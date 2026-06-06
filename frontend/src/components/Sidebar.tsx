import { NavLink, useNavigate } from "react-router-dom";
import { useEffect, useRef, useState } from "react";

const navItems = [
  { icon: "grid_view", label: "Dashboard", to: "/" },
  { icon: "edit_note", label: "Editor", to: "/editor" },
  { icon: "record_voice_over", label: "Voice-over", to: "/voice-over" },
  { icon: "video_library", label: "Library", to: "/library" },
];

export default function Sidebar() {
  const navigate = useNavigate();
  const menuRef = useRef<HTMLDivElement>(null);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  return (
    <aside className="hidden md:flex flex-col w-64 h-screen sticky top-0 bg-surface border-r border-outline-variant z-50">
      <div className="p-6 flex items-center gap-3 mb-8">
        <svg
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="text-primary shrink-0"
        >
          <rect x="4" y="6" width="3.5" height="12" rx="1.75" fill="currentColor" />
          <rect x="10.25" y="2" width="3.5" height="20" rx="1.75" fill="currentColor" />
          <rect x="16.5" y="6" width="3.5" height="12" rx="1.75" fill="currentColor" />
        </svg>
        <span className="text-headline-md font-bold text-primary">
          Voice RMV
        </span>
      </div>
      <nav className="flex-grow px-4 space-y-1">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.to === "/"}
            className={({ isActive }) =>
              `sidebar-item flex items-center gap-3 px-4 py-3 rounded-xl transition-all hover:bg-surface-container ${
                isActive
                  ? "active"
                  : "text-on-surface-variant"
              }`
            }
          >
            <span className="material-symbols-outlined">{item.icon}</span>
            <span className="text-label-md">{item.label}</span>
          </NavLink>
        ))}
      </nav>
      <div className="p-4 mt-auto border-t border-outline-variant">
        <div className="relative flex items-center gap-3 p-2" ref={menuRef}>
          <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-primary-container shrink-0">
            <img
              alt="User profile photo"
              className="w-full h-full object-cover"
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuCmaSuNVo2aOI7HIPixYec9WnqDvhfR6budRty0x8LFyzjAdu_hu024d3UydjtjCGa2vnNZ_1vzLwIzacn2CBHzKKqTqd_le-tnvET_JEWiya7G9Yt6oBoMfAZyfpdW0T3wj_XXmEhzFmnPqTMx1Nesp2yWMbNOPI7zWMJok4qQ3khwDv_Bv2_GzMt3w8SrfjtY9NsoqwhxykdZxF6SZb217Tqd2-ImxDTkd4od57UI8TvLqyQIWE-mPQT5JcN4p-x4w6LX6ZDYtw"
            />
          </div>
          <div className="truncate">
            <p className="text-label-md text-on-surface truncate">
              Alex Rivera
            </p>
            <p className="text-[12px] text-on-surface-variant truncate">
              Pro Plan
            </p>
          </div>
          <button
            className="ml-auto text-on-surface-variant hover:bg-surface-container p-2 rounded-full transition-colors"
            onClick={() => setMenuOpen((current) => !current)}
            aria-haspopup="menu"
            aria-expanded={menuOpen}
          >
            <span className="material-symbols-outlined">settings</span>
          </button>
          {menuOpen && (
            <div className="absolute right-2 bottom-full mb-2 w-48 rounded-xl border border-outline-variant bg-surface shadow-lg overflow-hidden z-50">
              <button
                className="w-full flex items-center gap-3 px-4 py-3 text-left text-label-md text-on-surface hover:bg-surface-container"
                onClick={() => {
                  setMenuOpen(false);
                  navigate("/settings/provider");
                }}
              >
                <span className="material-symbols-outlined text-on-surface-variant text-[18px]">tune</span>
                Provedor
              </button>
            </div>
          )}
        </div>
      </div>
    </aside>
  );
}
