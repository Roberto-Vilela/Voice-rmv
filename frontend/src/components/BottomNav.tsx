import { NavLink } from "react-router-dom";

const navItems = [
  { icon: "grid_view", label: "Dashboard", to: "/" },
  { icon: "edit_note", label: "Editor", to: "/editor" },
  { icon: "record_voice_over", label: "Voice-over", to: "/voice-over" },
  { icon: "video_library", label: "Library", to: "/library" },
];

export default function BottomNav() {
  return (
    <nav className="fixed bottom-0 left-0 w-full z-50 flex justify-around items-center py-2 px-2 bg-surface border-t border-outline-variant shadow-lg md:hidden">
      {navItems.map((item) => (
        <NavLink
          key={item.to}
          to={item.to}
          end={item.to === "/"}
          className={({ isActive }) =>
            `flex flex-col items-center justify-center px-4 py-1 active:scale-90 transition-all ${
              isActive
                ? "bg-primary text-white rounded-xl"
                : "text-on-surface-variant hover:bg-surface-container-high"
            }`
          }
        >
          <span className="material-symbols-outlined">{item.icon}</span>
          <span className="text-label-md text-[10px]">{item.label}</span>
        </NavLink>
      ))}
    </nav>
  );
}
