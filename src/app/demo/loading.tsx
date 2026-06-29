export default function Loading() {
  return (
    <main className="mx-auto w-full max-w-7xl px-5 py-10 lg:px-8">
      <div className="h-8 w-72 animate-pulse rounded-md bg-slate-200" />
      <div className="mt-6 grid gap-4 lg:grid-cols-2">
        {[0, 1, 2, 3].map((item) => (
          <div
            className="h-56 animate-pulse rounded-lg border border-border bg-surface"
            key={item}
          />
        ))}
      </div>
    </main>
  );
}
