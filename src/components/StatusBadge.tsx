import { caseStatusLabels, type CaseStatus } from "@/data/synthetic-cases";

const statusStyles: Record<CaseStatus, string> = {
  pending: "border-slate-300 bg-slate-50 text-slate-700",
  analyzing: "border-sky-200 bg-sky-50 text-sky-800",
  human_review: "border-amber-300 bg-amber-50 text-amber-900",
  approved: "border-emerald-200 bg-emerald-50 text-emerald-800",
  rejected: "border-red-200 bg-red-50 text-red-800",
  escalated: "border-purple-200 bg-purple-50 text-purple-800",
  completed: "border-emerald-200 bg-emerald-50 text-emerald-800",
};

export function StatusBadge({ status }: { status: CaseStatus }) {
  return (
    <span
      className={`inline-flex rounded-md border px-2.5 py-1 text-xs font-semibold ${statusStyles[status]}`}
    >
      {caseStatusLabels[status]}
    </span>
  );
}
