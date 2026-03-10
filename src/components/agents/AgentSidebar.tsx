import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import AgentCard from "./AgentCard";
import StatusDot from "@/components/ui/StatusDot";

export default function AgentSidebar() {
  const agents = useQuery(api.agents.list);

  return (
    <aside className="h-full flex flex-col border-r border-border bg-bg-card overflow-hidden">
      <div className="flex items-center gap-2 px-4 py-3 border-b border-border shrink-0">
        <StatusDot status="active" />
        <span className="text-xs font-bold uppercase tracking-widest text-text-primary">Agents</span>
        {agents && (
          <span className="ml-auto text-xs font-semibold bg-gray-100 text-text-secondary px-1.5 py-0.5 rounded">
            {agents.length}
          </span>
        )}
      </div>
      <div className="flex-1 overflow-y-auto">
        {!agents ? (
          <div className="space-y-1 p-2">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="flex items-center gap-3 px-2 py-2.5 animate-pulse">
                <div className="w-9 h-9 rounded-full bg-gray-200 shrink-0" />
                <div className="flex-1 space-y-1.5">
                  <div className="h-3 bg-gray-200 rounded w-2/3" />
                  <div className="h-2.5 bg-gray-100 rounded w-1/2" />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <ul>
            {agents.map((agent) => (
              <li key={agent._id}>
                <AgentCard agent={agent} />
              </li>
            ))}
          </ul>
        )}
      </div>
    </aside>
  );
}
