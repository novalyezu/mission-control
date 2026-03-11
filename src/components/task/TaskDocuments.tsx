import { Doc } from "../../../convex/_generated/dataModel";

type Props = {
  documents: Doc<"documents">[];
};

const typeIcon: Record<Doc<"documents">["type"], string> = {
  deliverable: "📄",
  research: "🔍",
  protocol: "📋",
};

export default function TaskDocuments({ documents }: Props) {
  if (documents.length === 0) return null;

  return (
    <div>
      <h3 className="text-xs font-bold uppercase tracking-widest text-text-secondary mb-3">
        Documents
      </h3>
      <ul className="space-y-1.5">
        {documents.map((doc) => (
          <li key={doc._id} className="flex items-center gap-2.5 p-2.5 rounded-lg border border-border hover:bg-gray-50">
            <span>{typeIcon[doc.type]}</span>
            <span className="text-sm text-text-primary flex-1 truncate">{doc.title}</span>
            <span className="text-[11px] bg-gray-100 text-text-secondary px-2 py-0.5 rounded-full capitalize shrink-0">
              {doc.type}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
