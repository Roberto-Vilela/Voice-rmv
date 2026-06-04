import HeroSection from "../components/HeroSection";
import UploadDropzone from "../components/UploadDropzone";
import CreditsCard from "../components/CreditsCard";
import RecentActivity from "../components/RecentActivity";
import WaveformPlayer from "../components/WaveformPlayer";

export default function DashboardPage() {
  return (
    <div className="space-y-stack-lg">
      <HeroSection />

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-gutter">
        <div className="lg:col-span-4 space-y-gutter">
          <UploadDropzone />
          <CreditsCard />
        </div>

        <div className="lg:col-span-8 flex flex-col gap-gutter">
          <RecentActivity />
          <WaveformPlayer />
        </div>
      </div>
    </div>
  );
}
