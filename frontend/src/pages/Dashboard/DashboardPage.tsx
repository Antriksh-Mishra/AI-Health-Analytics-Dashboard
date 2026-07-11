import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import Button from "../../components/common/Button";
import Logo from "../../components/common/Logo";
import { LogOut, LayoutDashboard, FileText, Bot, BarChart3, Settings, ShieldCheck, User } from "lucide-react";

export default function DashboardPage() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  if (!user) return null;

  return (
    <div className="min-h-screen flex bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100">
      {/* Sidebar Placeholder */}
      <aside className="w-64 border-r border-slate-200 bg-white p-6 flex flex-col justify-between dark:border-slate-800 dark:bg-slate-900">
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
            <button className="flex items-center gap-3 w-full px-4 py-3 rounded-xl text-sm font-semibold text-slate-400 cursor-not-allowed select-none dark:text-slate-600" disabled>
              <BarChart3 size={18} />
              Analytics
            </button>
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

      {/* Main Panel */}
      <main className="flex-1 p-10 flex flex-col space-y-6 overflow-y-auto">
        <header className="flex justify-between items-center pb-5 border-b border-slate-200 dark:border-slate-800">
          <div className="text-left">
            <h1 className="text-2xl font-black font-heading text-slate-900 dark:text-white">
              Health Dashboard
            </h1>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Welcome back, {user.first_name}. Monitor and manage your biometric indicators.
            </p>
          </div>

          <div className="flex items-center gap-2 bg-green-50 dark:bg-green-950/30 px-3.5 py-2 rounded-full text-xs font-bold text-green-600 dark:text-green-400">
            <ShieldCheck size={14} />
            <span>Secure Mode Active</span>
          </div>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-2 rounded-3xl border border-slate-200 bg-white p-8 shadow-sm dark:border-slate-800 dark:bg-slate-900 text-left space-y-4">
            <h2 className="text-lg font-bold font-heading text-slate-900 dark:text-white">
              Authentication Verified
            </h2>
            <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
              Your profile is verified under standard JSON Web Token credentials. In subsequent phases, you will be able to drag-and-drop clinical reports here to map blood work indicators and analyze trends.
            </p>
            <div className="p-4 rounded-2xl bg-blue-50/50 dark:bg-blue-950/20 border border-blue-100 dark:border-blue-900/30 text-xs text-blue-800 dark:text-blue-300">
              💡 **Next Step**: Proceed to Phase 3 to build the PDF/Image Upload engine and configure the backend EasyOCR parameters extraction pipeline.
            </div>
          </div>

          <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm dark:border-slate-800 dark:bg-slate-900 text-left space-y-4">
            <h2 className="text-lg font-bold font-heading text-slate-900 dark:text-white">
              User Credentials
            </h2>
            <div className="space-y-2 text-xs">
              <div className="flex justify-between py-1 border-b border-slate-50 dark:border-slate-800/50">
                <span className="text-slate-400">Email:</span>
                <span className="font-semibold text-slate-800 dark:text-slate-200">{user.email}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-50 dark:border-slate-800/50">
                <span className="text-slate-400">First Name:</span>
                <span className="font-semibold text-slate-800 dark:text-slate-200">{user.first_name}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-50 dark:border-slate-800/50">
                <span className="text-slate-400">Last Name:</span>
                <span className="font-semibold text-slate-800 dark:text-slate-200">{user.last_name}</span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-slate-400">Role:</span>
                <span className="font-semibold text-slate-800 dark:text-slate-200 capitalize">{user.role}</span>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}