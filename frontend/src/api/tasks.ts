// src/api/tasks.ts
import { narrateText, narrateVideoUrl, narrateUpload } from "./client";

export const createTextTask = (text: string, voice: string, speed = 1.0, pitch = 0, volume = 1.0) =>
  narrateText(text, voice, speed, pitch, volume);

export const createVideoUrlTask = (url: string, voice: string) =>
  narrateVideoUrl(url, voice);

export const createUploadTask = (file: File, voice: string) =>
  narrateUpload(file, voice);
