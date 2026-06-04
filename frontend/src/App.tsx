import { BrowserRouter, Routes, Route } from "react-router-dom";
import AppLayout from "./components/AppLayout";
import DashboardPage from "./pages/DashboardPage";
import VideoUrlPage from "./pages/VideoUrlPage";
import AudioUploadPage from "./pages/AudioUploadPage";
import VideoUploadPage from "./pages/VideoUploadPage";
import TextPage from "./pages/TextPage";
import HistoryPage from "./pages/HistoryPage";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<AppLayout />}>
          <Route index element={<DashboardPage />} />
          <Route path="/editor" element={<TextPage />} />
          <Route path="/voice-over" element={<AudioUploadPage />} />
          <Route path="/library" element={<VideoUploadPage />} />
          <Route path="/url" element={<VideoUrlPage />} />
          <Route path="/history" element={<HistoryPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
