import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Mail, Lock, ArrowRight, User, Shield, Briefcase } from "lucide-react";
import toast from "react-hot-toast";

import { useAuth } from "../../hooks/useAuth";
import Logo from "../../components/common/Logo";
import Button from "../../components/common/Button";
import Input from "../../components/common/Input";

const registerSchema = z.object({
  first_name: z.string().min(1, "First name is required"),
  last_name: z.string().min(1, "Last name is required"),
  email: z.string().min(1, "Email is required").email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  role: z.enum(["patient", "doctor"]),
});

type RegisterFormValues = z.infer<typeof registerSchema>;

export default function RegisterPage() {
  const navigate = useNavigate();
  const { register: registerUser } = useAuth();
  const [loading, setLoading] = useState(false);
  const [selectedRole, setSelectedRole] = useState<"patient" | "doctor">("patient");

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      first_name: "",
      last_name: "",
      email: "",
      password: "",
      role: "patient",
    },
  });

  const handleRoleChange = (role: "patient" | "doctor") => {
    setSelectedRole(role);
    setValue("role", role);
  };

  const onSubmit = async (data: RegisterFormValues) => {
    setLoading(true);
    try {
      await registerUser(data);
      toast.success("Account created successfully! Welcome.");
      navigate("/dashboard");
    } catch (err: any) {
      const errMsg = err.response?.data?.error || "Registration failed. Please try again.";
      toast.error(errMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950 px-6 py-12 relative overflow-hidden grid-bg dark:grid-bg-dark">
      <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] rounded-full bg-blue-500/10 blur-[120px] pointer-events-none"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[55%] h-[55%] rounded-full bg-indigo-500/10 blur-[130px] pointer-events-none"></div>

      <div className="w-full max-w-md relative z-10 flex flex-col items-center">
        <Link to="/" className="mb-8 hover:opacity-90 transition-opacity">
          <Logo size="md" />
        </Link>

        <div className="w-full rounded-3xl border border-slate-200 bg-white/80 p-8 shadow-xl backdrop-blur-md dark:border-slate-800 dark:bg-slate-900/60 dark:shadow-black/30">
          <div className="text-center mb-6">
            <h2 className="text-2xl font-black font-heading text-slate-900 dark:text-white mb-1.5">
              Create Account
            </h2>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Join MedIntel AI for deep clinical analytics.
            </p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <Input
                {...register("first_name")}
                label="First Name"
                placeholder="Jane"
                leftIcon={<User size={18} />}
                error={errors.first_name?.message}
              />
              <Input
                {...register("last_name")}
                label="Last Name"
                placeholder="Doe"
                leftIcon={<User size={18} />}
                error={errors.last_name?.message}
              />
            </div>

            <Input
              {...register("email")}
              label="Email Address"
              type="email"
              placeholder="jane.doe@company.com"
              leftIcon={<Mail size={18} />}
              error={errors.email?.message}
            />

            <Input
              {...register("password")}
              label="Password"
              type="password"
              placeholder="••••••••"
              leftIcon={<Lock size={18} />}
              error={errors.password?.message}
            />

            {/* Role selection block */}
            <div className="flex flex-col gap-1.5 text-left">
              <span className="text-sm font-heading font-semibold text-slate-700 dark:text-slate-300">
                Choose Account Type
              </span>
              <div className="grid grid-cols-2 gap-3 p-1 rounded-2xl bg-slate-100 dark:bg-slate-950 border border-slate-200/50 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => handleRoleChange("patient")}
                  className={`flex items-center justify-center gap-2 py-3.5 rounded-xl text-sm font-semibold transition-all duration-300 cursor-pointer ${
                    selectedRole === "patient"
                      ? "bg-white shadow-sm text-blue-600 dark:bg-slate-900 dark:text-blue-400"
                      : "text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200"
                  }`}
                >
                  <User size={16} />
                  Patient
                </button>
                <button
                  type="button"
                  onClick={() => handleRoleChange("doctor")}
                  className={`flex items-center justify-center gap-2 py-3.5 rounded-xl text-sm font-semibold transition-all duration-300 cursor-pointer ${
                    selectedRole === "doctor"
                      ? "bg-white shadow-sm text-blue-600 dark:bg-slate-900 dark:text-blue-400"
                      : "text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200"
                  }`}
                >
                  <Briefcase size={16} />
                  Doctor
                </button>
              </div>
            </div>

            <Button
              type="submit"
              variant="primary"
              size="lg"
              isLoading={loading}
              rightIcon={<ArrowRight size={18} />}
              className="w-full mt-2"
            >
              Get Started
            </Button>
          </form>

          <div className="text-center mt-6 pt-6 border-t border-slate-100 dark:border-slate-800/80">
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Already have an account?{" "}
              <Link to="/login" className="font-semibold text-blue-600 hover:text-blue-700 dark:text-blue-400">
                Sign In here
              </Link>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 mt-6 text-slate-400 dark:text-slate-600 text-[10px] font-bold uppercase tracking-wider select-none pointer-events-none">
          <Shield size={12} className="text-green-500" />
          <span>Encrypted HIPAA Environment</span>
        </div>
      </div>
    </div>
  );
}