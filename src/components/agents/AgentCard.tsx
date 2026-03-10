import { Doc } from "../../../convex/_generated/dataModel";
import AgentAvatar from "./AgentAvatar";
import Badge from "@/components/ui/Badge";
import StatusDot from "@/components/ui/StatusDot";

type Props = {
  agent: Doc<"agents">;
};

export default function AgentCard({ agent }: Props) {
  return (
    <div className="flex items-center gap-3 px-4 py-2.5 hover:bg-gray-50 cursor-default">
      <AgentAvatar name={agent.name} color={agent.avatarColor} />
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1.5">
          <span className="text-sm font-semibold text-text-primary truncate">{agent.name}</span>
          {agent.badge && <Badge type={agent.badge} />}
        </div>
        <div className="text-xs text-text-secondary truncate">{agent.role}</div>
      </div>
      {agent.status === "active" && (
        <div className="flex items-center gap-1 shrink-0">
          <StatusDot status="active" />
          <span className="text-[10px] font-semibold text-status-green uppercase tracking-wide">
            Working
          </span>
        </div>
      )}
      {agent.status === "idle" && (
        <div className="flex items-center gap-1 shrink-0">
          <StatusDot status="idle" />
          <span className="text-[10px] font-semibold text-yellow-500 uppercase tracking-wide">
            Idle
          </span>
        </div>
      )}
      {agent.status === "blocked" && (
        <div className="flex items-center gap-1 shrink-0">
          <StatusDot status="blocked" />
          <span className="text-[10px] font-semibold text-red-500 uppercase tracking-wide">
            Blocked
          </span>
        </div>
      )}
    </div>
  );
}
