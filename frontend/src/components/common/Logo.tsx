import { Activity } from "lucide-react";

type LogoProps = {
  size?: "sm" | "md" | "lg";
};

export default function Logo({ size = "md" }: LogoProps) {
  const containerClasses = {
    sm: "gap-2.5",
    md: "gap-3",
    lg: "gap-4",
  };

  const iconWrapperClasses = {
    sm: "h-9 w-9 rounded-lg text-lg",
    md: "h-11 w-11 rounded-xl text-xl",
    lg: "h-14 w-14 rounded-2xl text-2xl",
  };

  const iconSizes = {
    sm: 18,
    md: 22,
    lg: 28,
  };

  const titleClasses = {
    sm: "text-lg font-bold tracking-tight",
    md: "text-xl font-extrabold tracking-tight",
    lg: "text-3xl font-black tracking-tight",
  };

  const subtitleClasses = {
    sm: "text-[10px]",
    md: "text-xs",
    lg: "text-sm",
  };

  return (
    <div className={`flex items-center ${containerClasses[size]} select-none`}>
      {/* Icon Wrapper with Gradient and Glow */}
      <div 
        className={`flex items-center justify-center bg-gradient-to-tr from-blue-600 to-indigo-500 text-white shadow-md shadow-blue-500/20 transition-transform duration-300 hover:rotate-6 ${iconWrapperClasses[size]}`}
      >
        <Activity size={iconSizes[size]} className="animate-pulse" />
      </div>

      {/* Brand Text */}
      <div className="flex flex-col leading-tight">
        <h1 
          className={`bg-gradient-to-r from-blue-600 via-indigo-600 to-indigo-800 bg-clip-text font-heading text-transparent dark:from-blue-400 dark:to-indigo-300 ${titleClasses[size]}`}
        >
          MedIntel<span className="text-slate-900 dark:text-slate-100 font-medium">AI</span>
        </h1>
        <p className={`font-sans font-medium text-slate-500 dark:text-slate-400 ${subtitleClasses[size]}`}>
          AI-Powered Health Analytics
        </p>
      </div>
    </div>
  );
}