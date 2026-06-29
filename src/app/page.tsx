import type { Metadata } from "next";
import Link from "next/link";
import { Footer } from "@/components/Footer";
import { Header } from "@/components/Header";
import { SecurityNotice } from "@/components/SecurityNotice";

export const metadata: Metadata = {
  title: "Landing",
};

const principles = [
  "Datos sintéticos",
  "Human-in-the-Loop",
  "Trazabilidad completa",
  "Seguridad por diseño",
  "Evaluación continua",
  "Arquitectura open source",
];

const problems = [
  "Carga administrativa elevada",
  "Procesos repetitivos",
  "Errores manuales",
  "Dificultad para auditar decisiones",
  "Necesidad de automatización segura",
];

const flow = [
  "Solicitud",
  "Clasificación",
  "Validación",
  "Consulta de procedimiento",
  "Borrador",
  "Revisión humana",
  "Auditoría",
];

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main>
        <section className="border-b border-border bg-surface">
          <div className="mx-auto grid max-w-7xl gap-10 px-5 py-16 lg:grid-cols-[1.1fr_0.9fr] lg:px-8 lg:py-20">
            <div>
              <p className="text-sm font-semibold uppercase tracking-wide text-accent">
                SaludFlow OSS
              </p>
              <h1 className="mt-4 max-w-4xl text-4xl font-semibold tracking-normal text-slate-950 sm:text-5xl">
                Agente administrativo sanitario open source con supervisión
                humana
              </h1>
              <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-700">
                Automatiza tareas administrativas sanitarias simuladas,
                manteniendo control humano, trazabilidad y evaluación desde la
                primera iteración.
              </p>
              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <Link
                  className="inline-flex min-h-11 items-center justify-center rounded-md bg-accent px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-accent-strong"
                  href="/solicitud"
                >
                  Crear solicitud
                </Link>
                <Link
                  className="inline-flex min-h-11 items-center justify-center rounded-md border border-border bg-surface px-5 py-2.5 text-sm font-semibold text-slate-900 transition hover:bg-surface-muted"
                  href="/demo"
                >
                  Ver demostración
                </Link>
                <Link
                  className="inline-flex min-h-11 items-center justify-center rounded-md border border-border bg-surface px-5 py-2.5 text-sm font-semibold text-slate-900 transition hover:bg-surface-muted"
                  href="/architecture"
                >
                  Consultar arquitectura
                </Link>
              </div>
            </div>
            <SecurityNotice />
          </div>
        </section>

        <section className="mx-auto grid max-w-7xl gap-8 px-5 py-14 lg:grid-cols-2 lg:px-8">
          <div>
            <h2 className="text-2xl font-semibold text-slate-950">Problema</h2>
            <p className="mt-3 leading-7 text-slate-700">
              La administración sanitaria combina tareas de alto volumen,
              reglas cambiantes y necesidad de justificar cada decisión. Esta
              foundation muestra el marco visual y técnico para automatizar con
              cautela, sin tratar datos reales.
            </p>
            <ul className="mt-6 grid gap-3">
              {problems.map((item) => (
                <li
                  className="rounded-lg border border-border bg-surface p-4 text-sm font-medium text-slate-800"
                  key={item}
                >
                  {item}
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h2 className="text-2xl font-semibold text-slate-950">Propuesta</h2>
            <div className="mt-6 grid gap-3 sm:grid-cols-2">
              {principles.map((item) => (
                <div
                  className="rounded-lg border border-border bg-surface p-4"
                  key={item}
                >
                  <p className="font-semibold text-slate-950">{item}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="border-y border-border bg-surface-muted">
          <div className="mx-auto max-w-7xl px-5 py-14 lg:px-8">
            <h2 className="text-2xl font-semibold text-slate-950">
              Flujo resumido
            </h2>
            <ol className="mt-6 grid gap-3 md:grid-cols-7">
              {flow.map((step, index) => (
                <li
                  className="relative rounded-lg border border-border bg-surface p-4 text-sm font-semibold text-slate-900"
                  key={step}
                >
                  <span className="font-mono text-xs text-accent">
                    {String(index + 1).padStart(2, "0")}
                  </span>
                  <span className="mt-2 block">{step}</span>
                </li>
              ))}
            </ol>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
