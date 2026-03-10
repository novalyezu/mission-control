type Props = {
  name: string;
  color?: string;
  size?: "sm" | "md";
};

export default function AgentAvatar({ name, color = "#6B7280", size = "md" }: Props) {
  const dim = size === "sm" ? "w-6 h-6 text-[10px]" : "w-9 h-9 text-sm";
  return (
    <div
      className={`${dim} rounded-full flex items-center justify-center font-bold text-white shrink-0`}
      style={{ backgroundColor: color }}
    >
      {name.charAt(0).toUpperCase()}
    </div>
  );
}
