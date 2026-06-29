"use client";

export default function Error({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <main className="mx-auto w-full max-w-3xl px-5 py-10">
      <section className="rounded-lg border border-red-200 bg-red-50 p-6 text-red-900">
        <h1 className="text-xl font-semibold">
          No se pudo cargar la bandeja simulada
        </h1>
        <p className="mt-2 text-sm">
          La demo usa fixtures locales; si el problema continúa, requiere
          revisión humana antes de avanzar.
        </p>
        <button
          className="mt-4 min-h-10 rounded-md bg-red-700 px-4 text-sm font-semibold text-white"
          onClick={reset}
          type="button"
        >
          Reintentar
        </button>
      </section>
    </main>
  );
}
