import type { Metadata } from "next";
import Link from "next/link";
import { DemoWorkspace } from "@/components/demo/DemoWorkspace";
import { Footer } from "@/components/Footer";
import { Header } from "@/components/Header";
import { SecurityNotice } from "@/components/SecurityNotice";

export const metadata: Metadata = {
  title: "Demo",
};

export default function DemoPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="mx-auto w-full max-w-7xl flex-1 px-5 py-10 lg:px-8">
        <div className="mb-8 grid gap-6 lg:grid-cols-[1fr_360px]">
          <section>
            <p className="text-sm font-semibold uppercase tracking-wide text-accent">
              Bandeja operativa local
            </p>
            <h1 className="mt-3 text-3xl font-semibold text-slate-950">
              Expedientes administrativos sintéticos
            </h1>
            <p className="mt-4 max-w-3xl leading-7 text-slate-700">
              Filtra, abre y procesa expedientes mediante reglas deterministas.
              Todo funciona con fixtures locales y estado en localStorage.
            </p>
            <Link
              className="mt-6 inline-flex min-h-11 items-center justify-center rounded-md bg-accent px-5 text-sm font-semibold text-white transition hover:bg-accent-strong"
              href="/solicitud"
            >
              Nueva solicitud
            </Link>
          </section>
          <SecurityNotice />
        </div>
        <DemoWorkspace />
      </main>
      <Footer />
    </div>
  );
}
