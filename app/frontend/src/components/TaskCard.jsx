"import { Calendar, Flag, GripVertical } from \"lucide-react\";

const STATUS_STYLES = {
  Pending: \"bg-amber-500/10 text-amber-300 border-amber-500/25\",
  \"In Progress\": \"bg-indigo-500/10 text-indigo-300 border-indigo-500/25\",
  Completed: \"bg-emerald-500/10 text-emerald-300 border-emerald-500/25\",
};

const PRIORITY_STYLES = {
  Low: \"text-slate-400\",
  Medium: \"text-amber-400\",
  High: \"text-rose-400\",
};

function formatDate(iso) {
  try {
    const d = new Date(iso);
    return d.toLocaleDateString(undefined, {
      month: \"short\",
      day: \"numeric\",
    });
  } catch {
    return iso;
  }
}

function isOverdue(iso, status) {
  if (status === \"Completed\") return false;
  const d = new Date(iso);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return d < today;
}

function initials(name = \"\") {
  return name
    .split(\" \")
    .filter(Boolean)
    .slice(0, 2)
    .map((s) => s[0]?.toUpperCase())
    .join(\"\");
}

export default function TaskCard({ task, isDragging, onClick }) {
  const overdue = isOverdue(task.due_date, task.status);

  return (
    <div
      onClick={onClick}
      data-testid={`task-card-${task.id}`}
      className={`group relative rounded-xl border backdrop-blur-sm p-4 cursor-pointer transition-all select-none
        ${
          isDragging
            ? \"border-indigo-400/60 bg-slate-800/80 shadow-[0_20px_50px_rgba(0,0,0,0.5)]\"
            : \"border-slate-800 bg-slate-900/60 hover:-translate-y-0.5 hover:border-indigo-500/40 hover:shadow-[0_12px_30px_rgba(99,102,241,0.15)]\"
        }`}
    >
      {/* Top row: project badge + drag handle */}
      <div className=\"flex items-center justify-between mb-3\">
        <span className=\"text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400 truncate max-w-[70%]\">
          {task.project_name}
        </span>
        <GripVertical className=\"h-4 w-4 text-slate-600 group-hover:text-slate-400 transition-colors\" />
      </div>

      {/* Title */}
      <h4 className=\"font-display font-bold text-slate-50 leading-snug line-clamp-2\">
        {task.title}
      </h4>

      {task.description && (
        <p className=\"mt-1 text-xs text-slate-400 line-clamp-2\">
          {task.description}
        </p>
      )}

      {/* Middle row: status + priority */}
      <div className=\"mt-3 flex items-center gap-2 flex-wrap\">
        <span
          className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[11px] font-semibold ${
            STATUS_STYLES[task.status]
          }`}
          data-testid={`task-status-badge-${task.id}`}
        >
          {task.status}
        </span>
        <span
          className={`inline-flex items-center gap-1 text-[11px] font-semibold ${
            PRIORITY_STYLES[task.priority] || \"text-slate-400\"
          }`}
        >
          <Flag className=\"h-3 w-3\" />
          {task.priority}
        </span>
      </div>

      {/* Bottom row: assignee + due date */}
      <div className=\"mt-4 flex items-center justify-between pt-3 border-t border-slate-800/80\">
        <div className=\"flex items-center gap-2 min-w-0\">
          {task.assignee_avatar ? (
            <img
              src={task.assignee_avatar}
              alt={task.assigned_to}
              className=\"h-7 w-7 rounded-full object-cover border border-slate-700\"
            />
          ) : (
            <div className=\"h-7 w-7 rounded-full bg-gradient-to-br from-indigo-500 to-emerald-500 flex items-center justify-center text-[10px] font-bold text-slate-900\">
              {initials(task.assigned_to)}
            </div>
          )}
          <span className=\"text-xs text-slate-300 truncate\">
            {task.assigned_to}
          </span>
        </div>
        <span
          className={`inline-flex items-center gap-1 text-[11px] font-mono ${
            overdue ? \"text-rose-400\" : \"text-slate-400\"
          }`}
        >
          <Calendar className=\"h-3 w-3\" />
          {formatDate(task.due_date)}
        </span>
      </div>
    </div>
  );
}
"