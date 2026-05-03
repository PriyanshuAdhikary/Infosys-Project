import { useMemo } from "react";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import { motion } from "framer-motion";
import TaskCard from "@/components/TaskCard";
import { Clock, Sparkles, CircleCheckBig } from "lucide-react";

const COLUMNS = [
  {
    id: "Pending",
    title: "Pending",
    icon: Clock,
    accent: "text-amber-300",
    dot: "bg-amber-400",
  },
  {
    id: "In Progress",
    title: "In Progress",
    icon: Sparkles,
    accent: "text-indigo-300",
    dot: "bg-indigo-400",
  },
  {
    id: "Completed",
    title: "Completed",
    icon: CircleCheckBig,
    accent: "text-emerald-300",
    dot: "bg-emerald-400",
  },
];

export default function KanbanBoard({ tasks, onStatusChange, onTaskClick }) {
  const grouped = useMemo(() => {
    const map = { Pending: [], "In Progress": [], Completed: [] };
    tasks.forEach((t) => {
      if (map[t.status]) map[t.status].push(t);
    });
    return map;
  }, [tasks]);

  const handleDragEnd = (result) => {
    const { destination, source, draggableId } = result;
    if (!destination) return;
    if (
      destination.droppableId === source.droppableId &&
      destination.index === source.index
    ) {
      return;
    }
    const newStatus = destination.droppableId;
    onStatusChange(draggableId, newStatus);
  };

  return (
    <DragDropContext onDragEnd={handleDragEnd}>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {COLUMNS.map((col, colIdx) => {
          const Icon = col.icon;
          const columnTasks = grouped[col.id] || [];
          return (
            <motion.div
              key={col.id}
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.45, delay: 0.05 * colIdx }}
              className="flex flex-col"
              data-testid={`kanban-column-${col.id.toLowerCase().replace(/\s+/g, "-")}`}
            >
              <div className="flex items-center justify-between px-2 mb-3">
                <div className="flex items-center gap-2">
                  <span className={`h-2 w-2 rounded-full ${col.dot}`} />
                  <Icon className={`h-4 w-4 ${col.accent}`} />
                  <h4 className={`font-display font-bold tracking-tight ${col.accent}`}>
                    {col.title}
                  </h4>
                  <span className="font-mono text-xs text-slate-500">
                    {columnTasks.length.toString().padStart(2, "0")}
                  </span>
                </div>
              </div>

              <Droppable droppableId={col.id}>
                {(provided, snapshot) => (
                  <div
                    ref={provided.innerRef}
                    {...provided.droppableProps}
                    className={`flex-1 min-h-[420px] rounded-2xl border p-3 transition-colors ${
                      snapshot.isDraggingOver
                        ? "border-indigo-500/40 bg-indigo-500/5"
                        : "border-slate-800/70 bg-slate-900/30"
                    }`}
                  >
                    <motion.div
                      initial="hidden"
                      animate="show"
                      variants={{
                        hidden: { opacity: 0 },
                        show: {
                          opacity: 1,
                          transition: { staggerChildren: 0.06 },
                        },
                      }}
                      className="space-y-3"
                    >
                      {columnTasks.map((task, index) => (
                        <Draggable
                          key={task.id}
                          draggableId={task.id}
                          index={index}
                        >
                          {(dragProvided, dragSnapshot) => (
                            <motion.div
                              ref={dragProvided.innerRef}
                              {...dragProvided.draggableProps}
                              {...dragProvided.dragHandleProps}
                              variants={{
                                hidden: { opacity: 0, y: 16 },
                                show: { opacity: 1, y: 0 },
                              }}
                              style={dragProvided.draggableProps.style}
                              className={dragSnapshot.isDragging ? "rotate-[1deg]" : ""}
                            >
                              <TaskCard
                                task={task}
                                isDragging={dragSnapshot.isDragging}
                                onClick={() => onTaskClick(task)}
                              />
                            </motion.div>
                          )}
                        </Draggable>
                      ))}
                      {provided.placeholder}

                      {columnTasks.length === 0 && !snapshot.isDraggingOver && (
                        <div className="text-center py-10 text-xs font-mono text-slate-600">
                          Drop tasks here
                        </div>
                      )}
                    </motion.div>
                  </div>
                )}
              </Droppable>
            </motion.div>
          );
        })}
      </div>
    </DragDropContext>
  );
}