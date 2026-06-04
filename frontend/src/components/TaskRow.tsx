import React from "react";
import { TaskResponse } from "../api/client";

export default React.memo(function TaskRow({ task }: { task: TaskResponse }) {
  const statusColors: Record<string, string> = {
    completed: "bg-green-100 text-green-700",
    processing: "bg-primary-fixed text-primary",
    error: "bg-red-100 text-red-700",
  };
  const dotColors: Record<string, string> = {
    completed: "bg-green-600",
    processing: "bg-primary",
    error: "bg-red-600",
  };
  const statusClass = statusColors[task.status] ?? "bg-gray-100 text-gray-700";
  const dotClass = dotColors[task.status] ?? "bg-gray-600";

  const iconName =
    task.type === "audio_upload"
      ? "mic"
      : task.type === "video_upload"
      ? "movie"
      : "description";

  return (
    <div className="flex items-center gap-4 p-6 hover:bg-surface-container-low transition-colors cursor-pointer">
      <div className="w-12 h-12 rounded-xl bg-surface-container flex items-center justify-center shrink-0">
        <span className="material-symbols-outlined text-on-surface-variant">{iconName}</span>
      </div>

      <div className="flex-grow">
        <h4 className="text-label-md text-on-surface">
          {task.input_file || task.input_text || task.input_url}
        </h4>
        <p className="text-body-sm text-on-surface-variant">{task.voice}</p>
      </div>

      <div className="flex items-center gap-6">
        <div className="hidden md:flex flex-col items-end">
          <span
            className={`px-3 py-1 rounded-full text-[12px] font-semibold flex items-center gap-1 ${statusClass}`}
          >
            {task.status === "processing" ? (
              <svg className="animate-spin h-3 w-3" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                />
              </svg>
            ) : (
              <span className={`w-1.5 h-1.5 rounded-full ${dotClass}`} />
            )}
            {task.status.charAt(0).toUpperCase() + task.status.slice(1)}
          </span>
          <span className="text-body-sm text-outline mt-1">
            {new Date(task.created_at).toLocaleDateString()}
          </span>
        </div>
        <span className="material-symbols-outlined text-outline">more_vert</span>
      </div>
    </div>
  );
});
