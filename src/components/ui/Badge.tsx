type Props = {
  type: "lead" | "int" | "spc";
};

const styles = {
  lead: "bg-amber-100 text-amber-700",
  int: "bg-blue-100 text-blue-700",
  spc: "bg-purple-100 text-purple-700",
};

export default function Badge({ type }: Props) {
  return (
    <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded uppercase tracking-wide ${styles[type]}`}>
      {type}
    </span>
  );
}
