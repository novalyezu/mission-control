import { Doc, Id } from "../../../convex/_generated/dataModel";
import AgentAvatar from "@/components/agents/AgentAvatar";

type Props = {
  agents: Doc<"agents">[];
  activityCounts: Map<Id<"agents">, number>;
  selectedId: Id<"agents"> | null;
  onSelect: (id: Id<"agents"> | null) => void;
};

export default function AgentFilterBar({ agents, activityCounts, selectedId, onSelect }: Props) {
  return (
    <div className="flex items-center gap-1.5 px-4 py-2 border-b border-border overflow-x-auto">
      <button
        onClick={() => onSelect(null)}
        className={`text-xs px-2.5 py-1 rounded whitespace-nowrap transition-colors ${
          selectedId === null
            ? "bg-accent text-white font-semibold"
            : "bg-gray-100 text-text-secondary hover:bg-gray-200"
        }`}
      >
        All Agents
      </button>
      {agents.map((agent) => {
        const count = activityCounts.get(agent._id) ?? 0;
        if (count === 0) return null;
        return (
          <button
            key={agent._id}
            onClick={() => onSelect(agent._id)}
            className={`flex items-center gap-1 text-xs px-2 py-1 rounded whitespace-nowrap transition-colors ${
              selectedId === agent._id
                ? "bg-accent text-white font-semibold"
                : "bg-gray-100 text-text-secondary hover:bg-gray-200"
            }`}
          >
            <AgentAvatar name={agent.name} color={agent.avatarColor} size="sm" />
            <span>{agent.name}</span>
            <span className="font-bold">{count}</span>
          </button>
        );
      })}
    </div>
  );
}
