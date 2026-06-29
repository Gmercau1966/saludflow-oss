import type { SyntheticCase } from "@/data/synthetic-cases";
import { RiskBadge } from "@/components/RiskBadge";
import { StatusBadge } from "@/components/StatusBadge";
import { SyntheticDataBadge } from "@/components/SyntheticDataBadge";

const dateFormatter = new Intl.DateTimeFormat("es-ES", {
  day: "2-digit",
  month: "short",
  year: "numeric",
  hour: "2-digit",
  minute: "2-digit",
});

export function CaseCard({ caseItem }: { caseItem: SyntheticCase }) {
  return (
    <article className="rounded-lg border border-border bg-surface p-5 shadow-sm">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="font-mono text-xs font-semibold text-slate-500">
            {caseItem.id}
          </p>
          <h3 className="mt-2 text-lg font-semibold text-slate-950">
            {caseItem.subject}
          </h3>
        </div>
        <SyntheticDataBadge />
      </div>

      <dl className="mt-5 grid gap-4 text-sm sm:grid-cols-2">
        <div>
          <dt className="text-slate-500">Categoría</dt>
          <dd className="mt-1 font-medium text-slate-900">
            {caseItem.category}
          </dd>
        </div>
        <div>
          <dt className="text-slate-500">Fecha de entrada</dt>
          <dd className="mt-1 font-medium text-slate-900">
            {dateFormatter.format(new Date(caseItem.receivedAt))}
          </dd>
        </div>
        <div>
          <dt className="text-slate-500">Confianza fixture</dt>
          <dd className="mt-1 font-medium text-slate-900">
            {Math.round(caseItem.confidence * 100)}%
          </dd>
        </div>
        <div>
          <dt className="text-slate-500">Revisión humana</dt>
          <dd className="mt-1 font-medium text-slate-900">
            {caseItem.requiresHumanReview ? "Requerida" : "No requerida"}
          </dd>
        </div>
      </dl>

      <div className="mt-5 flex flex-wrap gap-2">
        <StatusBadge status={caseItem.status} />
        <RiskBadge risk={caseItem.risk} />
      </div>
    </article>
  );
}
