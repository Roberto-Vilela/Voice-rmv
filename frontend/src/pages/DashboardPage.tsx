import { useState, useMemo } from "react";
import type { Task } from "../types";
import HeroSection from "../components/HeroSection";
import UploadDropzone from "../components/UploadDropzone";
import VoiceSelector from "../components/VoiceSelector";
import RecentActivity from "../components/RecentActivity";
import WaveformPlayer from "../components/WaveformPlayer";
import { useTasks } from "../api/hooks";

export default function DashboardPage() {
  const [voice, setVoice] = useState("en-US-AriaNeural");
  const [activeTask, setActiveTask] = useState<Task | null>(null);
  const { data: tasks = [], refetch } = useTasks();

  const latestCompleted = useMemo(() => {
    if (!Array.isArray(tasks)) return null;
    return tasks.find((t: any) => t.audio_url) || null;
  }, [tasks]);

  const playerTask = activeTask || latestCompleted;

  const handleSelectTask = (task: Task) => setActiveTask(task);

  // Handle new task from HeroSection
  const handleVideoSubmitted = async (task: Task) => {
    setActiveTask(task);
    // Refetch to ensure task appears in RecentActivity
    await refetch();
  };

  return (
    <div className="space-y-stack-lg">
      <h1 className="text-2xl font-bold text-slate-900 mb-6">
        Welcome back, Alex!
      </h1>
      <HeroSection selectedVoice={voice} onVideoSubmitted={handleVideoSubmitted} />

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-gutter">
        <div className="lg:col-span-4 space-y-gutter">
          <UploadDropzone voice={voice} />
          <VoiceSelector value={voice} onChange={setVoice} />
        </div>

        <div className="lg:col-span-8 flex flex-col gap-gutter">
          <RecentActivity onSelectTask={handleSelectTask} />
          <WaveformPlayer task={playerTask} />
        </div>
      </div>
    </div>
  );
}
