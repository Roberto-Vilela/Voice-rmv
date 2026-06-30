import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";
import WaveformPlayer from "../components/WaveformPlayer";
import { createUploadTask, createVideoUrlTask } from "../api/tasks";
import { patchTask, downloadTaskAudio, translateTaskText, translateText } from "../api/client";
import { useTask, useTasks } from "../api/hooks";
import { getErrorMessage } from "../utils/errors";
import type { Task } from "../types";

type EditorSegment = {
  id: string;
  start: number;
  end: number;
  speaker: string;
  html: string;
};

function escapeHtml(value: string): string {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function textToHtml(value: string): string {
  return escapeHtml(value).replaceAll("\n", "<br>");
}

function stripHtml(value: string): string {
  const div = document.createElement("div");
  div.innerHTML = value;
  return div.textContent || "";
}

function formatTime(seconds: number): string {
  const total = Math.max(0, seconds);
  const minutes = Math.floor(total / 60);
  const secs = Math.floor(total % 60);
  return `${String(minutes).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
}

function formatRange(start: number, end: number): string {
  return `[${formatTime(start)} - ${formatTime(end)}]`;
}

function formatRelativeTime(date: Date | null): string {
  if (!date) return "not saved yet";
  const diff = Date.now() - date.getTime();
  const seconds = Math.floor(diff / 1000);
  if (seconds < 10) return "just now";
  if (seconds < 60) return `${seconds}s ago`;
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  return `${hours}h ago`;
}

function splitTextIntoChunks(text: string): string[] {
  const clean = text.trim().replace(/\s+/g, " ");
  if (!clean) return [];

  const sentenceChunks = clean
    .split(/(?<=[.!?])\s+/)
    .map((part) => part.trim())
    .filter(Boolean);

  if (sentenceChunks.length > 1) return sentenceChunks;

  const words = clean.split(" ");
  const size = words.length > 48 ? 16 : words.length > 24 ? 12 : Math.max(words.length, 1);
  const chunks: string[] = [];
  for (let i = 0; i < words.length; i += size) {
    chunks.push(words.slice(i, i + size).join(" "));
  }
  return chunks;
}

function buildSegments(task: Task | null, draftText: string): EditorSegment[] {
  if (task?.extra_data?.source_removed === true) {
    return [];
  }

  const editorSegments = task?.extra_data?.editor_segments;
  const narrationSegments = task?.extra_data?.narration_segments;
  if (Array.isArray(narrationSegments) && narrationSegments.length > 0) {
    return narrationSegments.map((segment, index) => {
      const savedSegment = Array.isArray(editorSegments) ? editorSegments[index] : null;
      return {
        id: savedSegment?.id || `segment-${index}`,
        start: Number(segment.start || 0),
        end: Number(segment.end || segment.start || 0),
        speaker: savedSegment?.speaker || segment.speaker || (index % 2 === 0 ? "A" : "B"),
        html: savedSegment?.html || textToHtml(String(segment.text || "")),
      };
    });
  }

  if (Array.isArray(editorSegments) && editorSegments.length > 0) {
    return editorSegments.map((segment, index) => ({
      id: segment.id || `segment-${index}`,
      start: Number(segment.start || 0),
      end: Number(segment.end || 0),
      speaker: segment.speaker || (index % 2 === 0 ? "A" : "B"),
      html: segment.html || "",
    }));
  }

  const backendSegments = task?.extra_data?.transcription_segments;
  if (Array.isArray(backendSegments) && backendSegments.length > 0) {
    return backendSegments.map((segment, index) => ({
      id: `segment-${index}`,
      start: Number(segment.start || 0),
      end: Number(segment.end || segment.start || 0),
      speaker: segment.speaker || (index % 2 === 0 ? "A" : "B"),
      html: textToHtml(String(segment.text || "")),
    }));
  }

  const sourceText = task?.transcription?.trim() || draftText.trim() || task?.input_text?.trim() || "";
  if (!sourceText) return [];

  const chunks = splitTextIntoChunks(sourceText);
  const duration = task?.duration_seconds && task.duration_seconds > 0 ? task.duration_seconds : Math.max(8, chunks.join(" ").split(/\s+/).length * 0.5);
  const step = chunks.length > 0 ? duration / chunks.length : duration;

  return chunks.map((chunk, index) => ({
    id: `segment-${index}`,
    start: index * step,
    end: (index + 1) * step,
    speaker: chunks.length > 1 ? (index % 2 === 0 ? "A" : "B") : "A",
    html: textToHtml(chunk),
  }));
}

function buildSrt(segments: EditorSegment[]): string {
  const toSrtTime = (seconds: number) => {
    const total = Math.max(0, seconds);
    const hours = Math.floor(total / 3600);
    const minutes = Math.floor((total % 3600) / 60);
    const secs = Math.floor(total % 60);
    const ms = Math.floor((total - Math.floor(total)) * 1000);
    return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}:${String(secs).padStart(2, "0")},${String(ms).padStart(3, "0")}`;
  };

  return segments
    .map((segment, index) => {
      const text = stripHtml(segment.html).trim();
      return `${index + 1}\n${toSrtTime(segment.start)} --> ${toSrtTime(segment.end)}\n[SPEAKER ${segment.speaker}] ${text}`;
    })
    .join("\n\n");
}

