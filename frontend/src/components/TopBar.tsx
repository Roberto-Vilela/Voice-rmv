export default function TopBar() {
  return (
    <header className="w-full top-0 sticky bg-surface shadow-sm z-40 md:bg-background/80 md:backdrop-blur-md md:shadow-none">
      <div className="flex justify-between items-center px-margin-mobile md:px-margin-desktop h-16 w-full max-w-container-max mx-auto">
        <div className="flex items-center gap-3 md:hidden">
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
        <div className="hidden md:block">
          <h2 className="text-headline-md text-on-surface">
            Welcome back, Alex!
          </h2>
        </div>
        <div className="flex items-center gap-4">
          <button className="flex items-center text-on-surface-variant hover:bg-surface-container p-2 rounded-full transition-colors">
            <span className="material-symbols-outlined">notifications</span>
          </button>
          <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-primary-container md:hidden">
            <img
              alt="User profile photo"
              className="w-full h-full object-cover"
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuCmaSuNVo2aOI7HIPixYec9WnqDvhfR6budRty0x8LFyzjAdu_hu024d3UydjtjCGa2vnNZ_1vzLwIzacn2CBHzKKqTqd_le-tnvET_JEWiya7G9Yt6oBoMfAZyfpdW0T3wj_XXmEhzFmnPqTMx1Nesp2yWMbNOK4qQ3khwDv_Bv2_GzMt3w8SrfjtY9NsoqwhxykdZxF6SZb217Tqd2-ImxDTkd4od57UI8TvLqyQIWE-mPQT5JcN4p-x4w6LX6ZDYtw"
            />
          </div>
        </div>
      </div>
    </header>
  );
}
