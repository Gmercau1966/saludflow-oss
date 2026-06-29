import type { CaseStatus } from "@/data/synthetic-cases";

const statusStyles: Record<CaseStatus, string> = {
  Pendiente: "border-slate-300 bg-slate-50 text-slate-700",
  Procesando: "border-sky-200 bg-sky-50 text-sky-800",
  "Revisión humana": "border-amber-300 bg-amber-50 text-amber-900",
  Completado: "border-emerald-200 bg-emerald-50 text-emerald-800",
};

export function StatusBadge({ status }: { status: CaseStatus }) {
  return (
    <span
      className={`inline-flex rounded-md border px-2.5 py-1 text-xs font-semibold ${statusStyles[status]}`}
    >
      {status}
    </span>
  );
}
