# Mission Control

A real-time command center dashboard for managing AI agents and their tasks. Built with React + Convex. Single-page app, no auth (POC).

## Tech Stack

- **Frontend:** React 19 + TypeScript, Vite, Tailwind CSS 4
- **Backend:** [Convex](https://convex.dev/) (real-time database, server functions)

## UI Layout

```
┌──────────┬──────────────────────────────┬──────────────┐
│  AGENTS  │        MISSION QUEUE         │  LIVE FEED   │
│ sidebar  │     (kanban board)           │   sidebar    │
│          │  Inbox│Assign│InProg│Rev│Done│              │
└──────────┴──────────────────────────────┴──────────────┘
              ↑ Header bar (stats, clock, status)
```

- **Left** — Agent roster with status indicators
- **Center** — Kanban board with 5 columns: Inbox → Assigned → In Progress → Review → Done
- **Right** — Live activity feed with filters by type and agent
- **Modal** — Click any task card to open a detail view with Markdown description, messages, and documents

## Get Started

```
npm install
npm run dev
```

This starts both the Convex backend and Vite frontend in parallel.

Once running, seed the database with sample data:

```
npx convex run seed:run
```

This populates 8 agents, 10 tasks across all statuses, and 8 activities.

## Project Structure

```
convex/          # Backend — schema, queries, mutations, seed
src/
├── App.tsx
├── components/
│   ├── agents/  # AgentSidebar, AgentCard, AgentAvatar
│   ├── board/   # MissionQueue, BoardColumn, TaskCard
│   ├── feed/    # LiveFeed, FeedFilters, AgentFilterBar, FeedItem
│   ├── task/    # TaskDetailModal, TaskDescription, TaskMessages, TaskDocuments
│   ├── layout/  # Header
│   └── ui/      # Badge, StatusDot, Tag, Clock
└── lib/
    └── utils.ts # timeAgo, formatClock, formatDate
doc/             # Implementation plans
```
