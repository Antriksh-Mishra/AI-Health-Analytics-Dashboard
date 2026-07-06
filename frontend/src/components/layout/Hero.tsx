import { motion } from "framer-motion";
import { ArrowRight, Sparkles, Shield, Cpu, CheckCircle2, TrendingUp } from "lucide-react";
import { useNavigate } from "react-router-dom";
import Button from "../common/Button";

export default function Hero() {
  const navigate = useNavigate();

  // Animation constants for staggered entrance
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15,
        delayChildren: 0.1,
      },
    },
  } as const;

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { type: "spring" as const, stiffness: 100, damping: 15 },
    },
  } as const;

  return (
    <section className="relative pt-36 pb-24 px-6 md:px-12 w-full overflow-hidden grid-bg dark:grid-bg-dark">
      {/* Background radial spotlights */}
      <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] rounded-full bg-blue-500/10 blur-[120px] pointer-events-none animate-blob"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[55%] h-[55%] rounded-full bg-indigo-500/10 blur-[130px] pointer-events-none animate-blob animation-delay-2000"></div>

      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-16 items-center">
        {/* Left: Heading and Core Info */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="lg:col-span-6 flex flex-col text-left space-y-6"
        >
          {/* HIPAA Pill Label */}
          <motion.div
            variants={itemVariants}
            className="inline-flex items-center gap-2 self-start bg-blue-50/80 border border-blue-100/50 px-3.5 py-1.5 rounded-full dark:bg-blue-950/40 dark:border-blue-900/30"
          >
            <Shield size={14} className="text-blue-600 dark:text-blue-400" />
            <span className="text-xs font-semibold text-blue-700 dark:text-blue-300 font-sans tracking-wide uppercase">
              HIPAA Compliant & Secure
            </span>
          </motion.div>

          {/* Heading */}
          <motion.h1
            variants={itemVariants}
            className="text-4xl md:text-5xl lg:text-6xl font-black font-heading leading-[1.08] text-slate-900 dark:text-white"
          >
            AI-Powered
            <span className="block mt-2 bg-gradient-to-r from-blue-600 via-indigo-600 to-violet-600 bg-clip-text text-transparent dark:from-blue-400 dark:to-indigo-300">
              Health Intelligence
            </span>
          </motion.h1>

          {/* Paragraph */}
          <motion.p
            variants={itemVariants}
            className="text-lg text-slate-600 dark:text-slate-300 max-w-xl leading-relaxed"
          >
            Transform raw medical reports, blood tests, and scans into clean visual trends, personalized diagnostic explanations, and risk forecasts using EasyOCR and Google Gemini AI.
          </motion.p>

          {/* Key Checklist Benefits */}
          <motion.div
            variants={itemVariants}
            className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2"
          >
            {[
              "Extracts 50+ lab metrics instantly",
              "Interactive health trend charts",
              "Gemini-powered clinical summary",
              "Multi-report side-by-side comparison",
            ].map((text, idx) => (
              <div key={idx} className="flex items-center gap-2 text-slate-600 dark:text-slate-400">
                <CheckCircle2 size={16} className="text-green-500 shrink-0" />
                <span className="text-sm font-medium">{text}</span>
              </div>
            ))}
          </motion.div>

          {/* Buttons CTA */}
          <motion.div
            variants={itemVariants}
            className="flex flex-col sm:flex-row gap-4 pt-4"
          >
            <Button
              variant="primary"
              size="lg"
              rightIcon={<ArrowRight size={18} />}
              onClick={() => navigate("/register")}
            >
              Get Started Free
            </Button>
            <Button
              variant="outline"
              size="lg"
              onClick={() => {
                const el = document.querySelector("#features");
                el?.scrollIntoView({ behavior: "smooth" });
              }}
            >
              Learn More
            </Button>
          </motion.div>
        </motion.div>

        {/* Right: Dynamic Interactive Dashboard Mockup */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 30 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ type: "spring", stiffness: 60, damping: 15, delay: 0.4 }}
          className="lg:col-span-6 relative w-full"
        >
          {/* Main Glassmorphic Panel Mockup */}
          <div className="relative rounded-3xl border border-slate-200 bg-white/80 p-6 shadow-2xl shadow-slate-300/40 backdrop-blur-md dark:border-slate-800 dark:bg-slate-900/60 dark:shadow-black/50 w-full overflow-hidden">
            {/* Header of Dashboard Mockup */}
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800/80 pb-4 mb-6">
              <div className="flex items-center gap-3">
                <div className="h-2.5 w-2.5 rounded-full bg-red-400"></div>
                <div className="h-2.5 w-2.5 rounded-full bg-yellow-400"></div>
                <div className="h-2.5 w-2.5 rounded-full bg-green-400"></div>
                <span className="text-xs font-semibold text-slate-400 dark:text-slate-500 font-mono ml-2">
                  MEDINTEL_PANEL_V1.0
                </span>
              </div>
              <div className="flex items-center gap-2 bg-blue-50 dark:bg-blue-900/30 px-3 py-1 rounded-full text-[10px] font-bold text-blue-600 dark:text-blue-400">
                <Cpu size={12} className="animate-spin" />
                Gemini Active
              </div>
            </div>

            {/* Mock Layout */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Box 1: Health Score widget */}
              <div className="rounded-2xl border border-slate-100 bg-white p-4 shadow-sm dark:border-slate-800/60 dark:bg-slate-950/40">
                <span className="text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider block mb-1">
                  Overall Health Score
                </span>
                <div className="flex items-baseline gap-2">
                  <span className="text-4xl font-extrabold font-mono text-slate-800 dark:text-white">
                    84
                  </span>
                  <span className="text-sm font-semibold text-green-500 font-mono">
                    +4% (Good)
                  </span>
                </div>
                {/* Visual Gauge Bar */}
                <div className="w-full bg-slate-100 dark:bg-slate-800 h-2.5 rounded-full mt-3 overflow-hidden">
                  <div className="bg-gradient-to-r from-blue-500 to-green-500 h-full rounded-full w-[84%]"></div>
                </div>
              </div>

              {/* Box 2: Patient Card */}
              <div className="rounded-2xl border border-slate-100 bg-white p-4 shadow-sm dark:border-slate-800/60 dark:bg-slate-950/40">
                <span className="text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider block mb-1">
                  Extracted Demographics
                </span>
                <div className="space-y-1">
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-400 font-medium">Name:</span>
                    <span className="font-semibold text-slate-800 dark:text-slate-200">Sarah Jenkins</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-400 font-medium">Age/Gender:</span>
                    <span className="font-semibold text-slate-800 dark:text-slate-200">38 / Female</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-400 font-medium">Date:</span>
                    <span className="font-semibold text-slate-800 dark:text-slate-200">May 12, 2026</span>
                  </div>
                </div>
              </div>

              {/* Box 3: Extraction Table */}
              <div className="md:col-span-2 rounded-2xl border border-slate-100 bg-white p-4 shadow-sm dark:border-slate-800/60 dark:bg-slate-950/40">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                    Extracted Lab Values
                  </span>
                  <div className="flex items-center gap-1 text-slate-400 text-xs">
                    <TrendingUp size={12} className="text-blue-500" />
                    <span>OCR Accuracy: 98%</span>
                  </div>
                </div>
                <div className="space-y-2.5">
                  {/* Row 1 */}
                  <div className="flex items-center justify-between py-1.5 border-b border-slate-50 dark:border-slate-900">
                    <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">Hemoglobin</span>
                    <div className="flex items-center gap-3">
                      <span className="text-xs font-bold font-mono text-slate-800 dark:text-slate-200">14.2 g/dL</span>
                      <span className="text-[10px] font-bold bg-green-50 text-green-600 px-2 py-0.5 rounded-full dark:bg-green-950/20 dark:text-green-400">
                        Optimal
                      </span>
                    </div>
                  </div>
                  {/* Row 2 */}
                  <div className="flex items-center justify-between py-1.5 border-b border-slate-50 dark:border-slate-900">
                    <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">Blood Sugar (Fasting)</span>
                    <div className="flex items-center gap-3">
                      <span className="text-xs font-bold font-mono text-slate-800 dark:text-slate-200">126 mg/dL</span>
                      <span className="text-[10px] font-bold bg-amber-50 text-amber-600 px-2 py-0.5 rounded-full dark:bg-amber-950/20 dark:text-amber-400 animate-pulse">
                        Elevated
                      </span>
                    </div>
                  </div>
                  {/* Row 3 */}
                  <div className="flex items-center justify-between py-1.5">
                    <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">Vitamin D (25-OH)</span>
                    <div className="flex items-center gap-3">
                      <span className="text-xs font-bold font-mono text-slate-800 dark:text-slate-200">19 ng/mL</span>
                      <span className="text-[10px] font-bold bg-red-50 text-red-600 px-2 py-0.5 rounded-full dark:bg-red-950/20 dark:text-red-400 animate-pulse">
                        Deficient
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Box 4: AI Recommendations */}
              <div className="md:col-span-2 rounded-2xl border border-slate-50 bg-blue-50/30 p-4 dark:border-blue-900/10 dark:bg-blue-950/10 text-left">
                <div className="flex items-center gap-2 mb-2 text-blue-600 dark:text-blue-400">
                  <Sparkles size={14} className="animate-pulse" />
                  <span className="text-xs font-bold uppercase tracking-wider">
                    Gemini AI Clinical Summary
                  </span>
                </div>
                <p className="text-xs leading-relaxed text-slate-600 dark:text-slate-400">
                  Patient presents deficient Vitamin D and mild fasting hyperglycemia (126 mg/dL). Recommended: initiate cholecalciferol supplementation (2000 IU/day), monitor glucose index, reduce carbohydrate load, and schedule re-testing in 6 weeks.
                </p>
              </div>
            </div>
          </div>

          {/* Outer floating accents for high aesthetic effect */}
          <div className="absolute top-[20%] right-[-6%] rounded-2xl border border-slate-100 bg-white p-3 shadow-lg dark:border-slate-800 dark:bg-slate-950/60 hidden sm:flex items-center gap-3 select-none hover:-translate-y-1 transition-transform pointer-events-none">
            <div className="h-8 w-8 rounded-lg bg-green-500/10 flex items-center justify-center text-green-500">
              <CheckCircle2 size={16} />
            </div>
            <div>
              <p className="text-[10px] text-slate-400 font-semibold uppercase">Security Status</p>
              <p className="text-xs font-bold text-slate-800 dark:text-slate-200">256-bit Encrypted</p>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
