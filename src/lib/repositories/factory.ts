import { getRuntimeMode } from "../env";
import { LocalCaseRepository } from "./local-case-repository";
import {
  SupabaseCaseRepository,
  type RepositorySupabaseClient,
} from "./supabase-case-repository";
import type { CaseRepository } from "./case-repository";

export function createCaseRepository(options?: {
  supabase?: unknown;
  ownerId?: string;
}): CaseRepository {
  if (getRuntimeMode() === "local") {
    return new LocalCaseRepository();
  }

  if (!options?.supabase || !options.ownerId) {
    throw new Error(
      "El modo Supabase requiere una sesion anonima activa antes de cargar expedientes.",
    );
  }

  return new SupabaseCaseRepository(
    options.supabase as RepositorySupabaseClient,
    options.ownerId,
  );
}
