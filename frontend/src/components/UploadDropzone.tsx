import { useState } from "react";
import { createUploadTask } from "../api/tasks";
import { useTasks } from "../api/hooks";

export default function UploadDropzone() {
  const [isDragOver, setIsDragOver] = useState(false);
  const { refetch } = useTasks();

  return (
    <div
      className={`bg-surface-container-lowest p-gutter rounded-2xl border-2 border-dashed flex flex-col items-center justify-center min-h-[320px] transition-all cursor-pointer group ${
        isDragOver
          ? "border-primary bg-primary-fixed"
          : "border-outline-variant hover:bg-surface-container-low hover:border-primary"
      }`}
      onDragOver={(e) => {
        e.preventDefault();
        setIsDragOver(true);
      }}
      onDragLeave={() => setIsDragOver(false)}
      onDrop={(e) => {
        e.preventDefault();
        setIsDragOver(false);
        const file = e.dataTransfer.files?.[0];
        if (file) {
          const voice = "pt-BR-FranciscaNeural";
          void createUploadTask(file, voice).then(() => refetch());
        }
      }}
    >
      <div
        className={`w-20 h-20 rounded-full bg-primary-fixed flex items-center justify-center mb-6 transition-transform ${
          isDragOver ? "scale-110" : "group-hover:scale-110"
        }`}
      >
        <span className="material-symbols-outlined text-primary text-4xl">
          upload_file
        </span>
      </div>
      <h3 className="text-headline-md text-on-surface mb-2">Upload File</h3>
      <p className="text-body-sm text-on-surface-variant text-center px-4">
        Drag and drop MP3, MP4, or WAV files. Up to 500MB.
      </p>
    </div>
  );
}
