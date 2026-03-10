import { v } from "convex/values";
import { query, mutation } from "./_generated/server";

export const listByTask = query({
  args: { taskId: v.id("tasks") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("messages")
      .withIndex("by_task", (q) => q.eq("taskId", args.taskId))
      .order("asc")
      .collect();
  },
});

export const send = mutation({
  args: {
    taskId: v.id("tasks"),
    fromAgentId: v.id("agents"),
    content: v.string(),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("messages", {
      taskId: args.taskId,
      fromAgentId: args.fromAgentId,
      content: args.content,
      attachments: [],
    });
  },
});
