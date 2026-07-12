import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import Button from "../../components/common/Button";
import Logo from "../../components/common/Logo";
import API from "../../services/api";
import toast from "react-hot-toast";
import { 
  LogOut, 
  LayoutDashboard, 
  FileText, 
  Bot, 
  BarChart3, 
  Settings, 
  ShieldCheck, 
  User, 
  ArrowLeftRight,
  TrendingUp,
  TrendingDown,
  Sparkles,
  Loader2,
  Calendar,
  CheckCircle2,
  FileBarChart,
  HelpCircle
} from "lucide-react";

interface Report {
  id: number;
  filename: string;
  ocr_status: string;
  uploaded_at: string;
  biometrics: Array<{
    hemoglobin: number | null;
    blood_sugar: number | null;
    cholesterol: number | null;
    vitamin_d: number | null;
    systolic_bp: number | null;
    diastolic_bp: number | null;
    test_date: string | null;
  }>;
}

export default function AnalyticsPage() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [aiInsights, setAiInsights] = useState<string | null>(null);
  const [generatingAi, setGeneratingAi] = useState(false);

  const handleLogout = () => {
    navigate("/");
    setTimeout(() => {
      logout();
    }, 100);
  };

  useEffect(() => {
    const fetchReports = async () => {
      try {
        const res = await API.get<Report[]>("/reports");
        // Keep only completed reports for comparison
        const completed = res.data.filter(r => r.ocr_status === "completed" && r.biometrics && r.biometrics.length > 0);
        setReports(completed);
        
        // Auto-select the first two if available
        if (completed.length >= 2) {
          setSelectedIds([completed[1].id, completed[0].id]); // older first, newer second (reversed uploaded order)
        } else if (completed.length === 1) {
          setSelectedIds([completed[0].id]);
        }
      } catch (err: any) {
        toast.error("Failed to load reports library.");
      } finally {
        setLoading(false);
      }
    };
    fetchReports();
  }, []);

  const handleToggleSelect = (id: number) => {
    setAiInsights(null); // Clear insights since context changed
    setSelectedIds((prev) => {
      if (prev.includes(id)) {
        return prev.filter(x => x !== id);
      }
      if (prev.length >= 3) {
        toast.error("You can select up to 3 reports for side-by-side comparison.");
        return prev;
      }
      return [...prev, id];
    });
  };

  const getSortedSelection = () => {
    // Return selected reports ordered chronologically by uploaded_at date
    const selected = reports.filter(r => selectedIds.includes(r.id));
    return [...selected].sort((a, b) => new Date(a.uploaded_at).getTime() - new Date(b.uploaded_at).getTime());
  };

  const generateComparison = async () => {
    const sorted = getSortedSelection();
    if (sorted.length < 2) {
      toast.error("Please select at least 2 reports to generate AI progress insights.");
      return;
    }
    
    setGeneratingAi(true);
    setAiInsights(null);
    try {
      const res = await API.post<{ comparison: string }>("/ai/compare", {
        report1_id: sorted[0].id,
        report2_id: sorted[1].id
      });
      setAiInsights(res.data.comparison);
    } catch (err: any) {
      toast.error("Failed to generate comparative insights.");
    } finally {
      setGeneratingAi(false);
    }
  };

  if (!user) return null;

  const sortedSelection = getSortedSelection();

  // Helper to render metric row
  const renderMetricRow = (
    label: string, 
    unit: string, 
    extractor: (r: Report) => number | null, 
    evaluator: (val1: number, val2: number) => { text: string; positive: boolean }
  ) => {
    if (sortedSelection.length < 2) return null;
    
    const v1 = extractor(sortedSelection[0]);
    const v2 = extractor(sortedSelection[1]);
    const v3 = sortedSelection.length === 3 ? extractor(sortedSelection[2]) : null;

    let deltaElement = null;
    if (v1 !== null && v2 !== null) {
      const evaluation = evaluator(v1, v2);
      deltaElement = (
        <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-extrabold border ${
          evaluation.positive 
            ? "bg-green-50 text-green-700 border-green-200 dark:bg-green-950/20 dark:text-green-400 dark:border-green-900/30"
            : "bg-red-50 text-red-700 border-red-200 dark:bg-red-950/20 dark:text-red-400 dark:border-red-900/30"
        }`}>
          {evaluation.positive ? <TrendingDown size={12} /> : <TrendingUp size={12} />}
          <span>{evaluation.text}</span>
        </span>
      );
    }

    return (
      <tr className="border-b border-slate-100 dark:border-slate-800 hover:bg-slate-50/50 dark:hover:bg-slate-800/20 transition-all">
        <td className="py-4 px-4 font-semibold text-sm text-slate-800 dark:text-slate-200 text-left">
          {label}
        </td>
        <td className="py-4 px-4 text-xs font-bold text-slate-400 text-left">
          {unit}
        </td>
        <td className="py-4 px-4 text-sm font-black text-slate-900 dark:text-white text-center">
          {v1 !== null ? v1.toFixed(v1 % 1 === 0 ? 0 : 1) : "N/A"}
        </td>
        <td className="py-4 px-4 text-sm font-black text-slate-900 dark:text-white text-center">
          {v2 !== null ? v2.toFixed(v2 % 1 === 0 ? 0 : 1) : "N/A"}
        </td>
        {sortedSelection.length === 3 && (
          <td className="py-4 px-4 text-sm font-black text-slate-900 dark:text-white text-center">
            {v3 !== null ? v3.toFixed(v3 % 1 === 0 ? 0 : 1) : "N/A"}
          </td>
        )}
        <td className="py-4 px-4 text-center">
          {deltaElement || <span className="text-xs text-slate-400 font-semibold">—</span>}
        </td>
      </tr>
    );
  };

  // Helper to parse BP deltas
  const renderBPRow = () => {
    if (sortedSelection.length < 2) return null;
    
    const r1 = sortedSelection[0];
    const r2 = sortedSelection[1];
    const r3 = sortedSelection.length === 3 ? sortedSelection[2] : null;

    const sys1 = r1.biometrics[0].systolic_bp;
    const dia1 = r1.biometrics[0].diastolic_bp;
    
    const sys2 = r2.biometrics[0].systolic_bp;
    const dia2 = r2.biometrics[0].diastolic_bp;

    const sys3 = r3?.biometrics[0]?.systolic_bp;
    const dia3 = r3?.biometrics[0]?.diastolic_bp;

    let deltaElement = null;
    if (sys1 !== null && sys2 !== null && dia1 !== null && dia2 !== null) {
      const sysDelta = sys2 - sys1;
      const diaDelta = dia2 - dia1;
      const positive = sysDelta <= 0 && diaDelta <= 0;
      
      const sysText = sysDelta > 0 ? `+${sysDelta}` : `${sysDelta}`;
      const diaText = diaDelta > 0 ? `+${diaDelta}` : `${diaDelta}`;

      deltaElement = (
        <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-extrabold border ${
          positive 
            ? "bg-green-50 text-green-700 border-green-200 dark:bg-green-950/20 dark:text-green-400 dark:border-green-900/30"
            : "bg-red-50 text-red-700 border-red-200 dark:bg-red-950/20 dark:text-red-400 dark:border-red-900/30"
        }`}>
          {positive ? <TrendingDown size={12} /> : <TrendingUp size={12} />}
          <span>{sysText}/{diaText} mmHg</span>
        </span>
      );
    }

    return (
      <tr className="border-b border-slate-100 dark:border-slate-800 hover:bg-slate-50/50 dark:hover:bg-slate-800/20 transition-all">
        <td className="py-4 px-4 font-semibold text-sm text-slate-800 dark:text-slate-200 text-left">
          Blood Pressure
        </td>
        <td className="py-4 px-4 text-xs font-bold text-slate-400 text-left">
          mmHg
        </td>
        <td className="py-4 px-4 text-sm font-black text-slate-900 dark:text-white text-center">
          {sys1 !== null && dia1 !== null ? `${sys1}/${dia1}` : "N/A"}
        </td>
        <td className="py-4 px-4 text-sm font-black text-slate-900 dark:text-white text-center">
          {sys2 !== null && dia2 !== null ? `${sys2}/${dia2}` : "N/A"}
        </td>
        {sortedSelection.length === 3 && (
          <td className="py-4 px-4 text-sm font-black text-slate-900 dark:text-white text-center">
            {sys3 !== null && dia3 !== null ? `${sys3}/${dia3}` : "N/A"}
          </td>
        )}
        <td className="py-4 px-4 text-center">
          {deltaElement || <span className="text-xs text-slate-400 font-semibold">—</span>}
        </td>
      </tr>
    );
  };

  return (
    <div className="min-h-screen flex bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100">
      {/* Sidebar Navigation */}
      <aside className="w-64 border-r border-slate-200 bg-white p-6 flex flex-col justify-between dark:border-slate-800 dark:bg-slate-900 shrink-0">
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
            <Link to="/ai-assistant" className="flex items-center gap-3 w-full px-4 py-3 rounded-xl text-sm font-semibold text-slate-500 hover:bg-slate-50 dark:text-slate-400 dark:hover:bg-slate-800/50">
              <Bot size={18} />
              AI Assistant
            </Link>
            <Link to="/analytics" className="flex items-center gap-3 w-full px-4 py-3 rounded-xl text-sm font-semibold bg-blue-50 text-blue-600 dark:bg-blue-950/40 dark:text-blue-400">
              <BarChart3 size={18} />
              Analytics
            </Link>
            <button className="flex items-center gap-3 w-full px-4 py-3 rounded-xl text-sm font-semibold text-slate-400 cursor-not-allowed select-none dark:text-slate-600" disabled>
              <Settings size={18} />
              Settings
            </button>
          </nav>
        </div>

        <div className="pt-6 border-t border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-3 mb-4 px-2">
            <div className="h-9 w-9 rounded-full bg-blue-100 dark:bg-blue-900/50 flex items-center justify-center text-blue-600 dark:text-blue-400">
              <User size={16} />
            </div>
            <div className="text-left">
              <p className="text-xs font-bold text-slate-800 dark:text-slate-200">
                {user.first_name} {user.last_name}
              </p>
              <p className="text-[10px] text-slate-400 font-semibold capitalize">
                {user.role} Account
              </p>
            </div>
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={handleLogout}
            leftIcon={<LogOut size={16} />}
            className="w-full justify-center py-2.5"
          >
            Sign Out
          </Button>
        </div>
      </aside>

      {/* Main Workspace */}
      <main className="flex-1 p-8 flex flex-col space-y-6 overflow-y-auto max-w-7xl mx-auto w-full">
        <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-5 border-b border-slate-200 dark:border-slate-800">
          <div className="text-left">
            <h1 className="text-2xl font-black font-heading text-slate-900 dark:text-white">
              Multi-Report Analytics
            </h1>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Compare biometrics side-by-side and monitor longitudinal trends.
            </p>
          </div>

          <div className="flex items-center gap-2 bg-green-50 dark:bg-green-950/30 px-3.5 py-2 rounded-full text-xs font-bold text-green-600 dark:text-green-400 border border-green-200/50 dark:border-green-900/20">
            <ShieldCheck size={14} />
            <span>Secure HIPAA Environment</span>
          </div>
        </header>

        {loading ? (
          <div className="flex-1 flex flex-col items-center justify-center py-20">
            <Loader2 size={40} className="text-blue-600 animate-spin mb-4" />
            <p className="text-sm text-slate-500 font-semibold">Loading comparative database...</p>
          </div>
        ) : reports.length === 0 ? (
          /* Empty onboarding state */
          <div className="flex-1 flex flex-col items-center justify-center py-16 px-4 text-center max-w-lg mx-auto space-y-6">
            <div className="h-16 w-16 bg-blue-50 dark:bg-blue-950/40 border border-blue-100 dark:border-blue-900/30 rounded-3xl flex items-center justify-center text-blue-600 dark:text-blue-400 shadow-sm">
              <FileBarChart size={32} />
            </div>
            
            <div className="space-y-2">
              <h2 className="text-xl font-extrabold text-slate-950 dark:text-white">
                Insufficient Data to Compare
              </h2>
              <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
                Comparison mapping requires at least **2 completed medical reports**. Upload additional blood reports to unlock delta computations.
              </p>
            </div>

            <Button
              size="md"
              onClick={() => navigate("/reports")}
              className="px-6 shadow-md"
            >
              Upload Lab Reports
            </Button>
          </div>
        ) : (
          /* Core Comparison Panels */
          <div className="space-y-6">
            
            {/* Reports Selector Checklist Card */}
            <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900 text-left">
              <h2 className="text-sm font-bold uppercase tracking-wider text-slate-400 mb-4">
                Select Reports for Comparison (Up to 3)
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {reports.map((report) => {
                  const isSelected = selectedIds.includes(report.id);
                  const parsedDate = report.biometrics[0]?.test_date 
                    ? new Date(report.biometrics[0].test_date).toLocaleDateString()
                    : new Date(report.uploaded_at).toLocaleDateString();
                  
                  return (
                    <div
                      key={report.id}
                      onClick={() => handleToggleSelect(report.id)}
                      className={`group cursor-pointer rounded-2xl border p-4 flex items-center gap-3 transition-all ${
                        isSelected 
                          ? "border-blue-500 bg-blue-500/[0.03] shadow-sm shadow-blue-50 dark:shadow-none" 
                          : "border-slate-200 dark:border-slate-800 bg-slate-50/50 hover:bg-slate-50 dark:bg-slate-950/20 dark:hover:bg-slate-900"
                      }`}
                    >
                      <div className={`h-5 w-5 rounded-md border flex items-center justify-center transition-all ${
                        isSelected 
                          ? "bg-blue-600 border-blue-600 text-white" 
                          : "border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900"
                      }`}>
                        {isSelected && <CheckCircle2 size={12} className="stroke-[3]" />}
                      </div>
                      
                      <div className="text-left overflow-hidden">
                        <p className="text-xs font-extrabold text-slate-800 dark:text-slate-200 truncate">
                          {report.filename}
                        </p>
                        <p className="text-[10px] text-slate-400 font-semibold flex items-center gap-1 mt-1">
                          <Calendar size={10} />
                          {parsedDate}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {selectedIds.length < 2 ? (
              /* Informative Callout if only 1 selected */
              <div className="p-8 rounded-3xl bg-blue-50/50 dark:bg-blue-950/20 border border-blue-100 dark:border-blue-900/30 text-center max-w-md mx-auto space-y-3">
                <HelpCircle className="text-blue-500 mx-auto" size={32} />
                <p className="text-sm font-bold text-slate-800 dark:text-slate-200">
                  Select Another Report
                </p>
                <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                  Please check at least **2 reports** above to populate the comparative analytics matrix and calculate deltas.
                </p>
              </div>
            ) : (
              /* Side-by-side Table & AI Insights Panel */
              <div className="space-y-6">
                
                {/* Comparison Matrix Table Card */}
                <div className="rounded-3xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900 overflow-hidden">
                  <div className="p-6 border-b border-slate-100 dark:border-slate-800 text-left">
                    <h2 className="text-lg font-bold font-heading text-slate-900 dark:text-white flex items-center gap-2">
                      <ArrowLeftRight size={18} className="text-blue-500" />
                      <span>Biometric Comparison Matrix</span>
                    </h2>
                  </div>
                  
                  <div className="overflow-x-auto">
                    <table className="w-full border-collapse">
                      <thead>
                        <tr className="bg-slate-50 dark:bg-slate-800/40 border-b border-slate-100 dark:border-slate-800">
                          <th className="py-3.5 px-4 text-left text-xs font-bold uppercase tracking-wider text-slate-400 w-1/4">
                            Biomarker
                          </th>
                          <th className="py-3.5 px-4 text-left text-xs font-bold uppercase tracking-wider text-slate-400 w-12">
                            Unit
                          </th>
                          {sortedSelection.map((report, idx) => {
                            const dateStr = report.biometrics[0]?.test_date 
                              ? new Date(report.biometrics[0].test_date).toLocaleDateString()
                              : new Date(report.uploaded_at).toLocaleDateString();
                            return (
                              <th key={report.id} className="py-3.5 px-4 text-center text-xs font-extrabold uppercase tracking-wider text-slate-800 dark:text-slate-200">
                                {idx === 0 ? "Report 1 (Base)" : idx === 1 ? "Report 2" : "Report 3"}
                                <span className="block text-[10px] text-slate-400 font-semibold lowercase mt-0.5">
                                  {dateStr}
                                </span>
                              </th>
                            );
                          })}
                          <th className="py-3.5 px-4 text-center text-xs font-bold uppercase tracking-wider text-slate-400 w-1/4">
                            Progress Delta
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {renderMetricRow(
                          "Fasting Glucose", 
                          "mg/dL", 
                          (r) => r.biometrics[0].blood_sugar,
                          (v1, v2) => {
                            const diff = v2 - v1;
                            const text = diff > 0 ? `+${diff.toFixed(0)} mg/dL` : `${diff.toFixed(0)} mg/dL`;
                            return { text, positive: diff <= 0 }; // decrease glucose is positive
                          }
                        )}
                        {renderMetricRow(
                          "Hemoglobin", 
                          "g/dL", 
                          (r) => r.biometrics[0].hemoglobin,
                          (v1, v2) => {
                            const diff = v2 - v1;
                            const text = diff > 0 ? `+${diff.toFixed(1)} g/dL` : `${diff.toFixed(1)} g/dL`;
                            return { text, positive: diff >= 0 }; // increase hemoglobin is positive
                          }
                        )}
                        {renderMetricRow(
                          "Vitamin D (25-OH)", 
                          "ng/mL", 
                          (r) => r.biometrics[0].vitamin_d,
                          (v1, v2) => {
                            const diff = v2 - v1;
                            const text = diff > 0 ? `+${diff.toFixed(0)} ng/mL` : `${diff.toFixed(0)} ng/mL`;
                            return { text, positive: diff >= 0 }; // increase Vitamin D is positive
                          }
                        )}
                        {renderBPRow()}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* AI Progress Analysis Box */}
                <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900 text-left space-y-4">
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div className="flex items-center gap-2">
                      <Sparkles size={18} className="text-blue-500" />
                      <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                        MedIntel AI Comparison Analysis
                      </h3>
                    </div>
                    
                    <Button
                      size="sm"
                      onClick={generateComparison}
                      disabled={generatingAi}
                      leftIcon={generatingAi ? <Loader2 size={12} className="animate-spin" /> : <Sparkles size={12} />}
                      className="px-4 text-xs shadow-sm bg-slate-900 hover:bg-slate-800 text-slate-50 dark:bg-slate-800 dark:hover:bg-slate-700 border-none"
                    >
                      {generatingAi ? "Generating Summary..." : "Generate AI Summary"}
                    </Button>
                  </div>

                  {generatingAi && (
                    <div className="flex flex-col items-center justify-center py-10 border border-dashed border-slate-100 dark:border-slate-800 rounded-2xl">
                      <Loader2 size={30} className="text-blue-500 animate-spin mb-2" />
                      <p className="text-xs text-slate-400 font-semibold">Comparing metrics and generating clinical analysis...</p>
                    </div>
                  )}

                  {aiInsights && (
                    <div className="p-5 rounded-2xl bg-blue-50/20 border border-blue-100/50 dark:bg-blue-950/10 dark:border-blue-900/20 text-sm text-slate-700 dark:text-slate-300 leading-relaxed whitespace-pre-line font-medium">
                      {aiInsights}
                    </div>
                  )}

                  {!generatingAi && !aiInsights && (
                    <div className="text-center py-6 border border-dashed border-slate-100 dark:border-slate-800 rounded-2xl text-xs text-slate-400 font-semibold">
                      Click the "Generate AI Summary" button to receive a detailed medical progress synthesis from your assistant.
                    </div>
                  )}
                </div>

              </div>
            )}
            
          </div>
        )}
      </main>
    </div>
  );
}
