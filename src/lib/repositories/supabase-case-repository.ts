import { getSyntheticCases } from "../../data/synthetic-cases";
import type { SyntheticCase } from "../../domain/types";
import {
  auditEventToDatabaseRow,
  caseToDatabaseRow,
  databaseRowToCase,
  humanReviewToDatabaseRow,
  workflowRunToDatabaseRow,
  type DatabaseAuditEventRow,
  type DatabaseCaseRow,
  type DatabaseHumanReviewRow,
  type DatabaseWorkflowRunRow,
} from "./database-mappers";
import {
  CaseRepositoryError,
  type CaseRepository,
} from "./case-repository";

type QueryResult<T> = {
  data: T | null;
  error: { message: string } | null;
};

export type QueryBuilder<T> = {
  select(columns?: string): QueryBuilder<T>;
  eq(column: string, value: string): QueryBuilder<T>;
  order(column: string, options?: { ascending?: boolean }): Promise<QueryResult<T[]>>;
  single(): Promise<QueryResult<T>>;
  insert(values: unknown): Promise<QueryResult<unknown>>;
  upsert(values: unknown): Promise<QueryResult<unknown>>;
  update(values: unknown): QueryBuilder<T>;
  delete(): QueryBuilder<T>;
};

export type RepositorySupabaseClient = {
  from<T = unknown>(table: string): QueryBuilder<T>;
};

function assertNoError<T>(result: QueryResult<T>, action: string): T | null {
  if (result.error) {
    throw new CaseRepositoryError(`${action}: ${result.error.message}`);
  }

  return result.data;
}

export class SupabaseCaseRepository implements CaseRepository {
  readonly mode = "supabase" as const;

  constructor(
    private readonly supabase: RepositorySupabaseClient,
    private readonly ownerId: string,
  ) {}

  async listCases(): Promise<SyntheticCase[]> {
    const result = await this.supabase
      .from<DatabaseCaseRow>("cases")
      .select("*")
      .eq("owner_id", this.ownerId)
      .order("received_at", { ascending: false });

    const rows = assertNoError(result, "No se pudieron cargar los expedientes");
    return (rows ?? []).map(databaseRowToCase);
  }

  async getCase(caseId: string): Promise<SyntheticCase | null> {
    const result = await this.supabase
      .from<DatabaseCaseRow>("cases")
      .select("*")
      .eq("owner_id", this.ownerId)
      .eq("id", caseId)
      .single();

    if (result.error?.message.includes("0 rows")) {
      return null;
    }

    const row = assertNoError(result, "No se pudo cargar el expediente");
    return row ? databaseRowToCase(row) : null;
  }

  async createCase(caseItem: SyntheticCase): Promise<SyntheticCase> {
    await this.persistCase(caseItem);
    await this.insertAuditEvents(caseItem);
    return caseItem;
  }

  async updateCase(caseItem: SyntheticCase): Promise<SyntheticCase> {
    await this.persistCase(caseItem);
    await this.insertAuditEvents(caseItem);
    await this.insertHumanReview(caseItem);
    await this.completeWorkflowRun(caseItem);
    return caseItem;
  }

  async resetCase(caseId: string): Promise<SyntheticCase | null> {
    const existing = await this.getCase(caseId);
    if (!existing) {
      return null;
    }

    const fixture = getSyntheticCases().find((caseItem) => caseItem.id === caseId);
    const resetCase =
      fixture ??
      (existing.source === "web_form"
        ? {
            ...existing,
            status: "pending" as const,
            risk:
              existing.category === "Reclamación administrativa"
                ? ("high" as const)
                : existing.category === "Reembolso"
                  ? ("medium" as const)
                  : ("low" as const),
            confidence: 0.86,
            draftResponse: "",
            analysis: undefined,
            review: undefined,
            requiresHumanReview: existing.documents.some(
              (document) => document.status === "missing",
            ),
            auditEvents: existing.auditEvents.filter(
              (event) => event.type === "intake_received",
            ),
          }
        : existing);

    await this.updateCase(resetCase);
    return resetCase;
  }

  async resetDemo(): Promise<SyntheticCase[]> {
    const result = await this.supabase
      .from<DatabaseCaseRow>("cases")
      .delete()
      .eq("owner_id", this.ownerId)
      .order("received_at", { ascending: false });
    assertNoError(result, "No se pudo reiniciar la demo");
    return this.seedFixtures();
  }

  async seedIfEmpty(): Promise<SyntheticCase[]> {
    const cases = await this.listCases();
    if (cases.length > 0) {
      return cases;
    }

    return this.seedFixtures();
  }

  private async seedFixtures(): Promise<SyntheticCase[]> {
    const fixtures = getSyntheticCases();
    await Promise.all(fixtures.map((caseItem) => this.createCase(caseItem)));
    return this.listCases();
  }

  private async persistCase(caseItem: SyntheticCase) {
    const result = await this.supabase
      .from<DatabaseCaseRow>("cases")
      .upsert(caseToDatabaseRow(caseItem, this.ownerId));
    assertNoError(result, "No se pudo guardar el expediente");
  }

  private async insertAuditEvents(caseItem: SyntheticCase) {
    const rows: DatabaseAuditEventRow[] = caseItem.auditEvents.map((event) =>
      auditEventToDatabaseRow(event, this.ownerId, caseItem.id),
    );

    if (rows.length === 0) {
      return;
    }

    const result = await this.supabase.from("audit_events").insert(rows);
    assertNoError(result, "No se pudo guardar la auditoria");
  }

  private async insertHumanReview(caseItem: SyntheticCase) {
    const row: DatabaseHumanReviewRow | null = humanReviewToDatabaseRow(
      caseItem,
      this.ownerId,
    );
    if (!row) {
      return;
    }

    const result = await this.supabase.from("human_reviews").insert(row);
    assertNoError(result, "No se pudo guardar la revision humana");
  }

  private async completeWorkflowRun(caseItem: SyntheticCase) {
    if (!caseItem.analysis) {
      return;
    }

    const workflowRun: DatabaseWorkflowRunRow = workflowRunToDatabaseRow(
      caseItem,
      caseItem,
      this.ownerId,
    );
    const result = await this.supabase.from("workflow_runs").insert(workflowRun);
    assertNoError(result, "No se pudo registrar la ejecucion del workflow");
  }
}
