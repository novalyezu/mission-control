import { useState } from "react";
import { useMutation, useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { Doc, Id } from "../../../convex/_generated/dataModel";
import AgentAvatar from "@/components/agents/AgentAvatar";
import { timeAgo } from "@/lib/utils";

type EnrichedMessage = Doc<"messages"> & { sender: Doc<"agents"> | null };

type Props = {
  taskId: Id<"tasks">;
  messages: EnrichedMessage[];
};

export default function TaskMessages({ taskId, messages }: Props) {
  const [content, setContent] = useState("");
  const [sendingAs, setSendingAs] = useState<Id<"agents"> | "">("");
  const agents = useQuery(api.agents.list);
  const sendMessage = useMutation(api.messages.send);

  async function handleSend() {
    if (!content.trim() || !sendingAs) return;
    await sendMessage({ taskId, fromAgentId: sendingAs as Id<"agents">, content: content.trim() });
    setContent("");
  }

  return (
    <div>
      <h3 className="text-xs font-bold uppercase tracking-widest text-text-secondary mb-3">
        Messages
      </h3>

      {messages.length === 0 ? (
        <p className="text-xs text-text-secondary text-center py-6">No messages yet</p>
      ) : (
        <ul className="space-y-4 mb-4">
          {messages.map((msg) => (
            <li key={msg._id} className="flex gap-2.5">
              <AgentAvatar
                name={msg.sender?.name ?? "?"}
                color={msg.sender?.avatarColor}
                size="sm"
              />
              <div className="flex-1 min-w-0">
                <div className="flex items-baseline gap-2 mb-0.5">
                  <span className="text-xs font-semibold text-text-primary">{msg.sender?.name ?? "Unknown"}</span>
                  <span className="text-[11px] text-text-secondary">{timeAgo(msg._creationTime)}</span>
                </div>
                <p className="text-sm text-text-primary leading-relaxed">{msg.content}</p>
              </div>
            </li>
          ))}
        </ul>
      )}

      <div className="flex gap-2 pt-3 border-t border-border">
        <div className="flex-1 flex gap-2">
          <select
            value={sendingAs}
            onChange={(e) => setSendingAs(e.target.value as Id<"agents">)}
            className="text-xs border border-border rounded px-2 py-1.5 bg-bg-card text-text-secondary shrink-0"
          >
            <option value="">As...</option>
            {agents?.map((a) => (
              <option key={a._id} value={a._id}>{a.name}</option>
            ))}
          </select>
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); void handleSend(); } }}
            placeholder="Add a comment..."
            rows={2}
            className="flex-1 text-sm border border-border rounded px-3 py-2 resize-none bg-bg-card text-text-primary placeholder:text-text-secondary focus:outline-none focus:ring-1 focus:ring-accent"
          />
        </div>
        <button
          onClick={() => void handleSend()}
          disabled={!content.trim() || !sendingAs}
          className="self-end text-xs font-semibold bg-accent text-white px-3 py-2 rounded hover:bg-amber-600 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
        >
          Send
        </button>
      </div>
    </div>
  );
}
