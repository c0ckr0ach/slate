import type { User } from "../types";

export default function Avatar({ initials, color = "mint", size = "md", className = "" }: { initials: string; color?: User["color"] | string; size?: "sm" | "md" | "lg"; className?: string }) {
  return <span className={`avatar avatar-${color} avatar-${size} ${className}`}>{initials}</span>;
}
