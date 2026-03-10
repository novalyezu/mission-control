import { v } from "convex/values";
import { query, mutation } from "./_generated/server";

export const list = query({
  args: { limit: v.optional(v.number()) },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("activities")
      .order("desc")
      .take(args.limit ?? 50);
  },
});

export const listByAgent = query({
  args: { agentId: v.id("agents") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("activities")
      .withIndex("by_agent", (q) => q.eq("agentId", args.agentId))
      .order("desc")
      .take(50);
  },
});

export const log = mutation({
  args: {
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
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("activities", args);
  },
});
