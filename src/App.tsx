import { useState } from "react";
import { Id } from "../convex/_generated/dataModel";
import Header from "@/components/layout/Header";
import AgentSidebar from "@/components/agents/AgentSidebar";
import MissionQueue from "@/components/board/MissionQueue";
import LiveFeed from "@/components/feed/LiveFeed";
import TaskDetailModal from "@/components/task/TaskDetailModal";

export default function App() {
  const [selectedTaskId, setSelectedTaskId] = useState<Id<"tasks"> | null>(null);

  return (
    <div className="h-screen flex flex-col bg-bg-page overflow-hidden">
      <Header />
      <div className="flex-1 grid grid-cols-[280px_1fr_360px] overflow-hidden">
        <AgentSidebar />
        <MissionQueue onSelectTask={setSelectedTaskId} />
        <LiveFeed />
      </div>
      {selectedTaskId && (
        <TaskDetailModal
          taskId={selectedTaskId}
          onClose={() => setSelectedTaskId(null)}
        />
      )}
    </div>
  );
}
