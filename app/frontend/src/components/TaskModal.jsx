import { AnimatePresence, motion } from "framer-motion";
import { X, Calendar, User, Folder, Flag, Check } from "lucide-react";

const STATUS_OPTIONS = [
  {
    id: "Pending",
    cls: "border-amber-500/30 bg-amber-500/10 text-amber-300 hover:bg-amber-500/20",
    active: "border-amber-400 bg-amber-500/20 text-amber-200 shadow-[0_0_18px_rgba(245,158,11,0.35)]",
  },
  {
    id: "In Progress",
    cls: "border-indigo-500/30 bg-indigo-500/10 text-indigo-300 hover:bg-indigo-500/20",
    active: "border-indigo-400 bg-indigo-500/20 text-indigo-200 shadow-[0_0_18px_rgba(99,102,241,0.35)]",
  },
  {
    id: "Completed",
    cls: "border-emerald-500/30 bg-emerald-500/10 text-emerald-300 hover:bg-emerald-500/20",
    active: "border-emerald-400 bg-emerald-500/20 text-emerald-200 shadow-[0_0_18px_rgba(16,185,129,0.35)]",
  },
];

function formatDate(iso) {
  try {
    return new Date(iso).toLocaleDateString(undefined, {
      weekday: "short",
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  } catch {
    return iso;
  }
}

export default function TaskModal({ task, onClose, onStatusChange }) {
  return (
    <AnimatePresence>
      {task && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="fixed inset-0 z-50 flex items-center justify-center px-4"
          data-testid="task-modal"
        >
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-slate-950/70 backdrop-blur-sm"
            onClick={onClose}
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 8 }}
            transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
            className="relative w-full max-w-lg rounded-2xl border border-white/10 bg-slate-900/90 backdrop-blur-xl shadow-[0_30px_60px_rgba(0,0,0,0.6)]"
          >
            {/* Header */}
            <div className="flex items-start justify-between p-6 pb-4 border-b border-slate-800/80">
              <div className="min-w-0">
                <p className="text-[10px] font-bold uppercase tracking-[0.25em] text-indigo-300/80">
                  {task.project_name}
                </p>
                <h3 className="mt-1 font-display text-xl sm:text-2xl font-extrabold tracking-tight leading-snug">
                  {task.title}
                </h3>
              </div>
              <button
                onClick={onClose}
                data-testid="task-modal-close"
                className="rounded-lg p-1.5 text-slate-400 hover:text-slate-100 hover:bg-slate-800/70 transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Body */}
            <div className="p-6 space-y-5">
              {task.description && (
                <p className="text-sm text-slate-300 leading-relaxed">
                  {task.description}
                </p>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                <MetaRow
                  icon={<User className="h-3.5 w-3.5" />}
                  label="Assignee"
                  value={task.assigned_to}
                />
                <MetaRow
                  icon={<Calendar className="h-3.5 w-3.5" />}
                  label="Due"
                  value={formatDate(task.due_date)}
                />
                <MetaRow
                  icon={<Folder className="h-3.5 w-3.5" />}
                  label="Project"
                  value={task.project_name}
                />
                <MetaRow
                  icon={<Flag className="h-3.5 w-3.5" />}
                  label="Priority"
                  value={task.priority}
                />
              </div>

              <div>
                <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-500 mb-3">
                  Update status
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  {STATUS_OPTIONS.map((opt) => {
                    const isActive = task.status === opt.id;
                    return (
                      <button
                        key={opt.id}
                        onClick={() => onStatusChange(task.id, opt.id)}
                        data-testid={`task-modal-status-${opt.id
                          .toLowerCase()
                          .replace(/\s+/g, "-")}`}
                        className={`flex items-center justify-center gap-2 rounded-lg border px-3 py-2 text-xs font-semibold transition-all ${
                          isActive ? opt.active : opt.cls
                        }`}
                      >
                        {isActive && <Check className="h-3.5 w-3.5" />}
                        {opt.id}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function MetaRow({ icon, label, value }) {
  return (
    <div className="flex items-center gap-3 rounded-lg border border-slate-800/80 bg-slate-950/40 px-3 py-2">
      <span className="text-slate-500">{icon}</span>
      <div className="min-w-0">
        <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-slate-500">
          {label}
        </p>
        <p className="text-slate-200 text-sm font-semibold truncate">{value}</p>
      </div>
    </div>
  );
}