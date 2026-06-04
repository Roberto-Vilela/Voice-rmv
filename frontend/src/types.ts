export type TaskStatus = "pending" | "processing" | "completed" | "error";

export interface Task {
  id: string;
  type: string;
  status: TaskStatus;
  progress: number;
  voice: string;
  input_text?: string;
  input_url?: string;
  input_file?: string;
  transcription?: string;
  audio_url?: string;
  duration_seconds?: number;
  error?: string;
  created_at: string;
  updated_at: string;
}

export interface Voice {
  name: string;
  locale: string;
  gender: string;
}
