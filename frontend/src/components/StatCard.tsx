import type { ReactNode } from "react";

export default function StatCard({ label, value, note, icon, tone = "mint" }: { label: string; value: string; note: ReactNode; icon: ReactNode; tone?: string }) {
  return <article className="stat-card"><div className={`stat-icon ${tone}`}>{icon}</div><div className="stat-label">{label}</div><div className="stat-value">{value}</div><div className="stat-note">{note}</div></article>;
}
