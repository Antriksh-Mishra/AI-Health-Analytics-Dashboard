import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import Button from "../../components/common/Button";
import Input from "../../components/common/Input";
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
  Save,
  Loader2,
  Heart,
  Sun,
  Moon
} from "lucide-react";

export default function SettingsPage() {
  const { user, logout, updateUser } = useAuth();
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
  const [saving, setSaving] = useState(false);

  // Form State
  const [firstName, setFirstName] = useState(user?.first_name || "");
  const [lastName, setLastName] = useState(user?.last_name || "");
  const [age, setAge] = useState(user?.age !== undefined && user?.age !== null ? String(user.age) : "");
  const [gender, setGender] = useState(user?.gender || "");
  const [weight, setWeight] = useState(user?.weight !== undefined && user?.weight !== null ? String(user.weight) : "");
  const [height, setHeight] = useState(user?.height !== undefined && user?.height !== null ? String(user.height) : "");
  const [allergies, setAllergies] = useState(user?.allergies || "");
  const [chronicConditions, setChronicConditions] = useState(user?.chronic_conditions || "");

  const handleLogout = () => {
    navigate("/");
    setTimeout(() => {
      logout();
    }, 100);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    
    // Parse numeric fields safely
    const ageVal = age.trim() === "" ? null : parseInt(age, 10);
    const weightVal = weight.trim() === "" ? null : parseFloat(weight);
    const heightVal = height.trim() === "" ? null : parseFloat(height);

    if (ageVal !== null && isNaN(ageVal)) {
      toast.error("Age must be a valid integer number.");
      setSaving(false);
      return;
    }
    if (weightVal !== null && isNaN(weightVal)) {
      toast.error("Weight must be a valid float value.");
      setSaving(false);
      return;
    }
    if (heightVal !== null && isNaN(heightVal)) {
      toast.error("Height must be a valid float value.");
      setSaving(false);
      return;
    }

    try {
      const res = await API.put<{ user: any }>("/auth/profile", {
        first_name: firstName,
        last_name: lastName,
        age: ageVal,
        gender: gender || null,
        weight: weightVal,
        height: heightVal,
        allergies: allergies || null,
        chronic_conditions: chronicConditions || null
      });

      updateUser(res.data.user);
      toast.success("Health profile settings saved successfully!");
    } catch (err: any) {
      toast.error(err.response?.data?.error || "Failed to update profile settings.");
    } finally {
      setSaving(false);
    }
  };

  if (!user) return null;

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
            <Link to="/analytics" className="flex items-center gap-3 w-full px-4 py-3 rounded-xl text-sm font-semibold text-slate-500 hover:bg-slate-50 dark:text-slate-400 dark:hover:bg-slate-800/50">
              <BarChart3 size={18} />
              Analytics
            </Link>
            <Link to="/settings" className="flex items-center gap-3 w-full px-4 py-3 rounded-xl text-sm font-semibold bg-blue-50 text-blue-600 dark:bg-blue-950/40 dark:text-blue-400">
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

      {/* Main Workspace */}
      <main className="flex-1 p-8 flex flex-col space-y-6 overflow-y-auto max-w-4xl mx-auto w-full">
        <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-5 border-b border-slate-200 dark:border-slate-800">
          <div className="text-left">
            <h1 className="text-2xl font-black font-heading text-slate-900 dark:text-white">
              Profile Settings
            </h1>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Update account details and customize clinical health profile reference indices.
            </p>
          </div>

          <div className="flex items-center gap-2 bg-green-50 dark:bg-green-950/30 px-3.5 py-2 rounded-full text-xs font-bold text-green-600 dark:text-green-400 border border-green-200/50 dark:border-green-900/20">
            <ShieldCheck size={14} />
            <span>Secure HIPAA Environment</span>
          </div>
        </header>

        <form onSubmit={handleSave} className="space-y-6 text-left">
          {/* Account Profile Card */}
          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400 mb-6 flex items-center gap-2">
              <User size={16} className="text-blue-500" />
              <span>Personal Account Information</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="First Name"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                required
              />
              <Input
                label="Last Name"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                required
              />
              <div className="sm:col-span-2">
                <Input
                  label="Email Address"
                  value={user.email}
                  disabled
                  helperText="Registered email address cannot be changed."
                  className="bg-slate-50 dark:bg-slate-950 text-slate-400"
                />
              </div>
            </div>
          </div>

          {/* Clinical Health Profile Card */}
          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400 mb-6 flex items-center gap-2">
              <Heart size={16} className="text-rose-500" />
              <span>Clinical Health Profile & Metadata</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
              <Input
                label="Age"
                type="number"
                value={age}
                onChange={(e) => setAge(e.target.value)}
                placeholder="e.g. 35"
              />

              <div className="flex flex-col text-left">
                <label className="text-xs font-bold text-slate-500 dark:text-slate-400 mb-1.5 uppercase tracking-wider">
                  Gender
                </label>
                <select
                  value={gender}
                  onChange={(e) => setGender(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-slate-800 dark:text-slate-200"
                >
                  <option value="">Select Gender</option>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="other">Other</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <Input
                  label="Weight (kg)"
                  type="number"
                  step="0.1"
                  value={weight}
                  onChange={(e) => setWeight(e.target.value)}
                  placeholder="kg"
                />
                <Input
                  label="Height (cm)"
                  type="number"
                  step="0.1"
                  value={height}
                  onChange={(e) => setHeight(e.target.value)}
                  placeholder="cm"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="flex flex-col text-left">
                <label className="text-xs font-bold text-slate-500 dark:text-slate-400 mb-1.5 uppercase tracking-wider">
                  Known Allergies
                </label>
                <textarea
                  value={allergies}
                  onChange={(e) => setAllergies(e.target.value)}
                  placeholder="e.g. Penicillin, Pollen, Shellfish"
                  rows={3}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-slate-800 dark:text-slate-200 placeholder-slate-400"
                />
              </div>

              <div className="flex flex-col text-left">
                <label className="text-xs font-bold text-slate-500 dark:text-slate-400 mb-1.5 uppercase tracking-wider">
                  Chronic Conditions
                </label>
                <textarea
                  value={chronicConditions}
                  onChange={(e) => setChronicConditions(e.target.value)}
                  placeholder="e.g. Hypertension, Type 2 Diabetes"
                  rows={3}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-slate-800 dark:text-slate-200 placeholder-slate-400"
                />
              </div>
            </div>
          </div>

          <div className="flex justify-end pt-4">
            <Button
              type="submit"
              size="md"
              disabled={saving}
              leftIcon={saving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
              className="px-6 shadow-md"
            >
              {saving ? "Saving changes..." : "Save Profile Settings"}
            </Button>
          </div>
        </form>
      </main>
    </div>
  );
}