export default function EditorPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const queryClient = useQueryClient();
  const taskId = searchParams.get("taskId");
  const draftText = searchParams.get("text") || "";
  const uploadInputRef = useRef<HTMLInputElement>(null);
  const revealScopeRef = useRef<HTMLDivElement>(null);
  const [youtubeUrl, setYoutubeUrl] = useState("");
  const [segments, setSegments] = useState<EditorSegment[]>([]);
  const [currentTime, setCurrentTime] = useState(0);
  const [isSaving, setIsSaving] = useState(false);
  const [isDirty, setIsDirty] = useState(false);
  const [savedAt, setSavedAt] = useState<Date | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isTranslationMode, setIsTranslationMode] = useState(false);
  const [isTranslating, setIsTranslating] = useState(false);
  const [translationSegments, setTranslationSegments] = useState<EditorSegment[]>([]);
  const [isSourceRemoved, setIsSourceRemoved] = useState(false);

  const { data: currentTaskData } = useTask(taskId);
  const { data: tasks = [] } = useTasks();

  const fallbackTask = useMemo(() => {
    if (taskId || draftText) return null;
    if (!Array.isArray(tasks)) return null;
    return tasks.find((task: Task) => task.audio_url) || null;
  }, [taskId, tasks, draftText]);

  const currentTask = (taskId ? currentTaskData : fallbackTask) || null;
  const currentVoice = currentTask?.voice || "en-US-AriaNeural";
  const title = currentTask?.extra_data?.display_name || currentTask?.input_file || currentTask?.input_text || currentTask?.input_url || "Transcription Editor";
  const isLoadingTask = !!taskId && !currentTaskData;

  const sourceKey = taskId ? currentTask?.id || `loading:${taskId}` : currentTask?.id || `draft:${draftText || "empty"}`;
  const taskContentKey = JSON.stringify({
    status: currentTask?.status || null,
    updatedAt: currentTask?.updated_at || null,
    transcription: currentTask?.transcription || "",
    inputText: currentTask?.input_text || "",
    duration: currentTask?.duration_seconds || 0,
    narrationSegments: currentTask?.extra_data?.narration_segments || [],
    backendSegments: currentTask?.extra_data?.transcription_segments || [],
    editorSegments: currentTask?.extra_data?.editor_segments || [],
  });

  useEffect(() => {
    setIsDirty(false);
    setSavedAt(null);
    setError(null);
    setCurrentTime(0);
    setIsTranslationMode(false);
    setTranslationSegments([]);
    setIsSourceRemoved(false);
  }, [sourceKey]);

  useEffect(() => {
    if (isDirty) return;
    if (isSourceRemoved) return;
    const newSegments = buildSegments(currentTask, draftText);
    setSegments(newSegments);

    const savedTranslation = currentTask?.extra_data?.translation_segments;
    if (Array.isArray(savedTranslation) && savedTranslation.length > 0 && newSegments.length > 0 && savedTranslation.length === newSegments.length) {
      const restored = newSegments.map((seg) => {
        const saved = savedTranslation.find((s: Record<string, unknown>) => s.id === seg.id);
        return saved ? { ...seg, html: String(saved.html ?? "") } : seg;
      });
      setTranslationSegments(restored);
      setIsTranslationMode(true);
    }
  }, [currentTask, draftText, isDirty, isSourceRemoved, taskContentKey]);

  useEffect(() => {
    const root = revealScopeRef.current;
    if (!root) return;

    const cards = Array.from(root.querySelectorAll<HTMLElement>("[data-reveal]"));
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: "0px 0px -8% 0px" },
    );

    cards.forEach((card) => observer.observe(card));
    return () => observer.disconnect();
  }, [sourceKey]);

  useEffect(() => {
    if (!isDirty || !currentTask?.id || !segments.length) return;
    const timer = window.setTimeout(() => {
      void saveChanges("auto");
    }, 1000);
    return () => window.clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [segments, isDirty, currentTask?.id]);

  const [activeSegmentIndex, setActiveSegmentIndex] = useState(-1);

  useEffect(() => {
    const index = segments.findIndex(
      (segment) => currentTime >= segment.start && currentTime < segment.end,
    );
    setActiveSegmentIndex((current) => (current === index ? current : index));
  }, [currentTime, segments]);

  const updateSegmentHtml = (id: string, html: string) => {
    setSegments((current) => current.map((segment) => (segment.id === id ? { ...segment, html } : segment)));
    setIsDirty(true);
  };

  const applyFormat = (format: "bold" | "italic" | "underline") => {
    const sel = window.getSelection();
    if (!sel || !sel.rangeCount || sel.isCollapsed) return;

    const range = sel.getRangeAt(0);
    const container = range.commonAncestorContainer;
    const editor = (container.nodeType === 3 ? container.parentElement : container as HTMLElement)
      ?.closest?.("[contentEditable]") as HTMLElement | null;
    if (!editor) return;

    const tagMap: Record<string, string> = { bold: "strong", italic: "em", underline: "u" };
    const tag = tagMap[format];
    if (!tag) return;

    try {
      const fragment = range.extractContents();
      const wrapper = document.createElement(tag);
      wrapper.appendChild(fragment);
      range.insertNode(wrapper);

      sel.removeAllRanges();
      const newRange = document.createRange();
      newRange.selectNodeContents(wrapper);
      sel.addRange(newRange);

      const segmentId = editor.dataset.segmentId;
      if (segmentId) updateSegmentHtml(segmentId, editor.innerHTML);
    } catch {
      // fallback silently
    }
  };

  const applyCommand = (command: "undo" | "redo") => {
    document.execCommand(command, false);
  };

  const saveChanges = async (mode: "auto" | "manual" = "manual") => {
    if (!currentTask?.id) {
      setError("Load a task first to save changes.");
      return;
    }

    const transcription = segments.map((segment) => stripHtml(segment.html).trim()).filter(Boolean).join("\n\n");
    const extraData: Record<string, unknown> = {
      ...(currentTask.extra_data || {}),
      editor_segments: segments,
      editor_saved_at: new Date().toISOString(),
    };
    if (isTranslationMode && translationSegments.length > 0) {
      extraData.translation_segments = translationSegments.map((s) => ({ id: s.id, html: s.html }));
      extraData.translated_text = translationSegments.map((s) => stripHtml(s.html).trim()).filter(Boolean).join("\n\n");
    }

    setIsSaving(true);
    setError(null);
    try {
      await patchTask(currentTask.id, {
        transcription,
        extra_data: extraData,
      });
      setSavedAt(new Date());
      setIsDirty(false);
      if (mode === "manual") {
        setError(null);
      }
    } catch (err: unknown) {
      setError(getErrorMessage(err, "Unable to save changes."));
    } finally {
      setIsSaving(false);
    }
  };

  const exportSrt = () => {
    if (!segments.length) return;
    const blob = new Blob([buildSrt(segments)], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${title.replace(/\.[^.]+$/, "") || "transcription"}.srt`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleDownloadAudio = async () => {
    if (!currentTask?.audio_url) return;
    setError(null);
    const display = currentTask.extra_data?.display_name || currentTask.input_text || currentTask.id;
    try {
      await downloadTaskAudio(currentTask.id, `${String(display).slice(0, 80)}.mp3`);
    } catch (err: unknown) {
      setError(getErrorMessage(err, "Failed to download audio."));
    }
  };

  const handleTranslate = useCallback(async () => {
    if (!segments.length) {
      setError("No transcription segments available. Wait for transcription to complete.");
      return;
    }
    setIsTranslating(true);
    setError(null);
    try {
      const sourceLanguage =
        typeof currentTask?.extra_data?.language === "string"
          ? currentTask.extra_data.language
          : "auto";
      const sourceSegments = segments.map((segment) => ({
        id: segment.id,
        text: stripHtml(segment.html).trim(),
      })).filter((segment) => segment.text);
      if (!sourceSegments.length) {
        setError("No translatable text found in the editor.");
        return;
      }
      const result = currentTask?.id
        ? await translateTaskText(currentTask.id, sourceSegments, sourceLanguage, "pt-BR")
        : await translateText(sourceSegments, sourceLanguage, "pt-BR");
      const translatedById = new Map(
        result.segments.map((segment) => [segment.id, segment.text]),
      );
      const newSegments = segments.map((seg) => ({
        ...seg,
        html: textToHtml(translatedById.get(seg.id)?.trim() || ""),
      }));
      setTranslationSegments(newSegments);
      setIsTranslationMode(true);
      setIsDirty(true);
    } catch (err: unknown) {
      setError(getErrorMessage(err, "Translation failed."));
    } finally {
      setIsTranslating(false);
    }
  }, [segments, currentTask]);

  const handleTranslateExit = useCallback(() => {
    setIsTranslationMode(false);
    setTranslationSegments([]);
  }, []);

  const handleSendToVoiceOver = useCallback(() => {
    const text = translationSegments
      .map((seg) => stripHtml(seg.html).trim())
      .filter(Boolean)
      .join("\n\n");
    if (!text) return;
    sessionStorage.setItem("voiceOverText", text);
    navigate("/voice-over");
  }, [translationSegments, navigate]);

  const handleRemoveUpload = async () => {
    if (!currentTask?.id) return;
    setIsDirty(false);
    setIsSaving(true);
    setIsSourceRemoved(true);
    const clearedExtraData = {
      ...(currentTask.extra_data || {}),
      display_name: "",
      source_removed: true,
      transcription_segments: [],
      narration_segments: [],
      editor_segments: [],
      translation_segments: [],
      translated_text: "",
    };
    try {
      const result = await patchTask(currentTask.id, {
        extra_data: clearedExtraData,
      });
      const clearedTask = {
        ...result,
        extra_data: {
          ...(result.extra_data || {}),
          ...clearedExtraData,
        },
      };
      queryClient.setQueryData(["task", currentTask.id], clearedTask);
      queryClient.setQueryData(["tasks"], (currentTasks: Task[] | undefined) =>
        currentTasks?.map((task) =>
          task.id === currentTask.id
            ? {
                ...task,
                extra_data: {
                  ...(task.extra_data || {}),
                  ...clearedExtraData,
                },
              }
            : task,
        ),
      );
      setSegments([]);
      setTranslationSegments([]);
      setIsTranslationMode(false);
      setCurrentTime(0);
      setError(null);
    } catch (err: unknown) {
      setIsSourceRemoved(false);
      setError(getErrorMessage(err, "Failed to remove upload."));
    } finally {
      setIsSaving(false);
    }
  };

  const handleUpload = async (file: File) => {
    try {
      const task = await createUploadTask(file, currentVoice);
      navigate(`/editor?taskId=${task.id}`);
    } catch (err: unknown) {
      setError(getErrorMessage(err, "Upload failed."));
    }
  };

  const handleYoutubeLoad = async () => {
    if (!youtubeUrl.trim()) return;
    try {
      const task = await createVideoUrlTask(youtubeUrl.trim(), currentVoice);
      setYoutubeUrl("");
      navigate(`/editor?taskId=${task.id}`);
    } catch (err: unknown) {
      setError(getErrorMessage(err, "Could not load the YouTube link."));
    }
  };

  return (
    <div ref={revealScopeRef} className="space-y-stack-lg pb-24 md:pb-12">
       <div className="flex items-center justify-between px-margin-mobile md:px-0">
         <div className="flex items-center gap-4">
           <button
             className="active:scale-95 transition-transform hover:opacity-80 p-2 text-on-surface"
             onClick={() => navigate(-1)}
           >
             <span className="material-symbols-outlined">arrow_back</span>
           </button>
           <h1 className="text-headline-md font-bold text-primary">Transcription Editor</h1>
         </div>
         <div className="flex items-center gap-3">
          <button
            onClick={handleRemoveUpload}
            className="hidden md:flex items-center gap-2 px-4 py-2 text-on-surface font-label-md hover:bg-secondary-container/20 rounded-xl transition-all disabled:opacity-30 disabled:cursor-not-allowed"
            disabled={
              currentTask?.extra_data?.source_removed === true ||
              !currentTask?.transcription &&
              !currentTask?.input_text &&
              !currentTask?.input_file &&
              !currentTask?.input_url &&
              !currentTask?.extra_data?.translated_text
            }
            title="Clear editor content"
          >
            <span className="material-symbols-outlined">delete</span>
            <span>Clear</span>
          </button>
          <button
            onClick={exportSrt}
            className="hidden md:flex items-center gap-2 px-4 py-2 text-secondary font-label-md hover:bg-secondary-container/20 rounded-xl transition-all"
          >
            <span className="material-symbols-outlined">file_download</span>
            Export
          </button>
          {currentTask?.audio_url && (
            <button
              onClick={handleDownloadAudio}
              className="flex items-center gap-2 px-4 py-2 text-primary font-label-md hover:bg-primary-container/20 rounded-xl transition-all"
              title="Download audio"
            >
              <span className="material-symbols-outlined">download</span>
              Audio
            </button>
          )}
        </div>
       </div>

      <div className="max-w-container-max mx-auto lg:p-gutter flex flex-col h-[calc(100vh-128px)] min-h-screen">
        <div className="px-margin-mobile md:px-0 flex flex-col gap-gutter mb-gutter">
          <div data-reveal className="reveal-card bg-surface border border-outline-variant rounded-xl shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 overflow-hidden">
            <div className="p-4 space-y-3">
              <div className="flex items-center gap-3 border-b border-outline-variant/50 pb-3">
                <span className="material-symbols-outlined text-secondary text-xl">video_library</span>
                <h3 className="text-sm font-semibold text-on-surface tracking-wide">Source</h3>
                <span className={`ml-auto text-[11px] font-medium px-2.5 py-0.5 rounded-full ${
                  currentTask?.status === "completed"
                    ? "bg-success/10 text-success"
                    : currentTask?.status === "processing" || currentTask?.status === "pending"
                    ? "bg-processing/10 text-processing"
                    : "bg-surface-container text-on-surface-variant"
                }`}>
                  {currentTask?.status === "completed" ? "Ready" : currentTask?.status || "Idle"}
                </span>
              </div>
              <input
                ref={uploadInputRef}
                type="file"
                accept="video/*,audio/*"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) {
                    void handleUpload(file);
                  }
                  e.target.value = "";
                }}
              />
              <div className="flex flex-col sm:flex-row gap-3">
                <button
                  className="flex items-center justify-center gap-2 h-11 px-6 rounded-lg font-semibold bg-primary text-on-primary hover:opacity-90 transition-all active:scale-95 shrink-0"
                  onClick={() => uploadInputRef.current?.click()}
                >
                  <span className="material-symbols-outlined text-lg">upload_file</span>
                  <span className="text-sm">Load video</span>
                </button>
                <div className="flex gap-2 flex-1">
                  <input
                    value={youtubeUrl}
                    onChange={(e) => setYoutubeUrl(e.target.value)}
                    className="flex-1 h-11 px-4 rounded-lg border border-outline bg-surface-container-low text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
                    placeholder="YouTube link"
                  />
                  <button
                    className="h-11 px-6 rounded-lg font-semibold bg-secondary text-white hover:opacity-90 transition-all active:scale-95"
                    onClick={() => void handleYoutubeLoad()}
                  >
                    Load
                  </button>
                </div>
              </div>
            </div>
            {!isSourceRemoved && currentTask?.audio_url && currentTask?.extra_data?.source_removed !== true && (
              <div className="border-t border-outline-variant/50">
                <WaveformPlayer task={currentTask} onTimeUpdate={setCurrentTime} />
              </div>
            )}
          </div>
        </div>

        <div className="px-margin-mobile md:px-0">
        <div data-reveal className="reveal-card hover-lift bg-surface border border-outline-variant rounded-xl p-2 flex flex-wrap items-center gap-2 sticky top-0 z-20 shadow-sm shrink-0">
            <div className="flex items-center gap-1 border-r border-outline-variant pr-2">
              <button className="p-2 hover:bg-surface-container rounded-lg text-on-surface-variant" title="Bold" onMouseDown={(e) => e.preventDefault()} onClick={() => applyFormat("bold")}>
                <span className="material-symbols-outlined">format_bold</span>
              </button>
              <button className="p-2 hover:bg-surface-container rounded-lg text-on-surface-variant" title="Italic" onMouseDown={(e) => e.preventDefault()} onClick={() => applyFormat("italic")}>
                <span className="material-symbols-outlined">format_italic</span>
              </button>
              <button className="p-2 hover:bg-surface-container rounded-lg text-on-surface-variant" title="Underline" onMouseDown={(e) => e.preventDefault()} onClick={() => applyFormat("underline")}>
                <span className="material-symbols-outlined">format_underlined</span>
              </button>
            </div>
            <div className="flex items-center gap-1 border-r border-outline-variant pr-2">
              <button className="p-2 hover:bg-surface-container rounded-lg text-on-surface-variant" title="Undo" onMouseDown={(e) => e.preventDefault()} onClick={() => applyCommand("undo")}>
                <span className="material-symbols-outlined">undo</span>
              </button>
              <button className="p-2 hover:bg-surface-container rounded-lg text-on-surface-variant" title="Redo" onMouseDown={(e) => e.preventDefault()} onClick={() => applyCommand("redo")}>
                <span className="material-symbols-outlined">redo</span>
              </button>
            </div>
            <div className="flex items-center gap-1 border-r border-outline-variant pr-2">
              <button
                className={`p-2 rounded-lg transition-all ${isTranslationMode ? "bg-primary text-on-primary" : "hover:bg-surface-container text-on-surface-variant"}`}
                title="Translate"
                disabled={!segments.length || isTranslating}
                onClick={() => void (isTranslationMode ? handleTranslateExit() : handleTranslate())}
              >
                <span className="material-symbols-outlined">
                  {isTranslating ? "sync" : isTranslationMode ? "translate" : "g_translate"}
                </span>
              </button>
            </div>
            {isTranslationMode && translationSegments.length > 0 && translationSegments.some((seg) => stripHtml(seg.html).trim()) && (
              <button
                className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold bg-secondary text-white hover:opacity-90 transition-all active:scale-95"
                onClick={handleSendToVoiceOver}
                title="Send translated text to Voice Over"
              >
                <span className="material-symbols-outlined text-lg">record_voice_over</span>
                <span>Send to Voice Over</span>
              </button>
            )}
            <div className={`${isTranslationMode ? "" : "ml-auto"} hidden md:flex items-center gap-2 px-3 py-1 bg-surface-container rounded-full`}>
              <span className="material-symbols-outlined text-sm text-secondary">check_circle</span>
              <span className="text-xs font-label-md text-on-surface-variant">
                {isSaving ? "Saving..." : `Auto-saved ${formatRelativeTime(savedAt)}`}
              </span>
            </div>
          </div>

          <div data-reveal className={`reveal-card hover-lift bg-surface border border-outline-variant rounded-xl shadow-sm overflow-hidden flex-1 lg:overflow-y-auto mb-24 lg:mb-0 desktop-content-height`}>
            {isTranslationMode && (
              <div className="sticky top-0 z-10 bg-surface border-b border-outline-variant px-gutter py-3 flex items-center gap-3">
                <span className="text-xs font-bold uppercase tracking-wider text-on-surface-variant">Original</span>
                <span className="material-symbols-outlined text-sm text-secondary">arrow_forward</span>
                <span className="text-xs font-bold uppercase tracking-wider text-on-surface-variant">Translation</span>
                {isTranslating && (
                  <span className="ml-auto text-xs text-secondary animate-pulse">
                    Loading CPU translator and translating...
                  </span>
                )}
              </div>
            )}
            <div className={`${isTranslationMode ? "grid grid-cols-2 divide-x divide-outline-variant" : ""}`}>
              <div className={`p-gutter space-y-6 ${isTranslationMode ? "overflow-y-auto max-h-[calc(100vh-160px)]" : ""}`}>
                {!segments.length ? (
                  <div className="p-8 text-center text-on-surface-variant">
                    {isLoadingTask
                      ? "Loading transcription..."
                      : "Load a video or YouTube link to start editing the transcript."}
                  </div>
                ) : (
                  segments.map((segment, index) => {
                    const isActive = index === activeSegmentIndex;
                    return (
                      <div key={segment.id} className={`reveal-card hover-lift flex gap-4 p-4 rounded-lg group transition-all is-visible ${isActive ? 'active-row font-semibold bg-primary/5' : 'zebra-row'}`}>
                        <div className="min-w-[110px] font-code-md text-code-md mt-1 text-primary opacity-60">
                          {formatRange(segment.start, segment.end)}
                        </div>
                        <div className="flex-1 space-y-2">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-label-md px-2 py-0.5 rounded text-xs text-primary bg-primary-fixed">
                              SPEAKER {segment.speaker}
                            </span>
                          </div>
                          {isTranslationMode ? (
                            <div className="p-1 text-body-md text-on-surface leading-relaxed" dangerouslySetInnerHTML={{ __html: segment.html }} />
                          ) : (
                            <div
                              contentEditable
                              data-segment-id={segment.id}
                              suppressContentEditableWarning
                              spellCheck={false}
                              className="outline-none focus:ring-2 focus:ring-primary/10 rounded p-1 text-body-md text-on-surface leading-relaxed"
                              dangerouslySetInnerHTML={{ __html: segment.html }}
                              onFocus={() => setCurrentTime(segment.start)}
                              onInput={(e: React.FormEvent<HTMLDivElement>) => updateSegmentHtml(segment.id, e.currentTarget.innerHTML)}
                            />
                          )}
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
              {isTranslationMode && (
                <div className="p-gutter space-y-6 overflow-y-auto max-h-[calc(100vh-160px)] bg-surface-container-low/30">
                  {translationSegments.length === 0 ? (
                    <div className="p-8 text-center text-on-surface-variant">
                      {isTranslating ? "Translating..." : "Click Translate to generate the translation."}
                    </div>
                  ) : (
                    translationSegments.map((segment, index) => {
                      const orig = segments[index];
                      return (
                        <div key={segment.id} className="flex gap-4 p-4 rounded-lg">
                          <div className="min-w-[110px] font-code-md text-code-md mt-1 text-secondary opacity-60">
                            {orig ? formatRange(orig.start, orig.end) : "—"}
                          </div>
                          <div className="flex-1 space-y-2">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="font-label-md px-2 py-0.5 rounded text-xs text-on-secondary bg-secondary/20">
                                SPEAKER {segment.speaker}
                              </span>
                            </div>
                            <div
                              contentEditable
                              data-segment-id={segment.id}
                              suppressContentEditableWarning
                              spellCheck={false}
                              className="outline-none focus:ring-2 focus:ring-secondary/20 rounded p-1 text-body-md text-on-surface leading-relaxed"
                              dangerouslySetInnerHTML={{ __html: segment.html }}
                              onInput={(e) => {
                                const html = e.currentTarget.innerHTML;
                                setTranslationSegments((prev) => prev.map((s) => s.id === segment.id ? { ...s, html } : s));
                                setIsDirty(true);
                              }}
                            />
                          </div>
                        </div>
                      );
                    })
                  )}
                  <div className="h-12" />
                </div>
              )}
            </div>
              <div className="h-12 lg:h-24" />
            </div>
      </div>
      </div>

        <button
          className="fixed bottom-24 lg:bottom-20 right-margin-mobile md:right-margin-desktop z-40 bg-primary text-on-primary px-6 py-4 rounded-xl shadow-lg flex items-center gap-2 active:scale-90 transition-all hover:opacity-90 group"
          onClick={() => void saveChanges("manual")}
          disabled={isSaving || !currentTask?.id}
        >
        <span className="material-symbols-outlined icon-filled">save</span>
        <span className="font-label-md">Save Changes</span>
      </button>

      {error && (
        <div className="fixed bottom-32 right-margin-mobile md:right-margin-desktop z-50 bg-error text-white px-4 py-3 rounded-xl shadow-lg max-w-sm">
          {error}
        </div>
      )}
    </div>
  );
}
