"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { CaseCard } from "@/components/CaseCard";
import { RiskBadge } from "@/components/RiskBadge";
import { StatusBadge } from "@/components/StatusBadge";
import {
  caseStatusLabels,
  intakeSourceLabels,
  riskLevelLabels,
  type CaseStatus,
  type IntakeSource,
  type RiskLevel,
} from "@/data/synthetic-cases";
import { calculateDemoMetrics } from "@/domain/metrics";
import type { DemoState, SyntheticCase } from "@/domain/types";
import { useAnonymousSession } from "@/components/supabase/AnonymousSessionProvider";
import { createInitialDemoState } from "@/lib/demo-storage";
import { createCaseRepository } from "@/lib/repositories/factory";

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
  source: "all" | IntakeSource,
  query: string,
  sort: SortOrder,
) {
  const normalizedQuery = query.trim().toLowerCase();

  return cases
    .filter((caseItem) => status === "all" || caseItem.status === status)
    .filter((caseItem) => risk === "all" || caseItem.risk === risk)
    .filter((caseItem) => source === "all" || caseItem.source === source)
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
  const session = useAnonymousSession();
  const [state, setState] = useState<DemoState>(() => createInitialDemoState());
  const [isLoaded, setIsLoaded] = useState(false);
  const [loadError, setLoadError] = useState("");
  const [status, setStatus] = useState<"all" | CaseStatus>("all");
  const [risk, setRisk] = useState<"all" | RiskLevel>("all");
  const [source, setSource] = useState<"all" | IntakeSource>("all");
  const [query, setQuery] = useState("");
  const [sort, setSort] = useState<SortOrder>("newest");

  useEffect(() => {
    let cancelled = false;

    async function loadCases() {
      if (session.status !== "ready") {
        return;
      }

      try {
        setLoadError("");
        const repository = createCaseRepository({
          supabase: session.supabase ?? undefined,
          ownerId: session.userId ?? undefined,
        });
        const cases = await repository.seedIfEmpty();
        if (!cancelled) {
          setState({
            cases,
            lastUpdatedAt: new Date().toISOString(),
            storageVersion: 1,
          });
          setIsLoaded(true);
        }
      } catch (error) {
        if (!cancelled) {
          setLoadError(
            error instanceof Error
              ? error.message
              : "No se pudo cargar la bandeja.",
          );
          setIsLoaded(true);
        }
      }
    }

    void loadCases();

    return () => {
      cancelled = true;
    };
  }, [session.status, session.supabase, session.userId]);

  const filteredCases = useMemo(
    () => filterCases(state.cases, status, risk, source, query, sort),
    [query, risk, sort, source, state.cases, status],
  );
  const metrics = calculateDemoMetrics(state);

  function handleResetFilters() {
    setStatus("all");
    setRisk("all");
    setSource("all");
    setQuery("");
    setSort("newest");
  }

  async function handleResetDemo() {
    if (
      window.confirm(
        "¿Reiniciar toda la demo? Se eliminarán los expedientes creados manualmente en este entorno.",
      )
    ) {
      const repository = createCaseRepository({
        supabase: session.supabase ?? undefined,
        ownerId: session.userId ?? undefined,
      });
      const cases = await repository.resetDemo();
      setState({
        cases,
        lastUpdatedAt: new Date().toISOString(),
        storageVersion: 1,
      });
    }
  }

  return (
    <div className="space-y-8">
      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-6">
        {[
          ["Total", metrics.total],
          ["Pendientes", metrics.pending],
          ["Revisión humana", metrics.humanReview],
          ["Completados", metrics.completed],
          ["Riesgo alto", metrics.highRisk],
          ["Formulario web", metrics.webFormIntakes],
        ].map(([label, value]) => (
          <div className="rounded-lg border border-border bg-surface p-5" key={label}>
            <p className="text-sm text-slate-500">{label}</p>
            <p className="mt-2 text-3xl font-semibold text-slate-950">{value}</p>
          </div>
        ))}
      </section>

      <section className="rounded-lg border border-border bg-surface p-5">
        <div className="grid gap-4 lg:grid-cols-[1.2fr_0.85fr_0.85fr_0.9fr_0.8fr_auto]">
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
            Origen
            <select
              className="min-h-11 rounded-md border border-border px-3 text-slate-950"
              onChange={(event) => setSource(event.target.value as "all" | IntakeSource)}
              value={source}
            >
              <option value="all">Todos</option>
              <option value="web_form">{intakeSourceLabels.web_form}</option>
              <option value="seed_fixture">{intakeSourceLabels.seed_fixture}</option>
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
          <Metric label="Solicitudes recibidas por formulario" value={metrics.webFormIntakes} />
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
            {source !== "all" ? (
              <span className="rounded-md border border-border px-2.5 py-1 text-xs font-semibold text-slate-700">
                {intakeSourceLabels[source]}
              </span>
            ) : null}
          </div>
        </div>
        {loadError ? (
          <div className="rounded-lg border border-red-200 bg-red-50 p-8 text-red-900">
            {loadError}
          </div>
        ) : isLoaded ? (
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
            Cargando bandeja de la demo...
          </div>
        )}
      </section>

      <section className="rounded-lg border border-dashed border-border bg-surface p-5 text-sm text-slate-600">
        El estado se conserva en localStorage en modo local o en Supabase con
        sesión anónima cuando el modo remoto está activado. No se usan
        proveedores de IA.
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
