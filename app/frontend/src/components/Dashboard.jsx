"import { useEffect, useMemo, useState } from \"react\";
import { motion } from \"framer-motion\";
import {
  LogOut,
  Sparkles,
  ShieldCheck,
  Users,
  Search,
  ListChecks,
  Clock,
  CircleCheckBig,
} from \"lucide-react\";
import {
  apiListProjects,
  apiListTasks,
  apiUpdateTaskStatus,
} from \"@/lib/api\";
import { toast } from \"sonner\";
import AdminPanel from \"@/components/AdminPanel\";
import KanbanBoard from \"@/components/KanbanBoard\";
import TaskModal from \"@/components/TaskModal\";

const STATUSES = [\"Pending\", \"In Progress\", \"Completed\"];

export default function Dashboard({ user, onLogout }) {
  const [projects, setProjects] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState(\"\");
  const [selectedTask, setSelectedTask] = useState(null);

  const isAdmin = user.role === \"Admin\";

  const loadData = async () => {
    try {
      const [p, t] = await Promise.all([apiListProjects(), apiListTasks()]);
      setProjects(p);
      setTasks(t);
    } catch (e) {
      toast.error(\"Failed to load data\");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const filteredTasks = useMemo(() => {
    if (!query.trim()) return tasks;
    const q = query.toLowerCase();
    return tasks.filter(
      (t) =>
        t.title.toLowerCase().includes(q) ||
        t.project_name.toLowerCase().includes(q) ||
        t.assigned_to.toLowerCase().includes(q)
    );
  }, [tasks, query]);

  const stats = useMemo(() => {
    const byStatus = STATUSES.reduce((acc, s) => ({ ...acc, [s]: 0 }), {});
    tasks.forEach((t) => (byStatus[t.status] = (byStatus[t.status] || 0) + 1));
    return {
      total: tasks.length,
      pending: byStatus[\"Pending\"] || 0,
      inProgress: byStatus[\"In Progress\"] || 0,
      completed: byStatus[\"Completed\"] || 0,
    };
  }, [tasks]);

  const handleStatusChange = async (taskId, newStatus) => {
    const previous = tasks;
    setTasks((prev) =>
      prev.map((t) => (t.id === taskId ? { ...t, status: newStatus } : t))
    );
    try {
      await apiUpdateTaskStatus(taskId, newStatus);
      toast.success(`Status updated to ${newStatus}`);
    } catch (e) {
      setTasks(previous);
      toast.error(\"Could not update status\");
    }
  };

  const handleTaskCreated = (task) => {
    setTasks((prev) => [task, ...prev]);
  };

  const handleProjectCreated = (project) => {
    setProjects((prev) => [project, ...prev]);
  };

  return (
    <div className=\"min-h-screen\" data-testid=\"dashboard\">
      {/* Header */}
      <header className=\"sticky top-0 z-20 backdrop-blur-xl bg-slate-950/70 border-b border-white/5\">
        <div className=\"max-w-7xl mx-auto px-6 sm:px-8 py-4 flex items-center justify-between gap-4\">
          <div className=\"flex items-center gap-3\">
            <div className=\"h-9 w-9 rounded-xl bg-gradient-to-br from-indigo-500 to-emerald-500 p-[1px]\">
              <div className=\"h-full w-full rounded-xl bg-slate-950 flex items-center justify-center\">
                <Sparkles className=\"h-4 w-4 text-indigo-400\" />
              </div>
            </div>
            <h1 className=\"font-display text-2xl font-extrabold tracking-tight\">
              Task<span className=\"text-indigo-400\">Sync</span>
            </h1>
          </div>

          <div className=\"flex items-center gap-3\">
            <RoleBadge role={user.role} />
            <div className=\"hidden sm:flex items-center gap-2 text-sm text-slate-400\">
              <span className=\"font-mono text-xs text-slate-500\">@</span>
              <span className=\"font-semibold text-slate-200\" data-testid=\"current-username\">
                {user.username}
              </span>
            </div>
            <button
              onClick={onLogout}
              data-testid=\"logout-button\"
              className=\"inline-flex items-center gap-2 rounded-lg border border-slate-800 bg-slate-900/60 hover:bg-slate-800/70 hover:border-slate-700 text-slate-200 text-sm font-semibold py-2 px-3 transition-all\"
            >
              <LogOut className=\"h-4 w-4\" />
              <span className=\"hidden sm:inline\">Logout</span>
            </button>
          </div>
        </div>
      </header>

      <main className=\"max-w-7xl mx-auto px-6 sm:px-8 py-8 space-y-8\">
        {/* Hero / stats */}
        <section>
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className=\"flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4\"
          >
            <div>
              <p className=\"text-xs font-bold uppercase tracking-[0.2em] text-slate-500\">
                Workspace
              </p>
              <h2 className=\"font-display text-3xl sm:text-4xl font-extrabold tracking-tight mt-1\">
                Good to see you, {user.username || \"friend\"}.
              </h2>
              <p className=\"text-slate-400 mt-1\">
                {stats.total} tasks across {projects.length} active projects.
              </p>
            </div>

            <div className=\"relative w-full sm:w-80\">
              <Search className=\"absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500\" />
              <input
                type=\"text\"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder=\"Search tasks, projects, people…\"
                data-testid=\"task-search-input\"
                className=\"w-full bg-slate-900/60 border border-slate-800 rounded-lg pl-10 pr-4 py-2.5 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500/50 transition-all\"
              />
            </div>
          </motion.div>

          <div className=\"mt-6 grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4\">
            <StatCard
              label=\"Total\"
              value={stats.total}
              icon={<ListChecks className=\"h-4 w-4\" />}
              tint=\"slate\"
            />
            <StatCard
              label=\"Pending\"
              value={stats.pending}
              icon={<Clock className=\"h-4 w-4\" />}
              tint=\"amber\"
            />
            <StatCard
              label=\"In Progress\"
              value={stats.inProgress}
              icon={<Sparkles className=\"h-4 w-4\" />}
              tint=\"indigo\"
            />
            <StatCard
              label=\"Completed\"
              value={stats.completed}
              icon={<CircleCheckBig className=\"h-4 w-4\" />}
              tint=\"emerald\"
            />
          </div>
        </section>

        {/* Admin Panel */}
        {isAdmin && (
          <AdminPanel
            projects={projects}
            onProjectCreated={handleProjectCreated}
            onTaskCreated={handleTaskCreated}
          />
        )}

        {/* Kanban Board */}
        <section data-testid=\"kanban-section\">
          <div className=\"flex items-center justify-between mb-4\">
            <div>
              <h3 className=\"font-display text-xl font-bold tracking-tight\">
                Task Board
              </h3>
              <p className=\"text-sm text-slate-500\">
                Drag cards across columns to update status.
              </p>
            </div>
          </div>

          {loading ? (
            <div className=\"text-center py-16 text-slate-500 font-mono text-sm\">
              Loading board…
            </div>
          ) : (
            <KanbanBoard
              tasks={filteredTasks}
              onStatusChange={handleStatusChange}
              onTaskClick={(task) => setSelectedTask(task)}
            />
          )}
        </section>
      </main>

      <TaskModal
        task={selectedTask}
        onClose={() => setSelectedTask(null)}
        onStatusChange={handleStatusChange}
      />
    </div>
  );
}

function RoleBadge({ role }) {
  const isAdmin = role === \"Admin\";
  const Icon = isAdmin ? ShieldCheck : Users;
  const color = isAdmin
    ? \"border-indigo-400/40 bg-indigo-500/10 text-indigo-300 shadow-[0_0_18px_rgba(99,102,241,0.35)]\"
    : \"border-emerald-400/40 bg-emerald-500/10 text-emerald-300 shadow-[0_0_18px_rgba(16,185,129,0.35)]\";
  return (
    <span
      data-testid=\"role-badge\"
      className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-bold uppercase tracking-[0.18em] ${color}`}
    >
      <Icon className=\"h-3.5 w-3.5\" />
      {role}
    </span>
  );
}

function StatCard({ label, value, icon, tint }) {
  const tints = {
    slate: \"text-slate-300\",
    amber: \"text-amber-300\",
    indigo: \"text-indigo-300\",
    emerald: \"text-emerald-300\",
  };
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -2 }}
      transition={{ duration: 0.3 }}
      className=\"rounded-xl border border-white/10 bg-slate-900/50 backdrop-blur-xl p-4 flex items-center justify-between\"
      data-testid={`stat-${label.toLowerCase().replace(/\s+/g, \"-\")}`}
    >
      <div>
        <p className=\"text-[10px] font-bold uppercase tracking-[0.2em] text-slate-500\">
          {label}
        </p>
        <p className={`font-display text-3xl font-extrabold mt-1 ${tints[tint]}`}>
          {value}
        </p>
      </div>
      <div className={`p-2 rounded-lg bg-slate-800/60 ${tints[tint]}`}>{icon}</div>
    </motion.div>
  );
}
"