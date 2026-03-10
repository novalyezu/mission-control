import { Doc, Id } from "../../../convex/_generated/dataModel";
import AgentAvatar from "@/components/agents/AgentAvatar";
import Tag from "@/components/ui/Tag";
import { timeAgo } from "@/lib/utils";

type EnrichedTask = Doc<"tasks"> & {
  assignees: (Doc<"agents"> | null)[];
};

type Props = {
  task: EnrichedTask;
};

function PriorityIcon({ priority }: { priority?: string }) {
  if (priority === "high")
    return <span className="text-red-500 text-xs font-bold">↑</span>;
  if (priority === "medium")
    return <span className="text-yellow-500 text-xs font-bold">→</span>;
  if (priority === "low")
    return <span className="text-gray-400 text-xs font-bold">↓</span>;
  return null;
}

export default function TaskCard({ task }: Props) {
  const firstAssignee = task.assignees.find(Boolean) as Doc<"agents"> | undefined;

  return (
    <div className="bg-bg-card border border-border rounded-lg p-3 shadow-sm hover:shadow-md transition-shadow cursor-default">
      <div className="flex items-start gap-1.5 mb-1">
        <PriorityIcon priority={task.priority} />
        <h3 className="text-sm font-semibold text-text-primary leading-snug flex-1">{task.title}</h3>
      </div>
      <p className="text-xs text-text-secondary leading-relaxed mb-3 line-clamp-2">
        {task.description}
      </p>
      {firstAssignee && (
        <div className="flex items-center gap-1.5 mb-2">
          <AgentAvatar name={firstAssignee.name} color={firstAssignee.avatarColor} size="sm" />
          <span className="text-xs text-text-secondary">{firstAssignee.name}</span>
          <span className="text-xs text-text-secondary ml-auto">{timeAgo(task._creationTime)}</span>
        </div>
      )}
      {!firstAssignee && (
        <div className="text-xs text-text-secondary mb-2">{timeAgo(task._creationTime)}</div>
      )}
      {task.tags && task.tags.length > 0 && (
        <div className="flex flex-wrap gap-1">
          {task.tags.map((tag) => (
            <Tag key={tag} label={tag} />
          ))}
        </div>
      )}
    </div>
  );
}
