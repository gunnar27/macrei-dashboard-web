// Shared display formatters — keep number/date rendering consistent everywhere.

export function usd0(n: number): string {
  return `${n < 0 ? "-" : ""}$${Math.abs(Math.round(n)).toLocaleString()}`;
}
export function usd(n: number | null | undefined): string {
  return n == null ? "—" : usd0(n);
}
export function usdK(n: number): string {
  return `${n < 0 ? "-" : ""}$${Math.abs(Math.round(n / 1000))}k`;
}
export function pct(n: number): string {
  return `${n.toFixed(1)}%`;
}
export function fmtDate(iso: string | null | undefined): string {
  if (!iso) return "—";
  const d = new Date(`${iso}T00:00:00`);
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" });
}
export function syncedLabel(iso: string | null | undefined): string {
  if (!iso) return "Not yet synced";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "Not yet synced";
  return `Synced ${d.toLocaleString(undefined, {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  })}`;
}
