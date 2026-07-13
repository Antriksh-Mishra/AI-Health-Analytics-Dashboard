import { useState, useEffect, useRef, useCallback } from "react";
import { Link, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import {
  Send,
  Sparkles,
  Bot,
  User,
  LayoutDashboard,
  FileText,
  BarChart3,
  Settings,
  LogOut,
  ChevronDown,
  Bookmark,
  Sun,
  Moon,
} from "lucide-react";

import { useAuth } from "../../hooks/useAuth";
import API from "../../services/api";
import type { Report } from "../../types";
import Logo from "../../components/common/Logo";
import Button from "../../components/common/Button";

interface ChatMessage {
  role: "user" | "model";
  content: string;
}

export default function AIAssistantPage() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [theme, setTheme] = useState(() => {
    const saved = localStorage.getItem("theme");
    if (saved) return saved;
    return document.documentElement.classList.contains("dark") ? "dark" : "light";
  });

  const toggleTheme = () => {
    const nextTheme = theme === "dark" ? "light" : "dark";
    setTheme(nextTheme);
    localStorage.setItem("theme", nextTheme);
    if (nextTheme === "dark") {
      document.documentElement.classList.add("dark");
      document.body.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
      document.body.classList.remove("dark");
    }
  };

  const [reports, setReports] = useState<Report[]>([]);
  const [selectedReportId, setSelectedReportId] = useState<number | "">("");
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [reportsLoading, setReportsLoading] = useState(true);
  
  const chatEndRef = useRef<HTMLDivElement>(null);

  // Scroll to bottom of chat
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  // Fetch user reports for dropdown context
  const loadReports = useCallback(async () => {
    try {
      const res = await API.get<Report[]>("/reports");
      setReports(res.data.filter(r => r.ocr_status === "completed"));
    } catch (err: any) {
      toast.error("Failed to load reports library.");
    } finally {
      setReportsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadReports();
  }, [loadReports]);

  const handleSend = async (textToSend: string) => {
    if (!textToSend.trim() || loading) return;

    const userMessage: ChatMessage = { role: "user", content: textToSend };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setLoading(true);

    // Format chat history for Gemini
    const historyPayload = messages.map((m) => ({
      role: m.role,
      content: m.content,
    }));

    try {
      const res = await API.post<{ reply: string }>("/ai/chat", {
        message: textToSend,
        history: historyPayload,
        report_id: selectedReportId || null,
      });

      const aiMessage: ChatMessage = { role: "model", content: res.data.reply };
      setMessages((prev) => [...prev, aiMessage]);
    } catch (err: any) {
      toast.error("Failed to fetch response from assistant.");
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    navigate("/");
    setTimeout(() => {
      logout();
    }, 100);
  };

  const promptChips = [
    { label: "Explain my overall reports", query: "Can you summarize all my clinical values and tell me what areas I should focus on?" },
    { label: "Check my Blood Pressure", query: "My report mentions blood pressure values. Are they in the normal range?" },
    { label: "How to improve Vitamin D", query: "What are natural ways or supplements to boost my Vitamin D levels?" },
    { label: "Fasting Glucose query", query: "What does an elevated fasting glucose indicate and what diet changes should I make?" },
  ];

  const formatText = (text: string) => {
    // Basic formatting for bullet points and bold sections
    return text.split('\n').map((line, i) => {
      // Bold matches **text**
      let formattedLine = line;
      const boldRegex = /\*\*(.*?)\*\*/g;
      let match;
      while ((match = boldRegex.exec(line)) !== null) {
        formattedLine = formattedLine.replace(match[0], `<strong>${match[1]}</strong>`);
      }

      if (line.trim().startsWith('* ') || line.trim().startsWith('- ')) {
        return (
          <li 
            key={i} 
            className="ml-4 list-disc mb-1" 
            dangerouslySetInnerHTML={{ __html: formattedLine.trim().substring(2) }}
          />
        );
      }
      return (
        <p 
          key={i} 
          className="mb-2 leading-relaxed" 
          dangerouslySetInnerHTML={{ __html: formattedLine }}
        />
      );
    });
  };

  if (!user) return null;

  return (
    <div className="min-h-screen flex bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors duration-300">
      {/* Sidebar Layout */}
      <aside className="w-64 border-r border-slate-200 bg-white p-6 flex flex-col justify-between dark:border-slate-800 dark:bg-slate-900 transition-colors">
        <div className="space-y-8">
          <Logo size="sm" />
          <nav className="space-y-1">
            <Link to="/dashboard" className="flex items-center gap-3 w-full px-4 py-3 rounded-xl text-sm font-semibold text-slate-500 hover:bg-slate-50 dark:text-slate-400 dark:hover:bg-slate-800/50">
              <LayoutDashboard size={18} />
              Overview
            </Link>
            <Link to="/reports" className="flex items-center gap-3 w-full px-4 py-3 rounded-xl text-sm font-semibold text-slate-500 hover:bg-slate-50 dark:text-slate-400 dark:hover:bg-slate-800/50">
              <FileText size={18} />
              Medical Reports
            </Link>
            <Link to="/ai-assistant" className="flex items-center gap-3 w-full px-4 py-3 rounded-xl text-sm font-semibold bg-blue-50 text-blue-600 dark:bg-blue-950/40 dark:text-blue-400">
              <Bot size={18} />
              AI Assistant
            </Link>
            <Link to="/analytics" className="flex items-center gap-3 w-full px-4 py-3 rounded-xl text-sm font-semibold text-slate-500 hover:bg-slate-50 dark:text-slate-400 dark:hover:bg-slate-800/50">
              <BarChart3 size={18} />
              Analytics
            </Link>
            <Link to="/settings" className="flex items-center gap-3 w-full px-4 py-3 rounded-xl text-sm font-semibold text-slate-500 hover:bg-slate-50 dark:text-slate-400 dark:hover:bg-slate-800/50">
              <Settings size={18} />
              Settings
            </Link>
          </nav>
        </div>

        <div className="pt-6 border-t border-slate-100 dark:border-slate-800">
          <button
            onClick={toggleTheme}
            type="button"
            className="flex items-center gap-3 w-full px-4 py-2.5 mb-4 rounded-xl text-sm font-semibold text-slate-500 hover:bg-slate-50 dark:text-slate-400 dark:hover:bg-slate-800/50 transition-all cursor-pointer text-left"
          >
            {theme === "dark" ? <Sun size={18} className="text-amber-500" /> : <Moon size={18} className="text-indigo-500" />}
            <span>{theme === "dark" ? "Light Mode" : "Dark Mode"}</span>
          </button>

          <div className="flex items-center gap-3 mb-4 px-2">
            <div className="h-9 w-9 rounded-full bg-blue-100 dark:bg-blue-900/50 flex items-center justify-center text-blue-600 dark:text-blue-400">
              <User size={16} />
            </div>
            <div className="text-left">
              <p className="text-xs font-bold text-slate-800 dark:text-slate-200">{user.first_name} {user.last_name}</p>
              <p className="text-[10px] text-slate-400 font-semibold capitalize">{user.role} Account</p>
            </div>
          </div>
          <Button variant="outline" size="sm" onClick={handleLogout} leftIcon={<LogOut size={16} />} className="w-full justify-center py-2.5">
            Sign Out
          </Button>
        </div>
      </aside>

      {/* Main Panel */}
      <main className="flex-1 flex flex-col h-screen overflow-hidden bg-slate-50 dark:bg-slate-950">
        {/* Chat Header */}
        <header className="px-8 py-5 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 shrink-0">
          <div className="text-left">
            <h1 className="text-xl font-black font-heading text-slate-900 dark:text-white flex items-center gap-2">
              <Bot className="text-blue-600 dark:text-blue-400" size={24} />
              MedIntel AI Assistant
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400">Chat with our intelligent clinical analysis companion.</p>
          </div>

          {/* Report Context Dropdown */}
          <div className="relative w-full sm:w-72">
            <div className="flex items-center gap-2 px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl">
              <Bookmark size={14} className="text-blue-600 dark:text-blue-400 shrink-0" />
              <select
                value={selectedReportId}
                onChange={(e) => {
                  setSelectedReportId(e.target.value === "" ? "" : Number(e.target.value));
                  setMessages([]); // Clear chat when changing context
                }}
                disabled={reportsLoading}
                className="w-full bg-transparent border-none text-xs font-semibold focus:outline-none pr-6 cursor-pointer appearance-none text-slate-700 dark:text-slate-300"
              >
                <option value="">No Active Report Context</option>
                {reports.map((report) => (
                  <option key={report.id} value={report.id}>
                    {report.filename}
                  </option>
                ))}
              </select>
              <ChevronDown size={14} className="absolute right-3 pointer-events-none text-slate-400" />
            </div>
          </div>
        </header>

        {/* Message feed */}
        <div className="flex-1 overflow-y-auto p-8 space-y-6">
          {messages.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center max-w-xl mx-auto space-y-8 py-10">
              <div className="h-16 w-16 rounded-3xl bg-blue-50 dark:bg-blue-950/40 flex items-center justify-center text-blue-600 dark:text-blue-400 shadow-sm border border-blue-100 dark:border-blue-900/30">
                <Sparkles size={32} className="animate-pulse" />
              </div>
              <div className="space-y-2">
                <h3 className="text-lg font-black font-heading text-slate-900 dark:text-white">Ask MedIntel AI</h3>
                <p className="text-sm text-slate-400 leading-relaxed">
                  {selectedReportId 
                    ? "Discuss this report context with the AI. Ask questions about your values, trends, or medical terms."
                    : "Connect a medical report in the header dropdown to discuss specific metrics, or ask general health questions here."}
                </p>
              </div>

              {/* Quick prompts */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full pt-4">
                {promptChips.map((chip, i) => (
                  <button
                    key={i}
                    onClick={() => handleSend(chip.query)}
                    className="p-3.5 rounded-2xl border border-slate-200 bg-white hover:border-blue-500 hover:bg-blue-50/10 text-left text-xs font-semibold text-slate-700 hover:text-blue-600 dark:border-slate-800 dark:bg-slate-900 dark:hover:border-blue-400 dark:hover:bg-blue-950/10 dark:text-slate-300 dark:hover:text-blue-400 transition-all duration-300 cursor-pointer shadow-sm"
                  >
                    {chip.label}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <div className="max-w-4xl mx-auto space-y-6 text-left">
              {messages.map((msg, i) => (
                <div 
                  key={i} 
                  className={`flex gap-4 ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                >
                  {/* Assistant Icon */}
                  {msg.role === "model" && (
                    <div className="h-9 w-9 rounded-xl bg-blue-100 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-900/30 flex items-center justify-center text-blue-600 dark:text-blue-400 shrink-0">
                      <Bot size={16} />
                    </div>
                  )}

                  {/* Message Bubble */}
                  <div 
                    className={`max-w-[75%] px-5 py-3.5 rounded-2xl text-sm leading-relaxed shadow-sm
                      ${msg.role === "user"
                        ? "bg-gradient-to-tr from-blue-600 to-indigo-500 text-white rounded-tr-none font-medium"
                        : "bg-white border border-slate-200 dark:border-slate-800/80 dark:bg-slate-900 rounded-tl-none text-slate-800 dark:text-slate-200"
                      }
                    `}
                  >
                    {msg.role === "model" ? formatText(msg.content) : <p>{msg.content}</p>}
                  </div>

                  {/* User Icon */}
                  {msg.role === "user" && (
                    <div className="h-9 w-9 rounded-xl bg-slate-200 dark:bg-slate-800 flex items-center justify-center text-slate-600 dark:text-slate-400 shrink-0 border border-slate-300 dark:border-slate-700/50">
                      <User size={16} />
                    </div>
                  )}
                </div>
              ))}

              {/* Loading Indicator */}
              {loading && (
                <div className="flex gap-4 justify-start">
                  <div className="h-9 w-9 rounded-xl bg-blue-100 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-900/30 flex items-center justify-center text-blue-600 dark:text-blue-400 shrink-0">
                    <Bot size={16} />
                  </div>
                  <div className="px-5 py-4 rounded-2xl bg-white border border-slate-200 dark:border-slate-800/80 dark:bg-slate-900 rounded-tl-none flex items-center gap-1.5 shadow-sm">
                    <span className="h-2 w-2 rounded-full bg-slate-400 animate-bounce [animation-delay:-0.3s]"></span>
                    <span className="h-2 w-2 rounded-full bg-slate-400 animate-bounce [animation-delay:-0.15s]"></span>
                    <span className="h-2 w-2 rounded-full bg-slate-400 animate-bounce"></span>
                  </div>
                </div>
              )}
              <div ref={chatEndRef} />
            </div>
          )}
        </div>

        {/* Input area */}
        <div className="p-6 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 shrink-0">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSend(input);
            }}
            className="max-w-4xl mx-auto flex gap-3"
          >
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={selectedReportId 
                ? "Ask about this report values (e.g. 'Is my sugar level good?')..."
                : "Ask anything about wellness, values, or connect a report..."}
              disabled={loading}
              className="flex-1 px-5 py-3.5 rounded-2xl bg-slate-50 focus:bg-white dark:bg-slate-950 dark:focus:bg-slate-950 border border-slate-200 dark:border-slate-800 text-sm focus:outline-none focus:border-blue-500 dark:focus:border-blue-400 transition-colors text-slate-800 dark:text-slate-100"
            />
            <Button
              variant="primary"
              type="submit"
              disabled={!input.trim() || loading}
              className="px-5 py-3.5 rounded-2xl justify-center"
            >
              <Send size={18} />
            </Button>
          </form>
        </div>
      </main>
    </div>
  );
}
