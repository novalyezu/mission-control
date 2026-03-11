# Task Detail Modal — Implementation Plan

## Overview

Clicking any task card opens a full-detail modal overlay. The modal stays on the same page (no routing). It shows the full task description rendered as Markdown, assignees, messages/comments, and attached documents.

---

## What the Modal Contains

```
┌─────────────────────────────────────────────────────┐
│  ↑ PRIORITY   [STATUS BADGE]              [× Close] │
│  ─────────────────────────────────────────────────  │
│  Task Title (large, bold)                           │
│  Tags: [research] [documentation] ...               │
│                                                     │
│  ┌────────────────────┐  ┌────────────────────────┐ │
│  │  DESCRIPTION       │  │  DETAILS               │ │
│  │  (Markdown render) │  │  Assignees: avatars    │ │
│  │                    │  │  Created: X days ago   │ │
│  │                    │  │  Documents: N files    │ │
│  └────────────────────┘  └────────────────────────┘ │
│                                                     │
│  MESSAGES ─────────────────────────────────────────│
│  [Avatar] Agent Name · timestamp                    │
│    Message content here...                          │
│  [Avatar] Agent Name · timestamp                    │
│    Message content here...                          │
│                                                     │
│  ┌─────────────────────────────────────┐  [Send]   │
│  │ Add a comment...                    │           │
│  └─────────────────────────────────────┘           │
└─────────────────────────────────────────────────────┘
```

---

## Phase 1: Dependencies

### 1.1 Install `react-markdown`

```bash
npm install react-markdown remark-gfm
```

- `react-markdown` — safe Markdown renderer (no `dangerouslySetInnerHTML`)
- `remark-gfm` — GitHub Flavored Markdown (tables, strikethrough, task lists, autolinks)

No other dependencies needed — no UI library, no router.

---

## Phase 2: State Management

### 2.1 Modal state in `App.tsx`

Add a single piece of state: `selectedTaskId: Id<"tasks"> | null`

- `null` → modal closed
- Any task ID → modal open, showing that task

Pass down as props:

- `onSelectTask(id)` → passed into `MissionQueue` → `BoardColumn` → `TaskCard`
- `selectedTaskId` + `onClose` → passed into `TaskDetailModal`

This keeps state at the top level with no extra state library needed.

### 2.2 Prop threading

```
App
├── MissionQueue  (onSelectTask)
│   └── BoardColumn (onSelectTask)
│       └── TaskCard  (onClick → onSelectTask(task._id))
└── TaskDetailModal (taskId, onClose)
```

---

## Phase 3: Backend — New Queries

### 3.1 `convex/tasks.ts` — add `getWithDetails`

A single query that returns everything needed for the modal in one round-trip:

```ts
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

    // Enrich messages with sender info
    const enrichedMessages = await Promise.all(
      messages.map(async (msg) => ({
        ...msg,
        sender: await ctx.db.get(msg.fromAgentId),
      })),
    );

    return {
      ...task,
      assignees: assignees.filter(Boolean),
      messages: enrichedMessages,
      documents,
    };
  },
});
```

### 3.2 `convex/messages.ts` — `send` already exists

No changes needed. The existing `send` mutation is sufficient.

---

## Phase 4: Frontend Components

### 4.1 New files to create

```
src/
└── components/
    ├── board/
    │   └── TaskCard.tsx       ← EDIT: add onClick prop
    └── task/
        ├── TaskDetailModal.tsx   # Outer modal shell (backdrop, close on Esc/click-outside)
        ├── TaskDescription.tsx   # Markdown renderer section
        ├── TaskMessages.tsx      # Message list + send input
        └── TaskDocuments.tsx     # Attached documents list
```

### 4.2 `TaskDetailModal.tsx`

**Responsibilities:**

- Renders a fixed full-screen backdrop (`position: fixed, inset: 0`)
- Centered card: `max-w-3xl w-full max-h-[85vh]` with internal scroll
- Calls `useQuery(api.tasks.getWithDetails, { id: taskId })`
- Loading state: skeleton while query resolves
- Close on: `×` button, `Escape` key (useEffect), backdrop click
- Renders all sub-sections inside a scrollable body

**Layout:**

```tsx
// Backdrop
<div
  className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4"
  onClick={onClose}
>
  // Card (stop propagation so clicks inside don't close)
  <div
    className="bg-bg-card rounded-xl shadow-2xl w-full max-w-3xl max-h-[85vh] flex flex-col"
    onClick={(e) => e.stopPropagation()}
  >
    // Header
    <TaskModalHeader task={task} onClose={onClose} />
    // Scrollable body
    <div className="flex-1 overflow-y-auto p-6 space-y-6">
      <div className="grid grid-cols-[1fr_240px] gap-6">
        <TaskDescription content={task.description} />
        <TaskSidebar task={task} />
      </div>
      <TaskMessages taskId={task._id} messages={task.messages} />
      {task.documents.length > 0 && (
        <TaskDocuments documents={task.documents} />
      )}
    </div>
  </div>
</div>
```

