import React, { useEffect, useRef, useState } from "react";
import type { Task } from "../types";
import { deleteTask, duplicateTask } from "../api/client";
import AudioModal from "./AudioModal";

interface Props {
  task: Task;
  onRefetch?: () => void;
  onSelectTask?: (task: Task) => void;
}

export default React.memo(function TaskRow({ task, onRefetch, onSelectTask }: Props) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

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
    task.type === "audio_upload" ? "mic"
    : task.type === "video_upload" ? "movie"
    : "description";

  const handleDuplicate = async () => {
    await duplicateTask(task.id);
    setMenuOpen(false);
    onRefetch?.();
  };

  const handleDelete = async () => {
    await deleteTask(task.id);
    setMenuOpen(false);
    onRefetch?.();
  };

  const handlePlayAudio = () => {
    setMenuOpen(false);
    setModalOpen(true);
  };

  const handleEditText = () => {
    window.location.href = `/editor?taskId=${task.id}`;
    setMenuOpen(false);
  };

  const handleRerecord = () => {
    window.location.href = `/voice-over?taskId=${task.id}`;
    setMenuOpen(false);
  };

  return (
    <div className="flex items-center gap-4 p-6 hover:bg-surface-container-low transition-colors cursor-pointer" onClick={() => onSelectTask?.(task)}>
      <div className="w-12 h-12 rounded-xl bg-surface-container flex items-center justify-center shrink-0">
        <span className="material-symbols-outlined text-on-surface-variant">{iconName}</span>
      </div>

      <div className="flex-grow min-w-0">
        <h4 className="text-label-md text-on-surface truncate">
          {task.input_file || task.input_text || task.input_url}
        </h4>
        <p className="text-body-sm text-on-surface-variant">{task.voice}</p>
      </div>

      <div className="flex items-center gap-6">
        <div className="hidden md:flex flex-col items-end">
          <span className={`px-3 py-1 rounded-full text-[12px] font-semibold flex items-center gap-1 ${statusClass}`}>
            {task.status === "processing" ? (
              <svg className="animate-spin h-3 w-3" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
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

        <div className="relative" ref={menuRef} onClick={(e) => e.stopPropagation()}>
          <button onClick={(e) => { e.stopPropagation(); setMenuOpen(!menuOpen); }} className="material-symbols-outlined text-outline hover:text-on-surface p-1 rounded-full hover:bg-surface-container transition-colors">
            more_vert
          </button>
          {menuOpen && (
            <div className="absolute right-0 top-full mt-2 w-56 bg-white rounded-xl shadow-lg border border-outline-variant z-50 py-1 overflow-hidden">
              {task.audio_url && (
                <button onClick={handlePlayAudio} className="w-full flex items-center gap-3 px-4 py-2.5 text-label-md text-on-surface hover:bg-surface-container text-left">
                  <span className="material-symbols-outlined text-on-surface-variant text-[18px]">play_arrow</span>
                  Reproduzir áudio
                </button>
              )}
              {task.input_text && (
                <button onClick={handleEditText} className="w-full flex items-center gap-3 px-4 py-2.5 text-label-md text-on-surface hover:bg-surface-container text-left">
                  <span className="material-symbols-outlined text-on-surface-variant text-[18px]">edit</span>
                  Editar para texto
                </button>
              )}
              {task.type === "audio_upload" && (
                <button onClick={handleRerecord} className="w-full flex items-center gap-3 px-4 py-2.5 text-label-md text-on-surface hover:bg-surface-container text-left">
                  <span className="material-symbols-outlined text-on-surface-variant text-[18px]">mic</span>
                  Regravar voz
                </button>
              )}
              <button onClick={handleDuplicate} className="w-full flex items-center gap-3 px-4 py-2.5 text-label-md text-on-surface hover:bg-surface-container text-left">
                <span className="material-symbols-outlined text-on-surface-variant text-[18px]">content_copy</span>
                Duplicar
              </button>
              <button onClick={handleDelete} className="w-full flex items-center gap-3 px-4 py-2.5 text-label-md text-error hover:bg-error-fixed text-left">
                <span className="material-symbols-outlined text-error text-[18px]">delete</span>
                Excluir
              </button>
            </div>
          )}
          {modalOpen && task.audio_url && (
            <AudioModal task={task} onClose={() => setModalOpen(false)} />
          )}
        </div>
      </div>
    </div>
  );
});
