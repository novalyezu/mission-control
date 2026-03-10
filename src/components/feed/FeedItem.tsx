import { Doc } from "../../../convex/_generated/dataModel";
import { timeAgo } from "@/lib/utils";

type ActivityType = Doc<"activities">["type"];

type Props = {
  activity: Doc<"activities"> & { agent: Doc<"agents"> | null };
};

const typeColor: Record<ActivityType, string> = {
  task_created:    "text-blue-500",
  task_assigned:   "text-cyan-500",
  task_completed:  "text-status-green",
  message_sent:    "text-gray-400",
  document_created:"text-purple-500",
  status_changed:  "text-amber-500",
  decision_made:   "text-green-600",
};

export default function FeedItem({ activity }: Props) {
  const color = typeColor[activity.type] ?? "text-gray-400";

  return (
    <div className="flex items-start gap-2.5 px-4 py-2.5 hover:bg-gray-50">
      <span className={`mt-0.5 text-base leading-none ${color}`}>◆</span>
      <div className="flex-1 min-w-0">
        <p className="text-xs text-text-primary leading-snug">
          <span className="font-semibold">{activity.agent?.name ?? "Agent"}</span>{" "}
          {activity.message}
        </p>
        <p className="text-[11px] text-text-secondary mt-0.5">{timeAgo(activity._creationTime)}</p>
      </div>
      {activity.taskId && (
        <span className="text-text-secondary text-xs shrink-0">→</span>
      )}
    </div>
  );
}
