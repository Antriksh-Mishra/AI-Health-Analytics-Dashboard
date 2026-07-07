import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Mail, Lock, ArrowRight, Shield } from "lucide-react";
import toast from "react-hot-toast";

import { useAuth } from "../../hooks/useAuth";
import Logo from "../../components/common/Logo";
import Button from "../../components/common/Button";
import Input from "../../components/common/Input";

const loginSchema = z.object({
  email: z.string().min(1, "Email is required").email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

type LoginFormValues = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const onSubmit = async (data: LoginFormValues) => {
    setLoading(true);
    try {
      await login(data);
      toast.success("Welcome back! Redirecting...");
      navigate("/dashboard");
    } catch (err: any) {
      const errMsg = err.response?.data?.error || "Login failed. Please verify your credentials.";
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
              Sign In
            </h2>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Access your medical data and health analytics.
            </p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <Input
              {...register("email")}
              label="Email Address"
              type="email"
              placeholder="name@company.com"
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

            <div className="flex items-center justify-between pt-1">
              <label className="flex items-center gap-2 text-xs font-semibold text-slate-500 dark:text-slate-400 cursor-pointer select-none">
                <input type="checkbox" className="rounded border-slate-300 text-blue-600 focus:ring-blue-500/30" />
                Remember me
              </label>
              <a href="#" className="text-xs font-semibold text-blue-600 hover:text-blue-700 dark:text-blue-400">
                Forgot password?
              </a>
            </div>

            <Button
              type="submit"
              variant="primary"
              size="lg"
              isLoading={loading}
              rightIcon={<ArrowRight size={18} />}
              className="w-full mt-2"
            >
              Sign In
            </Button>
          </form>

          <div className="text-center mt-6 pt-6 border-t border-slate-100 dark:border-slate-800/80">
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Don't have an account?{" "}
              <Link to="/register" className="font-semibold text-blue-600 hover:text-blue-700 dark:text-blue-400">
                Register here
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