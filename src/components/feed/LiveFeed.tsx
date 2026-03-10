import { useState, useMemo } from "react";
import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { Doc, Id } from "../../../convex/_generated/dataModel";
import FeedItem from "./FeedItem";
import FeedFilters from "./FeedFilters";
import AgentFilterBar from "./AgentFilterBar";
import StatusDot from "@/components/ui/StatusDot";

type FilterTab = "all" | "tasks" | "comments" | "decisions" | "docs" | "status";

const TAB_TYPES: Record<FilterTab, string[]> = {
  all:       [],
  tasks:     ["task_created", "task_assigned", "task_completed"],
  comments:  ["message_sent"],
  decisions: ["decision_made"],
  docs:      ["document_created"],
  status:    ["status_changed"],
};

export default function LiveFeed() {
  const activities = useQuery(api.activities.list, { limit: 50 });
  const agents = useQuery(api.agents.list);

  const [activeTab, setActiveTab] = useState<FilterTab>("all");
  const [selectedAgentId, setSelectedAgentId] = useState<Id<"agents"> | null>(null);

  const agentMap = useMemo(() => {
    if (!agents) return new Map<Id<"agents">, Doc<"agents">>();
    return new Map(agents.map((a) => [a._id, a]));
  }, [agents]);

  const enrichedActivities = useMemo(() => {
    if (!activities) return [];
    return activities.map((a) => ({ ...a, agent: agentMap.get(a.agentId) ?? null }));
  }, [activities, agentMap]);

  const filtered = useMemo(() => {
    let list = enrichedActivities;
    const types = TAB_TYPES[activeTab];
    if (types.length > 0) list = list.filter((a) => types.includes(a.type));
    if (selectedAgentId) list = list.filter((a) => a.agentId === selectedAgentId);
    return list;
  }, [enrichedActivities, activeTab, selectedAgentId]);

  const tabCounts = useMemo(() => {
    const counts: Record<FilterTab, number> = {
      all: enrichedActivities.length,
      tasks: 0, comments: 0, decisions: 0, docs: 0, status: 0,
    };
    for (const a of enrichedActivities) {
      if (["task_created","task_assigned","task_completed"].includes(a.type)) counts.tasks++;
      else if (a.type === "message_sent") counts.comments++;
      else if (a.type === "decision_made") counts.decisions++;
      else if (a.type === "document_created") counts.docs++;
      else if (a.type === "status_changed") counts.status++;
    }
    return counts;
  }, [enrichedActivities]);

  const agentActivityCounts = useMemo(() => {
    const map = new Map<Id<"agents">, number>();
    for (const a of enrichedActivities) {
      map.set(a.agentId, (map.get(a.agentId) ?? 0) + 1);
    }
    return map;
  }, [enrichedActivities]);

  return (
    <aside className="h-full flex flex-col bg-bg-card overflow-hidden">
      <div className="flex items-center gap-2 px-4 py-3 border-b border-border shrink-0">
        <StatusDot status="active" />
        <span className="text-xs font-bold uppercase tracking-widest text-text-primary">Live Feed</span>
      </div>
      <FeedFilters active={activeTab} onChange={setActiveTab} counts={tabCounts} />
      {agents && agents.length > 0 && (
        <AgentFilterBar
          agents={agents}
          activityCounts={agentActivityCounts}
          selectedId={selectedAgentId}
          onSelect={setSelectedAgentId}
        />
      )}
      <div className="flex-1 overflow-y-auto">
        {!activities ? (
          <div className="space-y-px p-2">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="flex gap-2.5 px-2 py-2.5 animate-pulse">
                <div className="w-3 h-3 rounded-full bg-gray-200 mt-0.5 shrink-0" />
                <div className="flex-1 space-y-1.5">
                  <div className="h-3 bg-gray-200 rounded w-full" />
                  <div className="h-2.5 bg-gray-100 rounded w-1/3" />
                </div>
              </div>
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex items-center justify-center h-32 text-xs text-text-secondary">
            No activity
          </div>
        ) : (
          <ul className="divide-y divide-border">
            {filtered.map((activity) => (
              <li key={activity._id}>
                <FeedItem activity={activity} />
              </li>
            ))}
          </ul>
        )}
      </div>
    </aside>
  );
}
