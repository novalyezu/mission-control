import { query } from "./_generated/server";

export const dashboard = query({
  args: {},
  handler: async (ctx) => {
    const [agents, tasks] = await Promise.all([
      ctx.db.query("agents").collect(),
      ctx.db.query("tasks").collect(),
    ]);

    const activeAgents = agents.filter((a) => a.status === "active").length;
    const tasksByStatus = {
      inbox: tasks.filter((t) => t.status === "inbox").length,
      assigned: tasks.filter((t) => t.status === "assigned").length,
      in_progress: tasks.filter((t) => t.status === "in_progress").length,
      review: tasks.filter((t) => t.status === "review").length,
      done: tasks.filter((t) => t.status === "done").length,
    };
    const totalInQueue = tasks.filter((t) => t.status !== "done").length;

    return {
      activeAgents,
      totalAgents: agents.length,
      totalInQueue,
      tasksByStatus,
    };
  },
});
