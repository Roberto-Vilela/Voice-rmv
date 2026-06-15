import axios from "axios";

const api = axios.create({
  baseURL: "/api",
});

export async function narrateText(text: string, voice: string, speed = 1.0, pitch = 0, volume = 1.0) {
  const { data } = await api.post("/narrate/text", { text, voice, speed, pitch, volume });
  return data;
}

export async function narrateVideoUrl(url: string, voice: string) {
  const { data } = await api.post("/narrate/video-url", { url, voice });
  return data;
}

export async function narrateUpload(file: File, voice: string) {
  const form = new FormData();
  form.append("file", file);
  form.append("voice", voice);
  const { data } = await api.post("/narrate/upload", form);
  return data;
}

export async function getTask(taskId: string) {
  const { data } = await api.get(`/tasks/${taskId}`);
  return data;
}

export async function listTasks() {
  const { data } = await api.get<{ tasks: any[]; total: number }>("/tasks");
  return data.tasks;
}

export async function deleteTask(taskId: string) {
  const { data } = await api.delete(`/tasks/${taskId}`);
  return data;
}

export async function duplicateTask(taskId: string) {
  const { data } = await api.post(`/tasks/${taskId}/duplicate`);
  return data;
}

export async function patchTask(taskId: string, body: {
  display_name?: string | null;
  transcription?: string | null;
  input_text?: string | null;
  extra_data?: Record<string, unknown>;
  input_file?: string | null;
  input_url?: string | null;
  audio_path?: string | null;
}) {
  const { data } = await api.patch(`/tasks/${taskId}`, body);
  return data;
}

export type TranslationSegment = {
  id: string;
  text: string;
};

export type TranslationResponse = {
  segments: TranslationSegment[];
  translated_text: string;
};

export async function translateText(
  segments: TranslationSegment[],
  sourceLang = "auto",
  targetLang = "pt-BR",
): Promise<TranslationResponse> {
  const { data } = await api.post<TranslationResponse>("/translate", {
    segments,
    source_lang: sourceLang,
    target_lang: targetLang,
  });
  return data;
}

export async function translateTaskText(
  taskId: string,
  segments: TranslationSegment[],
  sourceLang = "auto",
  targetLang = "pt-BR",
): Promise<TranslationResponse> {
  const { data } = await api.post<TranslationResponse>(`/translate-task/${taskId}`, {
    segments,
    source_lang: sourceLang,
    target_lang: targetLang,
  });
  return data;
}

export async function getVoices() {
  const { data } = await api.get("/voices");
  return data;
}

export default api;
