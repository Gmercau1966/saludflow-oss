import type { Metadata } from "next";
import { CaseCard } from "@/components/CaseCard";
import { Footer } from "@/components/Footer";
import { Header } from "@/components/Header";
import { SecurityNotice } from "@/components/SecurityNotice";
import { getSyntheticCases } from "@/data/synthetic-cases";

export const metadata: Metadata = {
  title: "Demo",
};

const statusFilters = [
  "Todos",
  "Pendiente",
  "Procesando",
  "Revisión humana",
  "Completado",
];

export default function DemoPage() {
  const cases = getSyntheticCases();
  const humanReviewCount = cases.filter(
    (caseItem) => caseItem.requiresHumanReview,
  ).length;
  const highRiskCount = cases.filter((caseItem) => caseItem.risk === "Alto")
    .length;

  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="mx-auto w-full max-w-7xl flex-1 px-5 py-10 lg:px-8">
        <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
          <section>
            <p className="text-sm font-semibold uppercase tracking-wide text-accent">
              Bandeja simulada
            </p>
            <h1 className="mt-3 text-3xl font-semibold text-slate-950">
              Expedientes administrativos sintéticos
            </h1>
            <p className="mt-4 max-w-3xl leading-7 text-slate-700">
              Las puntuaciones y decisiones de esta vista son fixtures locales.
              Todavía no existe procesamiento mediante IA.
            </p>
          </section>
          <SecurityNotice />
        </div>

        <section className="mt-8 grid gap-4 sm:grid-cols-3">
          <div className="rounded-lg border border-border bg-surface p-5">
            <p className="text-sm text-slate-500">Total</p>
            <p className="mt-2 text-3xl font-semibold text-slate-950">
              {cases.length}
            </p>
          </div>
          <div className="rounded-lg border border-border bg-surface p-5">
            <p className="text-sm text-slate-500">Revisión humana</p>
            <p className="mt-2 text-3xl font-semibold text-slate-950">
              {humanReviewCount}
            </p>
          </div>
          <div className="rounded-lg border border-border bg-surface p-5">
            <p className="text-sm text-slate-500">Riesgo alto</p>
            <p className="mt-2 text-3xl font-semibold text-slate-950">
              {highRiskCount}
            </p>
          </div>
        </section>

        <section className="mt-8 rounded-lg border border-border bg-surface p-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="font-semibold text-slate-950">Filtro por estado</h2>
              <p className="mt-1 text-sm text-slate-600">
                Interfaz demostrativa preparada para datos persistentes futuros.
              </p>
            </div>
            <div className="flex flex-wrap gap-2" aria-label="Filtros visuales">
              {statusFilters.map((filter, index) => (
                <button
                  className="min-h-10 rounded-md border border-border px-3 text-sm font-medium text-slate-700 transition hover:bg-surface-muted disabled:cursor-not-allowed disabled:opacity-60"
                  disabled={index !== 0}
                  key={filter}
                  type="button"
                >
                  {filter}
                </button>
              ))}
            </div>
          </div>
        </section>

        <section className="mt-8" aria-label="Estado de carga">
          <div className="rounded-lg border border-dashed border-border bg-surface p-4 text-sm text-slate-600">
            Estado de carga preparado: los fixtures locales se entregan de forma
            inmediata en esta foundation.
          </div>
        </section>

        {cases.length > 0 ? (
          <section className="mt-6 grid gap-4 lg:grid-cols-2">
            {cases.map((caseItem) => (
              <CaseCard caseItem={caseItem} key={caseItem.id} />
            ))}
          </section>
        ) : (
          <section className="mt-6 rounded-lg border border-border bg-surface p-8 text-center">
            <h2 className="text-lg font-semibold text-slate-950">
              No hay expedientes para mostrar
            </h2>
            <p className="mt-2 text-sm text-slate-600">
              Este estado quedará conectado a Supabase en una iteración futura.
            </p>
          </section>
        )}
      </main>
      <Footer />
    </div>
  );
}
