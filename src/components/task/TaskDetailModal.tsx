import { useEffect } from "react";
import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { Id } from "../../../convex/_generated/dataModel";
import AgentAvatar from "@/components/agents/AgentAvatar";
import Badge from "@/components/ui/Badge";
import Tag from "@/components/ui/Tag";
import TaskDescription from "./TaskDescription";
import TaskMessages from "./TaskMessages";
import TaskDocuments from "./TaskDocuments";

type Props = {
  taskId: Id<"tasks">;
  onClose: () => void;
};

const STATUS_STYLES: Record<string, string> = {
  inbox:       "bg-gray-100 text-gray-600",
  assigned:    "bg-blue-100 text-blue-700",
  in_progress: "bg-amber-100 text-amber-700",
  review:      "bg-purple-100 text-purple-700",
  done:        "bg-green-100 text-green-700",
};

const STATUS_LABELS: Record<string, string> = {
  inbox: "Inbox", assigned: "Assigned", in_progress: "In Progress", review: "Review", done: "Done",
};

const PRIORITY_ICON: Record<string, string> = {
  high: "↑", medium: "→", low: "↓",
};

const PRIORITY_COLOR: Record<string, string> = {
  high: "text-red-500", medium: "text-yellow-500", low: "text-gray-400",
};

export default function TaskDetailModal({ taskId, onClose }: Props) {
  const task = useQuery(api.tasks.getWithDetails, { id: taskId });

  // Close on Escape
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  // Scroll lock
  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = ""; };
  }, []);

  return (
    <div
      className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        className="bg-bg-card rounded-xl shadow-2xl w-full max-w-3xl max-h-[85vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-start gap-3 px-6 pt-5 pb-4 border-b border-border shrink-0">
          <div className="flex-1 min-w-0">
            {task ? (
              <>
                <div className="flex items-center gap-2 mb-2 flex-wrap">
                  {task.priority && (
                    <span className={`text-sm font-bold ${PRIORITY_COLOR[task.priority]}`}>
                      {PRIORITY_ICON[task.priority]}
                    </span>
                  )}
                  <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${STATUS_STYLES[task.status]}`}>
                    {STATUS_LABELS[task.status]}
                  </span>
                  {task.tags?.map((tag) => <Tag key={tag} label={tag} />)}
                </div>
                <h2 className="text-lg font-bold text-text-primary leading-snug">{task.title}</h2>
              </>
            ) : (
              <div className="space-y-2 animate-pulse">
                <div className="h-4 bg-gray-200 rounded w-24" />
                <div className="h-6 bg-gray-200 rounded w-3/4" />
              </div>
            )}
          </div>
          <button
            autoFocus
            onClick={onClose}
            className="text-text-secondary hover:text-text-primary text-xl leading-none shrink-0 mt-0.5"
          >
            ×
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {!task ? (
            <div className="space-y-4 animate-pulse">
              <div className="h-4 bg-gray-200 rounded w-full" />
              <div className="h-4 bg-gray-200 rounded w-5/6" />
              <div className="h-4 bg-gray-200 rounded w-4/6" />
            </div>
          ) : (
            <>
              <div className="grid grid-cols-[1fr_220px] gap-6">
                <TaskDescription content={task.description} />

                {/* Sidebar */}
                <div className="space-y-4">
                  <div>
                    <h3 className="text-xs font-bold uppercase tracking-widest text-text-secondary mb-2">
                      Assignees
                    </h3>
                    {task.assignees.length === 0 ? (
                      <p className="text-xs text-text-secondary">Unassigned</p>
                    ) : (
                      <div className="space-y-1.5">
                        {task.assignees.map((agent) =>
                          agent ? (
                            <div key={agent._id} className="flex items-center gap-2">
                              <AgentAvatar name={agent.name} color={agent.avatarColor} size="sm" />
                              <span className="text-xs text-text-primary">{agent.name}</span>
                              {agent.badge && <Badge type={agent.badge} />}
                            </div>
                          ) : null
                        )}
                      </div>
                    )}
                  </div>

                  <div>
                    <h3 className="text-xs font-bold uppercase tracking-widest text-text-secondary mb-1">
                      Created
                    </h3>
                    <p className="text-xs text-text-secondary">
                      {new Date(task._creationTime).toLocaleDateString("en-US", {
                        month: "short", day: "numeric", year: "numeric",
                      })}
                    </p>
                  </div>

                  {task.documents.length > 0 && (
                    <div>
                      <h3 className="text-xs font-bold uppercase tracking-widest text-text-secondary mb-1">
                        Documents
                      </h3>
                      <p className="text-xs text-text-secondary">{task.documents.length} attached</p>
                    </div>
                  )}
                </div>
              </div>

              <div className="border-t border-border pt-6">
                <TaskMessages taskId={task._id} messages={task.messages} />
              </div>

              {task.documents.length > 0 && (
                <div className="border-t border-border pt-6">
                  <TaskDocuments documents={task.documents} />
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
