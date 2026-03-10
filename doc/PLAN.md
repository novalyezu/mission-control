# Mission Control — Implementation Plan

## Overview

A real-time command center dashboard for managing AI agents and their tasks. Built with React + Convex. Single-page app, no auth (POC).

The UI is a three-panel layout:

```
┌──────────┬──────────────────────────────┬──────────────┐
│  AGENTS  │        MISSION QUEUE         │  LIVE FEED   │
│ sidebar  │     (kanban board)           │   sidebar    │
│          │  Inbox│Assign│InProg│Rev│Done│              │
└──────────┴──────────────────────────────┴──────────────┘
              ↑ Header bar (stats, clock, status)
```

---

## Tech Stack (already set up)

- **Frontend:** React 19 + TypeScript, Vite, Tailwind CSS 4
- **Backend:** Convex (real-time queries, mutations)
- **Path alias:** `@/` → `./src/`

---

## Phase 1: Schema Refinements

The schema in `convex/schema.ts` is mostly ready. A few adjustments needed:

### 1.1 Add missing `notifications` table back

The original spec included it but it's not in the current schema:

```ts
notifications: defineTable({
  mentionedAgentId: v.id("agents"),
  content: v.string(),
  delivered: v.boolean(),
}),
```

### 1.2 Add optional fields & indexes

- `agents.currentTaskId` → make optional (`v.optional(v.id("tasks"))`) since idle agents may not have a task
- `tasks.assigneeIds` → keep as-is (empty array for unassigned)
- `messages.attachments` → keep as-is (empty array for none)
- Add `_creationTime` is auto-provided by Convex — use it for sorting

**Indexes to add for query performance:**

| Table      | Index Name           | Fields                  |
|------------|----------------------|-------------------------|
| tasks      | `by_status`          | `status`                |
| messages   | `by_task`            | `taskId`                |
| activities | `by_agent`           | `agentId`               |
| documents  | `by_task`            | `taskId`                |
| notifications | `by_agent`        | `mentionedAgentId`      |

### 1.3 Add tags to tasks

The design shows tags on task cards (e.g. "research", "documentation", "video", "content"). Add:

```ts
tasks: defineTable({
  // ...existing fields
  tags: v.optional(v.array(v.string())),
})
```

### 1.4 Add agent badge type

The design shows badges like "LEAD", "INT", "SPC" next to agent names:

```ts
agents: defineTable({
  // ...existing fields
  badge: v.optional(v.union(v.literal("lead"), v.literal("int"), v.literal("spc"))),
  avatarColor: v.optional(v.string()), // hex color for avatar circle
})
```

---

## Phase 2: Convex Backend Functions

Create backend query and mutation functions under `convex/`.

### 2.1 `convex/agents.ts`

| Function          | Type     | Description                          |
|-------------------|----------|--------------------------------------|
| `list`            | query    | Return all agents, sorted by name    |
| `getById`         | query    | Return single agent by ID            |
| `updateStatus`    | mutation | Set agent status (idle/active/blocked)|

### 2.2 `convex/tasks.ts`

| Function          | Type     | Description                                  |
|-------------------|----------|----------------------------------------------|
| `list`            | query    | Return all tasks (optionally filter by status)|
| `listByStatus`    | query    | Return tasks grouped/filtered by status column|
| `getById`         | query    | Return single task with assignee details     |
| `create`          | mutation | Create a new task (status defaults to "inbox")|
| `updateStatus`    | mutation | Move a task to a new status column           |
| `assign`          | mutation | Add/remove agent assignees                   |

### 2.3 `convex/messages.ts`

| Function          | Type     | Description                            |
|-------------------|----------|----------------------------------------|
| `listByTask`      | query    | Return messages for a task, sorted by time |
| `send`            | mutation | Create a message on a task             |

### 2.4 `convex/activities.ts`

| Function          | Type     | Description                                |
|-------------------|----------|-------------------------------------------|
| `list`            | query    | Return recent activities (paginated, last N)|
| `listByAgent`     | query    | Filter activities by agent                 |
| `log`             | mutation | Record a new activity entry                |

### 2.5 `convex/documents.ts`

