type Props = {
  label: string;
};

export default function Tag({ label }: Props) {
  return (
    <span className="text-[11px] bg-gray-100 text-text-secondary px-2 py-0.5 rounded-full">
      {label}
    </span>
  );
}
