import axios from "axios";

const api = axios.create({
  baseURL: "/api",
});

export async function narrateText(text: string, voice: string) {
  const { data } = await api.post("/narrate/text", { text, voice });
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
  const { data } = await api.get("/tasks");
  return data;
}

export async function getVoices() {
  const { data } = await api.get("/voices");
  return data;
}

export default api;
