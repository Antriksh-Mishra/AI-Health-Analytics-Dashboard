import { useState, useEffect, useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { useNavigate, Link } from "react-router-dom";
import toast from "react-hot-toast";
import {
  UploadCloud,
  FileText,
  Trash2,
  Eye,
  Loader2,
  Calendar,
  Heart,
  Droplet,
  Activity,
  AlertTriangle,
  User,
  LayoutDashboard,
  Bot,
  BarChart3,
  Settings,
  LogOut,
  Sparkles,
} from "lucide-react";

import { useAuth } from "../../hooks/useAuth";
import API from "../../services/api";
import type { Report } from "../../types";
import Logo from "../../components/common/Logo";
import Button from "../../components/common/Button";

export default function ReportsPage() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [selectedReport, setSelectedReport] = useState<Report | null>(null);
  const [detailModalOpen, setDetailModalOpen] = useState(false);

  const fetchReports = useCallback(async () => {
    try {
      const res = await API.get<Report[]>("/reports");
      setReports(res.data);
    } catch (err: any) {
      toast.error("Failed to load reports history.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchReports();
  }, [fetchReports]);

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    if (acceptedFiles.length === 0) return;
    
    const file = acceptedFiles[0];
    const formData = new FormData();
    formData.append("file", file);
    
    setUploading(true);
    const toastId = toast.loading(`Uploading and running OCR on ${file.name}...`);
    
    try {
      await API.post("/reports/upload", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      toast.success("Report uploaded and analyzed successfully!", { id: toastId });
      fetchReports();
    } catch (err: any) {
      const errMsg = err.response?.data?.error || "Failed to process report OCR.";
      toast.error(errMsg, { id: toastId });
    } finally {
      setUploading(false);
    }
  }, [fetchReports]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "application/pdf": [".pdf"],
      "image/*": [".png", ".jpg", ".jpeg", ".tiff"],
    },
    multiple: false,
    disabled: uploading,
  });

  const handleDelete = async (id: number) => {
    if (!window.confirm("Are you sure you want to delete this report? This will remove all associated biometric data.")) return;
    
    const toastId = toast.loading("Deleting report...");
    try {
      await API.delete(`/reports/${id}`);
      toast.success("Report deleted successfully", { id: toastId });
      setReports((prev) => prev.filter((r) => r.id !== id));
      if (selectedReport?.id === id) {
        setSelectedReport(null);
        setDetailModalOpen(false);
      }
    } catch (err: any) {
      toast.error("Failed to delete report.", { id: toastId });
    }
  };

  const openDetails = (report: Report) => {
    setSelectedReport(report);
    setDetailModalOpen(true);
  };

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const getStatusBadge = (status: string) => {
    const styles = {
      completed: "bg-green-50 text-green-700 border-green-200 dark:bg-green-950/20 dark:text-green-400 dark:border-green-900/30",
      processing: "bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/20 dark:text-blue-400 dark:border-blue-900/30 animate-pulse",
      failed: "bg-red-50 text-red-700 border-red-200 dark:bg-red-950/20 dark:text-red-400 dark:border-red-900/30",
      pending: "bg-slate-50 text-slate-700 border-slate-200 dark:bg-slate-900/40 dark:text-slate-400 dark:border-slate-800",
    };
    return (
      <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border capitalize ${styles[status as keyof typeof styles] || styles.pending}`}>
        {status === "processing" && <Loader2 size={12} className="animate-spin" />}
        {status}
      </span>
    );
  };

  const formatValue = (val: number | null, unit: string) => {
    return val !== null && val !== undefined ? `${val} ${unit}` : "Not detected";
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
            <Link to="/reports" className="flex items-center gap-3 w-full px-4 py-3 rounded-xl text-sm font-semibold bg-blue-50 text-blue-600 dark:bg-blue-950/40 dark:text-blue-400">
              <FileText size={18} />
              Medical Reports
            </Link>
            <Link to="/ai-assistant" className="flex items-center gap-3 w-full px-4 py-3 rounded-xl text-sm font-semibold text-slate-500 hover:bg-slate-50 dark:text-slate-400 dark:hover:bg-slate-800/50">
              <Bot size={18} />
              AI Assistant
            </Link>
            <button className="flex items-center gap-3 w-full px-4 py-3 rounded-xl text-sm font-semibold text-slate-400 cursor-not-allowed select-none dark:text-slate-600" disabled>
              <BarChart3 size={18} />
              Analytics (Locked)
            </button>
            <button className="flex items-center gap-3 w-full px-4 py-3 rounded-xl text-sm font-semibold text-slate-400 cursor-not-allowed select-none dark:text-slate-600" disabled>
              <Settings size={18} />
              Settings (Locked)
            </button>
          </nav>
        </div>

        <div className="pt-6 border-t border-slate-100 dark:border-slate-800">
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
      <main className="flex-1 p-8 md:p-10 flex flex-col space-y-8 overflow-y-auto max-w-7xl mx-auto w-full">
        <header className="flex justify-between items-center pb-5 border-b border-slate-200 dark:border-slate-800">
          <div className="text-left">
            <h1 className="text-2xl font-black font-heading text-slate-900 dark:text-white">Medical Reports Library</h1>
            <p className="text-sm text-slate-500 dark:text-slate-400">Upload reports and view extracted metrics data.</p>
          </div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Dropzone Upload Section */}
          <div className="lg:col-span-4 space-y-4">
            <div 
              {...getRootProps()} 
              className={`rounded-3xl border-2 border-dashed p-8 text-center flex flex-col items-center justify-center min-h-[260px] transition-all duration-300 cursor-pointer bg-white dark:bg-slate-900/50
                ${isDragActive ? "border-blue-500 bg-blue-50/20 dark:border-blue-400 dark:bg-blue-950/10" : "border-slate-200 dark:border-slate-800 hover:border-blue-500 dark:hover:border-blue-400"}
                ${uploading ? "opacity-60 pointer-events-none" : ""}
              `}
            >
              <input {...getInputProps()} />
              <div className="h-14 w-14 rounded-full bg-blue-50 dark:bg-blue-950 flex items-center justify-center mb-4 text-blue-600 dark:text-blue-400">
                {uploading ? (
                  <Loader2 size={28} className="animate-spin" />
                ) : (
                  <UploadCloud size={28} />
                )}
              </div>
              <h3 className="text-base font-bold text-slate-800 dark:text-slate-200 mb-1">
                {uploading ? "Analyzing Report..." : "Upload Medical Report"}
              </h3>
              <p className="text-xs text-slate-400 dark:text-slate-500 mb-4 max-w-[220px] leading-relaxed">
                Drag and drop your lab report PDF, PNG, or JPG. EasyOCR processes text parameters.
              </p>
              <Button variant="primary" size="sm" disabled={uploading}>
                Select Document
              </Button>
            </div>

            <div className="p-4 rounded-2xl bg-amber-500/5 border border-amber-500/10 text-left flex gap-3 text-xs text-amber-800 dark:text-amber-400">
              <AlertTriangle size={18} className="shrink-0 text-amber-500" />
              <div>
                <span className="font-semibold block mb-0.5">Extraction Guidelines</span>
                For highest accuracy, upload digital selectable text PDFs or high-resolution scan captures.
              </div>
            </div>
          </div>

          {/* History List Section */}
          <div className="lg:col-span-8 rounded-3xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900/40 overflow-hidden flex flex-col">
            <div className="px-6 py-5 border-b border-slate-100 dark:border-slate-800/80 text-left flex justify-between items-center">
              <h2 className="text-base font-bold font-heading text-slate-900 dark:text-white">Uploaded Records</h2>
              <span className="text-xs bg-slate-100 dark:bg-slate-800 px-3 py-1 rounded-full font-bold text-slate-500">
                {reports.length} Reports
              </span>
            </div>

            {loading ? (
              <div className="py-20 flex justify-center">
                <Loader2 size={36} className="text-blue-600 animate-spin" />
              </div>
            ) : reports.length === 0 ? (
              <div className="py-20 text-center flex flex-col items-center">
                <FileText size={48} className="text-slate-300 dark:text-slate-700 mb-3" />
                <h4 className="text-sm font-bold text-slate-700 dark:text-slate-300">No reports found</h4>
                <p className="text-xs text-slate-400 max-w-[200px] mt-1">Upload a blood test report to start mapping parameters.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-slate-100 dark:border-slate-800/80 bg-slate-50/50 dark:bg-slate-900/20 text-xs font-bold text-slate-400 uppercase tracking-wider">
                      <th className="px-6 py-4">Filename</th>
                      <th className="px-6 py-4">Uploaded</th>
                      <th className="px-6 py-4">OCR Status</th>
                      <th className="px-6 py-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800/50 text-sm">
                    {reports.map((report) => (
                      <tr key={report.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-900/30 transition-colors">
                        <td className="px-6 py-4 font-semibold text-slate-800 dark:text-slate-200 truncate max-w-[200px]">
                          {report.filename}
                        </td>
                        <td className="px-6 py-4 text-slate-500 dark:text-slate-400 text-xs">
                          <span className="flex items-center gap-1">
                            <Calendar size={12} />
                            {report.uploaded_at ? new Date(report.uploaded_at).toLocaleDateString(undefined, {
                              year: 'numeric', month: 'short', day: 'numeric'
                            }) : "N/A"}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          {getStatusBadge(report.ocr_status)}
                        </td>
                        <td className="px-6 py-4 text-right flex justify-end gap-2">
                          {report.ocr_status === "completed" && (
                            <button
                              onClick={() => openDetails(report)}
                              className="p-2 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 hover:text-blue-600 dark:border-slate-700 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-blue-400 transition-colors cursor-pointer"
                              title="View Extracted Parameters"
                            >
                              <Eye size={14} />
                            </button>
                          )}
                          <button
                            onClick={() => handleDelete(report.id)}
                            className="p-2 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 hover:text-red-500 dark:border-slate-700 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-red-400 transition-colors cursor-pointer"
                            title="Delete Report"
                          >
                            <Trash2 size={14} />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Details View Modal */}
      {detailModalOpen && selectedReport && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
          {/* Backdrop */}
          <div className="absolute inset-0 bg-slate-950/40 backdrop-blur-sm" onClick={() => setDetailModalOpen(false)}></div>
          
          {/* Content panel */}
          <div className="relative rounded-3xl border border-slate-200 bg-white shadow-2xl dark:border-slate-800 dark:bg-slate-900 w-full max-w-3xl overflow-hidden flex flex-col max-h-[85vh]">
            <header className="px-8 py-5 border-b border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-left">
              <div>
                <h3 className="text-lg font-black font-heading text-slate-900 dark:text-white">Report Analytics Details</h3>
                <p className="text-xs text-slate-400">{selectedReport.filename}</p>
              </div>
              <button 
                onClick={() => setDetailModalOpen(false)} 
                className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
              >
                ✕
              </button>
            </header>

            <div className="flex-1 overflow-y-auto p-8 space-y-6 text-left">
              {/* Parsed Indicators Grid */}
              <div>
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">Extracted Parameters</h4>
                
                {selectedReport.biometrics && selectedReport.biometrics.length > 0 ? (
                  (() => {
                    const bio = selectedReport.biometrics[0];
                    return (
                      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                        {/* Blood Sugar */}
                        <div className="p-4 rounded-2xl border border-slate-100 bg-slate-50/50 dark:border-slate-800/60 dark:bg-slate-950/20 flex items-center gap-3">
                          <div className="h-10 w-10 rounded-xl bg-red-500/10 flex items-center justify-center text-red-500">
                            <Droplet size={18} />
                          </div>
                          <div>
                            <span className="text-[10px] text-slate-400 font-semibold block uppercase">Fasting Glucose</span>
                            <span className="text-sm font-extrabold text-slate-800 dark:text-slate-200">
                              {formatValue(bio.blood_sugar, "mg/dL")}
                            </span>
                          </div>
                        </div>

                        {/* Hemoglobin */}
                        <div className="p-4 rounded-2xl border border-slate-100 bg-slate-50/50 dark:border-slate-800/60 dark:bg-slate-950/20 flex items-center gap-3">
                          <div className="h-10 w-10 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-500">
                            <Activity size={18} />
                          </div>
                          <div>
                            <span className="text-[10px] text-slate-400 font-semibold block uppercase">Hemoglobin</span>
                            <span className="text-sm font-extrabold text-slate-800 dark:text-slate-200">
                              {formatValue(bio.hemoglobin, "g/dL")}
                            </span>
                          </div>
                        </div>

                        {/* Cholesterol */}
                        <div className="p-4 rounded-2xl border border-slate-100 bg-slate-50/50 dark:border-slate-800/60 dark:bg-slate-950/20 flex items-center gap-3">
                          <div className="h-10 w-10 rounded-xl bg-yellow-500/10 flex items-center justify-center text-yellow-500">
                            <Heart size={18} />
                          </div>
                          <div>
                            <span className="text-[10px] text-slate-400 font-semibold block uppercase">Cholesterol</span>
                            <span className="text-sm font-extrabold text-slate-800 dark:text-slate-200">
                              {formatValue(bio.cholesterol, "mg/dL")}
                            </span>
                          </div>
                        </div>

                        {/* Vitamin D */}
                        <div className="p-4 rounded-2xl border border-slate-100 bg-slate-50/50 dark:border-slate-800/60 dark:bg-slate-950/20 flex items-center gap-3">
                          <div className="h-10 w-10 rounded-xl bg-orange-500/10 flex items-center justify-center text-orange-500">
                            <Sparkles size={18} />
                          </div>
                          <div>
                            <span className="text-[10px] text-slate-400 font-semibold block uppercase">Vitamin D</span>
                            <span className="text-sm font-extrabold text-slate-800 dark:text-slate-200">
                              {formatValue(bio.vitamin_d, "ng/mL")}
                            </span>
                          </div>
                        </div>

                        {/* Blood Pressure */}
                        <div className="p-4 rounded-2xl border border-slate-100 bg-slate-50/50 dark:border-slate-800/60 dark:bg-slate-950/20 flex items-center gap-3 sm:col-span-2">
                          <div className="h-10 w-10 rounded-xl bg-green-500/10 flex items-center justify-center text-green-500">
                            <Heart size={18} />
                          </div>
                          <div>
                            <span className="text-[10px] text-slate-400 font-semibold block uppercase">Blood Pressure</span>
                            <span className="text-sm font-extrabold text-slate-800 dark:text-slate-200">
                              {bio.systolic_bp !== null && bio.diastolic_bp !== null 
                                ? `${bio.systolic_bp} / ${bio.diastolic_bp} mmHg` 
                                : "Not detected"}
                            </span>
                          </div>
                        </div>
                      </div>
                    );
                  })()
                ) : (
                  <p className="text-xs text-slate-400">No biometric values could be isolated.</p>
                )}
              </div>

              {/* AI Clinical Insights Analysis Card */}
              {selectedReport.ai_insights && (
                <div className="p-6 rounded-2xl border border-blue-100 bg-blue-50/20 dark:border-blue-900/30 dark:bg-blue-950/10 space-y-4">
                  <div className="flex items-center gap-2 text-blue-600 dark:text-blue-400">
                    <Sparkles size={18} className="animate-pulse" />
                    <h4 className="text-sm font-bold font-heading">MedIntel AI Clinical Insights</h4>
                  </div>
                  
                  {/* Summary */}
                  <div className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed text-left">
                    <span className="font-bold text-slate-800 dark:text-slate-200 block mb-1">Executive Summary</span>
                    {selectedReport.ai_insights.summary}
                  </div>

                  {/* Flagged Items */}
                  {selectedReport.ai_insights.flagged_items && selectedReport.ai_insights.flagged_items.length > 0 && (
                    <div className="space-y-2">
                      <span className="text-[10px] font-bold text-red-500 uppercase tracking-wider block">Clinical Alerts</span>
                      <div className="grid grid-cols-1 gap-2.5">
                        {selectedReport.ai_insights.flagged_items.map((item, idx) => (
                          <div key={idx} className="p-3 rounded-xl bg-red-50/50 dark:bg-red-950/10 border border-red-100 dark:border-red-900/20 text-xs text-left">
                            <div className="flex justify-between font-bold text-slate-800 dark:text-slate-200 mb-1">
                              <span>⚠️ {item.metric}</span>
                              <span className="text-red-600 dark:text-red-400">{item.value} <span className="text-[10px] text-slate-400 font-normal">({item.range})</span></span>
                            </div>
                            <p className="text-slate-500 dark:text-slate-400 text-[11px] leading-relaxed">{item.reason}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Recommendations */}
                  {selectedReport.ai_insights.wellness_recommendations && selectedReport.ai_insights.wellness_recommendations.length > 0 && (
                    <div className="space-y-1.5 text-xs text-slate-700 dark:text-slate-300 text-left">
                      <span className="font-bold text-slate-800 dark:text-slate-200 block mb-1">Actionable Recommendations</span>
                      <ul className="space-y-1 list-none pl-0">
                        {selectedReport.ai_insights.wellness_recommendations.map((rec, idx) => (
                          <li key={idx} className="flex gap-2 items-start text-[11px] leading-relaxed">
                            <span className="text-green-500 font-bold shrink-0">✓</span>
                            <span>{rec}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              )}

              {/* Raw OCR Text Output */}
              <div>
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">Extracted Raw Text</h4>
                <div className="rounded-2xl bg-slate-50 p-5 dark:bg-slate-950 border border-slate-100 dark:border-slate-800/40 max-h-56 overflow-y-auto">
                  <pre className="text-[11px] font-mono text-slate-600 dark:text-slate-400 whitespace-pre-wrap leading-relaxed">
                    {selectedReport.raw_text || "No raw text was generated."}
                  </pre>
                </div>
              </div>
            </div>

            <footer className="px-8 py-4 bg-slate-50 dark:bg-slate-950 border-t border-slate-100 dark:border-slate-800/80 flex justify-end gap-3">
              <Button variant="outline" size="sm" onClick={() => setDetailModalOpen(false)}>
                Close
              </Button>
            </footer>
          </div>
        </div>
      )}
    </div>
  );
}
