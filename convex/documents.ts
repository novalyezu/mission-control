import { v } from "convex/values";
import { query, mutation } from "./_generated/server";

export const listByTask = query({
  args: { taskId: v.id("tasks") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("documents")
      .withIndex("by_task", (q) => q.eq("taskId", args.taskId))
      .order("desc")
      .collect();
  },
});

export const create = mutation({
  args: {
    title: v.string(),
    content: v.string(),
    type: v.union(v.literal("deliverable"), v.literal("research"), v.literal("protocol")),
    taskId: v.id("tasks"),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("documents", args);
  },
});
