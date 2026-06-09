import { useState } from "react";
import { narrateVideoUrl, getTask } from "../api/client";
import type { Task } from "../types";
import VoiceSelector from "./VoiceSelector";

interface HeroSectionProps {
  onVideoSubmitted?: (task: Task) => void;
  selectedVoice?: string;
}

export default function HeroSection({ 
  onVideoSubmitted, 
  selectedVoice 
}: HeroSectionProps) {
  const [url, setUrl] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [progress, setProgress] = useState(0);
  const [selectedVoiceId, setSelectedVoiceId] = useState(selectedVoice || "en-US-AriaNeural");

  // APPROACH 3: Híbrido - Progresso real do backend + suavização visual
  const pollTask = async (taskId: string) => {
    return new Promise<Task>((resolve, reject) => {
      const pollingInterval = setInterval(async () => {
        try {
          const updatedTask = await getTask(taskId);
          
          // Update progress from backend
          setProgress(updatedTask.progress || 0);
          
          // Check completion
          if (updatedTask.status === "completed") {
            clearInterval(pollingInterval);
            resolve(updatedTask);
            if (onVideoSubmitted) {
              onVideoSubmitted(updatedTask);
            }
          } else if (updatedTask.status === "error") {
            clearInterval(pollingInterval);
            reject(new Error(updatedTask.error || "Processing failed"));
          }
        } catch (err) {
          // Ignore polling errors
        }
      }, 1000);
      
      // Cleanup on unmount
      return () => clearInterval(pollingInterval);
    });
  };

  const submitVideo = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);
    setProgress(0);

    if (!url.trim()) {
      setError("Please enter a YouTube URL");
      setIsSubmitting(false);
      return;
    }

    const voice = selectedVoiceId;
    
    try {
      const task = await narrateVideoUrl(url, voice);
      
      // Reset form
      setUrl("");
      setSelectedVoiceId("en-US-AriaNeural");
      
      // Poll for completion
      await pollTask(task.id);
      
    } catch (err: unknown) {
      const rawError = err instanceof Error ? err.message : "Failed to submit video";
      setError(humanizeError(rawError));
    } finally {
      setIsSubmitting(false);
    }
  };

  const getFriendlyMessage = (progress: number): string => {
    const messages: Record<number, string> = {
      0: "Initializing...",
      5: "Downloading video from YouTube...",
      30: "✓ Video downloaded! Extracting audio...",
      50: "✓ Audio extracted! Transcribing to text...",
      75: "✓ Transcription complete! Synthesizing voice...",
      100: "✓ Complete! Check Recent Activity",
    };
    return messages[progress] || "Processing...";
  };

  const getStageIcon = (progress: number) => {
    if (progress === 100) return "check_circle";
    if (progress >= 75) return "volume_up";
    if (progress >= 50) return "translate";
    if (progress >= 30) return "audio_file";
    return "download";
  };

  const getStageColor = (progress: number) => {
    if (progress >= 100) return "text-success";
    if (progress >= 75) return "text-secondary";
    if (progress >= 50) return "text-tertiary";
    if (progress >= 30) return "text-primary";
    return "text-on-surface-variant";
  };

  const isStageCompleted = (progress: number, stage: number) => {
    return progress >= stage;
  };

  // Humanize error messages from backend
  const humanizeError = (error: string): string => {
    try {
      const normalized = error.toLowerCase();

      // YouTube specific errors
      if (
        normalized.includes("this video is not available")
        || normalized.includes("video unavailable")
      ) {
        return "This YouTube video is not available for processing. Try another public video link.";
      }
      if (normalized.includes("task not found")) {
        return "We lost track of this processing job. Please submit the video again.";
      }
      if (normalized.includes("not found")) {
        return "We could not find this video. Check the link and try again.";
      }
      if (normalized.includes("private")) {
        return "This video is private and cannot be processed from here.";
      }
      if (normalized.includes("age restricted")) {
        return "This video is age-restricted and cannot be processed.";
      }
      if (normalized.includes("short")) {
        return "YouTube Shorts are not supported yet. Please use a regular public video URL.";
      }
      if (normalized.includes("login required") || normalized.includes("sign in")) {
        return "This video requires a signed-in YouTube session and cannot be processed right now.";
      }
      if (normalized.includes("download failed")) {
        return "We could not download this video. Please try again in a moment or use another link.";
      }
      if (normalized.includes("transcription failed")) {
        return "We could not transcribe this video. Try another video with clearer audio.";
      }
      if (
        normalized.includes("network")
        || normalized.includes("timeout")
        || normalized.includes("temporarily unavailable")
      ) {
        return "There was a temporary connection problem while contacting YouTube. Please try again.";
      }

      // Generic error handling - fallback to standard message
      if (error.startsWith("Error") || !normalized.includes("[youtube]") && !normalized.includes("yt-dlp")) {
        return "We could not process this video right now. Please try again or use a different public YouTube link.";
      }

      // Fallback: show first meaningful line
      const lines = error.split('\n').filter(line => line.trim());
      return lines[0] || "We could not process this video right now. Please try again or use a different public YouTube link.";
    } catch {
      return "We could not process this video right now. Please try again or use a different public YouTube link.";
    }
  };

  return (
    <section className="relative bg-[#4f46e5] rounded-3xl p-10 text-white overflow-visible mb-8">
      <div className="max-w-2xl relative z-10">
        <h2 className="text-5xl font-bold leading-tight mb-4 tracking-tight">
          Transform any video into clear text and audio.
        </h2>
        <p className="text-indigo-100 text-lg leading-relaxed opacity-90 mb-8">
          AI-powered extraction, transcription, and high-fidelity voice-over synthesis in seconds.
        </p>

        {/* Progress Section - Shows instead of Task ID */}
        {(isSubmitting || error) && (
          <div className="mb-6 p-6 bg-white border border-gray-200 rounded-2xl shadow-sm shadow-lg">
            {error ? (
              <div className="text-gray-900 rounded-xl p-4 bg-gray-50">
                <div className="font-semibold mb-2 flex items-center gap-2">
                  <span className="material-symbols-outlined">error</span>
                  <span>Error</span>
                </div>
                <div className="text-gray-900">{error}</div>
              </div>
            ) : (
              <div className="space-y-4">
                {/* Progress Bar */}
                <div className="flex items-center gap-4">
                  <div className="flex-1">
                    <div className="flex justify-between items-center mb-3">
                      <span className="text-headline-sm font-semibold text-on-surface">
                        {getFriendlyMessage(progress)}
                      </span>
                      <span className="text-body-md text-primary font-bold">
                        {Math.round(progress)}%
                      </span>
                    </div>
                    <div className="relative h-8 bg-surface-container border border-outline rounded-full overflow-hidden">
                      {/* Progress Bar with Gradient */}
                      <div 
                        className="absolute inset-y-0 left-0 bg-gradient-to-r from-primary via-secondary to-tertiary rounded-full transition-all duration-500 ease-out shadow-lg"
                        style={{ width: `${progress}%` }}
                      />
                      {/* Shine Effect for Animation */}
                      {progress < 100 && (
                        <div className="absolute inset-0 bg-white/10 animate-pulse" />
                      )}
                    </div>
                  </div>
                  
                  {/* Progress Icon */}
                  <div className="p-4 bg-primary/10 rounded-full border border-outline">
                    <span className="material-symbols-outlined text-3xl" style={{ color: getStageColor(progress) }}>
                      {getStageIcon(progress)}
                    </span>
                  </div>
                </div>
                
                {/* Progress Stages */}
                <div className="text-body-sm text-on-surface-variant/70 space-y-2 pl-1">
                  {/* Download Stage */}
                  <div className="flex justify-between items-center group">
                    <span className="flex items-center gap-2">
                      <span className={`w-2 h-2 rounded-full transition-all duration-300 ${
                        isStageCompleted(progress, 5) ? "bg-success" : "bg-gray-400"
                      }`} />
                      <span>Download Video</span>
                    </span>
                    <span className={`transition-all duration-300 ${
                      isStageCompleted(progress, 5) ? "text-success" : "text-on-surface-variant/30"
                    }`}>✓</span>
                  </div>
                  
                  {/* Extract Audio Stage */}
                  <div className="flex justify-between items-center group">
                    <span className="flex items-center gap-2">
                      <span className={`w-2 h-2 rounded-full transition-all duration-300 ${
                        isStageCompleted(progress, 30) ? "bg-success" : "bg-gray-400"
                      }`} />
                      <span>Extract Audio</span>
                    </span>
                    <span className={`transition-all duration-300 ${
                      isStageCompleted(progress, 30) ? "text-success" : "text-on-surface-variant/30"
                    }`}>✓</span>
                  </div>
                  
                  {/* Transcribe Stage */}
                  <div className="flex justify-between items-center group">
                    <span className="flex items-center gap-2">
                      <span className={`w-2 h-2 rounded-full transition-all duration-300 ${
                        isStageCompleted(progress, 50) ? "bg-success" : "bg-gray-400"
                      }`} />
                      <span>Transcribe</span>
                    </span>
                    <span className={`transition-all duration-300 ${
                      isStageCompleted(progress, 50) ? "text-success" : "text-on-surface-variant/30"
                    }`}>✓</span>
                  </div>
                  
                  {/* Synthesize Voice Stage */}
                  <div className="flex justify-between items-center group">
                    <span className="flex items-center gap-2">
                      <span className={`w-2 h-2 rounded-full transition-all duration-300 ${
                        isStageCompleted(progress, 75) ? "bg-success" : "bg-gray-400"
                      }`} />
                      <span>Synthesize Voice</span>
                    </span>
                    <span className={`transition-all duration-300 ${
                      isStageCompleted(progress, 75) ? "text-success" : "text-on-surface-variant/30"
                    }`}>✓</span>
                  </div>
                </div>
                
                {/* Progress Info */}
                {progress < 100 ? (
                  <div className="text-body-xs text-on-surface-variant/50 text-center pt-2 border-t border-outline">
                    Processing in background...
                  </div>
                ) : (
                  <div className="text-body-md text-success font-semibold text-center pt-2">
                    ✓ Complete! Check Recent Activity
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        <div className="flex flex-col lg:flex-row lg:items-stretch gap-3">
          <div className="flex-1 lg:min-w-[400px] relative group">
            <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-primary opacity-60 group-focus-within:opacity-100 transition-opacity">
              link
            </span>
            <input
              className="w-full h-14 pl-12 pr-4 rounded-2xl border-none text-on-surface focus:ring-4 focus:ring-primary-fixed-dim transition-all text-body-md bg-white"
              placeholder="Paste YouTube URL here..."
              type="text"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && url.trim()) {
                  submitVideo(e);
                }
              }}
              disabled={isSubmitting}
            />
          </div>

          <div className="w-full lg:w-56 shrink-0">
            <VoiceSelector value={selectedVoiceId} onChange={setSelectedVoiceId} variant="compact" />
          </div>

          <button
            onClick={submitVideo}
            disabled={isSubmitting || !url.trim()}
            className={`h-14 shrink-0 bg-secondary-container text-on-secondary-container px-6 rounded-2xl text-label-md hover:scale-[1.02] hover:brightness-110 transition-all active:scale-95 flex items-center justify-center gap-2 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 disabled:hover:brightness-100 lg:min-w-[240px] ${
              isSubmitting ? "animate-pulse" : ""
            }`}
          >
            {isSubmitting ? (
              <>
                <span className="material-symbols-outlined animate-spin">
                  refresh
                </span>
                <span>Processing...</span>
              </>
            ) : (
              <>
                <span className="material-symbols-outlined">
                  download_for_offline
                </span>
                <span>Download & Transcribe</span>
              </>
            )}
          </button>
        </div>
      </div>

      <div className="absolute right-0 top-0 h-full w-1/3 opacity-10 pointer-events-none">
        <svg viewBox="0 0 200 100" className="w-full h-full" preserveAspectRatio="none">
          <path d="M0,50 Q25,30 50,50 T100,50 T150,50 T200,50" fill="none" stroke="white" strokeWidth="2" />
          <path d="M0,60 Q25,40 50,60 T100,60 T150,60 T200,60" fill="none" stroke="white" strokeWidth="1.5" />
          <path d="M0,40 Q25,20 50,40 T100,40 T150,40 T200,40" fill="none" stroke="white" strokeWidth="1.5" />
          <path d="M0,70 Q25,50 50,70 T100,70 T150,70 T200,70" fill="none" stroke="white" strokeWidth="1" />
          <path d="M0,30 Q25,10 50,30 T100,30 T150,30 T200,30" fill="none" stroke="white" strokeWidth="1" />
        </svg>
      </div>
    </section>
  );
}
