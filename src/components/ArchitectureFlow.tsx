const steps = [
  { label: "Interfaz Next.js", state: "Presente" },
  { label: "API / Server Actions", state: "Parcial" },
  { label: "Workflow administrativo", state: "Presente" },
  { label: "Herramientas deterministas", state: "Presente" },
  { label: "Proveedor de IA configurable", state: "Previsto" },
  { label: "Revisión humana", state: "Parcial" },
  { label: "Supabase + auditoría + métricas", state: "Parcial" },
];

export function ArchitectureFlow() {
  return (
    <div className="rounded-lg border border-border bg-surface p-5">
      <ol className="grid gap-3">
        {steps.map((step, index) => (
          <li key={step.label} className="grid gap-3">
            <div className="flex flex-col gap-2 rounded-lg border border-border bg-surface-muted p-4 sm:flex-row sm:items-center sm:justify-between">
              <span className="font-semibold text-slate-950">{step.label}</span>
              <span
                className={
                  step.state === "Presente"
                    ? "rounded-md bg-emerald-100 px-2.5 py-1 text-xs font-semibold text-emerald-800"
                    : step.state === "Parcial"
                      ? "rounded-md bg-sky-100 px-2.5 py-1 text-xs font-semibold text-sky-800"
                      : "rounded-md bg-slate-200 px-2.5 py-1 text-xs font-semibold text-slate-700"
                }
              >
                {step.state}
              </span>
            </div>
            {index < steps.length - 1 ? (
              <div className="ml-6 h-6 w-px bg-border" aria-hidden="true" />
            ) : null}
          </li>
        ))}
      </ol>
    </div>
  );
}
