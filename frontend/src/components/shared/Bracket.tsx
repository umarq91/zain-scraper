export function Bracket({
  pos,
  color = "#0A0A0A",
  size = 24,
}: {
  pos: "tl" | "tr" | "bl" | "br";
  color?: string;
  size?: number;
}) {
  const t = { tl: "", tr: "scaleX(-1)", bl: "scaleY(-1)", br: "scale(-1,-1)" }[pos];
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 40 40"
      aria-hidden="true"
      style={{ display: "block", transform: t }}
    >
      <path d="M2 16 L2 2 L16 2" fill="none" stroke={color} strokeWidth="2.5" />
    </svg>
  );
}
