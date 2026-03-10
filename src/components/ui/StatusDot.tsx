type Props = {
  status: "active" | "idle" | "blocked" | "online";
  className?: string;
};

const colorMap = {
  active: "bg-status-green",
  online: "bg-status-green",
  idle: "bg-yellow-400",
  blocked: "bg-red-500",
};

export default function StatusDot({ status, className = "" }: Props) {
  return (
    <span
      className={`inline-block w-2 h-2 rounded-full ${colorMap[status]} ${className}`}
    />
  );
}
