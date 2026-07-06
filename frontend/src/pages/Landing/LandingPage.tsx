import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import {
  UploadCloud,
  BrainCircuit,
  BarChart3,
  Columns2,
  Mail,
  ChevronDown,
  Sparkles,
  ShieldCheck,
  FileCheck2,
  MessageSquare,
  Lock,
} from "lucide-react";
import Navbar from "../../components/layout/Navbar";
import Hero from "../../components/layout/Hero";
import Button from "../../components/common/Button";

export default function LandingPage() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<"ocr" | "trends" | "ai">("ocr");
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const features = [
    {
      icon: <UploadCloud className="text-blue-500" size={26} />,
      title: "Smart Report Extraction",
      desc: "Drag-and-drop blood test PDFs or clinical images. EasyOCR extracts vitals, dates, and metrics within seconds.",
    },
    {
      icon: <BrainCircuit className="text-indigo-500" size={26} />,
      title: "Gemini AI Medical Analysis",
      desc: "Generates clinical summaries, highlights abnormal values, explains complex medical jargon, and suggests lifestyle changes.",
    },
    {
      icon: <BarChart3 className="text-violet-500" size={26} />,
      title: "Longitudinal Analytics",
      desc: "Visualize your wellness over time. Compare blood glucose, cholesterol, and vitamins on interactive charts.",
    },
    {
      icon: <Columns2 className="text-blue-500" size={26} />,
      title: "Report Comparison",
      desc: "Select two reports side-by-side. View direct delta offsets, health direction markers, and a combined AI comparison.",
    },
    {
      icon: <Mail className="text-indigo-500" size={26} />,
      title: "PDF & Direct Email Reports",
      desc: "Download high-quality summary report PDFs or email them directly to your general practitioner from the app.",
    },
    {
      icon: <Lock className="text-violet-500" size={26} />,
      title: "Secure Encrypted Database",
      desc: "All health data is stored in isolated relational databases with AES-256 encryption. We prioritize privacy first.",
    },
  ];

  const steps = [
    {
      num: "01",
      title: "Upload Document",
      desc: "Securely drag-and-drop a scan or PDF from your laboratory.",
      icon: <UploadCloud className="text-blue-600 dark:text-blue-400" size={24} />,
    },
    {
      num: "02",
      title: "Automated OCR Processing",
      desc: "EasyOCR reads columns, numeric results, and reference ranges.",
      icon: <FileCheck2 className="text-indigo-600 dark:text-indigo-400" size={24} />,
    },
    {
      num: "03",
      title: "AI Medical Synthesis",
      desc: "Gemini API flags deviations, writes summaries, and offers actions.",
      icon: <BrainCircuit className="text-violet-600 dark:text-violet-400" size={24} />,
    },
    {
      num: "04",
      title: "Interactive Analytics",
      desc: "Plotly and Recharts map historical records to visualize trends.",
      icon: <BarChart3 className="text-blue-600 dark:text-blue-400" size={24} />,
    },
  ];

  const faqs = [
    {
      q: "Is MedIntel AI HIPAA compliant?",
      a: "Yes, MedIntel AI implements industry-standard privacy protocols. All uploaded files and extracted medical database rows are encrypted at rest with AES-256 and in transit using TLS 1.3.",
    },
    {
      q: "How accurate is the medical report OCR?",
      a: "Our parsing engine uses EasyOCR coupled with a custom heuristic mapping layer. It extracts numerical values and reference ranges with approximately 98% accuracy on clear digital PDFs and scans.",
    },
    {
      q: "What file formats are supported?",
      a: "We support standard document types including PDF, JPEG, PNG, and TIFF. PDFs with selectable text yield the fastest and most accurate extractions.",
    },
    {
      q: "Can I share my health analytics with my doctor?",
      a: "Absolutely. You can generate a consolidated PDF health report card or use our email sharing service directly in the dashboard to send reports straight to your doctor's office.",
    },
  ];

  return (
    <div className="flex-1 w-full bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors duration-300">
      <Navbar />
      <Hero />

      <section id="features" className="py-24 px-6 md:px-12 w-full bg-white dark:bg-slate-900 border-y border-slate-100 dark:border-slate-800/50">
        <div className="max-w-7xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.5 }}
            className="space-y-4 max-w-2xl mx-auto mb-16"
          >
            <span className="text-xs font-bold text-blue-600 dark:text-blue-400 uppercase tracking-widest bg-blue-50 dark:bg-blue-900/30 px-3.5 py-1.5 rounded-full">
              Enterprise Features
            </span>
            <h2 className="text-3xl md:text-4xl font-extrabold font-heading text-slate-900 dark:text-white">
              End-to-End Health Analytics
            </h2>
            <p className="text-slate-500 dark:text-slate-400">
              Powerful modules customized to extract, synthesize, chart, and communicate critical clinical observations.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: idx * 0.1 }}
                className="group p-8 rounded-3xl border border-slate-100 bg-slate-50/50 dark:border-slate-800/40 dark:bg-slate-950/20 text-left transition-all duration-300 hover:bg-white hover:border-slate-200 hover:shadow-xl hover:shadow-slate-200/50 dark:hover:bg-slate-900 dark:hover:border-slate-700/80 dark:hover:shadow-black/40 hover:-translate-y-1"
              >
                <div className="h-12 w-12 rounded-xl bg-white shadow-md flex items-center justify-center dark:bg-slate-900 dark:border dark:border-slate-800 mb-6 group-hover:scale-110 transition-transform">
                  {feature.icon}
                </div>
                <h3 className="text-lg font-bold font-heading text-slate-900 dark:text-white mb-2">
                  {feature.title}
                </h3>
                <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
                  {feature.desc}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <section id="how-it-works" className="py-24 px-6 md:px-12 w-full grid-bg dark:grid-bg-dark">
        <div className="max-w-7xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.5 }}
            className="space-y-4 max-w-2xl mx-auto mb-20"
          >
            <span className="text-xs font-bold text-blue-600 dark:text-blue-400 uppercase tracking-widest bg-blue-50 dark:bg-blue-900/30 px-3.5 py-1.5 rounded-full">
              Workflow Pipeline
            </span>
            <h2 className="text-3xl md:text-4xl font-extrabold font-heading text-slate-900 dark:text-white">
              How MedIntel AI Works
            </h2>
            <p className="text-slate-500 dark:text-slate-400">
              Four steps that bridge clinical reports and interactive wellness analytics.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 relative">
            {steps.map((step, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: idx * 0.15 }}
                className="relative p-6 rounded-2xl bg-white border border-slate-100 dark:bg-slate-900 dark:border-slate-800 flex flex-col text-left space-y-4 shadow-sm"
              >
                {idx < 3 && (
                  <div className="hidden lg:block absolute top-1/2 -right-4 w-8 h-[2px] bg-slate-200 dark:bg-slate-800 z-0"></div>
                )}
                <div className="flex items-center justify-between">
                  <div className="h-10 w-10 rounded-lg bg-blue-50 dark:bg-blue-950 flex items-center justify-center">
                    {step.icon}
                  </div>
                  <span className="text-2xl font-black font-mono text-slate-200 dark:text-slate-800">
                    {step.num}
                  </span>
                </div>
                <h3 className="text-base font-bold font-heading text-slate-900 dark:text-white">
                  {step.title}
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                  {step.desc}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <section id="preview" className="py-24 px-6 md:px-12 w-full bg-white dark:bg-slate-900 border-t border-slate-100 dark:border-slate-800/50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <h2 className="text-3xl md:text-4xl font-extrabold font-heading text-slate-900 dark:text-white mb-4">
              Explore the Clinical Workspace
            </h2>
            <p className="text-slate-500 dark:text-slate-400">
              Interactive preview showcasing mock implementations of the main modules. Click tabs to cycle screens.
            </p>
          </div>

          <div className="flex justify-center mb-8">
            <div className="inline-flex p-1 rounded-2xl bg-slate-100 dark:bg-slate-950 border border-slate-200/50 dark:border-slate-800">
              {[
                { id: "ocr", name: "OCR Extractor" },
                { id: "trends", name: "Trend Graphs" },
                { id: "ai", name: "AI Health Buddy" },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`px-5 py-2.5 rounded-xl text-sm font-semibold transition-all duration-300 cursor-pointer ${
                    activeTab === tab.id
                      ? "bg-white shadow-sm text-blue-600 dark:bg-slate-900 dark:text-blue-400"
                      : "text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200"
                  }`}
                >
                  {tab.name}
                </button>
              ))}
            </div>
          </div>

          <div className="rounded-3xl border border-slate-200 bg-slate-50 p-4 md:p-8 dark:border-slate-800 dark:bg-slate-950/40 max-w-5xl mx-auto shadow-inner">
            <AnimatePresence mode="wait">
              {activeTab === "ocr" && (
                <motion.div
                  key="ocr"
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -15 }}
                  transition={{ duration: 0.3 }}
                  className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch"
                >
                  <div className="lg:col-span-5 rounded-2xl border-2 border-dashed border-slate-200 bg-white p-8 flex flex-col items-center justify-center text-center dark:border-slate-800 dark:bg-slate-950/60 min-h-[300px]">
                    <div className="h-14 w-14 rounded-full bg-blue-50 dark:bg-blue-950 flex items-center justify-center mb-4">
                      <UploadCloud className="text-blue-600 dark:text-blue-400" size={28} />
                    </div>
                    <h3 className="text-base font-bold text-slate-800 dark:text-slate-200 mb-1">
                      Drag report file here
                    </h3>
                    <p className="text-xs text-slate-400 dark:text-slate-500 mb-4 max-w-[200px]">
                      Supports PDF, PNG, or JPG up to 10MB
                    </p>
                    <div className="bg-blue-50 dark:bg-blue-950 text-blue-600 dark:text-blue-400 text-xs px-3.5 py-1.5 rounded-full font-bold">
                      Select Medical File
                    </div>
                  </div>

                  <div className="lg:col-span-7 rounded-2xl bg-white border border-slate-200/60 p-6 dark:bg-slate-900 dark:border-slate-800 flex flex-col justify-between">
                    <div>
                      <div className="flex justify-between items-center pb-3 border-b border-slate-100 dark:border-slate-800 mb-4">
                        <span className="text-sm font-extrabold text-slate-800 dark:text-slate-200">
                          Extracted Metrics
                        </span>
                        <span className="text-xs font-bold text-green-500">
                          Status: Extraction Complete
                        </span>
                      </div>
                      <div className="space-y-3">
                        <div className="flex justify-between text-xs py-1 border-b border-slate-50 dark:border-slate-800">
                          <span className="font-semibold text-slate-600 dark:text-slate-400">Fasting Glucose</span>
                          <span className="font-mono font-bold text-red-500">142 mg/dL (Reference: 70-100)</span>
                        </div>
                        <div className="flex justify-between text-xs py-1 border-b border-slate-50 dark:border-slate-800">
                          <span className="font-semibold text-slate-600 dark:text-slate-400">Total Cholesterol</span>
                          <span className="font-mono font-bold text-amber-500">225 mg/dL (Reference: &lt; 200)</span>
                        </div>
                        <div className="flex justify-between text-xs py-1 border-b border-slate-50 dark:border-slate-800">
                          <span className="font-semibold text-slate-600 dark:text-slate-400">Hemoglobin A1c</span>
                          <span className="font-mono font-bold text-red-500">6.8 % (Reference: 4.0-5.6)</span>
                        </div>
                        <div className="flex justify-between text-xs py-1">
                          <span className="font-semibold text-slate-600 dark:text-slate-400">Vitamin D (25-OH)</span>
                          <span className="font-mono font-bold text-green-500">45 ng/mL (Reference: 30-100)</span>
                        </div>
                      </div>
                    </div>
                    <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex justify-between items-center">
                      <span className="text-[10px] text-slate-400 dark:text-slate-500 font-mono">
                        EasyOCR Model v2.4
                      </span>
                      <Button variant="outline" size="sm" onClick={() => navigate("/register")}>
                        Configure Mappings
                      </Button>
                    </div>
                  </div>
                </motion.div>
              )}

              {activeTab === "trends" && (
                <motion.div
                  key="trends"
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -15 }}
                  transition={{ duration: 0.3 }}
                  className="rounded-2xl bg-white border border-slate-200/60 p-6 dark:bg-slate-900 dark:border-slate-800 flex flex-col space-y-6"
                >
                  <div className="flex justify-between items-center">
                    <div>
                      <h3 className="text-base font-bold text-slate-800 dark:text-slate-200">
                        Blood Glucose Trend (Fasting)
                      </h3>
                      <p className="text-xs text-slate-400 dark:text-slate-500">
                        Longitudinal analysis mapping 4 reports (June 2025 – May 2026)
                      </p>
                    </div>
                    <span className="text-xs bg-red-50 text-red-600 font-bold px-2 py-0.5 rounded-full dark:bg-red-950/20 dark:text-red-400">
                      Borderline Diabetic Range
                    </span>
                  </div>

                  <div className="h-44 w-full relative flex items-end justify-between px-6 pt-4 bg-slate-50 dark:bg-slate-950/40 rounded-xl border border-slate-100 dark:border-slate-800/50">
                    <div className="absolute inset-0 flex flex-col justify-between p-4 pointer-events-none opacity-20">
                      <div className="w-full border-t border-slate-400"></div>
                      <div className="w-full border-t border-slate-400"></div>
                      <div className="w-full border-t border-slate-400"></div>
                    </div>
                    {[
                      { date: "June 25", val: 148, h: "h-[85%]", color: "bg-red-500" },
                      { date: "Oct 25", val: 135, h: "h-[75%]", color: "bg-red-400" },
                      { date: "Jan 26", val: 129, h: "h-[70%]", color: "bg-amber-400" },
                      { date: "May 26", val: 110, h: "h-[50%]", color: "bg-green-500" },
                    ].map((bar, idx) => (
                      <div key={idx} className="flex flex-col items-center gap-2 z-10 w-[20%]">
                        <span className="text-xs font-extrabold font-mono text-slate-700 dark:text-slate-300">
                          {bar.val}
                        </span>
                        <div className={`w-full ${bar.h} ${bar.color} rounded-t-lg transition-all duration-500 shadow-lg`}></div>
                        <span className="text-[10px] text-slate-400 font-medium whitespace-nowrap mt-1">
                          {bar.date}
                        </span>
                      </div>
                    ))}
                  </div>
                  <p className="text-xs text-slate-500 leading-relaxed text-left">
                    💡 **Analysis:** Fasting glucose has dropped from 148 to 110 mg/dL over the past 12 months. This represents a favorable response to therapeutic lifestyle adjustments.
                  </p>
                </motion.div>
              )}

              {activeTab === "ai" && (
                <motion.div
                  key="ai"
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -15 }}
                  transition={{ duration: 0.3 }}
                  className="rounded-2xl bg-white border border-slate-200/60 p-6 dark:bg-slate-900 dark:border-slate-800 flex flex-col space-y-4"
                >
                  <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
                    <div className="flex items-center gap-2.5">
                      <div className="h-8 w-8 rounded-lg bg-blue-500 text-white flex items-center justify-center">
                        <BrainCircuit size={18} className="animate-pulse" />
                      </div>
                      <div>
                        <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200">
                          MedIntel AI Buddy
                        </h4>
                        <p className="text-[10px] text-slate-400">
                          Personalized Assistant • Offline model
                        </p>
                      </div>
                    </div>
                    <span className="h-2 w-2 rounded-full bg-green-500"></span>
                  </div>

                  <div className="space-y-4 h-48 overflow-y-auto pr-2 text-left">
                    <div className="flex gap-2">
                      <div className="h-6 w-6 rounded bg-slate-100 dark:bg-slate-800 text-[10px] flex items-center justify-center font-bold">U</div>
                      <div className="bg-slate-100 dark:bg-slate-800 rounded-2xl rounded-tl-none px-4 py-2.5 text-xs text-slate-700 dark:text-slate-300 max-w-[80%]">
                        Explain why my cholesterol is 245 mg/dL. Is that dangerous?
                      </div>
                    </div>
                    
                    <div className="flex gap-2">
                      <div className="h-6 w-6 rounded bg-blue-500 text-white text-[10px] flex items-center justify-center font-bold">AI</div>
                      <div className="bg-blue-50 dark:bg-blue-950/40 rounded-2xl rounded-tl-none px-4 py-2.5 text-xs text-slate-700 dark:text-slate-300 max-w-[80%] space-y-1.5">
                        <p>Total Cholesterol of 245 mg/dL is classified as <strong>borderline high</strong>. It is not an immediate emergency, but increases long-term risk of cardiovascular disease.</p>
                        <p>I recommend checking your LDL and HDL cholesterol values to determine your risk balance. Reducing trans fats and exercising will help lower these numbers.</p>
                      </div>
                    </div>
                  </div>

                  <div className="relative flex items-center">
                    <input
                      type="text"
                      disabled
                      placeholder="Ask the AI Medical Assistant..."
                      className="w-full rounded-xl border border-slate-200 dark:border-slate-800 px-4 py-2.5 text-xs bg-slate-50 dark:bg-slate-950/20 text-slate-400"
                    />
                    <div className="absolute right-3 p-1.5 rounded-lg bg-blue-500 text-white cursor-not-allowed">
                      <MessageSquare size={12} />
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </section>

      <section id="faqs" className="py-24 px-6 md:px-12 w-full bg-white dark:bg-slate-900 border-t border-slate-100 dark:border-slate-800/50">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-16 space-y-4">
            <span className="text-xs font-bold text-blue-600 dark:text-blue-400 uppercase tracking-widest bg-blue-50 dark:bg-blue-900/30 px-3.5 py-1.5 rounded-full">
              General Queries
            </span>
            <h2 className="text-3xl md:text-4xl font-extrabold font-heading text-slate-900 dark:text-white">
              Frequently Asked Questions
            </h2>
          </div>

          <div className="space-y-4">
            {faqs.map((faq, idx) => (
              <div
                key={idx}
                className="rounded-2xl border border-slate-200/80 bg-slate-50/50 dark:border-slate-800 dark:bg-slate-950/20 overflow-hidden"
              >
                <button
                  onClick={() => setOpenFaq(openFaq === idx ? null : idx)}
                  className="w-full px-6 py-5 flex items-center justify-between text-left font-semibold text-slate-800 hover:text-blue-600 dark:text-slate-200 dark:hover:text-blue-400 transition-colors cursor-pointer"
                >
                  <span className="text-sm md:text-base font-heading">{faq.q}</span>
                  <motion.div animate={{ rotate: openFaq === idx ? 180 : 0 }} transition={{ duration: 0.3 }}>
                    <ChevronDown size={18} className="text-slate-400" />
                  </motion.div>
                </button>
                <AnimatePresence initial={false}>
                  {openFaq === idx && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3 }}
                      className="overflow-hidden"
                    >
                      <div className="px-6 pb-5 pt-1 text-xs md:text-sm text-slate-500 dark:text-slate-400 border-t border-slate-100 dark:border-slate-800/40 leading-relaxed">
                        {faq.a}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="relative py-24 px-6 md:px-12 w-full overflow-hidden grid-bg dark:grid-bg-dark border-t border-slate-100 dark:border-slate-800/50">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[70%] h-[70%] rounded-full bg-blue-600/5 blur-[120px] pointer-events-none"></div>
        <div className="max-w-5xl mx-auto rounded-3xl bg-gradient-to-tr from-blue-600 to-indigo-800 px-8 py-16 text-center text-white relative shadow-2xl overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-white/10 via-transparent to-transparent opacity-60"></div>
          <div className="relative z-10 space-y-6 max-w-2xl mx-auto">
            <div className="inline-flex items-center gap-2 bg-white/10 px-3.5 py-1.5 rounded-full backdrop-blur-md">
              <Sparkles size={14} className="text-blue-200" />
              <span className="text-[10px] font-bold tracking-widest uppercase text-blue-100">
                Unlock Health Insights
              </span>
            </div>
            <h2 className="text-3xl md:text-4xl font-extrabold font-heading tracking-tight leading-tight">
              Ready to Consolidate Your Health Profile?
            </h2>
            <p className="text-sm md:text-base text-blue-100 leading-relaxed">
              Create your secure HIPAA-compliant account today. Extract metrics, track historical charts, and consult the AI Medical Buddy.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
              <Button
                variant="glass"
                size="lg"
                onClick={() => navigate("/register")}
                className="bg-white text-blue-800 hover:bg-slate-50 border-none"
              >
                Sign Up Free
              </Button>
              <Button
                variant="outline"
                size="lg"
                onClick={() => navigate("/login")}
                className="border-white/30 text-white hover:bg-white/10"
              >
                Sign In
              </Button>
            </div>
          </div>
        </div>
      </section>

      <footer className="py-16 px-6 md:px-12 w-full bg-slate-900 dark:bg-slate-950 text-slate-400 border-t border-slate-800">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-12 gap-12">
          <div className="md:col-span-5 space-y-4">
            <div className="flex items-center gap-2 bg-gradient-to-r from-blue-500 to-indigo-400 bg-clip-text text-transparent text-xl font-bold tracking-tight">
              <span>MedIntel</span>
              <span className="text-white font-medium">AI</span>
            </div>
            <p className="text-xs leading-relaxed text-slate-400 max-w-sm">
              MedIntel AI is an advanced SaaS application engineered to simplify laboratory metrics tracking. We run local OCR pipelines and Gemini API validation structures to deliver clear diagnostic visual timelines.
            </p>
            <div className="flex items-center gap-2.5 text-[10px] font-bold text-slate-500 uppercase tracking-widest pt-2">
              <ShieldCheck size={14} className="text-green-500" />
              <span>HIPAA Protected Environment</span>
            </div>
          </div>

          <div className="md:col-span-7 grid grid-cols-2 sm:grid-cols-3 gap-8">
            <div className="space-y-4">
              <h4 className="text-xs font-bold text-white uppercase tracking-wider">Product</h4>
              <ul className="space-y-2 text-xs">
                <li><a href="#features" className="hover:text-white transition-colors">Features</a></li>
                <li><a href="#how-it-works" className="hover:text-white transition-colors">Workflow</a></li>
                <li><a href="#preview" className="hover:text-white transition-colors">Dashboard Preview</a></li>
              </ul>
            </div>
            <div className="space-y-4">
              <h4 className="text-xs font-bold text-white uppercase tracking-wider">Security</h4>
              <ul className="space-y-2 text-xs">
                <li><a href="#" className="hover:text-white transition-colors">HIPAA Standards</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Data Encryption</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Terms of Service</a></li>
              </ul>
            </div>
            <div className="space-y-4 col-span-2 sm:col-span-1">
              <h4 className="text-xs font-bold text-white uppercase tracking-wider">Target Users</h4>
              <ul className="space-y-2 text-xs">
                <li><span className="text-slate-500">Patients</span></li>
                <li><span className="text-slate-500">Doctors</span></li>
                <li><span className="text-slate-500">Clinic Admins</span></li>
              </ul>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto pt-12 mt-12 border-t border-slate-800 text-center flex flex-col sm:flex-row items-center justify-between gap-4 text-xs">
          <span>&copy; {new Date().getFullYear()} MedIntel AI Inc. All rights reserved.</span>
          <div className="flex gap-4">
            <a href="#" className="hover:text-white transition-colors">Privacy Policy</a>
            <span>&bull;</span>
            <a href="#" className="hover:text-white transition-colors">Security Disclosures</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
