import { getSyntheticCases } from "../../data/synthetic-cases";
import {
  addCaseToState,
  loadDemoState,
  resetCaseInState,
  resetDemoState,
  saveDemoState,
} from "../demo-storage";
import type { CaseRepository } from "./case-repository";
import type { SyntheticCase } from "../../domain/types";

export class LocalCaseRepository implements CaseRepository {
  readonly mode = "local" as const;

  async listCases(): Promise<SyntheticCase[]> {
    return loadDemoState().cases;
  }

  async getCase(caseId: string): Promise<SyntheticCase | null> {
    return loadDemoState().cases.find((caseItem) => caseItem.id === caseId) ?? null;
  }

  async createCase(caseItem: SyntheticCase): Promise<SyntheticCase> {
    saveDemoState(addCaseToState(loadDemoState(), caseItem));
    return caseItem;
  }

  async updateCase(caseItem: SyntheticCase): Promise<SyntheticCase> {
    const current = loadDemoState();
    saveDemoState({
      ...current,
      cases: current.cases.map((item) => (item.id === caseItem.id ? caseItem : item)),
      lastUpdatedAt: new Date().toISOString(),
    });
    return caseItem;
  }

  async resetCase(caseId: string): Promise<SyntheticCase | null> {
    const nextState = resetCaseInState(loadDemoState(), caseId);
    saveDemoState(nextState);
    return nextState.cases.find((caseItem) => caseItem.id === caseId) ?? null;
  }

  async resetDemo(): Promise<SyntheticCase[]> {
    return resetDemoState().cases;
  }

  async seedIfEmpty(): Promise<SyntheticCase[]> {
    const state = loadDemoState();
    if (state.cases.length > 0) {
      return state.cases;
    }

    const seeded = {
      ...state,
      cases: getSyntheticCases(),
      lastUpdatedAt: new Date().toISOString(),
    };
    saveDemoState(seeded);
    return seeded.cases;
  }
}
