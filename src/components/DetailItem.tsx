export default function DetailItem({
  label,
  text,
  wide,
}: {
  label: string;
  text: string;
  wide?: boolean;
}) {
  return (
    <div className={`detail-item ${wide ? "wide" : ""}`}>
      <span>{label}</span>
      <strong>{text || "—"}</strong>
    </div>
  );
}
