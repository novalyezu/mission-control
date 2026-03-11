import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

type Props = {
  content: string;
};

export default function TaskDescription({ content }: Props) {
  return (
    <div>
      <h3 className="text-xs font-bold uppercase tracking-widest text-text-secondary mb-3">
        Description
      </h3>
      <div className="md-content text-sm text-text-primary leading-relaxed">
        <ReactMarkdown remarkPlugins={[remarkGfm]}>{content}</ReactMarkdown>
      </div>
    </div>
  );
}
