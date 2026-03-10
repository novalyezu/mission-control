import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import Clock from "@/components/ui/Clock";
import StatusDot from "@/components/ui/StatusDot";

export default function Header() {
  const stats = useQuery(api.stats.dashboard);

  return (
    <header className="flex items-center gap-6 px-5 py-3 border-b border-border bg-bg-card shrink-0 z-10">
      {/* Logo */}
      <div className="flex items-center gap-2.5 shrink-0">
        <div className="w-6 h-6 grid grid-cols-3 gap-0.5">
          {Array.from({ length: 9 }).map((_, i) => (
            <div key={i} className="w-1.5 h-1.5 rounded-sm bg-accent" />
          ))}
        </div>
        <span className="text-sm font-bold uppercase tracking-widest text-text-primary">
          Mission Control
        </span>
        <span className="text-xs font-semibold bg-accent-light text-accent px-2 py-0.5 rounded">
          Upstack Digital
        </span>
      </div>

      {/* Stats */}
      <div className="flex items-center gap-6 flex-1 justify-center">
        <div className="text-center">
          <div className="text-2xl font-bold tabular-nums leading-none">
            {stats?.activeAgents ?? "—"}
          </div>
          <div className="text-[10px] uppercase tracking-widest text-text-secondary mt-0.5">
            Agents Active
          </div>
        </div>
        <div className="w-px h-8 bg-border" />
        <div className="text-center">
          <div className="text-2xl font-bold tabular-nums leading-none">
            {stats?.totalInQueue ?? "—"}
          </div>
          <div className="text-[10px] uppercase tracking-widest text-text-secondary mt-0.5">
            Tasks in Queue
          </div>
        </div>
      </div>

      {/* Right side */}
      <div className="flex items-center gap-4 shrink-0">
        <Clock />
        <div className="flex items-center gap-1.5">
          <StatusDot status="online" />
          <span className="text-xs font-bold text-status-green uppercase tracking-wide">Online</span>
        </div>
      </div>
    </header>
  );
}