| Function          | Type     | Description                            |
|-------------------|----------|----------------------------------------|
| `listByTask`      | query    | Return documents attached to a task    |
| `create`          | mutation | Create a new document                  |

### 2.6 `convex/stats.ts`

| Function          | Type     | Description                                     |
|-------------------|----------|-------------------------------------------------|
| `dashboard`       | query    | Return aggregate counts: active agents, total tasks in queue, tasks per status |

### 2.7 Seed data script

Create `convex/seed.ts` — an action that populates the database with sample agents, tasks, messages, and activities matching the design mockup. This is critical for development and demo purposes.

---

## Phase 3: Frontend — Component Architecture

### 3.1 Directory structure

```
src/
├── main.tsx                     # ConvexProvider + render App
├── App.tsx                      # Top-level layout (3-panel)
├── components/
│   ├── layout/
│   │   └── Header.tsx           # Top bar: logo, stats, clock, online badge
│   ├── agents/
│   │   ├── AgentSidebar.tsx     # Left panel: agent list
│   │   ├── AgentCard.tsx        # Single agent row (avatar, name, badge, role, status)
│   │   └── AgentAvatar.tsx      # Colored circle with icon/initial
│   ├── board/
│   │   ├── MissionQueue.tsx     # Kanban board container
│   │   ├── BoardColumn.tsx      # Single status column (header + card list)
│   │   └── TaskCard.tsx         # Task card (title, desc, assignee, time, tags)
│   ├── feed/
│   │   ├── LiveFeed.tsx         # Right panel container
│   │   ├── FeedFilters.tsx      # Tab filters (All/Tasks/Comments/Decisions/Docs/Status)
│   │   ├── AgentFilterBar.tsx   # Agent pill/chip filter bar
│   │   └── FeedItem.tsx         # Single activity/comment entry
│   └── ui/
│       ├── Badge.tsx            # Reusable badge (LEAD, INT, SPC)
│       ├── StatusDot.tsx        # Green/yellow/red dot indicator
│       ├── Tag.tsx              # Task tag pill
│       └── Clock.tsx            # Live clock display
└── lib/
    └── utils.ts                 # Helpers: time formatting, etc.
```

### 3.2 Component details

#### Header (`Header.tsx`)
- Left: Logo icon + "MISSION CONTROL" text + project name badge ("SiteGPT")
- Center: Two stat cards — "{N} AGENTS ACTIVE" and "{N} TASKS IN QUEUE"
- Right: Docs button, live clock (HH:MM:SS + day/date), green ONLINE indicator
- Data: `useQuery(api.stats.dashboard)`

#### Agent Sidebar (`AgentSidebar.tsx`)
- Header: "AGENTS" + green dot + count badge
- Scrollable list of `AgentCard` components
- Data: `useQuery(api.agents.list)`

#### Agent Card (`AgentCard.tsx`)
- Colored avatar circle (left)
- Name + badge (LEAD/INT/SPC) on first line
- Role text on second line
- Green "WORKING" status indicator (right)

#### Mission Queue (`MissionQueue.tsx`)
- Header: "MISSION QUEUE" + green dot + filter/view controls
- 5 columns: INBOX, ASSIGNED, IN PROGRESS, REVIEW, DONE
- Each column shows count in header
- Horizontally scrollable if needed
- Data: `useQuery(api.tasks.list)` → group client-side by `status`

#### Board Column (`BoardColumn.tsx`)
- Column header: dot + status label + count
- Vertical scrollable list of `TaskCard`

#### Task Card (`TaskCard.tsx`)
- Priority indicator (colored arrow/icon, top-left)
- Title (bold)
- Description (truncated, 2-3 lines)
- Footer: assignee avatar + name, relative timestamp
- Bottom: tag pills
- Click → opens task detail (future, not in POC scope)

#### Live Feed (`LiveFeed.tsx`)
- Header: "LIVE FEED" + green dot
- `FeedFilters`: tab row — All, Tasks, Comments, Decisions, Docs, Status (with counts)
- `AgentFilterBar`: "All Agents" pill + individual agent pills with counts
- Scrollable list of `FeedItem` components
- Data: `useQuery(api.activities.list)`

#### Feed Item (`FeedItem.tsx`)
- Colored diamond/dot icon (left)
- Agent name + action description
- Relative timestamp
- Click chevron (→) to navigate to referenced task

