import type { Metadata } from "next";
import { Footer } from "@/components/Footer";
import { Header } from "@/components/Header";
import { WebFormIntake } from "@/components/intake/WebFormIntake";

export const metadata: Metadata = {
  title: "Crear solicitud",
};

export default function SolicitudPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="mx-auto w-full max-w-6xl flex-1 px-5 py-10 lg:px-8">
        <section className="mb-8 grid gap-6 lg:grid-cols-[1fr_360px]">
          <div>
            <p className="text-sm font-semibold uppercase tracking-wide text-accent">
              Portal público de demostración
            </p>
            <h1 className="mt-3 text-3xl font-semibold text-slate-950">
              Crear solicitud administrativa sintética
            </h1>
            <p className="mt-4 max-w-3xl leading-7 text-slate-700">
              Este canal acepta solicitudes ficticias de cambio de datos,
              documentación, reembolso, cita, reclamación o consulta de
              procedimiento. La solicitud se guardará solo en este navegador y
              aparecerá en la bandeja local de la demo.
            </p>
          </div>
          <aside className="rounded-lg border border-amber-300 bg-amber-50 p-5 text-sm leading-6 text-amber-950">
            <p className="font-semibold">Aviso obligatorio</p>
            <p className="mt-2">
              Utiliza únicamente datos ficticios. No introduzcas nombres reales,
              documentos de identidad, información clínica, teléfonos,
              direcciones ni datos de contacto reales.
            </p>
          </aside>
        </section>
        <WebFormIntake />
      </main>
      <Footer />
    </div>
  );
}
