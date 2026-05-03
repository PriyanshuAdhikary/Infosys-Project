import { useState } from "react";
import { motion } from "framer-motion";
import {
  Sparkles,
  Lock,
  User as UserIcon,
  ShieldCheck,
  Users,
  ArrowRight,
} from "lucide-react";
import { loginUser, setAuthToken } from "@/lib/api";
import { toast } from "sonner";

export default function Login({ onLogin }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("Admin");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!username.trim() || !password.trim()) {
      toast.error("Enter a username and password to continue.");
      return;
    }
    setLoading(true);
    try {
      const data = await loginUser(username.trim(), password.trim());
      setAuthToken(data.access_token);
      localStorage.setItem("role", data.role);
      localStorage.setItem("username", data.username);
      
      toast.success(`Welcome back, ${data.username}`);
      onLogin(data);
    } catch (err) {
      toast.error(err?.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-6 py-12">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="w-full max-w-md"
        data-testid="login-screen"
      >
        {/* Logo + tagline */}
        <div className="mb-8 flex flex-col items-center text-center">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.1, duration: 0.5 }}
            className="h-12 w-12 rounded-2xl bg-gradient-to-br from-indigo-500 to-emerald-500 p-[1px] mb-4"
          >
            <div className="h-full w-full rounded-2xl bg-slate-950 flex items-center justify-center">
              <Sparkles className="h-5 w-5 text-indigo-400" />
            </div>
          </motion.div>
          <h1 className="font-display text-4xl sm:text-5xl font-extrabold tracking-tight">
            Task<span className="text-indigo-400">Sync</span>
          </h1>
          <p className="mt-2 text-slate-400 text-sm">
            Where teams ship in sync. Sign in to your workspace.
          </p>
        </div>

        {/* Glass card */}
        <motion.form
          onSubmit={handleSubmit}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.5 }}
          className="relative overflow-hidden rounded-2xl border border-white/10 bg-slate-900/60 backdrop-blur-xl p-8 shadow-[0_8px_32px_rgba(0,0,0,0.5)]"
          data-testid="login-form"
        >
          {/* decorative gradient border */}
          <div className="pointer-events-none absolute inset-0 rounded-2xl bg-gradient-to-br from-indigo-500/10 via-transparent to-emerald-500/10" />

          <div className="relative space-y-5">
            {/* Username */}
            <div>
              <label className="text-xs font-bold uppercase tracking-[0.2em] text-slate-400">
                Username
              </label>
              <div className="mt-2 relative">
                <UserIcon className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="alex.morgan"
                  autoComplete="username"
                  data-testid="login-username-input"
                  className="w-full bg-slate-950/60 border border-slate-800 rounded-lg pl-11 pr-4 py-3 text-slate-50 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500/50 transition-all"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="text-xs font-bold uppercase tracking-[0.2em] text-slate-400">
                Password
              </label>
              <div className="mt-2 relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  autoComplete="current-password"
                  data-testid="login-password-input"
                  className="w-full bg-slate-950/60 border border-slate-800 rounded-lg pl-11 pr-4 py-3 text-slate-50 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500/50 transition-all"
                />
              </div>
            </div>

            {/* Role toggle */}
            <div>
              <label className="text-xs font-bold uppercase tracking-[0.2em] text-slate-400">
                Sign in as
              </label>
              <div className="mt-2 grid grid-cols-2 gap-2 p-1 rounded-lg bg-slate-950/60 border border-slate-800">
                <button
                  type="button"
                  onClick={() => setRole("Admin")}
                  data-testid="login-role-admin"
                  className={`flex items-center justify-center gap-2 py-2 px-3 rounded-md text-sm font-semibold transition-all ${
                    role === "Admin"
                      ? "bg-indigo-500/20 text-indigo-300 border border-indigo-500/40"
                      : "text-slate-400 hover:text-slate-200"
                  }`}
                >
                  <ShieldCheck className="h-4 w-4" />
                  Admin
                </button>
                <button
                  type="button"
                  onClick={() => setRole("Member")}
                  data-testid="login-role-member"
                  className={`flex items-center justify-center gap-2 py-2 px-3 rounded-md text-sm font-semibold transition-all ${
                    role === "Member"
                      ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/40"
                      : "text-slate-400 hover:text-slate-200"
                  }`}
                >
                  <Users className="h-4 w-4" />
                  Member
                </button>
              </div>
              <p className="mt-2 text-xs text-slate-500">
                Demo mode — any credentials work. Role selection drives admin access.
              </p>
            </div>

            {/* Submit */}
            <motion.button
              type="submit"
              disabled={loading}
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.98 }}
              data-testid="login-submit-button"
              className="w-full inline-flex items-center justify-center gap-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 disabled:opacity-60 disabled:cursor-not-allowed text-white font-semibold py-3 px-6 transition-all shadow-[0_8px_24px_rgba(99,102,241,0.35)]"
            >
              {loading ? (
                <span className="font-mono text-sm">Authenticating…</span>
              ) : (
                <>
                  Enter workspace
                  <ArrowRight className="h-4 w-4" />
                </>
              )}
            </motion.button>
          </div>
        </motion.form>

        <p className="mt-6 text-center text-xs text-slate-500 font-mono">
          v1.0 · built for high-performing teams
        </p>
      </motion.div>
    </div>
  );
}