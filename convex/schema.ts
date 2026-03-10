import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  agents: defineTable({
    name: v.string(),
    role: v.string(),
    status: v.union(v.literal("idle"), v.literal("active"), v.literal("blocked")),
    currentTaskId: v.optional(v.id("tasks")),
    sessionKey: v.string(),
    badge: v.optional(v.union(v.literal("lead"), v.literal("int"), v.literal("spc"))),
    avatarColor: v.optional(v.string()),
  }),
  tasks: defineTable({
    title: v.string(),
    description: v.string(),
    status: v.union(
      v.literal("inbox"),
      v.literal("assigned"),
      v.literal("in_progress"),
      v.literal("review"),
      v.literal("done")
    ),
    assigneeIds: v.array(v.id("agents")),
    priority: v.optional(v.union(v.literal("high"), v.literal("medium"), v.literal("low"))),
    tags: v.optional(v.array(v.string())),
  }).index("by_status", ["status"]),
  messages: defineTable({
    taskId: v.id("tasks"),
    fromAgentId: v.id("agents"),
    content: v.string(),
    attachments: v.array(v.id("documents")),
  }).index("by_task", ["taskId"]),
  activities: defineTable({
    type: v.union(
      v.literal("task_created"),
      v.literal("task_assigned"),
      v.literal("task_completed"),
      v.literal("message_sent"),
      v.literal("document_created"),
      v.literal("status_changed"),
      v.literal("decision_made")
    ),
    agentId: v.id("agents"),
    taskId: v.optional(v.id("tasks")),
    message: v.string(),
  }).index("by_agent", ["agentId"]),
  documents: defineTable({
    title: v.string(),
    content: v.string(),
    type: v.union(v.literal("deliverable"), v.literal("research"), v.literal("protocol")),
    taskId: v.id("tasks"),
  }).index("by_task", ["taskId"]),
  notifications: defineTable({
    mentionedAgentId: v.id("agents"),
    content: v.string(),
    delivered: v.boolean(),
  }).index("by_agent", ["mentionedAgentId"]),
});
