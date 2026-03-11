import { Doc, Id } from "../../../convex/_generated/dataModel";
import TaskCard from "./TaskCard";

type EnrichedTask = Doc<"tasks"> & { assignees: (Doc<"agents"> | null)[] };

type ColumnConfig = {
  label: string;
  dotColor: string;
};

const COLUMN_CONFIG: Record<string, ColumnConfig> = {
  inbox:      { label: "Inbox",       dotColor: "bg-gray-400" },
  assigned:   { label: "Assigned",    dotColor: "bg-blue-500" },
  in_progress:{ label: "In Progress", dotColor: "bg-amber-500" },
  review:     { label: "Review",      dotColor: "bg-purple-500" },
  done:       { label: "Done",        dotColor: "bg-status-green" },
};

type Props = {
  status: string;
  tasks: EnrichedTask[];
  onSelectTask: (id: Id<"tasks">) => void;
};

export default function BoardColumn({ status, tasks, onSelectTask }: Props) {
  const config = COLUMN_CONFIG[status] ?? { label: status, dotColor: "bg-gray-400" };

  return (
    <div className="flex flex-col min-w-[240px] max-w-[280px] w-full h-full">
      <div className="flex items-center gap-2 px-1 py-2 shrink-0">
        <span className={`w-2 h-2 rounded-full ${config.dotColor}`} />
        <span className="text-xs font-bold uppercase tracking-widest text-text-primary">
          {config.label}
        </span>
        <span className="text-xs text-text-secondary font-semibold">{tasks.length}</span>
      </div>
      <div className="flex-1 overflow-y-auto space-y-2 pr-1 pb-4">
        {tasks.length === 0 ? (
          <div className="flex items-center justify-center h-24 text-xs text-text-secondary">
            No tasks
          </div>
        ) : (
          tasks.map((task) => (
            <TaskCard key={task._id} task={task} onClick={() => onSelectTask(task._id)} />
          ))
        )}
      </div>
    </div>
  );
}
