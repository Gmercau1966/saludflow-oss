import type { Metadata } from "next";
import { ArchitectureFlow } from "@/components/ArchitectureFlow";
import { Footer } from "@/components/Footer";
import { Header } from "@/components/Header";

export const metadata: Metadata = {
  title: "Arquitectura",
};

const targetComponents = [
  "Next.js",
  "Vercel",
  "Supabase",
  "PostgreSQL",
  "pgvector",
  "Proveedor de IA configurable",
  "Modo Replay",
  "Human-in-the-Loop",
  "Auditoría",
  "Evaluaciones",
  "GitHub y CI/CD",
];

const notImplemented = [
  "IA",
  "RAG",
  "email",
  "aprobación humana real",
  "adjuntos reales",
  "notificaciones",
];

export default function ArchitecturePage() {
  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="mx-auto w-full max-w-7xl flex-1 px-5 py-10 lg:px-8">
        <section className="max-w-3xl">
          <p className="text-sm font-semibold uppercase tracking-wide text-accent">
            Arquitectura objetivo
          </p>
          <h1 className="mt-3 text-3xl font-semibold text-slate-950">
            Foundation presente y componentes previstos
          </h1>
          <p className="mt-4 leading-7 text-slate-700">
            Esta iteración incorpora la foundation de Supabase como backend
            opcional con sesión anónima, migración SQL y RLS. El modo local
            sigue siendo el valor por defecto para la demo sin servicios
            externos.
          </p>
        </section>

        <section className="mt-8 grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
          <div className="rounded-lg border border-border bg-surface p-5">
            <h2 className="text-xl font-semibold text-slate-950">
              Componentes objetivo
            </h2>
            <div className="mt-5 grid gap-2 sm:grid-cols-2">
              {targetComponents.map((component) => (
                <span
                  className="rounded-md border border-border bg-surface-muted px-3 py-2 text-sm font-medium text-slate-800"
                  key={component}
                >
                  {component}
                </span>
              ))}
            </div>
          </div>
          <ArchitectureFlow />
        </section>

        <section className="mt-8 grid gap-6 lg:grid-cols-2">
          <div className="rounded-lg border border-border bg-surface p-5">
            <h2 className="text-xl font-semibold text-slate-950">
              Canal web implementado
            </h2>
            <ol className="mt-5 grid gap-3 text-sm font-semibold text-slate-800">
              {[
                "Formulario web",
                "Validación y normalización",
                "Expediente canónico",
                "Repositorio local o Supabase",
                "Workflow determinista",
                "Revisión humana simulada",
              ].map((step) => (
                <li
                  className="rounded-md border border-border bg-surface-muted p-3"
                  key={step}
                >
                  {step}
                </li>
              ))}
            </ol>
          </div>
          <div className="rounded-lg border border-dashed border-border bg-surface p-5">
            <h2 className="text-xl font-semibold text-slate-950">
              Ampliación futura
            </h2>
            <ol className="mt-5 grid gap-3 text-sm font-semibold text-slate-600">
              {[
                "Email",
                "Análisis con IA",
                "Normalización",
                "Mismo expediente canónico",
              ].map((step) => (
                <li
                  className="rounded-md border border-border bg-surface-muted p-3"
                  key={step}
                >
                  {step}
                </li>
              ))}
            </ol>
            <p className="mt-4 text-sm text-slate-600">
              El canal email, la IA y la normalización automática quedan
              reservados para fases posteriores.
            </p>
          </div>
        </section>

        <section className="mt-8 rounded-lg border border-border bg-surface p-5">
          <h2 className="text-xl font-semibold text-slate-950">
            Qué no está implementado todavía
          </h2>
          <ul className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {notImplemented.map((item) => (
              <li
                className="rounded-md border border-slate-200 bg-slate-50 px-3 py-2 text-sm font-medium text-slate-700"
                key={item}
              >
                {item}
              </li>
            ))}
          </ul>
        </section>
      </main>
      <Footer />
    </div>
  );
}
