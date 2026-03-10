import Header from "@/components/layout/Header";
import AgentSidebar from "@/components/agents/AgentSidebar";
import MissionQueue from "@/components/board/MissionQueue";
import LiveFeed from "@/components/feed/LiveFeed";

export default function App() {
  return (
    <div className="h-screen flex flex-col bg-bg-page overflow-hidden">
      <Header />
      <div className="flex-1 grid grid-cols-[280px_1fr_360px] overflow-hidden">
        <AgentSidebar />
        <MissionQueue />
        <LiveFeed />
      </div>
    </div>
  );
}
