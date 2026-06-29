"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { RiskBadge } from "@/components/RiskBadge";
import { StatusBadge } from "@/components/StatusBadge";
import { SyntheticDataBadge } from "@/components/SyntheticDataBadge";
import {
  caseStatusLabels,
  intakeSourceLabels,
  responseChannelLabels,
  riskLevelLabels,
} from "@/data/synthetic-cases";
import {
  canRecordDecision,
  processCase,
  recordHumanDecision,
} from "@/domain/process-case";
import type { DemoState, ReviewDecision, SyntheticCase } from "@/domain/types";
import {
  createInitialDemoState,
  loadDemoState,
  resetCaseInState,
  saveDemoState,
} from "@/lib/demo-storage";

const stages = [
  "Clasificación",
  "Extracción",
  "Validación documental",
  "Consulta de procedimiento",
  "Evaluación de riesgo",
  "Generación de borrador",
];

const decisionLabels: Record<ReviewDecision, string> = {
  approve: "Aprobar",
  edit_and_approve: "Editar y aprobar",
  reject: "Rechazar",
  escalate: "Escalar",
};

const dateFormatter = new Intl.DateTimeFormat("es-ES", {
  dateStyle: "medium",
  timeStyle: "short",
});

export function CaseDetailWorkspace({ caseId }: { caseId: string }) {
  const [state, setState] = useState<DemoState>(() => createInitialDemoState());
  const [isLoaded, setIsLoaded] = useState(false);
  const [activeStage, setActiveStage] = useState(-1);
  const [feedback, setFeedback] = useState("");
  const [reviewNote, setReviewNote] = useState("");
  const [editedDraft, setEditedDraft] = useState("");

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setState(loadDemoState());
      setIsLoaded(true);
    }, 0);

    return () => window.clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (isLoaded) {
      saveDemoState(state);
    }
  }, [isLoaded, state]);

  const caseItem = useMemo(
    () => state.cases.find((item) => item.id === caseId),
    [caseId, state.cases],
  );

  useEffect(() => {
    if (caseItem?.draftResponse) {
      const timer = window.setTimeout(() => {
        setEditedDraft(caseItem.draftResponse);
      }, 0);

      return () => window.clearTimeout(timer);
    }

    return undefined;
  }, [caseItem?.draftResponse]);

  if (!isLoaded) {
    return (
      <div className="rounded-lg border border-border bg-surface p-8">
        Cargando expediente desde estado local...
      </div>
    );
  }

  if (!caseItem) {
    return (
      <section className="rounded-lg border border-border bg-surface p-8 text-center">
        <h1 className="text-xl font-semibold text-slate-950">
          Expediente no encontrado
        </h1>
        <p className="mt-2 text-sm text-slate-600">
          El estado local no contiene este expediente sintético.
        </p>
        <Link
          className="mt-4 inline-flex min-h-10 items-center rounded-md border border-border px-4 text-sm font-semibold text-slate-900"
          href="/demo"
        >
          Volver a la bandeja
        </Link>
      </section>
    );
  }

  function updateCase(nextCase: SyntheticCase) {
    setState((current) => ({
      ...current,
      cases: current.cases.map((item) => (item.id === nextCase.id ? nextCase : item)),
      lastUpdatedAt: new Date().toISOString(),
    }));
  }

  function handleAnalyze() {
    if (!caseItem || caseItem.status === "analyzing") {
      return;
    }

    setFeedback("Ejecutando análisis determinista local.");
    setActiveStage(0);
    stages.forEach((_, index) => {
      window.setTimeout(() => setActiveStage(index), index * 280);
    });
    window.setTimeout(() => {
      const nextCase = processCase(caseItem);
      updateCase(nextCase);
      setActiveStage(stages.length);
      setFeedback(
        nextCase.requiresHumanReview
          ? "Análisis completado. El expediente requiere revisión humana."
          : "Análisis completado. El expediente se completó en modo demo.",
      );
    }, stages.length * 280 + 120);
  }

  function handleResetCase() {
    if (window.confirm("¿Reiniciar este expediente sintético?")) {
      setState((current) => resetCaseInState(current, caseId));
      setFeedback("Expediente reiniciado desde fixture local.");
      setReviewNote("");
      setEditedDraft("");
      setActiveStage(-1);
    }
  }

  function handleDecision(decision: ReviewDecision) {
    if (!caseItem) {
      return;
    }

    const permission = canRecordDecision(caseItem, decision);
    if (!permission.allowed) {
      setFeedback(permission.reason ?? "Acción bloqueada por regla determinista.");
      return;
    }

    if (!reviewNote.trim()) {
      setFeedback("La nota del revisor es obligatoria.");
      return;
    }

    if (!window.confirm(`Confirmar acción simulada: ${decisionLabels[decision]}`)) {
      return;
    }

    try {
      const nextCase = recordHumanDecision(
        caseItem,
        decision,
        reviewNote,
        editedDraft,
      );
      updateCase(nextCase);
      setFeedback(`Decisión registrada: ${decisionLabels[decision]}.`);
    } catch (error) {
      setFeedback(error instanceof Error ? error.message : "Error inesperado.");
    }
  }

  const hasAnalysis = Boolean(caseItem.analysis);

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Link
          className="rounded-md text-sm font-semibold text-accent hover:text-accent-strong"
          href="/demo"
        >
          Volver a la bandeja
        </Link>
        <button
          className="min-h-10 rounded-md border border-red-200 px-4 text-sm font-semibold text-red-700 transition hover:bg-red-50"
          onClick={handleResetCase}
          type="button"
        >
          Reiniciar caso
        </button>
      </div>

      <section className="rounded-lg border border-border bg-surface p-5">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="font-mono text-sm font-semibold text-slate-500">
              {caseItem.id}
            </p>
            <h1 className="mt-2 text-3xl font-semibold text-slate-950">
              {caseItem.subject}
            </h1>
            <p className="mt-3 text-sm text-slate-600">
              Entrada: {dateFormatter.format(new Date(caseItem.receivedAt))}
            </p>
          </div>
          <SyntheticDataBadge />
        </div>
        <div className="mt-5 flex flex-wrap gap-2">
          <span className="rounded-md border border-border px-2.5 py-1 text-xs font-semibold text-slate-700">
            {caseItem.category}
          </span>
          <StatusBadge status={caseItem.status} />
          <RiskBadge risk={caseItem.risk} />
          <span className="rounded-md border border-border px-2.5 py-1 text-xs font-semibold text-slate-700">
            Confianza {Math.round(caseItem.confidence * 100)}%
          </span>
          <span className="rounded-md border border-border px-2.5 py-1 text-xs font-semibold text-slate-700">
            {intakeSourceLabels[caseItem.source]}
          </span>
        </div>
      </section>

      <section className="rounded-lg border border-border bg-surface p-5">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h2 className="text-xl font-semibold text-slate-950">
              Ejecución del análisis
            </h2>
            <p className="mt-1 text-sm text-slate-600">
              Reglas locales, sin IA real, APIs externas ni datos reales.
            </p>
          </div>
          <button
            className="min-h-11 rounded-md bg-accent px-5 text-sm font-semibold text-white transition hover:bg-accent-strong disabled:cursor-not-allowed disabled:opacity-60"
            disabled={caseItem.status === "analyzing"}
            onClick={handleAnalyze}
            type="button"
          >
            Analizar expediente
          </button>
        </div>
        <ol className="mt-5 grid gap-3 md:grid-cols-3">
          {stages.map((stage, index) => {
            const completed =
              (hasAnalysis && caseItem.analysis?.stagesCompleted.includes(stage)) ||
              activeStage > index;
            const active = activeStage === index;

            return (
              <li
                className={`rounded-md border p-3 text-sm font-medium ${
                  completed
                    ? "border-emerald-200 bg-emerald-50 text-emerald-800"
                    : active
                      ? "border-sky-200 bg-sky-50 text-sky-800"
                      : "border-border bg-surface-muted text-slate-600"
                }`}
                key={stage}
              >
                {stage}
              </li>
            );
          })}
        </ol>
        <p className="mt-4 text-sm text-slate-700" aria-live="polite">
          {feedback || "Listo para ejecutar el workflow determinista."}
        </p>
      </section>

      <div className="grid gap-6 lg:grid-cols-[1fr_0.9fr]">
        <InfoSection title="Solicitud original">
          <p className="leading-7 text-slate-700">{caseItem.originalText}</p>
        </InfoSection>

        <InfoSection title="Recepción">
          <dl className="grid gap-3 text-sm">
            {[
              ["Origen", intakeSourceLabels[caseItem.source]],
              [
                "Prioridad declarada",
                caseItem.declaredPriority === "urgent" ? "Urgente" : "Normal",
              ],
              [
                "Canal preferido",
                responseChannelLabels[caseItem.preferredResponseChannel],
              ],
              [
                "Documentos declarados",
                caseItem.declaredDocuments.join(", ") || "Sin documentación",
              ],
            ].map(([label, value]) => (
              <div className="grid gap-1" key={label}>
                <dt className="text-slate-500">{label}</dt>
                <dd className="font-medium text-slate-900">{value}</dd>
              </div>
            ))}
          </dl>
        </InfoSection>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_0.9fr]">
        <InfoSection title="Datos extraídos">
          <dl className="grid gap-3 text-sm">
            {[
              ["Tipo de trámite", caseItem.extractedData.procedureType],
              ["Canal", caseItem.extractedData.channel],
              ["Fecha solicitada", caseItem.extractedData.requestedDate],
              ["Referencia interna", caseItem.extractedData.internalReference],
              ["Motivo", caseItem.extractedData.reason],
              ["Prioridad", caseItem.extractedData.priority],
            ].map(([label, value]) => (
              <div className="grid gap-1" key={label}>
                <dt className="text-slate-500">{label}</dt>
                <dd className="font-medium text-slate-900">{value}</dd>
              </div>
            ))}
          </dl>
        </InfoSection>
      </div>

      <InfoSection title="Documentación">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[640px] text-left text-sm">
            <thead className="text-slate-500">
              <tr>
                <th className="py-2 pr-4">Documento</th>
                <th className="py-2 pr-4">Requerido</th>
                <th className="py-2 pr-4">Presentado</th>
                <th className="py-2 pr-4">Estado</th>
                <th className="py-2">Motivo</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {caseItem.documents.map((document) => (
                <tr key={document.name}>
                  <td className="py-3 pr-4 font-medium text-slate-900">
                    {document.name}
                  </td>
                  <td className="py-3 pr-4">{document.required ? "Sí" : "No"}</td>
                  <td className="py-3 pr-4">{document.presented ? "Sí" : "No"}</td>
                  <td className="py-3 pr-4">{document.status}</td>
                  <td className="py-3 text-slate-600">
                    {document.invalidReason ?? "No aplica"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </InfoSection>

      <InfoSection title="Procedimiento aplicable">
        <div className="grid gap-4 lg:grid-cols-[0.7fr_1fr]">
          <dl className="grid gap-3 text-sm">
            <div>
              <dt className="text-slate-500">Código</dt>
              <dd className="font-mono font-semibold text-slate-950">
                {caseItem.procedure.code}
              </dd>
            </div>
            <div>
              <dt className="text-slate-500">Título</dt>
              <dd className="font-medium text-slate-950">
                {caseItem.procedure.title}
              </dd>
            </div>
            <div>
              <dt className="text-slate-500">Plazo orientativo</dt>
              <dd>{caseItem.procedure.simulatedDeadline}</dd>
            </div>
            <div>
              <dt className="text-slate-500">Versión</dt>
              <dd>{caseItem.procedure.version}</dd>
            </div>
          </dl>
          <div>
            <h3 className="font-semibold text-slate-950">Pasos</h3>
            <ol className="mt-3 grid gap-2 text-sm text-slate-700">
              {caseItem.procedure.steps.map((step) => (
                <li className="rounded-md bg-surface-muted p-3" key={step}>
                  {step}
                </li>
              ))}
            </ol>
            <p className="mt-4 rounded-md border border-amber-300 bg-amber-50 p-3 text-sm text-amber-900">
              {caseItem.procedure.fictitiousSourceNotice}
            </p>
          </div>
        </div>
      </InfoSection>

      <InfoSection title="Resultado del análisis">
        {caseItem.analysis ? (
          <div className="grid gap-5 lg:grid-cols-2">
            <dl className="grid gap-3 text-sm">
              <div>
                <dt className="text-slate-500">Clasificación</dt>
                <dd className="font-medium text-slate-950">
                  {caseItem.analysis.classification}
                </dd>
              </div>
              <div>
                <dt className="text-slate-500">Confianza simulada</dt>
                <dd className="font-medium text-slate-950">
                  {Math.round(caseItem.analysis.confidence * 100)}%
                </dd>
              </div>
              <div>
                <dt className="text-slate-500">Motivo de revisión</dt>
                <dd className="font-medium text-slate-950">
                  {caseItem.analysis.humanReviewReason ?? "No requerida"}
                </dd>
              </div>
            </dl>
            <div className="grid gap-4">
              <ListBlock title="Factores de riesgo" items={caseItem.analysis.riskFactors} />
              <ListBlock title="Reglas activadas" items={caseItem.analysis.activatedRules} />
              <ListBlock
                title="Documentación faltante"
                items={caseItem.analysis.missingDocuments}
                emptyText="No hay documentación faltante."
              />
            </div>
          </div>
        ) : (
          <p className="text-sm text-slate-600">
            Ejecuta el análisis para ver clasificación, reglas activadas y
            motivos de revisión.
          </p>
        )}
      </InfoSection>

      <InfoSection title="Borrador de respuesta">
        <label className="grid gap-2 text-sm font-medium text-slate-700">
          Borrador editable
          <textarea
            className="min-h-36 rounded-md border border-border p-3 text-slate-950"
            onChange={(event) => setEditedDraft(event.target.value)}
            value={editedDraft || caseItem.draftResponse}
          />
        </label>
      </InfoSection>

      <InfoSection title="Revisión humana">
        <div className="grid gap-4 lg:grid-cols-[1fr_1.2fr]">
          <div className="rounded-md border border-border bg-surface-muted p-4 text-sm text-slate-700">
            <p>
              Revisor: <strong>Usuario demo</strong>
            </p>
            <p className="mt-2">
              Estado actual: <strong>{caseStatusLabels[caseItem.status]}</strong>
            </p>
            <p className="mt-2">
              Riesgo actual: <strong>{riskLevelLabels[caseItem.risk]}</strong>
            </p>
          </div>
          <div>
            <label className="grid gap-2 text-sm font-medium text-slate-700">
              Nota del revisor
              <textarea
                className="min-h-24 rounded-md border border-border p-3 text-slate-950"
                onChange={(event) => setReviewNote(event.target.value)}
                placeholder="Describe la decisión simulada y la regla aplicada"
                value={reviewNote}
              />
            </label>
            <div className="mt-4 flex flex-wrap gap-2">
              {(Object.keys(decisionLabels) as ReviewDecision[]).map((decision) => {
                const permission = canRecordDecision(caseItem, decision);

                return (
                  <button
                    className="min-h-10 rounded-md border border-border px-4 text-sm font-semibold text-slate-900 transition hover:bg-surface-muted disabled:cursor-not-allowed disabled:opacity-50"
                    disabled={!permission.allowed}
                    key={decision}
                    onClick={() => handleDecision(decision)}
                    title={permission.reason}
                    type="button"
                  >
                    {decisionLabels[decision]}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </InfoSection>

      <InfoSection title="Audit log local">
        <ol className="grid gap-3">
          {caseItem.auditEvents.map((event) => (
            <li
              className="rounded-md border border-border bg-surface-muted p-4 text-sm"
              key={event.id}
            >
              <p className="font-semibold text-slate-950">
                {dateFormatter.format(new Date(event.timestamp))} — {event.actor} —{" "}
                {event.description}
              </p>
              <p className="mt-1 text-slate-700">Resultado: {event.result}</p>
              <p className="mt-1 font-mono text-xs text-slate-500">
                Workflow: {event.workflowVersion} · Evento: {event.type}
              </p>
            </li>
          ))}
        </ol>
      </InfoSection>
    </div>
  );
}

function InfoSection({
  children,
  title,
}: {
  children: React.ReactNode;
  title: string;
}) {
  return (
    <section className="rounded-lg border border-border bg-surface p-5">
      <h2 className="mb-4 text-xl font-semibold text-slate-950">{title}</h2>
      {children}
    </section>
  );
}

function ListBlock({
  emptyText = "Sin elementos.",
  items,
  title,
}: {
  emptyText?: string;
  items: string[];
  title: string;
}) {
  return (
    <div>
      <h3 className="font-semibold text-slate-950">{title}</h3>
      {items.length > 0 ? (
        <ul className="mt-2 grid gap-2 text-sm text-slate-700">
          {items.map((item) => (
            <li className="rounded-md bg-surface-muted p-3" key={item}>
              {item}
            </li>
          ))}
        </ul>
      ) : (
        <p className="mt-2 text-sm text-slate-600">{emptyText}</p>
      )}
    </div>
  );
}