### 4.3 `TaskDescription.tsx`

Renders the `task.description` field as Markdown:

```tsx
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

export default function TaskDescription({ content }: { content: string }) {
  return (
    <div>
      <h3 className="text-xs font-bold uppercase tracking-widest text-text-secondary mb-3">
        Description
      </h3>
      <div className="prose prose-sm max-w-none text-text-primary">
        <ReactMarkdown remarkPlugins={[remarkGfm]}>{content}</ReactMarkdown>
      </div>
    </div>
  );
}
```

**Prose styling:** Use Tailwind's `@tailwindcss/typography` plugin for the `prose` class, or define custom Markdown styles manually (headings, lists, code blocks, blockquotes). Manual is preferred to avoid adding another dependency.

**Custom Markdown styles to define in `index.css`:**

```css
.md-content h1,
.md-content h2,
.md-content h3 {
  font-weight: bold;
  margin-bottom: 0.5rem;
}
.md-content ul {
  list-style: disc;
  padding-left: 1.5rem;
}
.md-content ol {
  list-style: decimal;
  padding-left: 1.5rem;
}
.md-content code {
  background: #f3f4f6;
  padding: 0.1rem 0.3rem;
  border-radius: 3px;
  font-size: 0.85em;
}
.md-content pre {
  background: #f3f4f6;
  padding: 1rem;
  border-radius: 6px;
  overflow-x: auto;
}
.md-content blockquote {
  border-left: 3px solid #e5e7eb;
  padding-left: 1rem;
  color: #6b7280;
}
.md-content a {
  color: #d97706;
  text-decoration: underline;
}
.md-content table {
  width: 100%;
  border-collapse: collapse;
}
.md-content th,
.md-content td {
  border: 1px solid #e5e7eb;
  padding: 0.4rem 0.75rem;
}
```

### 4.4 `TaskMessages.tsx`

**Responsibilities:**

- Displays existing messages with sender avatar, name, timestamp
- Text input + Send button to post a new message
- On send: calls `useMutation(api.messages.send)`, clears input
- For POC: sender is hardcoded to first agent (no auth); can be a dropdown "Send as..."

**Structure:**

```
MESSAGES section header
────────────────────────
[Avatar] Loki · 2 hours ago
  "I've started the outline for this..."

[Avatar] Fury · 1 hour ago
  "Great, I'll pull the customer data..."

────────────────────────
[Avatar] [textarea placeholder "Add a comment..."] [Send]
```

### 4.5 `TaskDocuments.tsx`

Simple list of documents attached to the task:

```
DOCUMENTS section header
────────────────────────
📄 Research Brief — deliverable
📄 Competitor Analysis — research
```

Each row shows: icon by type, title, type badge. Clicking does nothing for POC.

### 4.6 `TaskCard.tsx` edit

Add `onClick` prop:

```tsx
// Before:
<div className="... cursor-default">

// After:
<div className="... cursor-pointer" onClick={onClick}>
```

Props change: `{ task: EnrichedTask; onClick?: () => void }`

---

## Phase 5: Accessibility & UX Details

| Feature                 | Implementation                                                        |
| ----------------------- | --------------------------------------------------------------------- |
| Close on Escape         | `useEffect` with `keydown` listener, removes on cleanup               |
| Close on backdrop click | `onClick={onClose}` on backdrop, `stopPropagation` on card            |
| Scroll lock             | `document.body.style.overflow = "hidden"` when open, restore on close |
| Focus trap              | `autoFocus` on close button; tab cycles within modal                  |
| Loading state           | Skeleton: gray bars for title, description, messages                  |
| Empty messages          | "No messages yet" centered placeholder                                |

---

## Phase 6: `App.tsx` changes

```tsx
// Add state
const [selectedTaskId, setSelectedTaskId] = useState<Id<"tasks"> | null>(null);

// Pass to MissionQueue
<MissionQueue onSelectTask={setSelectedTaskId} />;

// Render modal conditionally
{
  selectedTaskId && (
    <TaskDetailModal
      taskId={selectedTaskId}
      onClose={() => setSelectedTaskId(null)}
    />
  );
}
```

---

## Implementation Order

1. `npm install react-markdown remark-gfm`
2. Edit `App.tsx` — add `selectedTaskId` state, thread props, conditionally render modal
3. Edit `TaskCard.tsx` — add `onClick` prop
4. Edit `BoardColumn.tsx` — pass `onSelectTask` through to `TaskCard`
5. Edit `MissionQueue.tsx` — accept and pass down `onSelectTask`
6. Create `convex/tasks.ts` — add `getWithDetails` query
7. Create `src/components/task/TaskDetailModal.tsx`
8. Create `src/components/task/TaskDescription.tsx`
9. Create `src/components/task/TaskMessages.tsx`
10. Create `src/components/task/TaskDocuments.tsx`
11. Add Markdown styles to `src/index.css`

---

## Out of Scope (still)

- Editing the task title/description inline
- Changing task status from the modal
- Uploading actual document files
- Rich text editor for messages
- @mention support in messages
- Reactions on messages
