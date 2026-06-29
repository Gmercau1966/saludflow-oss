import { getSyntheticCases } from "../data/synthetic-cases";
import type { DemoState, SyntheticCase } from "../domain/types";

export const DEMO_STORAGE_KEY = "saludflow-oss-demo-state-v1";

export function createInitialDemoState(): DemoState {
  return {
    cases: getSyntheticCases(),
    lastUpdatedAt: new Date().toISOString(),
    storageVersion: 1,
  };
}

export function parseDemoState(rawValue: string | null): DemoState {
  if (!rawValue) {
    return createInitialDemoState();
  }

  try {
    const parsed = JSON.parse(rawValue) as Partial<DemoState>;
    if (
      parsed.storageVersion !== 1 ||
      !Array.isArray(parsed.cases) ||
      parsed.cases.some(
        (caseItem) =>
          caseItem?.synthetic !== true ||
          (caseItem?.source !== "web_form" && caseItem?.source !== "seed_fixture"),
      )
    ) {
      return createInitialDemoState();
    }

    return {
      cases: parsed.cases as SyntheticCase[],
      lastUpdatedAt:
        typeof parsed.lastUpdatedAt === "string"
          ? parsed.lastUpdatedAt
          : new Date().toISOString(),
      storageVersion: 1,
    };
  } catch {
    return createInitialDemoState();
  }
}

export function serializeDemoState(state: DemoState): string {
  return JSON.stringify(state);
}

export function loadDemoState(): DemoState {
  if (typeof window === "undefined") {
    return createInitialDemoState();
  }

  return parseDemoState(window.localStorage.getItem(DEMO_STORAGE_KEY));
}

export function saveDemoState(state: DemoState): void {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.setItem(DEMO_STORAGE_KEY, serializeDemoState(state));
}

export function addCaseToState(state: DemoState, caseItem: SyntheticCase): DemoState {
  const withoutDuplicate = state.cases.filter((item) => item.id !== caseItem.id);

  return {
    ...state,
    cases: [caseItem, ...withoutDuplicate],
    lastUpdatedAt: new Date().toISOString(),
  };
}

export function resetCaseInState(state: DemoState, caseId: string): DemoState {
  const freshCase = getSyntheticCases().find((caseItem) => caseItem.id === caseId);
  if (freshCase) {
    return {
      ...state,
      cases: state.cases.map((caseItem) =>
        caseItem.id === caseId ? freshCase : caseItem,
      ),
      lastUpdatedAt: new Date().toISOString(),
    };
  }

  const existingCase = state.cases.find((caseItem) => caseItem.id === caseId);
  if (!existingCase || existingCase.source !== "web_form") {
    return state;
  }

  return {
    ...state,
    cases: state.cases.map((caseItem) =>
      caseItem.id === caseId
        ? {
            ...existingCase,
            status: "pending",
            risk:
              existingCase.category === "Reclamación administrativa"
                ? "high"
                : existingCase.category === "Reembolso"
                  ? "medium"
                  : "low",
            confidence: 0.86,
            draftResponse: "",
            analysis: undefined,
            review: undefined,
            requiresHumanReview: existingCase.documents.some(
              (document) => document.status === "missing",
            ),
            auditEvents: existingCase.auditEvents.filter(
              (event) => event.type === "intake_received",
            ),
          }
        : caseItem,
    ),
    lastUpdatedAt: new Date().toISOString(),
  };
}

export function resetDemoState(): DemoState {
  const state = createInitialDemoState();
  saveDemoState(state);
  return state;
}
