import { BrowserRouter, Routes, Route } from "react-router-dom";
import AppLayout from "./components/AppLayout";
import DashboardPage from "./pages/DashboardPage";
import VideoUrlPage from "./pages/VideoUrlPage";
import VideoUploadPage from "./pages/VideoUploadPage";
import EditorPage from "./pages/EditorPage";
import HistoryPage from "./pages/HistoryPage";
import VoiceOverPage from "./pages/VoiceOverPage";
import ProviderSettingsPage from "./pages/ProviderSettingsPage";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<AppLayout />}>
          <Route index element={<DashboardPage />} />
          <Route path="/editor" element={<EditorPage />} />
          <Route path="/voice-over" element={<VoiceOverPage />} />
          <Route path="/library" element={<VideoUploadPage />} />
          <Route path="/url" element={<VideoUrlPage />} />
          <Route path="/history" element={<HistoryPage />} />
          <Route path="/settings/provider" element={<ProviderSettingsPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
