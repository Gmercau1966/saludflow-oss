"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { CaseCard } from "@/components/CaseCard";
import { RiskBadge } from "@/components/RiskBadge";
import { StatusBadge } from "@/components/StatusBadge";
import {
  caseStatusLabels,
  riskLevelLabels,
  type CaseStatus,
  type RiskLevel,
} from "@/data/synthetic-cases";
import { calculateDemoMetrics } from "@/domain/metrics";
import type { DemoState, SyntheticCase } from "@/domain/types";
import {
  createInitialDemoState,
  loadDemoState,
  resetDemoState,
  saveDemoState,
} from "@/lib/demo-storage";

type SortOrder = "newest" | "oldest";

const statusOptions: Array<"all" | CaseStatus> = [
  "all",
  "pending",
  "analyzing",
  "human_review",
  "approved",
  "rejected",
  "escalated",
  "completed",
];
const riskOptions: Array<"all" | RiskLevel> = ["all", "low", "medium", "high"];

function filterCases(
  cases: SyntheticCase[],
  status: "all" | CaseStatus,
  risk: "all" | RiskLevel,
  query: string,
  sort: SortOrder,
) {
  const normalizedQuery = query.trim().toLowerCase();

  return cases
    .filter((caseItem) => status === "all" || caseItem.status === status)
    .filter((caseItem) => risk === "all" || caseItem.risk === risk)
    .filter((caseItem) => {
      if (!normalizedQuery) {
        return true;
      }

      return [caseItem.id, caseItem.subject, caseItem.category]
        .join(" ")
        .toLowerCase()
        .includes(normalizedQuery);
    })
    .sort((a, b) => {
      const left = new Date(a.receivedAt).getTime();
      const right = new Date(b.receivedAt).getTime();

      return sort === "newest" ? right - left : left - right;
    });
}

