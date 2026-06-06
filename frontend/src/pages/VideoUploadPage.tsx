import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { deleteTask } from "../api/client";
import { useTasks } from "../api/hooks";
import type { Task } from "../types";

type FilterKey = "all" | "videos" | "transcriptions" | "audio" | "archived";
type ViewMode = "grid" | "list";

type FileCard = {
  id: string;
  title: string;
  subtitle: string;
  kind: string;
  status: string;
  task?: Task;
  preview: "video" | "audio" | "text" | "error";
};

function getFileLabel(task: Task): string {
  return task.extra_data?.display_name || task.input_file || task.input_text || task.input_url || "Untitled";
}

function getDateLabel(task: Task): string {
  return new Date(task.updated_at || task.created_at).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function getSizeLabel(task: Task): string {
  if (task.type === "audio_upload") return task.duration_seconds ? `${Math.max(1, Math.round(task.duration_seconds))} sec` : "Audio";
  if (task.type === "video_upload" || task.type === "video_url") return "Video";
  if (task.transcription) return `${Math.max(1, Math.round(task.transcription.length / 8))} KB`;
  return "—";
}

function buildCards(tasks: Task[]): FileCard[] {
  return tasks.map((task) => {
    const status = task.status === "processing" ? "Transcribing" : task.status === "error" ? "Error" : "Done";
    const preview: FileCard["preview"] = task.status === "error" ? "error" : task.type === "audio_upload" ? "audio" : task.transcription ? "text" : "video";
    const kind = task.type === "audio_upload" ? "Audio" : task.type === "video_upload" || task.type === "video_url" ? "Video" : "Transcription";
    return {
      id: task.id,
      title: getFileLabel(task),
      subtitle: `${getDateLabel(task)} • ${getSizeLabel(task)}`,
      kind,
      status,
      task,
      preview,
    };
  });
}

export default function VideoUploadPage() {
  const navigate = useNavigate();
  const { data: tasks = [], refetch } = useTasks();
  const [search, setSearch] = useState("");
  const [activeFilter, setActiveFilter] = useState<FilterKey>("all");
  const [viewMode, setViewMode] = useState<ViewMode>("grid");
  const scopeRef = useRef<HTMLDivElement>(null);

  const cards = useMemo(() => buildCards(tasks), [tasks]);

  const filteredCards = useMemo(() => {
    const query = search.trim().toLowerCase();
    return cards.filter((card) => {
      const matchesSearch = !query || [card.title, card.subtitle, card.kind, card.status].some((value) => value.toLowerCase().includes(query));
      const matchesFilter =
        activeFilter === "all" ||
        (activeFilter === "videos" && card.kind === "Video") ||
        (activeFilter === "transcriptions" && card.kind === "Transcription") ||
        (activeFilter === "audio" && card.kind === "Audio") ||
        (activeFilter === "archived" && card.status === "Error");
      return matchesSearch && matchesFilter;
    });
  }, [cards, search, activeFilter]);

  useEffect(() => {
    const root = scopeRef.current;
    if (!root) return;

    const cardsToReveal = Array.from(root.querySelectorAll<HTMLElement>("[data-reveal]"));
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
            if (entry.isIntersecting) {
              entry.target.classList.add("is-visible");
              observer.unobserve(entry.target);
            }
        });
      },
      { threshold: 0.1, rootMargin: "0px 0px -8% 0px" },
    );

    cardsToReveal.forEach((card) => observer.observe(card));
    return () => observer.disconnect();
  }, [filteredCards.length, viewMode]);

  const handleDelete = async (taskId: string) => {
    await deleteTask(taskId);
    await refetch();
  };

  const openTask = (task?: Task) => {
    if (!task) return;
    if (task.type === "text") {
      navigate(`/editor?taskId=${task.id}`);
      return;
    }
    if (task.type === "audio_upload") {
      navigate(`/voice-over?taskId=${task.id}`);
      return;
    }
    if (task.type === "video_upload" || task.type === "video_url") {
      navigate(`/editor?taskId=${task.id}`);
      return;
    }
    navigate(`/editor?taskId=${task.id}`);
  };

  const tabButtonClass = (key: FilterKey) =>
    activeFilter === key
      ? "bg-primary text-on-primary px-6 py-2 rounded-full font-label-md transition-all whitespace-nowrap"
      : "bg-surface-container-high text-on-surface-variant px-6 py-2 rounded-full font-label-md hover:bg-surface-variant transition-all whitespace-nowrap";

  return (
    <div ref={scopeRef} className="space-y-stack-lg pb-24 md:pb-12">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h2 className="text-headline-md font-bold text-on-surface">Your Projects</h2>
          <p className="text-body-sm text-on-surface-variant">Manage and access all your media files</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="hidden md:flex items-center bg-surface-container-low px-4 py-2 rounded-xl border border-outline-variant w-96">
            <span className="material-symbols-outlined text-on-surface-variant mr-2">search</span>
            <input
              className="bg-transparent border-none focus:ring-0 w-full text-body-md outline-none"
              placeholder="Search files..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <div className="flex bg-surface-container-high p-1 rounded-xl">
            <button className={`p-2 rounded-lg transition-colors ${viewMode === "grid" ? "bg-surface-container-lowest shadow-sm text-primary" : "text-on-surface-variant"}`} onClick={() => setViewMode("grid")}>
              <span className="material-symbols-outlined text-[20px]">grid_view</span>
            </button>
            <button className={`p-2 rounded-lg transition-colors ${viewMode === "list" ? "bg-surface-container-lowest shadow-sm text-primary" : "text-on-surface-variant"}`} onClick={() => setViewMode("list")}>
              <span className="material-symbols-outlined text-[20px]">format_list_bulleted</span>
            </button>
          </div>
          <div className="w-px h-8 bg-outline-variant mx-2 hidden sm:block" />
          <button className="hidden sm:flex items-center gap-2 px-4 py-2 border border-outline-variant rounded-xl text-on-surface-variant hover:bg-surface-container-low transition-all">
            <span className="material-symbols-outlined text-[20px]">filter_list</span>
            <span className="font-label-md hidden sm:block">Filter</span>
          </button>
        </div>
      </div>

      <div className="md:hidden">
        <div className="flex items-center bg-surface-container-low px-4 py-3 rounded-xl border border-outline-variant">
          <span className="material-symbols-outlined text-on-surface-variant mr-2">search</span>
          <input
            className="bg-transparent border-none focus:ring-0 w-full text-body-md outline-none"
            placeholder="Search files..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      <div className="flex gap-2 overflow-x-auto pb-4 mb-stack-lg scrollbar-hide border-b border-outline-variant/30">
        <button className={tabButtonClass("all")} onClick={() => setActiveFilter("all")}>All Files</button>
        <button className={tabButtonClass("videos")} onClick={() => setActiveFilter("videos")}>Videos</button>
        <button className={tabButtonClass("transcriptions")} onClick={() => setActiveFilter("transcriptions")}>Transcriptions</button>
        <button className={tabButtonClass("audio")} onClick={() => setActiveFilter("audio")}>Audio</button>
        <button className={tabButtonClass("archived")} onClick={() => setActiveFilter("archived")}>Archived</button>
      </div>

      {filteredCards.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-32 text-center">
          <div className="w-64 h-64 mb-8 bg-surface-container rounded-full flex items-center justify-center relative">
            <span className="material-symbols-outlined text-[120px] text-outline-variant">folder_off</span>
            <div className="absolute -bottom-2 -right-2 w-16 h-16 bg-primary text-on-primary rounded-full flex items-center justify-center shadow-lg">
              <span className="material-symbols-outlined text-3xl">add</span>
            </div>
          </div>
          <h2 className="font-headline-lg text-on-surface mb-2">No files here yet</h2>
          <p className="text-body-md text-on-surface-variant max-w-md mb-8">Start your first transcription or upload a video to see your library come to life.</p>
          <button className="bg-primary text-on-primary px-8 py-3 rounded-xl font-label-md hover:bg-primary-container transition-all shadow-md" onClick={() => navigate("/voice-over")}>Upload Your First File</button>
        </div>
      ) : (
        <div className={`grid gap-gutter ${viewMode === "grid" ? "grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5" : "grid-cols-1"}`}>
          {filteredCards.map((card, index) => {
            const task = card.task;
            const revealId = `file-card-${card.id}`;
            return (
              <div
                key={card.id}
                id={revealId}
                data-reveal
                className={`reveal-card hover-lift group bg-surface-container-lowest border border-outline-variant rounded-xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 relative ${viewMode === "list" ? "flex flex-col md:flex-row" : ""}`}
                style={{ transitionDelay: `${index * 45}ms` }}
              >
                <div className={`relative overflow-hidden ${viewMode === "list" ? "md:w-72 md:flex-shrink-0" : "aspect-video"} bg-surface-dim`}>
                  {card.preview === "video" && (
                    <div className="w-full h-full bg-gradient-to-br from-primary/15 via-secondary/10 to-tertiary/15 flex items-center justify-center">
                      <span className="material-symbols-outlined text-primary text-6xl">movie</span>
                    </div>
                  )}
                  {card.preview === "audio" && (
                    <div className="w-full h-full bg-primary/5 flex flex-col items-center justify-center p-6 text-center border-b border-outline-variant/30">
                      <span className="material-symbols-outlined text-primary text-5xl mb-3 opacity-80 group-hover:scale-110 transition-transform">audio_file</span>
                      <div className="w-full h-8 flex items-center justify-center gap-1.5">
                        {[4, 8, 12, 6, 4].map((h, waveIndex) => (
                          <div key={waveIndex} className="w-1 h-4 bg-secondary/60 rounded-full animate-pulse" style={{ height: `${h * 4}px`, animationDelay: `${waveIndex * 0.1}s` }} />
                        ))}
                      </div>
                    </div>
                  )}
                  {card.preview === "text" && (
                    <div className="w-full h-full bg-surface-container-low p-6 flex flex-col justify-start overflow-hidden border-b border-outline-variant/30">
                      <div className="space-y-3 opacity-30">
                        <div className="h-2.5 w-3/4 bg-outline-variant rounded-full"></div>
                        <div className="h-2.5 w-1/2 bg-outline-variant rounded-full"></div>
                        <div className="h-2.5 w-full bg-outline-variant rounded-full"></div>
                        <div className="h-2.5 w-2/3 bg-outline-variant rounded-full"></div>
                      </div>
                      <div className="mt-auto flex items-center gap-2">
                        <div className="p-1.5 bg-primary/10 rounded-lg">
                          <span className="material-symbols-outlined text-primary text-xl">description</span>
                        </div>
                        <span className="text-xs font-bold text-primary tracking-wide">DOCX</span>
                      </div>
                    </div>
                  )}
                  {card.preview === "error" && (
                    <div className="w-full h-full bg-surface-dim relative overflow-hidden grayscale opacity-80 flex items-center justify-center">
                      <span className="material-symbols-outlined text-error text-5xl">error</span>
                    </div>
                  )}
                  <span className={`status-badge shadow-sm border ${card.status === "Error" ? "bg-error text-on-error border-error/20" : card.status === "Transcribing" ? "bg-tertiary-container text-on-tertiary-container" : "bg-secondary-container text-on-secondary-container border-secondary/20"}`}>
                    {card.status}
                  </span>
                  <div className="absolute inset-0 bg-black/35 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <button className="w-12 h-12 bg-white/20 backdrop-blur-md text-white rounded-full flex items-center justify-center hover:scale-110 transition-transform border border-white/30" onClick={() => openTask(task)}>
                      <span className="material-symbols-outlined text-3xl">{card.preview === "error" ? "refresh" : "play_arrow"}</span>
                    </button>
                  </div>
                </div>

                <div className="p-4 flex-1 flex flex-col">
                  <div className="flex items-start justify-between gap-2 mb-1">
                    <h3 className="font-bold text-body-md truncate group-hover:text-primary transition-colors" title={card.title}>{card.title}</h3>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-on-surface-variant whitespace-nowrap">{card.kind}</span>
                  </div>
                  <div className="flex items-center gap-2 text-body-sm text-on-surface-variant mb-4 flex-wrap">
                    <span>{card.subtitle}</span>
                    <span className="w-1 h-1 rounded-full bg-outline-variant" />
                    <span>{task?.progress ?? 0}%</span>
                  </div>
                  <div className="flex justify-between items-center border-t border-outline-variant pt-3 mt-auto">
                    <div className="flex gap-0.5">
                      <button className="p-2 hover:bg-primary-fixed rounded-lg text-primary transition-colors" title="Edit" onClick={() => openTask(task)}>
                        <span className="material-symbols-outlined text-[20px]">{card.kind === "Transcription" ? "visibility" : "edit"}</span>
                      </button>
                      <button className="p-2 hover:bg-primary-fixed rounded-lg text-primary transition-colors" title="Share" onClick={async () => navigator.clipboard.writeText(task?.audio_url || task?.input_url || card.title)}>
                        <span className="material-symbols-outlined text-[20px]">share</span>
                      </button>
                      {task?.audio_url && (
                        <button className="p-2 hover:bg-primary-fixed rounded-lg text-primary transition-colors" title="Download" onClick={() => window.open(task.audio_url, "_blank") }>
                          <span className="material-symbols-outlined text-[20px]">download</span>
                        </button>
                      )}
                    </div>
                    <button className="p-2 hover:bg-error-container rounded-lg text-error transition-colors" title="Delete" onClick={() => void handleDelete(task?.id || card.id)}>
                      <span className="material-symbols-outlined text-[20px]">delete</span>
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <button className="fixed lg:hidden bottom-24 right-margin-mobile bg-primary text-on-primary w-14 h-14 rounded-2xl shadow-xl flex items-center justify-center hover:scale-110 active:scale-90 transition-all z-40" onClick={() => navigate("/voice-over")}>
        <span className="material-symbols-outlined text-3xl">add</span>
      </button>
    </div>
  );
}
