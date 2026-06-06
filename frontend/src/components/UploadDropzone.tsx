import { useState, useRef } from "react";
import { createUploadTask } from "../api/tasks";
import { useTasks } from "../api/hooks";

interface Props {
  voice: string;
}

export default function UploadDropzone({ voice }: Props) {
  const [isDragOver, setIsDragOver] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const { refetch } = useTasks();

  const handleFile = (file: File) => {
    setError(null);
    setIsSuccess(false);
    setIsUploading(true);
    createUploadTask(file, voice)
      .then(() => {
        setIsSuccess(true);
        return refetch();
      })
      .catch((err) => setError(err?.response?.data?.detail || err.message || "Upload failed"))
      .finally(() => setIsUploading(false));
  };

  const handleInteraction = () => {
    setError(null);
  };

  return (
    <div
      className={`relative bg-surface-container-lowest p-gutter rounded-2xl border-2 border-dashed flex flex-col items-center justify-center min-h-[320px] transition-all cursor-pointer group pt-10 ${
        isDragOver
          ? "border-primary bg-primary-fixed"
          : isUploading
          ? "border-secondary bg-secondary-fixed"
          : isSuccess
          ? "border-green-500 bg-green-50"
          : error
          ? "border-error bg-error-fixed"
          : "border-outline-variant hover:bg-surface-container-low hover:border-primary"
      }`}
      onDragOver={(e) => {
        e.preventDefault();
        handleInteraction();
        setIsDragOver(true);
      }}
      onDragLeave={() => setIsDragOver(false)}
      onDrop={(e) => {
        e.preventDefault();
        setIsDragOver(false);
        handleInteraction();
        const file = e.dataTransfer.files?.[0];
        if (file) handleFile(file);
      }}
      onClick={() => {
        handleInteraction();
        setIsSuccess(false);
        inputRef.current?.click();
      }}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { handleInteraction(); setIsSuccess(false); inputRef.current?.click(); } }}
    >
      <div className="absolute -top-4 left-6 w-9 h-9 rounded-full border-2 border-white bg-orange-500 text-white flex items-center justify-center text-label-md shadow-md">
        2
      </div>
      <input
        ref={inputRef}
        type="file"
        accept=".mp3,.wav,.m4a,.mp4,.mkv,.avi,.mov,.webm"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) handleFile(file);
          e.target.value = "";
        }}
      />
      <div
        className={`w-20 h-20 rounded-full flex items-center justify-center mb-6 transition-transform ${
          isUploading
            ? "bg-secondary-fixed scale-110 animate-pulse"
            : isSuccess
            ? "bg-green-200 scale-110"
            : error
            ? "bg-error-fixed"
            : "bg-primary-fixed group-hover:scale-110"
        } ${isDragOver ? "scale-110" : ""}`}
      >
        <span className="material-symbols-outlined text-4xl text-primary">
          {isUploading ? "sync" : isSuccess ? "check_circle" : "upload_file"}
        </span>
      </div>
      <h3 className="text-headline-md text-on-surface mb-2">
        {isUploading ? "Uploading..." : isSuccess ? "Uploaded" : "Upload File"}
      </h3>
      <p className="text-body-sm text-center px-4">
        {error
          ? <span className="text-error">{error}</span>
          : isUploading
          ? <span className="text-on-surface-variant">Processing your file with {voice}…</span>
          : isSuccess
          ? <span className="text-green-700">File uploaded successfully.</span>
          : <span className="text-on-surface-variant">Drag and drop or click to select MP3, MP4, or WAV files. Up to 500MB.</span>
        }
      </p>
    </div>
  );
}
