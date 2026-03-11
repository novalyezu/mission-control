import { v } from "convex/values";
import { query, mutation } from "./_generated/server";

export const list = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("tasks").order("desc").collect();
  },
});

export const listByStatus = query({
  args: {
    status: v.union(
      v.literal("inbox"),
      v.literal("assigned"),
      v.literal("in_progress"),
      v.literal("review"),
      v.literal("done")
    ),
  },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("tasks")
      .withIndex("by_status", (q) => q.eq("status", args.status))
      .order("desc")
      .collect();
  },
});

export const getById = query({
  args: { id: v.id("tasks") },
  handler: async (ctx, args) => {
    const task = await ctx.db.get(args.id);
    if (!task) return null;
    const assignees = await Promise.all(task.assigneeIds.map((id) => ctx.db.get(id)));
    return { ...task, assignees: assignees.filter(Boolean) };
  },
});

export const create = mutation({
  args: {
    title: v.string(),
    description: v.string(),
    priority: v.optional(v.union(v.literal("high"), v.literal("medium"), v.literal("low"))),
    tags: v.optional(v.array(v.string())),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("tasks", {
      title: args.title,
      description: args.description,
      status: "inbox",
      assigneeIds: [],
      priority: args.priority,
      tags: args.tags,
    });
  },
});

export const updateStatus = mutation({
  args: {
    id: v.id("tasks"),
    status: v.union(
      v.literal("inbox"),
      v.literal("assigned"),
      v.literal("in_progress"),
      v.literal("review"),
      v.literal("done")
    ),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.id, { status: args.status });
  },
});

export const getWithDetails = query({
  args: { id: v.id("tasks") },
  handler: async (ctx, args) => {
    const task = await ctx.db.get(args.id);
    if (!task) return null;

    const [assignees, messages, documents] = await Promise.all([
      Promise.all(task.assigneeIds.map((id) => ctx.db.get(id))),
      ctx.db
        .query("messages")
        .withIndex("by_task", (q) => q.eq("taskId", args.id))
        .order("asc")
        .collect(),
      ctx.db
        .query("documents")
        .withIndex("by_task", (q) => q.eq("taskId", args.id))
        .order("desc")
        .collect(),
    ]);

    const enrichedMessages = await Promise.all(
      messages.map(async (msg) => ({
        ...msg,
        sender: await ctx.db.get(msg.fromAgentId),
      }))
    );

    return {
      ...task,
      assignees: assignees.filter(Boolean),
      messages: enrichedMessages,
      documents,
    };
  },
});

export const assign = mutation({
  args: {
    taskId: v.id("tasks"),
    agentIds: v.array(v.id("agents")),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.taskId, { assigneeIds: args.agentIds });
  },
});
