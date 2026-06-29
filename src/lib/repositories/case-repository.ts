import type { SyntheticCase } from "@/domain/types";

export interface CaseRepository {
  readonly mode: "local" | "supabase";
  listCases(): Promise<SyntheticCase[]>;
  getCase(caseId: string): Promise<SyntheticCase | null>;
  createCase(caseItem: SyntheticCase): Promise<SyntheticCase>;
  updateCase(caseItem: SyntheticCase): Promise<SyntheticCase>;
  resetCase(caseId: string): Promise<SyntheticCase | null>;
  resetDemo(): Promise<SyntheticCase[]>;
  seedIfEmpty(): Promise<SyntheticCase[]>;
}

export class CaseRepositoryError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "CaseRepositoryError";
  }
}