export function DemoWorkspace() {
  const [state, setState] = useState<DemoState>(() => createInitialDemoState());
  const [isLoaded, setIsLoaded] = useState(false);
  const [status, setStatus] = useState<"all" | CaseStatus>("all");
  const [risk, setRisk] = useState<"all" | RiskLevel>("all");
  const [query, setQuery] = useState("");
  const [sort, setSort] = useState<SortOrder>("newest");

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setState(loadDemoState());
      setIsLoaded(true);
    }, 0);

    return () => window.clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (isLoaded) {
      saveDemoState(state);
    }
  }, [isLoaded, state]);

  const filteredCases = useMemo(
    () => filterCases(state.cases, status, risk, query, sort),
    [query, risk, sort, state.cases, status],
  );
  const metrics = calculateDemoMetrics(state);

  function handleResetFilters() {
    setStatus("all");
    setRisk("all");
    setQuery("");
    setSort("newest");
  }

  function handleResetDemo() {
    if (window.confirm("¿Reiniciar toda la demo local?")) {
      setState(resetDemoState());
    }
  }

  return (
    <div className="space-y-8">
      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        {[
          ["Total", metrics.total],
          ["Pendientes", metrics.pending],
          ["Revisión humana", metrics.humanReview],
          ["Completados", metrics.completed],
          ["Riesgo alto", metrics.highRisk],
        ].map(([label, value]) => (
          <div className="rounded-lg border border-border bg-surface p-5" key={label}>
            <p className="text-sm text-slate-500">{label}</p>
            <p className="mt-2 text-3xl font-semibold text-slate-950">{value}</p>
          </div>
        ))}
      </section>

      <section className="rounded-lg border border-border bg-surface p-5">
        <div className="grid gap-4 lg:grid-cols-[1.2fr_0.9fr_0.9fr_0.8fr_auto]">
          <label className="grid gap-2 text-sm font-medium text-slate-700">
            Buscar expediente
            <input
              className="min-h-11 rounded-md border border-border px-3 text-slate-950"
              onChange={(event) => setQuery(event.target.value)}
              placeholder="ID, asunto o categoría"
              type="search"
              value={query}
            />
          </label>
          <label className="grid gap-2 text-sm font-medium text-slate-700">
            Estado
            <select
              className="min-h-11 rounded-md border border-border px-3 text-slate-950"
              onChange={(event) => setStatus(event.target.value as "all" | CaseStatus)}
              value={status}
            >
              {statusOptions.map((option) => (
                <option key={option} value={option}>
                  {option === "all" ? "Todos" : caseStatusLabels[option]}
                </option>
              ))}
            </select>
          </label>
          <label className="grid gap-2 text-sm font-medium text-slate-700">
            Riesgo
            <select
              className="min-h-11 rounded-md border border-border px-3 text-slate-950"
              onChange={(event) => setRisk(event.target.value as "all" | RiskLevel)}
              value={risk}
            >
              {riskOptions.map((option) => (
                <option key={option} value={option}>
                  {option === "all" ? "Todos" : riskLevelLabels[option]}
                </option>
              ))}
            </select>
          </label>
          <label className="grid gap-2 text-sm font-medium text-slate-700">
            Orden
            <select
              className="min-h-11 rounded-md border border-border px-3 text-slate-950"
              onChange={(event) => setSort(event.target.value as SortOrder)}
              value={sort}
            >
              <option value="newest">Más recientes</option>
              <option value="oldest">Más antiguos</option>
            </select>
          </label>
          <div className="flex items-end gap-2">
            <button
              className="min-h-11 rounded-md border border-border px-4 text-sm font-semibold text-slate-900 transition hover:bg-surface-muted"
              onClick={handleResetFilters}
              type="button"
            >
              Restablecer filtros
            </button>
          </div>
        </div>
      </section>

      <section className="rounded-lg border border-border bg-surface p-5">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-xl font-semibold text-slate-950">
              Dashboard local
            </h2>
            <p className="mt-1 text-sm text-slate-600">
              Métricas de demostración calculadas desde fixtures locales.
            </p>
          </div>
          <button
            className="min-h-11 rounded-md border border-red-200 px-4 text-sm font-semibold text-red-700 transition hover:bg-red-50"
            onClick={handleResetDemo}
            type="button"
          >
            Reiniciar demo
          </button>
        </div>
        <dl className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Metric label="Procesados" value={metrics.processed} />
          <Metric label="% revisión humana" value={`${metrics.humanReviewRate}%`} />
          <Metric label="% riesgo alto" value={`${metrics.highRiskRate}%`} />
          <Metric label="Antes" value={`${metrics.beforeMinutes} min`} />
          <Metric label="Después" value={`${metrics.afterMinutes} min`} />
          <Metric label="Horas ahorradas" value={metrics.savedHours.toFixed(1)} />
          <Metric
            label="Aprobación sin edición"
            value={`${metrics.approvalWithoutEditRate}%`}
          />
          <Metric label="Tasa de escalado" value={`${metrics.escalationRate}%`} />
        </dl>
      </section>

      <section aria-live="polite">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-xl font-semibold text-slate-950">
            Expedientes encontrados: {filteredCases.length}
          </h2>
          <div className="flex flex-wrap gap-2">
            {status !== "all" ? <StatusBadge status={status} /> : null}
            {risk !== "all" ? <RiskBadge risk={risk} /> : null}
          </div>
        </div>
        {isLoaded ? (
          filteredCases.length > 0 ? (
            <div className="grid gap-4 lg:grid-cols-2">
              {filteredCases.map((caseItem) => (
                <CaseCard caseItem={caseItem} key={caseItem.id} />
              ))}
            </div>
          ) : (
            <div className="rounded-lg border border-border bg-surface p-8 text-center">
              <h3 className="text-lg font-semibold text-slate-950">
                No hay expedientes que coincidan
              </h3>
              <p className="mt-2 text-sm text-slate-600">
                Ajusta la búsqueda o restablece los filtros para volver a la
                bandeja completa.
              </p>
            </div>
          )
        ) : (
          <div className="rounded-lg border border-border bg-surface p-8">
            Cargando estado local de la demo...
          </div>
        )}
      </section>

      <section className="rounded-lg border border-dashed border-border bg-surface p-5 text-sm text-slate-600">
        El estado se conserva en localStorage. No se usan cookies, servicios
        externos, Supabase ni proveedores de IA.
        <Link className="ml-2 font-semibold text-accent" href="/architecture">
          Ver arquitectura objetivo
        </Link>
      </section>
    </div>
  );
}

function Metric({ label, value }: { label: string; value: number | string }) {
  return (
    <div className="rounded-md border border-border bg-surface-muted p-4">
      <dt className="text-sm text-slate-500">{label}</dt>
      <dd className="mt-2 text-2xl font-semibold text-slate-950">{value}</dd>
    </div>
  );
}
