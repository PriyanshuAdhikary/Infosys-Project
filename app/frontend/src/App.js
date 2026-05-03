import { useEffect, useState } from "react";
import "@/App.css";
import { AnimatePresence, motion } from "framer-motion";
import Login from "@/components/Login";
import Dashboard from "@/components/Dashboard";
import { setAuthToken } from "@/lib/api";
import { Toaster } from "@/components/ui/sonner";

const STORAGE_KEY = "tasksync.user";

function App() {
  const [user, setUser] = useState({
    isLoggedIn: false,
    role: "Member",
    token: "",
    username: "",
  });

  // Hydrate from localStorage
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (parsed?.token) {
          setAuthToken(parsed.token);
          setUser({ ...parsed, isLoggedIn: true });
        }
      }
    } catch (e) {
      // ignore
    }
  }, []);

  const handleLogin = (payload) => {
    const next = {
      isLoggedIn: true,
      role: payload.role,
      token: payload.token,
      username: payload.username,
    };
    setAuthToken(payload.token);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    setUser(next);
  };

  const handleLogout = () => {
    setAuthToken(null);
    localStorage.removeItem(STORAGE_KEY);
    setUser({ isLoggedIn: false, role: "Member", token: "", username: "" });
  };

  return (
    <div className="App grain bg-slate-950 text-slate-50 min-h-screen">
      {/* Ambient background orbs */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
        <div
          className="ambient-orb"
          style={{
            width: 520,
            height: 520,
            top: -140,
            left: -120,
            background:
              "radial-gradient(circle, rgba(99,102,241,0.55), rgba(99,102,241,0) 70%)",
          }}
        />
        <div
          className="ambient-orb"
          style={{
            width: 480,
            height: 480,
            bottom: -160,
            right: -120,
            background:
              "radial-gradient(circle, rgba(16,185,129,0.45), rgba(16,185,129,0) 70%)",
          }}
        />
        <div
          className="ambient-orb"
          style={{
            width: 380,
            height: 380,
            top: "40%",
            left: "55%",
            background:
              "radial-gradient(circle, rgba(139,92,246,0.28), rgba(139,92,246,0) 70%)",
          }}
        />
      </div>

      <div className="relative z-10">
        <AnimatePresence mode="wait">
          {!user.isLoggedIn ? (
            <motion.div
              key="login"
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.96 }}
              transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
            >
              <Login onLogin={handleLogin} />
            </motion.div>
          ) : (
            <motion.div
              key="dashboard"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -16 }}
              transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
            >
              <Dashboard user={user} onLogout={handleLogout} />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <Toaster theme="dark" position="top-right" richColors />
    </div>
  );
}

export default App;
