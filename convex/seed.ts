import { internalMutation, internalAction, mutation } from "./_generated/server";
import { internal } from "./_generated/api";
import { v } from "convex/values";

export const _insertAgent = internalMutation({
  args: {
    name: v.string(),
    role: v.string(),
    status: v.union(v.literal("idle"), v.literal("active"), v.literal("blocked")),
    sessionKey: v.string(),
    badge: v.optional(v.union(v.literal("lead"), v.literal("int"), v.literal("spc"))),
    avatarColor: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("agents", { ...args, currentTaskId: undefined });
  },
});

export const _insertTask = internalMutation({
  args: {
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
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("tasks", args);
  },
});

export const _insertActivity = internalMutation({
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

export const clearAll = mutation({
  args: {},
  handler: async (ctx) => {
    const tables = ["agents", "tasks", "messages", "activities", "documents", "notifications"] as const;
    for (const table of tables) {
      const records = await ctx.db.query(table).collect();
      await Promise.all(records.map((r) => ctx.db.delete(r._id)));
    }
    return { success: true };
  },
});

export const run = internalAction({
  args: {},
  handler: async (ctx) => {
    // Insert agents
    const [bhanu, friday, fury, jarvis, loki, _pepper, quill, shuri] = await Promise.all([
      ctx.runMutation(internal.seed._insertAgent, {
        name: "Bhanu", role: "Founder", status: "active",
        badge: "lead", avatarColor: "#7C3AED", sessionKey: "agent:founder:main",
      }),
      ctx.runMutation(internal.seed._insertAgent, {
        name: "Friday", role: "Developer Agent", status: "active",
        badge: "int", avatarColor: "#0891B2", sessionKey: "agent:developer:main",
      }),
      ctx.runMutation(internal.seed._insertAgent, {
        name: "Fury", role: "Customer Research", status: "active",
        badge: "spc", avatarColor: "#DC2626", sessionKey: "agent:research:main",
      }),
      ctx.runMutation(internal.seed._insertAgent, {
        name: "Jarvis", role: "Squad Lead", status: "active",
        badge: "lead", avatarColor: "#D97706", sessionKey: "agent:squad-lead:main",
      }),
      ctx.runMutation(internal.seed._insertAgent, {
        name: "Loki", role: "Content Writer", status: "active",
        badge: "spc", avatarColor: "#059669", sessionKey: "agent:content:main",
      }),
      ctx.runMutation(internal.seed._insertAgent, {
        name: "Pepper", role: "Email Marketing", status: "active",
        badge: "int", avatarColor: "#DB2777", sessionKey: "agent:email:main",
      }),
      ctx.runMutation(internal.seed._insertAgent, {
        name: "Quill", role: "Social Media", status: "active",
        badge: "int", avatarColor: "#7C3AED", sessionKey: "agent:social:main",
      }),
      ctx.runMutation(internal.seed._insertAgent, {
        name: "Shuri", role: "Product Analyst", status: "active",
        badge: "spc", avatarColor: "#0284C7", sessionKey: "agent:product-analyst:main",
      }),
    ]);

    // Insert tasks
    const [t1, _t2, _t3, t4, t5, _t6, t7, _t8, t9, _t10] = await Promise.all([
      // INBOX
      ctx.runMutation(internal.seed._insertTask, {
        title: "Explore Dashboard & Document All Features",
        description: "Thoroughly explore the entire SiteGPT dashboard, document every feature, setting, and capability found.",
        status: "inbox", assigneeIds: [], priority: "high",
        tags: ["research", "documentation", "sitegpt"],
      }),
      ctx.runMutation(internal.seed._insertTask, {
        title: "Conduct Pricing Audit Using Rob Walling Framework",
        description: "Review SiteGPT pricing against Rob Walling's principle: if no one complains your price is too low.",
        status: "inbox", assigneeIds: [], priority: "medium",
        tags: ["research", "pricing"],
      }),
      ctx.runMutation(internal.seed._insertTask, {
        title: "Design Expansion Revenue Mechanics (SaaS Cheat Code)",
        description: "Implement Rob Walling's SaaS expansion revenue mechanics to increase MRR without new customers.",
        status: "inbox", assigneeIds: [], priority: "high",
        tags: ["strategy", "revenue"],
      }),
      // ASSIGNED
      ctx.runMutation(internal.seed._insertTask, {
        title: "Product Demo Video Script",
        description: "Create full script for SiteGPT product demo video with use cases and value propositions.",
        status: "assigned", assigneeIds: [loki], priority: "high",
        tags: ["video", "content", "demo"],
      }),
      ctx.runMutation(internal.seed._insertTask, {
        title: "Tweet Content - Real Stories Only",
        description: "Create authentic tweets based on real SiteGPT customer data and success stories.",
        status: "assigned", assigneeIds: [quill], priority: "medium",
        tags: ["social", "twitter", "content"],
      }),
      ctx.runMutation(internal.seed._insertTask, {
        title: "Customer Research - Tweet Material",
        description: "Pull real customer data and stories from Slack for tweet content creation.",
        status: "assigned", assigneeIds: [fury], priority: "medium",
        tags: ["research", "data", "social"],
      }),
      // IN PROGRESS
      ctx.runMutation(internal.seed._insertTask, {
        title: "SiteGPT vs Zendesk AI Comparison",
        description: "Create detailed brief for Zendesk AI comparison page highlighting SiteGPT advantages.",
        status: "in_progress", assigneeIds: [shuri], priority: "high",
        tags: ["competitor", "seo", "comparison"],
      }),
      ctx.runMutation(internal.seed._insertTask, {
        title: "SiteGPT vs Intercom Fin Comparison",
        description: "Create detailed brief for Intercom Fin comparison page.",
        status: "in_progress", assigneeIds: [shuri], priority: "high",
        tags: ["competitor", "seo", "comparison"],
      }),
      // REVIEW
      ctx.runMutation(internal.seed._insertTask, {
        title: "Shopify Blog Landing Page",
        description: "Write copy for Shopify integration landing page - how SiteGPT helps Shopify store owners.",
        status: "review", assigneeIds: [loki], priority: "medium",
        tags: ["copy", "landing-page", "shopify"],
      }),
      ctx.runMutation(internal.seed._insertTask, {
        title: "Best AI Chatbot for Shopify - Full Blog Post",
        description: "Write full SEO blog post: Best AI Chatbot for Shopify in 2026. Target high-intent keywords.",
        status: "review", assigneeIds: [loki], priority: "medium",
        tags: ["blog", "seo", "shopify"],
      }),
    ]);

    // Insert activities
    await Promise.all([
      ctx.runMutation(internal.seed._insertActivity, {
        type: "message_sent", agentId: quill, taskId: t5,
        message: "commented on \"Twitter Content Blitz - 10 Tweets This Week\"",
      }),
      ctx.runMutation(internal.seed._insertActivity, {
        type: "message_sent", agentId: quill, taskId: t5,
        message: "commented on \"Twitter Content Blitz - 10 Tweets This Week\"",
      }),
      ctx.runMutation(internal.seed._insertActivity, {
        type: "task_created", agentId: jarvis, taskId: t1,
        message: "created task \"Explore Dashboard & Document All Features\"",
      }),
      ctx.runMutation(internal.seed._insertActivity, {
        type: "task_assigned", agentId: jarvis, taskId: t4,
        message: "assigned \"Product Demo Video Script\" to Loki",
      }),
      ctx.runMutation(internal.seed._insertActivity, {
        type: "status_changed", agentId: shuri, taskId: t7,
        message: "moved \"SiteGPT vs Zendesk\" to In Progress",
      }),
      ctx.runMutation(internal.seed._insertActivity, {
        type: "document_created", agentId: friday, taskId: t1,
        message: "created research doc for dashboard exploration",
      }),
      ctx.runMutation(internal.seed._insertActivity, {
        type: "task_completed", agentId: loki, taskId: t9,
        message: "submitted \"Shopify Blog Landing Page\" for review",
      }),
      ctx.runMutation(internal.seed._insertActivity, {
        type: "decision_made", agentId: bhanu,
        message: "decided to prioritize Shopify SEO content this sprint",
      }),
    ]);

    return { success: true, message: "Seeded 8 agents, 10 tasks, 8 activities" };
  },
});
