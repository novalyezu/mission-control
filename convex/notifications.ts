import { v } from "convex/values";
import { query, mutation } from "./_generated/server";

export const listByAgent = query({
  args: { agentId: v.id("agents") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("notifications")
      .withIndex("by_agent", (q) => q.eq("mentionedAgentId", args.agentId))
      .order("desc")
      .collect();
  },
});

export const listUnread = query({
  args: { agentId: v.id("agents") },
  handler: async (ctx, args) => {
    const all = await ctx.db
      .query("notifications")
      .withIndex("by_agent", (q) => q.eq("mentionedAgentId", args.agentId))
      .order("desc")
      .collect();
    return all.filter((n) => !n.delivered);
  },
});

export const send = mutation({
  args: {
    mentionedAgentId: v.id("agents"),
    content: v.string(),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("notifications", {
      mentionedAgentId: args.mentionedAgentId,
      content: args.content,
      delivered: false,
    });
  },
});

export const markDelivered = mutation({
  args: { id: v.id("notifications") },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.id, { delivered: true });
  },
});
