export function SecurityNotice() {
  return (
    <aside
      className="rounded-lg border border-amber-300 bg-amber-50 p-5 text-amber-950"
      aria-label="Aviso de seguridad y alcance"
    >
      <p className="font-semibold">Demostrador tecnológico.</p>
      <p className="mt-2 text-sm leading-6">
        Utiliza exclusivamente información sintética. No está destinado a
        diagnóstico, tratamiento, decisiones clínicas ni procesamiento de
        expedientes sanitarios reales.
      </p>
    </aside>
  );
}
