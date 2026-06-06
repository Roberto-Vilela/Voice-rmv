export type TaskStatus = "pending" | "processing" | "completed" | "error";

export interface TaskExtraData {
  display_name?: string;
  transcription_segments?: Array<{
    start?: number;
    end?: number;
    text?: string;
    speaker?: string;
  }>;
  editor_segments?: Array<{
    id: string;
    start: number;
    end: number;
    speaker: string;
    html: string;
  }>;
  [key: string]: unknown;
}

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
  extra_data?: TaskExtraData | null;
  created_at: string;
  updated_at: string;
}

export interface Voice {
  name: string;
  locale: string;
  gender: string;
}
