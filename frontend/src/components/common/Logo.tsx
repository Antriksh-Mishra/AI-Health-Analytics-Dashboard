type LogoProps = {
  size?: "sm" | "md" | "lg";
  showText?: boolean;
};

export default function Logo({ size = "md", showText = true }: LogoProps) {
  // Sizing mappings for SVG container
  const svgSizes = {
    sm: "h-9 w-9",
    md: "h-12 w-12",
    lg: "h-16 w-16",
  };

  // Sizing mappings for text branding
  const titleClasses = {
    sm: "text-base font-black tracking-tight",
    md: "text-xl font-extrabold tracking-tight",
    lg: "text-3xl font-black tracking-tight",
  };

  const subtitleClasses = {
    sm: "text-[8px] tracking-[0.12em]",
    md: "text-[10px] tracking-[0.15em]",
    lg: "text-xs tracking-[0.2em]",
  };

  const containerGap = {
    sm: "gap-2.5",
    md: "gap-3",
    lg: "gap-4",
  };

  return (
    <div className={`flex items-center ${containerGap[size]} select-none text-left`}>
      {/* MedIntel AI Vector SVG Logo Mark */}
      <svg
        viewBox="0 0 100 100"
        className={`${svgSizes[size]} shrink-0 transition-transform duration-300 hover:scale-105`}
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <linearGradient id="medintel-logo-grad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stop-color="#00d2ff" />
            <stop offset="100%" stop-color="#004e92" />
          </linearGradient>
        </defs>

        {/* Crescent Swooshes */}
        <path
          d="M 50,6 A 44,44 0 0,1 94,50"
          stroke="url(#medintel-logo-grad)"
          stroke-width="3.5"
          stroke-linecap="round"
        />
        <path
          d="M 50,94 A 44,44 0 0,1 6,50"
          stroke="url(#medintel-logo-grad)"
          stroke-width="3.5"
          stroke-linecap="round"
        />

        {/* Rounded Medical Cross */}
        <rect
          x="36"
          y="18"
          width="28"
          height="64"
          rx="9"
          fill="url(#medintel-logo-grad)"
        />
        <rect
          x="18"
          y="36"
          width="64"
          height="28"
          rx="9"
          fill="url(#medintel-logo-grad)"
        />

        {/* Heartbeat EKG Pulse Trace (White Line Overlay) */}
        <path
          d="M 18,50 L 35,50 L 39,58 L 44,32 L 48,68 L 52,42 L 55,50 L 59,50"
          stroke="#ffffff"
          stroke-width="3.2"
          stroke-linecap="round"
          stroke-linejoin="round"
        />

        {/* AI Circuit Board Nodes (White Lines + Circles Overlay) */}
        <path
          d="M 59,50 H 63 L 68,43 H 74"
          stroke="#ffffff"
          stroke-width="3"
          stroke-linecap="round"
          stroke-linejoin="round"
        />
        <path
          d="M 59,50 L 66,47 H 77"
          stroke="#ffffff"
          stroke-width="3"
          stroke-linecap="round"
          stroke-linejoin="round"
        />
        <path
          d="M 59,50 H 80"
          stroke="#ffffff"
          stroke-width="3"
          stroke-linecap="round"
          stroke-linejoin="round"
        />
        <path
          d="M 59,50 L 66,53 H 77"
          stroke="#ffffff"
          stroke-width="3"
          stroke-linecap="round"
          stroke-linejoin="round"
        />
        <path
          d="M 59,50 H 63 L 68,57 H 74"
          stroke="#ffffff"
          stroke-width="3"
          stroke-linecap="round"
          stroke-linejoin="round"
        />

        {/* Node Endpoint Circles */}
        <circle cx="75" cy="43" r="2.2" fill="#ffffff" />
        <circle cx="78" cy="47" r="2.2" fill="#ffffff" />
        <circle cx="81" cy="50" r="2.2" fill="#ffffff" />
        <circle cx="78" cy="53" r="2.2" fill="#ffffff" />
        <circle cx="75" cy="57" r="2.2" fill="#ffffff" />
      </svg>

      {/* Brand Text Branding */}
      {showText && (
        <div className="flex flex-col leading-none">
          <h1 className={`${titleClasses[size]} font-heading text-slate-900 dark:text-white flex items-baseline`}>
            MedIntel
            <span className="bg-gradient-to-r from-blue-600 to-indigo-500 bg-clip-text text-transparent ml-0.5">
              AI
            </span>
          </h1>
          
          <div className="flex items-center gap-1 mt-1 text-slate-400 dark:text-slate-500">
            <span className="h-[1px] w-2 bg-slate-300 dark:bg-slate-700"></span>
            <span className={`${subtitleClasses[size]} font-bold uppercase select-none`}>
              AI Health Analytics
            </span>
            <span className="h-[1px] w-2 bg-slate-300 dark:bg-slate-700"></span>
          </div>
        </div>
      )}
    </div>
  );
}