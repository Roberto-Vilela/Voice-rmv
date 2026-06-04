// src/api/tasks.ts
import { narrateText, narrateVideoUrl, narrateUpload } from "./client";

export const createTextTask = (text: string, voice: string) =>
  narrateText(text, voice);

export const createVideoUrlTask = (url: string, voice: string) =>
  narrateVideoUrl(url, voice);

export const createUploadTask = (file: File, voice: string) =>
  narrateUpload(file, voice);
