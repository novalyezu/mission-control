import { useState, useEffect } from "react";
import { formatClock, formatDate } from "@/lib/utils";

export default function Clock() {
  const [now, setNow] = useState(new Date());

  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(id);
  }, []);

  return (
    <div className="text-right">
      <div className="text-sm font-bold tabular-nums tracking-wide">{formatClock(now)}</div>
      <div className="text-[11px] text-text-secondary">{formatDate(now)}</div>
    </div>
  );
}
