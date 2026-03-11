import { useMemo } from "react";
import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { Doc, Id } from "../../../convex/_generated/dataModel";
import BoardColumn from "./BoardColumn";
import StatusDot from "@/components/ui/StatusDot";

const STATUSES = ["inbox", "assigned", "in_progress", "review", "done"] as const;

type Props = {
  onSelectTask: (id: Id<"tasks">) => void;
};

export default function MissionQueue({ onSelectTask }: Props) {
  const tasks = useQuery(api.tasks.list);
  const agents = useQuery(api.agents.list);

  const agentMap = useMemo(() => {
    if (!agents) return new Map<Id<"agents">, Doc<"agents">>();
    return new Map(agents.map((a) => [a._id, a]));
  }, [agents]);

  const tasksByStatus = useMemo(() => {
    if (!tasks) return null;
    const grouped: Record<string, (Doc<"tasks"> & { assignees: (Doc<"agents"> | null)[] })[]> = {
      inbox: [], assigned: [], in_progress: [], review: [], done: [],
    };
    for (const task of tasks) {
      const enriched = {
        ...task,
        assignees: task.assigneeIds.map((id) => agentMap.get(id) ?? null),
      };
      grouped[task.status]?.push(enriched);
    }
    return grouped;
  }, [tasks, agentMap]);

  const totalTasks = tasks?.length ?? 0;

  return (
    <main className="h-full flex flex-col border-r border-border overflow-hidden">
      <div className="flex items-center gap-2 px-4 py-3 border-b border-border shrink-0">
        <StatusDot status="active" />
        <span className="text-xs font-bold uppercase tracking-widest text-text-primary">
          Mission Queue
        </span>
        <span className="ml-auto text-xs text-text-secondary">
          {totalTasks} active
        </span>
      </div>
      <div className="flex-1 overflow-x-auto overflow-y-hidden">
        <div className="flex gap-4 h-full px-4 pt-3">
          {!tasksByStatus ? (
            Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="min-w-[240px] animate-pulse">
                <div className="h-5 bg-gray-200 rounded w-24 mb-3" />
                <div className="space-y-2">
                  {Array.from({ length: 3 }).map((_, j) => (
                    <div key={j} className="h-24 bg-gray-100 rounded-lg" />
                  ))}
                </div>
              </div>
            ))
          ) : (
            STATUSES.map((status) => (
              <BoardColumn key={status} status={status} tasks={tasksByStatus[status] ?? []} onSelectTask={onSelectTask} />
            ))
          )}
        </div>
      </div>
    </main>
  );
}