---

## Phase 4: Styling & Design System

### 4.1 Color palette (from mockup)

| Token             | Value       | Usage                          |
|-------------------|-------------|--------------------------------|
| `--bg-page`       | `#FAF9F6`   | Page background (warm off-white)|
| `--bg-card`       | `#FFFFFF`   | Card backgrounds               |
| `--bg-sidebar`    | `#FFFFFF`   | Sidebar backgrounds            |
| `--text-primary`  | `#1A1A1A`   | Headings, primary text         |
| `--text-secondary`| `#6B7280`   | Descriptions, timestamps       |
| `--accent`        | `#D97706`   | Orange accent (dots, highlights)|
| `--accent-light`  | `#FEF3C7`   | Light amber (tag backgrounds)  |
| `--status-green`  | `#22C55E`   | Online/working indicators      |
| `--border`        | `#E5E7EB`   | Card borders, dividers         |

### 4.2 Typography

- Header/logo: Bold, uppercase, tracking-wide (monospace feel)
- Stats numbers: Large, bold
- Card titles: Semi-bold, text-sm
- Body text: Regular, text-xs to text-sm, secondary color
- Tags: text-xs, rounded pill, muted background

### 4.3 Layout approach

- Use CSS Grid for the 3-panel layout: `grid-cols-[280px_1fr_360px]`
- Header is fixed/sticky at top
- Each panel scrolls independently (`overflow-y-auto`)
- Cards use Tailwind's `rounded-lg shadow-sm border`
- Responsive: at small screens, collapse to single-column (stretch goal, not POC)

---

## Phase 5: Implementation Order

### Step 1 — Schema + Backend (estimated: 1 session)
1. Update `convex/schema.ts` with refinements from Phase 1
2. Create all Convex function files from Phase 2
3. Create and run seed data script
4. Verify data in Convex dashboard

### Step 2 — Layout Shell (estimated: 1 session)
1. Set up Tailwind theme tokens (colors, fonts)
2. Build `App.tsx` with 3-panel grid layout
3. Build `Header.tsx` with static content first, then wire to stats query
4. Confirm layout renders correctly

### Step 3 — Agent Sidebar (estimated: 1 session)
1. Build `AgentSidebar.tsx`, `AgentCard.tsx`, `AgentAvatar.tsx`
2. Wire to `useQuery(api.agents.list)`
3. Style to match mockup

### Step 4 — Mission Queue / Kanban Board (estimated: 1-2 sessions)
1. Build `MissionQueue.tsx`, `BoardColumn.tsx`, `TaskCard.tsx`
2. Wire to `useQuery(api.tasks.list)`, group by status
3. Style columns and cards to match mockup
4. Add tag pills and assignee display on cards

### Step 5 — Live Feed (estimated: 1 session)
1. Build `LiveFeed.tsx`, `FeedFilters.tsx`, `AgentFilterBar.tsx`, `FeedItem.tsx`
2. Wire to `useQuery(api.activities.list)`
3. Implement client-side filtering by type and agent
4. Style to match mockup

### Step 6 — Polish (estimated: 1 session)
1. Live clock component
2. Relative timestamps ("about 2 hours ago", "1 day ago")
3. Smooth scrolling in all panels
4. Empty states for columns with 0 items
5. Loading states / skeletons

---

## Out of Scope (for POC)

- Authentication / authorization
- Drag-and-drop task reordering between columns
- Task detail modal/page
- Agent detail page
- Real-time presence / WebSocket indicators (Convex handles reactivity automatically)
- Mobile/responsive layout
- Dark mode
- Search functionality
- Keyboard shortcuts
- Document viewer
- Notification system (bell icon, toasts)

---

## Key Decisions

1. **No routing library** — single page, no navigation needed for POC
2. **No UI component library** — Tailwind utilities only, keeps bundle small and gives full design control
3. **Client-side grouping** — fetch all tasks once, group by status in React (simpler than 5 separate queries; Convex re-runs reactively anyway)
4. **Seed script** — essential for development; populate with agents/tasks matching the mockup
5. **Convex reactivity** — all `useQuery` hooks auto-update in real-time; no manual polling or WebSocket setup needed
