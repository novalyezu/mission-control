type FilterTab = "all" | "tasks" | "comments" | "decisions" | "docs" | "status";

type Props = {
  active: FilterTab;
  onChange: (tab: FilterTab) => void;
  counts: Record<FilterTab, number>;
};

const TABS: { key: FilterTab; label: string }[] = [
  { key: "all",       label: "All" },
  { key: "tasks",     label: "Tasks" },
  { key: "comments",  label: "Comments" },
  { key: "decisions", label: "Decisions" },
  { key: "docs",      label: "Docs" },
  { key: "status",    label: "Status" },
];

export default function FeedFilters({ active, onChange, counts }: Props) {
  return (
    <div className="flex items-center gap-0.5 px-4 py-2 border-b border-border overflow-x-auto">
      {TABS.map(({ key, label }) => (
        <button
          key={key}
          onClick={() => onChange(key)}
          className={`flex items-center gap-1 text-xs px-2.5 py-1 rounded whitespace-nowrap transition-colors ${
            active === key
              ? "bg-accent-light text-accent font-semibold"
              : "text-text-secondary hover:text-text-primary hover:bg-gray-50"
          }`}
        >
          {label}
          {counts[key] > 0 && (
            <span className={`text-[10px] font-bold ${active === key ? "text-accent" : "text-text-secondary"}`}>
              {counts[key]}
            </span>
          )}
        </button>
      ))}
    </div>
  );
}
