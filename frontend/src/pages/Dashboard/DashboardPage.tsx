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
  Activity, 
  ArrowUpRight, 
  Plus, 
  Sparkles,
  Loader2,
  AlertTriangle,
  CheckCircle2,
  Info,
  Sun,
  Moon
} from "lucide-react";
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer 
} from "recharts";

interface AnalyticsDataPoint {
  id: number;
  report_id: number;
  filename: string;
  date: string;
  hemoglobin: number | null;
  blood_sugar: number | null;
  cholesterol: number | null;
  vitamin_d: number | null;
  tsh: number | null;
  systolic_bp: number | null;
  diastolic_bp: number | null;
  bp_display: string | null;
  extra_metrics: Record<string, any>;
}

type MetricType = "blood_sugar" | "hemoglobin" | "vitamin_d" | "tsh" | "bp";

export default function DashboardPage() {
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
  const [dataPoints, setDataPoints] = useState<AnalyticsDataPoint[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeMetric, setActiveMetric] = useState<MetricType>("blood_sugar");

  const handleLogout = () => {
    navigate("/");
    setTimeout(() => {
      logout();
    }, 100);
  };

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const res = await API.get<AnalyticsDataPoint[]>("/reports/analytics");
        setDataPoints(res.data);
      } catch (err: any) {
        toast.error("Failed to load health analytics data.");
      } finally {
        setLoading(false);
      }
    };
    fetchAnalytics();
  }, []);

  if (!user) return null;

  // Extract latest metrics
  const getLatestMetric = (metric: MetricType) => {
    if (dataPoints.length === 0) return null;
    
    // Find the latest record that contains a value for this metric
    const reversed = [...dataPoints].reverse();
    if (metric === "bp") {
      const match = reversed.find(d => d.systolic_bp !== null && d.diastolic_bp !== null);
      return match ? { systolic: match.systolic_bp, diastolic: match.diastolic_bp, date: match.date } : null;
    } else {
      const match = reversed.find(d => d[metric] !== null);
      return match ? { value: match[metric], date: match.date } : null;
    }
  };

  const latestSugar = getLatestMetric("blood_sugar") as { value: number; date: string } | null;
  const latestHb = getLatestMetric("hemoglobin") as { value: number; date: string } | null;
  const latestVitD = getLatestMetric("vitamin_d") as { value: number; date: string } | null;
  const latestTsh = getLatestMetric("tsh") as { value: number; date: string } | null;
  const latestBP = getLatestMetric("bp") as { systolic: number; diastolic: number; date: string } | null;

  const getTshStatus = (val: number) => {
    if (val >= 0.40 && val <= 4.50) return { label: "Normal", color: "text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-950/20 border-green-200 dark:border-green-900/30" };
    if (val > 4.50) return { label: "Hypothyroid", color: "text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/20 border-amber-200 dark:border-amber-900/30" };
    return { label: "Hyperthyroid", color: "text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950/20 border-red-200 dark:border-red-900/30" };
  };

  // Status evaluators
  const getSugarStatus = (val: number) => {
    if (val < 100) return { label: "Normal", color: "text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-950/20 border-green-200 dark:border-green-900/30" };
    if (val <= 125) return { label: "Prediabetes", color: "text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/20 border-amber-200 dark:border-amber-900/30" };
    return { label: "Diabetic range", color: "text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950/20 border-red-200 dark:border-red-900/30" };
  };

  const getHbStatus = (val: number) => {
    const gender = user?.gender;
    let minNormal = 12.0;
    let maxNormal = 17.5;
    
    if (gender === "male") {
      minNormal = 13.5;
      maxNormal = 17.5;
    } else if (gender === "female") {
      minNormal = 12.0;
      maxNormal = 15.5;
    }

    if (val >= minNormal && val <= maxNormal) {
      return { label: "Normal", color: "text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-950/20 border-green-200 dark:border-green-900/30" };
    }
    if ((val >= minNormal - 1.0 && val < minNormal) || (val > maxNormal && val <= maxNormal + 1.0)) {
      return { label: "Warning", color: "text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/20 border-amber-200 dark:border-amber-900/30" };
    }
    return { label: "Critical", color: "text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950/20 border-red-200 dark:border-red-900/30" };
  };

  const getVitDStatus = (val: number) => {
    if (val >= 30) return { label: "Normal", color: "text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-950/20 border-green-200 dark:border-green-900/30" };
    if (val >= 20) return { label: "Insufficiency", color: "text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/20 border-amber-200 dark:border-amber-900/30" };
    return { label: "Deficiency", color: "text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950/20 border-red-200 dark:border-red-900/30" };
  };

  const getBPStatus = (sys: number, dia: number) => {
    if (sys < 120 && dia < 80) return { label: "Normal", color: "text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-950/20 border-green-200 dark:border-green-900/30" };
    if (sys <= 139 || dia <= 89) return { label: "Prehypertension", color: "text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/20 border-amber-200 dark:border-amber-900/30" };
    return { label: "Hypertension", color: "text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950/20 border-red-200 dark:border-red-900/30" };
  };

  // Setup charting parameters
  const chartConfigs = {
    blood_sugar: {
      label: "Fasting Glucose",
      key: "blood_sugar",
      color: "#f59e0b",
      gradient: "colorSugar",
      unit: " mg/dL"
    },
    hemoglobin: {
      label: "Hemoglobin",
      key: "hemoglobin",
      color: "#ec4899",
      gradient: "colorHb",
      unit: " g/dL"
    },
    vitamin_d: {
      label: "Vitamin D",
      key: "vitamin_d",
      color: "#eab308",
      gradient: "colorVitD",
      unit: " ng/mL"
    },
    tsh: {
      label: "Thyroid (TSH)",
      key: "tsh",
      color: "#8b5cf6",
      gradient: "colorTsh",
      unit: " µIU/mL"
    },
    bp: {
      label: "Blood Pressure",
      key: "systolic_bp",
      color: "#3b82f6",
      gradient: "colorBP",
      unit: " mmHg"
    }
  };

  const activeConfig = chartConfigs[activeMetric];

  // Custom tooltips styling for charts
  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-slate-900/95 text-slate-100 border border-slate-700 p-4 rounded-2xl shadow-xl backdrop-blur-md text-left">
          <p className="text-xs text-slate-400 font-bold mb-1">{data.date}</p>
          {activeMetric === "bp" ? (
            <p className="text-sm font-extrabold text-blue-400">
              Blood Pressure: {data.systolic_bp}/{data.diastolic_bp} mmHg
            </p>
          ) : (
            <p className="text-sm font-extrabold" style={{ color: activeConfig.color }}>
              {activeConfig.label}: {payload[0].value} {activeConfig.unit.trim()}
            </p>
          )}
          <p className="text-[10px] text-slate-400 mt-2 font-semibold italic max-w-xs">
            Report: {data.filename}
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="min-h-screen flex bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100">
      {/* Sidebar Navigation */}
      <aside className="w-64 border-r border-slate-200 bg-white p-6 flex flex-col justify-between dark:border-slate-800 dark:bg-slate-900 shrink-0">
        <div className="space-y-8">
          <Logo size="sm" />
          
          <nav className="space-y-1">
            <Link to="/dashboard" className="flex items-center gap-3 w-full px-4 py-3 rounded-xl text-sm font-semibold bg-blue-50 text-blue-600 dark:bg-blue-950/40 dark:text-blue-400">
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

      {/* Main Panel */}
      <main className="flex-1 p-8 flex flex-col space-y-6 overflow-y-auto max-w-7xl mx-auto w-full">
        <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-5 border-b border-slate-200 dark:border-slate-800">
          <div className="text-left">
            <h1 className="text-2xl font-black font-heading text-slate-900 dark:text-white">
              Clinical Health Overview
            </h1>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Welcome, {user.first_name}. Monitor your historical biomarkers and clinical indicators.
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
            <p className="text-sm text-slate-500 font-semibold">Loading clinical database...</p>
          </div>
        ) : dataPoints.length === 0 ? (
          /* Empty/Onboarding view */
          <div className="flex-1 flex flex-col items-center justify-center py-16 px-4 text-center max-w-lg mx-auto space-y-6">
            <div className="h-16 w-16 bg-blue-50 dark:bg-blue-950/40 border border-blue-100 dark:border-blue-900/30 rounded-3xl flex items-center justify-center text-blue-600 dark:text-blue-400 shadow-sm animate-pulse">
              <Activity size={32} />
            </div>
            
            <div className="space-y-2">
              <h2 className="text-xl font-extrabold text-slate-950 dark:text-white">
                Begin Your Health Dashboard
              </h2>
              <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
                We need health records to calculate longitudinal trends. Upload your digital clinical report sheet (PDF/Image) to see biometric analytics.
              </p>
            </div>

            <Button
              size="md"
              onClick={() => navigate("/reports")}
              leftIcon={<Plus size={16} />}
              className="px-6 shadow-md"
            >
              Upload First Report
            </Button>
          </div>
        ) : (
          /* Rich Dashboard Grid */
          <div className="space-y-6">
            
            {/* Latest Indicator Cards Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
              
              {/* Glucose Card */}
              <div 
                onClick={() => setActiveMetric("blood_sugar")}
                className={`group cursor-pointer rounded-2xl border p-5 shadow-sm text-left transition-all duration-300 ${
                  activeMetric === "blood_sugar" 
                    ? "border-amber-400 dark:border-amber-500 bg-amber-500/[0.03] shadow-amber-100 dark:shadow-none" 
                    : "border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-slate-300 dark:hover:border-slate-700 hover:shadow-md"
                }`}
              >
                <div className="flex justify-between items-start mb-4">
                  <span className="text-[10px] uppercase tracking-wider font-extrabold text-slate-400">
                    Fasting Sugar
                  </span>
                  {latestSugar && (
                    <span className={`text-[10px] font-bold px-2 py-0.5 border rounded-full capitalize ${getSugarStatus(latestSugar.value).color}`}>
                      {getSugarStatus(latestSugar.value).label}
                    </span>
                  )}
                </div>
                <div className="flex items-baseline gap-1.5">
                  <span className="text-3xl font-black font-heading text-slate-900 dark:text-white">
                    {latestSugar ? latestSugar.value : "N/A"}
                  </span>
                  <span className="text-xs text-slate-400 font-semibold">mg/dL</span>
                </div>
                <p className="text-[10px] text-slate-400 mt-3 font-medium">
                  {latestSugar ? `As of ${latestSugar.date}` : "Not detected in records"}
                </p>
              </div>

              {/* Hemoglobin Card */}
              <div 
                onClick={() => setActiveMetric("hemoglobin")}
                className={`group cursor-pointer rounded-2xl border p-5 shadow-sm text-left transition-all duration-300 ${
                  activeMetric === "hemoglobin" 
                    ? "border-pink-400 dark:border-pink-500 bg-pink-500/[0.03] shadow-pink-100 dark:shadow-none" 
                    : "border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-slate-300 dark:hover:border-slate-700 hover:shadow-md"
                }`}
              >
                <div className="flex justify-between items-start mb-4">
                  <span className="text-[10px] uppercase tracking-wider font-extrabold text-slate-400">
                    Hemoglobin
                  </span>
                  {latestHb && (
                    <span className={`text-[10px] font-bold px-2 py-0.5 border rounded-full capitalize ${getHbStatus(latestHb.value).color}`}>
                      {getHbStatus(latestHb.value).label}
                    </span>
                  )}
                </div>
                <div className="flex items-baseline gap-1.5">
                  <span className="text-3xl font-black font-heading text-slate-900 dark:text-white">
                    {latestHb ? latestHb.value.toFixed(1) : "N/A"}
                  </span>
                  <span className="text-xs text-slate-400 font-semibold">g/dL</span>
                </div>
                <p className="text-[10px] text-slate-400 mt-3 font-medium">
                  {latestHb ? `As of ${latestHb.date}` : "Not detected in records"}
                </p>
              </div>

              {/* Vitamin D Card */}
              <div 
                onClick={() => setActiveMetric("vitamin_d")}
                className={`group cursor-pointer rounded-2xl border p-5 shadow-sm text-left transition-all duration-300 ${
                  activeMetric === "vitamin_d" 
                    ? "border-yellow-400 dark:border-yellow-500 bg-yellow-500/[0.03] shadow-yellow-100 dark:shadow-none" 
                    : "border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-slate-300 dark:hover:border-slate-700 hover:shadow-md"
                }`}
              >
                <div className="flex justify-between items-start mb-4">
                  <span className="text-[10px] uppercase tracking-wider font-extrabold text-slate-400">
                    Vitamin D (25-OH)
                  </span>
                  {latestVitD && (
                    <span className={`text-[10px] font-bold px-2 py-0.5 border rounded-full capitalize ${getVitDStatus(latestVitD.value).color}`}>
                      {getVitDStatus(latestVitD.value).label}
                    </span>
                  )}
                </div>
                <div className="flex items-baseline gap-1.5">
                  <span className="text-3xl font-black font-heading text-slate-900 dark:text-white">
                    {latestVitD ? latestVitD.value : "N/A"}
                  </span>
                  <span className="text-xs text-slate-400 font-semibold">ng/mL</span>
                </div>
                <p className="text-[10px] text-slate-400 mt-3 font-medium">
                  {latestVitD ? `As of ${latestVitD.date}` : "Not detected in records"}
                </p>
              </div>

              {/* Thyroid (TSH) Card */}
              <div 
                onClick={() => setActiveMetric("tsh")}
                className={`group cursor-pointer rounded-2xl border p-5 shadow-sm text-left transition-all duration-300 ${
                  activeMetric === "tsh" 
                    ? "border-violet-400 dark:border-violet-500 bg-violet-500/[0.03] shadow-violet-100 dark:shadow-none" 
                    : "border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-slate-300 dark:hover:border-slate-700 hover:shadow-md"
                }`}
              >
                <div className="flex justify-between items-start mb-4">
                  <span className="text-[10px] uppercase tracking-wider font-extrabold text-slate-400">
                    Thyroid (TSH)
                  </span>
                  {latestTsh && (
                    <span className={`text-[10px] font-bold px-2 py-0.5 border rounded-full capitalize ${getTshStatus(latestTsh.value).color}`}>
                      {getTshStatus(latestTsh.value).label}
                    </span>
                  )}
                </div>
                <div className="flex items-baseline gap-1.5">
                  <span className="text-3xl font-black font-heading text-slate-900 dark:text-white">
                    {latestTsh ? latestTsh.value.toFixed(2) : "N/A"}
                  </span>
                  <span className="text-xs text-slate-400 font-semibold">µIU/mL</span>
                </div>
                <p className="text-[10px] text-slate-400 mt-3 font-medium">
                  {latestTsh ? `As of ${latestTsh.date}` : "Not detected in records"}
                </p>
              </div>

              {/* BP Card */}
              <div 
                onClick={() => setActiveMetric("bp")}
                className={`group cursor-pointer rounded-2xl border p-5 shadow-sm text-left transition-all duration-300 ${
                  activeMetric === "bp" 
                    ? "border-blue-400 dark:border-blue-500 bg-blue-500/[0.03] shadow-blue-100 dark:shadow-none" 
                    : "border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-slate-300 dark:hover:border-slate-700 hover:shadow-md"
                }`}
              >
                <div className="flex justify-between items-start mb-4">
                  <span className="text-[10px] uppercase tracking-wider font-extrabold text-slate-400">
                    Blood Pressure
                  </span>
                  {latestBP && (
                    <span className={`text-[10px] font-bold px-2 py-0.5 border rounded-full capitalize ${getBPStatus(latestBP.systolic, latestBP.diastolic).color}`}>
                      {getBPStatus(latestBP.systolic, latestBP.diastolic).label}
                    </span>
                  )}
                </div>
                <div className="flex items-baseline gap-1.5">
                  <span className="text-3xl font-black font-heading text-slate-900 dark:text-white">
                    {latestBP ? `${latestBP.systolic}/${latestBP.diastolic}` : "N/A"}
                  </span>
                  <span className="text-xs text-slate-400 font-semibold">mmHg</span>
                </div>
                <p className="text-[10px] text-slate-400 mt-3 font-medium">
                  {latestBP ? `As of ${latestBP.date}` : "Not detected in records"}
                </p>
              </div>

            </div>

            {/* Core Interactive Chart Panel & Wellness Insights Panel */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              
              {/* Trend Chart Card */}
              <div className="lg:col-span-2 rounded-3xl border border-slate-200 bg-white p-6 md:p-8 shadow-sm dark:border-slate-800 dark:bg-slate-900 text-left flex flex-col space-y-6">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                  <div>
                    <h2 className="text-lg font-bold font-heading text-slate-900 dark:text-white flex items-center gap-2">
                      <span>Clinical Trajectory: {activeConfig.label}</span>
                    </h2>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                      Longitudinal values mapped across uploaded medical data.
                    </p>
                  </div>

                  {/* Toggle buttons for mobile chart switching */}
                  <div className="inline-flex rounded-xl bg-slate-100 p-1 dark:bg-slate-800/80 gap-0.5">
                    {(["blood_sugar", "hemoglobin", "vitamin_d", "tsh", "bp"] as MetricType[]).map((metric) => (
                      <button
                        key={metric}
                        onClick={() => setActiveMetric(metric)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                          activeMetric === metric
                            ? "bg-white text-slate-950 dark:bg-slate-700 dark:text-white shadow-sm"
                            : "text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
                        }`}
                      >
                        {metric === "blood_sugar" ? "Glucose" : metric === "vitamin_d" ? "Vit D" : metric === "tsh" ? "TSH" : metric === "bp" ? "BP" : "Hb"}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Recharts Container */}
                <div className="h-80 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart
                      data={dataPoints}
                      margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
                    >
                      <defs>
                        <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor={activeConfig.color} stopOpacity={0.2}/>
                          <stop offset="95%" stopColor={activeConfig.color} stopOpacity={0}/>
                        </linearGradient>
                        {/* Separate gradient specifically for BP systolic/diastolic dual mapping */}
                        <linearGradient id="systolicGradient" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.15}/>
                          <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                        </linearGradient>
                        <linearGradient id="diastolicGradient" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.15}/>
                          <stop offset="95%" stopColor="#06b6d4" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(226, 232, 240, 0.3)" />
                      <XAxis 
                        dataKey="date" 
                        tick={{ fontSize: 10, fill: '#94a3b8', fontWeight: 600 }}
                        axisLine={false}
                        tickLine={false}
                      />
                      <YAxis 
                        tick={{ fontSize: 10, fill: '#94a3b8', fontWeight: 600 }}
                        axisLine={false}
                        tickLine={false}
                        domain={activeMetric === 'bp' ? [50, 180] : activeMetric === 'hemoglobin' ? [8, 20] : activeMetric === 'vitamin_d' ? [0, 80] : activeMetric === 'tsh' ? [0, 10] : [60, 200]}
                      />
                      <Tooltip content={<CustomTooltip />} />
                      
                      {activeMetric === "bp" ? (
                        <>
                          <Area 
                            type="monotone" 
                            dataKey="systolic_bp" 
                            stroke="#3b82f6" 
                            strokeWidth={3}
                            fillOpacity={1} 
                            fill="url(#systolicGradient)" 
                            connectNulls
                          />
                          <Area 
                            type="monotone" 
                            dataKey="diastolic_bp" 
                            stroke="#06b6d4" 
                            strokeWidth={3}
                            fillOpacity={1} 
                            fill="url(#diastolicGradient)" 
                            connectNulls
                          />
                        </>
                      ) : (
                        <Area 
                          type="monotone" 
                          dataKey={activeConfig.key} 
                          stroke={activeConfig.color} 
                          strokeWidth={3}
                          fillOpacity={1} 
                          fill="url(#chartGradient)" 
                          connectNulls
                        />
                      )}
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Side Wellness Insights and Actions Panel */}
              <div className="flex flex-col gap-6">
                
                {/* AI Assistant Chat Quick Prompt CTA */}
                <div className="rounded-3xl bg-slate-900 text-slate-100 p-6 text-left shadow-lg space-y-4 relative overflow-hidden dark:bg-slate-900 border border-slate-800">
                  <div className="absolute right-0 top-0 h-32 w-32 bg-blue-600/10 rounded-full blur-2xl"></div>
                  
                  <div className="inline-flex h-10 w-10 bg-white/10 rounded-xl items-center justify-center text-blue-400">
                    <Sparkles size={20} />
                  </div>
                  
                  <div className="space-y-1">
                    <h3 className="font-extrabold text-sm text-white">Ask MedIntel AI</h3>
                    <p className="text-xs text-slate-400 leading-relaxed">
                      Consult your assistant about these clinical trends, or request tips on dietary adjustments.
                    </p>
                  </div>

                  <Button
                    size="sm"
                    onClick={() => navigate("/ai-assistant")}
                    rightIcon={<ArrowUpRight size={14} />}
                    className="w-full justify-center bg-blue-600 hover:bg-blue-500 text-white font-bold border-none py-2.5 rounded-xl shadow-md cursor-pointer"
                  >
                    Consult Assistant
                  </Button>
                </div>

                {/* Wellness Summary / Alerts Widget */}
                <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900 text-left flex-1 flex flex-col justify-between space-y-4">
                  <div className="space-y-3">
                    <h3 className="font-bold text-sm text-slate-950 dark:text-white flex items-center gap-2">
                      <Activity size={16} className="text-blue-500" />
                      <span>Biomarker Status Summary</span>
                    </h3>
                    
                    <div className="space-y-2.5 text-xs">
                      {/* Glucose status line */}
                      {latestSugar && (
                        <div className="flex justify-between items-center py-1.5 border-b border-slate-50 dark:border-slate-800/50">
                          <span className="text-slate-500 font-semibold">Glucose:</span>
                          <span className={`font-bold flex items-center gap-1 ${
                            latestSugar.value >= 126 ? "text-red-500" : latestSugar.value >= 100 ? "text-amber-500" : "text-green-500"
                          }`}>
                            {latestSugar.value >= 100 ? <AlertTriangle size={12} /> : <CheckCircle2 size={12} />}
                            {latestSugar.value} mg/dL
                          </span>
                        </div>
                      )}
                      
                      {/* Hb status line */}
                      {latestHb && (
                        <div className="flex justify-between items-center py-1.5 border-b border-slate-50 dark:border-slate-800/50">
                          <span className="text-slate-500 font-semibold">Hemoglobin:</span>
                          <span className={`font-bold flex items-center gap-1 ${
                            latestHb.value < 11.0 ? "text-red-500" : latestHb.value < 12.0 ? "text-amber-500" : "text-green-500"
                          }`}>
                            {latestHb.value < 12.0 ? <AlertTriangle size={12} /> : <CheckCircle2 size={12} />}
                            {latestHb.value.toFixed(1)} g/dL
                          </span>
                        </div>
                      )}

                      {/* Vit D status line */}
                      {latestVitD && (
                        <div className="flex justify-between items-center py-1.5 border-b border-slate-50 dark:border-slate-800/50">
                          <span className="text-slate-500 font-semibold">Vitamin D:</span>
                          <span className={`font-bold flex items-center gap-1 ${
                            latestVitD.value < 20 ? "text-red-500" : latestVitD.value < 30 ? "text-amber-500" : "text-green-500"
                          }`}>
                            {latestVitD.value < 30 ? <AlertTriangle size={12} /> : <CheckCircle2 size={12} />}
                            {latestVitD.value} ng/mL
                          </span>
                        </div>
                      )}

                      {/* BP status line */}
                      {latestBP && (
                        <div className="flex justify-between items-center py-1.5">
                          <span className="text-slate-500 font-semibold">Blood Pressure:</span>
                          <span className={`font-bold flex items-center gap-1 ${
                            latestBP.systolic >= 140 || latestBP.diastolic >= 90 ? "text-red-500" : latestBP.systolic >= 120 || latestBP.diastolic >= 80 ? "text-amber-500" : "text-green-500"
                          }`}>
                            {latestBP.systolic >= 120 ? <AlertTriangle size={12} /> : <CheckCircle2 size={12} />}
                            {latestBP.systolic}/{latestBP.diastolic} mmHg
                          </span>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="p-3 bg-blue-50/50 dark:bg-blue-950/20 border border-blue-100 dark:border-blue-900/30 rounded-xl flex gap-2 text-[10px] text-blue-800 dark:text-blue-300">
                    <Info size={14} className="shrink-0 text-blue-500 mt-0.5" />
                    <p className="leading-relaxed">
                      All ranges mapped to clinical benchmarks. Click on any indicator card above to load its historical values onto the trend graph.
                    </p>
                  </div>
                </div>

              </div>
            </div>

          </div>
        )}
      </main>
    </div>
  );
}