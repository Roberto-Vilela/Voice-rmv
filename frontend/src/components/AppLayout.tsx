import { Outlet } from "react-router-dom";
import Sidebar from "./Sidebar";
import TopBar from "./TopBar";
import BottomNav from "./BottomNav";

export default function AppLayout() {
  return (
    <div className="bg-background text-on-background min-h-screen pb-24 md:pb-0 flex flex-col md:flex-row">
      <Sidebar />
      <div className="flex-grow flex flex-col min-w-0">
        <TopBar />
        <main className="max-w-container-max w-full mx-auto px-margin-mobile md:px-margin-desktop mt-stack-lg space-y-stack-lg pb-12">
          <Outlet />
        </main>
      </div>
      <BottomNav />
    </div>
  );
}
