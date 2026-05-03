"import { useState } from \"react\";
import { motion } from \"framer-motion\";
import { Plus, FolderPlus, ListPlus, Calendar as CalendarIcon } from \"lucide-react\";
import { apiCreateProject, apiCreateTask } from \"@/lib/api\";
import { toast } from \"sonner\";

export default function AdminPanel({ projects, onProjectCreated, onTaskCreated }) {
  const [projectName, setProjectName] = useState(\"\");
  const [projectColor, setProjectColor] = useState(\"indigo\");
  const [creatingProject, setCreatingProject] = useState(false);

  const [taskTitle, setTaskTitle] = useState(\"\");
  const [taskDescription, setTaskDescription] = useState(\"\");
  const [taskProjectId, setTaskProjectId] = useState(\"\");
  const [taskAssignee, setTaskAssignee] = useState(\"\");
  const [taskDueDate, setTaskDueDate] = useState(\"\");
  const [taskPriority, setTaskPriority] = useState(\"Medium\");
  const [creatingTask, setCreatingTask] = useState(false);

  const handleCreateProject = async (e) => {
    e.preventDefault();
    if (!projectName.trim()) {
      toast.error(\"Project name is required\");
      return;
    }
    setCreatingProject(true);
    try {
      const p = await apiCreateProject({
        name: projectName.trim(),
        color: projectColor,
      });
      onProjectCreated(p);
      setProjectName(\"\");
      toast.success(`Project \"${p.name}\" created`);
    } catch (e) {
      toast.error(\"Failed to create project\");
    } finally {
      setCreatingProject(false);
    }
  };

  const handleCreateTask = async (e) => {
    e.preventDefault();
    if (!taskTitle.trim() || !taskProjectId || !taskAssignee.trim() || !taskDueDate) {
      toast.error(\"Fill all required task fields\");
      return;
    }
    setCreatingTask(true);
    try {
      const t = await apiCreateTask({
        title: taskTitle.trim(),
        description: taskDescription.trim(),
        project_id: taskProjectId,
        assigned_to: taskAssignee.trim(),
        due_date: taskDueDate,
        priority: taskPriority,
      });
      onTaskCreated(t);
      setTaskTitle(\"\");
      setTaskDescription(\"\");
      setTaskAssignee(\"\");
      setTaskDueDate(\"\");
      toast.success(`Task \"${t.title}\" assigned`);
    } catch (e) {
      toast.error(\"Failed to create task\");
    } finally {
      setCreatingTask(false);
    }
  };

  const colors = [
    { id: \"indigo\", cls: \"bg-indigo-500\" },
    { id: \"emerald\", cls: \"bg-emerald-500\" },
    { id: \"amber\", cls: \"bg-amber-500\" },
    { id: \"rose\", cls: \"bg-rose-500\" },
    { id: \"violet\", cls: \"bg-violet-500\" },
  ];

  return (
    <motion.section
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.1 }}
      className=\"rounded-2xl border border-white/10 bg-slate-900/50 backdrop-blur-xl p-6 sm:p-8\"
      data-testid=\"admin-panel\"
    >
      <div className=\"flex items-center gap-2 mb-6\">
        <div className=\"h-8 w-8 rounded-lg bg-indigo-500/15 border border-indigo-500/30 flex items-center justify-center\">
          <Plus className=\"h-4 w-4 text-indigo-300\" />
        </div>
        <div>
          <h3 className=\"font-display text-lg font-bold tracking-tight\">
            Admin controls
          </h3>
          <p className=\"text-xs text-slate-500\">
            Spin up new projects and assign work.
          </p>
        </div>
      </div>

      <div className=\"grid lg:grid-cols-2 gap-6\">
        {/* Create Project */}
        <form
          onSubmit={handleCreateProject}
          className=\"rounded-xl border border-slate-800/80 bg-slate-950/40 p-5 space-y-4\"
          data-testid=\"create-project-form\"
        >
          <div className=\"flex items-center gap-2 text-slate-200\">
            <FolderPlus className=\"h-4 w-4 text-indigo-400\" />
            <h4 className=\"font-semibold\">Create new project</h4>
          </div>
          <div>
            <label className=\"text-[10px] font-bold uppercase tracking-[0.2em] text-slate-500\">
              Name
            </label>
            <input
              type=\"text\"
              value={projectName}
              onChange={(e) => setProjectName(e.target.value)}
              placeholder=\"e.g. Phoenix Launch\"
              data-testid=\"new-project-name-input\"
              className=\"mt-2 w-full bg-slate-950/60 border border-slate-800 rounded-lg px-3 py-2.5 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500/50 transition-all\"
            />
          </div>
          <div>
            <label className=\"text-[10px] font-bold uppercase tracking-[0.2em] text-slate-500\">
              Accent
            </label>
            <div className=\"mt-2 flex items-center gap-2\">
              {colors.map((c) => (
                <button
                  type=\"button\"
                  key={c.id}
                  onClick={() => setProjectColor(c.id)}
                  data-testid={`project-color-${c.id}`}
                  className={`h-7 w-7 rounded-full ${c.cls} transition-all ${
                    projectColor === c.id
                      ? \"ring-2 ring-white/80 scale-110\"
                      : \"opacity-60 hover:opacity-100\"
                  }`}
                />
              ))}
            </div>
          </div>
          <button
            type=\"submit\"
            disabled={creatingProject}
            data-testid=\"create-project-submit\"
            className=\"w-full inline-flex items-center justify-center gap-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 disabled:opacity-60 text-white font-semibold py-2.5 px-4 transition-all text-sm shadow-[0_6px_20px_rgba(99,102,241,0.3)]\"
          >
            <Plus className=\"h-4 w-4\" />
            {creatingProject ? \"Creating…\" : \"Create project\"}
          </button>
        </form>

        {/* Create Task */}
        <form
          onSubmit={handleCreateTask}
          className=\"rounded-xl border border-slate-800/80 bg-slate-950/40 p-5 space-y-4\"
          data-testid=\"create-task-form\"
        >
          <div className=\"flex items-center gap-2 text-slate-200\">
            <ListPlus className=\"h-4 w-4 text-emerald-400\" />
            <h4 className=\"font-semibold\">Assign new task</h4>
          </div>

          <div className=\"grid grid-cols-1 sm:grid-cols-2 gap-3\">
            <div className=\"sm:col-span-2\">
              <label className=\"text-[10px] font-bold uppercase tracking-[0.2em] text-slate-500\">
                Title
              </label>
              <input
                type=\"text\"
                value={taskTitle}
                onChange={(e) => setTaskTitle(e.target.value)}
                placeholder=\"e.g. Build settings page\"
                data-testid=\"new-task-title-input\"
                className=\"mt-2 w-full bg-slate-950/60 border border-slate-800 rounded-lg px-3 py-2.5 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500/50 transition-all\"
              />
            </div>

            <div>
              <label className=\"text-[10px] font-bold uppercase tracking-[0.2em] text-slate-500\">
                Project
              </label>
              <select
                value={taskProjectId}
                onChange={(e) => setTaskProjectId(e.target.value)}
                data-testid=\"new-task-project-select\"
                className=\"mt-2 w-full bg-slate-950/60 border border-slate-800 rounded-lg px-3 py-2.5 text-sm text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500/50 transition-all\"
              >
                <option value=\"\">Select project</option>
                {projects.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className=\"text-[10px] font-bold uppercase tracking-[0.2em] text-slate-500\">
                Assignee
              </label>
              <input
                type=\"text\"
                value={taskAssignee}
                onChange={(e) => setTaskAssignee(e.target.value)}
                placeholder=\"e.g. Maya Chen\"
                data-testid=\"new-task-assignee-input\"
                className=\"mt-2 w-full bg-slate-950/60 border border-slate-800 rounded-lg px-3 py-2.5 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500/50 transition-all\"
              />
            </div>

            <div>
              <label className=\"text-[10px] font-bold uppercase tracking-[0.2em] text-slate-500\">
                Due date
              </label>
              <div className=\"mt-2 relative\">
                <CalendarIcon className=\"absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500 pointer-events-none\" />
                <input
                  type=\"date\"
                  value={taskDueDate}
                  onChange={(e) => setTaskDueDate(e.target.value)}
                  data-testid=\"new-task-due-date-input\"
                  className=\"w-full bg-slate-950/60 border border-slate-800 rounded-lg pl-10 pr-3 py-2.5 text-sm text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500/50 transition-all [color-scheme:dark]\"
                />
              </div>
            </div>

            <div>
              <label className=\"text-[10px] font-bold uppercase tracking-[0.2em] text-slate-500\">
                Priority
              </label>
              <select
                value={taskPriority}
                onChange={(e) => setTaskPriority(e.target.value)}
                data-testid=\"new-task-priority-select\"
                className=\"mt-2 w-full bg-slate-950/60 border border-slate-800 rounded-lg px-3 py-2.5 text-sm text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500/50 transition-all\"
              >
                <option>Low</option>
                <option>Medium</option>
                <option>High</option>
              </select>
            </div>

            <div className=\"sm:col-span-2\">
              <label className=\"text-[10px] font-bold uppercase tracking-[0.2em] text-slate-500\">
                Description (optional)
              </label>
              <textarea
                value={taskDescription}
                onChange={(e) => setTaskDescription(e.target.value)}
                rows={2}
                placeholder=\"Quick context for the assignee…\"
                data-testid=\"new-task-description-input\"
                className=\"mt-2 w-full bg-slate-950/60 border border-slate-800 rounded-lg px-3 py-2.5 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500/50 transition-all resize-none\"
              />
            </div>
          </div>

          <button
            type=\"submit\"
            disabled={creatingTask}
            data-testid=\"create-task-submit\"
            className=\"w-full inline-flex items-center justify-center gap-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 disabled:opacity-60 text-white font-semibold py-2.5 px-4 transition-all text-sm shadow-[0_6px_20px_rgba(16,185,129,0.3)]\"
          >
            <Plus className=\"h-4 w-4\" />
            {creatingTask ? \"Assigning…\" : \"Assign task\"}
          </button>
        </form>
      </div>
    </motion.section>
  );
}
"