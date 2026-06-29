import type { RiskLevel } from "@/data/synthetic-cases";

const riskStyles: Record<RiskLevel, string> = {
  Bajo: "border-emerald-200 bg-emerald-50 text-emerald-800",
  Medio: "border-amber-300 bg-amber-50 text-amber-900",
  Alto: "border-red-200 bg-red-50 text-red-800",
};

export function RiskBadge({ risk }: { risk: RiskLevel }) {
  return (
    <span
      className={`inline-flex rounded-md border px-2.5 py-1 text-xs font-semibold ${riskStyles[risk]}`}
    >
      Riesgo {risk}
    </span>
  );
}
