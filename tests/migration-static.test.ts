import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const migration = readFileSync(
  "supabase/migrations/20260629173052_saludflow_foundation.sql",
  "utf8",
);

describe("Supabase foundation migration", () => {
  it("crea las tablas base del slice", () => {
    expect(migration).toContain("create table public.cases");
    expect(migration).toContain("create table public.workflow_runs");
    expect(migration).toContain("create table public.audit_events");
    expect(migration).toContain("create table public.human_reviews");
  });

  it("activa RLS en todas las tablas expuestas", () => {
    for (const table of ["cases", "workflow_runs", "audit_events", "human_reviews"]) {
      expect(migration).toContain(`alter table public.${table} enable row level security`);
    }
  });

  it("autoriza por owner_id usando auth.uid", () => {
    expect(migration).toContain("to authenticated");
    expect(migration).toContain("using ((select auth.uid()) = owner_id)");
    expect(migration).toContain("with check ((select auth.uid()) = owner_id)");
  });

  it("no concede acceso a anon ni menciona service_role", () => {
    expect(migration).not.toMatch(/grant\s+.+\s+to\s+anon/i);
    expect(migration).not.toMatch(/service_role/i);
    expect(migration).toContain(
      "revoke all privileges on table public.cases\nfrom anon, authenticated",
    );
  });

  it("mantiene auditoria y revisiones sin permisos de update/delete", () => {
    expect(migration).toContain(
      "grant select, insert on table public.audit_events to authenticated",
    );
    expect(migration).toContain(
      "grant select, insert on table public.human_reviews to authenticated",
    );
    expect(migration).not.toMatch(
      /grant\s+select,\s*insert,\s*update.+public\.audit_events/i,
    );
    expect(migration).not.toMatch(
      /grant\s+select,\s*insert,\s*delete.+public\.audit_events/i,
    );
    expect(migration).not.toMatch(
      /grant\s+select,\s*insert,\s*update.+public\.human_reviews/i,
    );
    expect(migration).not.toMatch(
      /grant\s+select,\s*insert,\s*delete.+public\.human_reviews/i,
    );
  });

  it("usa claves foraneas compuestas por owner y expediente", () => {
    expect(migration).toContain(
      "foreign key (owner_id, case_id) references public.cases (owner_id, id)",
    );
  });

  it("acepta email como source reservado y guarda revision humana requerida", () => {
    expect(migration).toContain(
      "source text not null check (source in ('web_form', 'seed_fixture', 'email'))",
    );
    expect(migration).toContain("requires_human_review boolean not null");
  });

  it("indexa casos por riesgo y propietario", () => {
    expect(migration).toContain(
      "create index cases_owner_risk_idx on public.cases (owner_id, risk_level)",
    );
  });

  it("guarda snapshots de workflow y usa estado running", () => {
    expect(migration).toContain("input_snapshot jsonb not null");
    expect(migration).toContain("output_snapshot jsonb null");
    expect(migration).toContain(
      "status text not null check (status in ('running', 'completed', 'failed'))",
    );
    expect(migration).not.toContain("'started'");
  });

  it("usa defaults de fecha para auditoria y revisiones", () => {
    expect(migration).toContain("result jsonb null");
    expect(migration).toContain("created_at timestamptz not null default now()");
  });

  it("revoca privilegios explicitamente a authenticated antes de conceder", () => {
    for (const table of ["cases", "workflow_runs", "audit_events", "human_reviews"]) {
      expect(migration).toContain(
        `revoke all privileges on table public.${table}\nfrom anon, authenticated`,
      );
    }
  });

  it("concede solamente los grants minimos esperados", () => {
    expect(migration).toContain(
      "grant select, insert, update, delete on table public.cases to authenticated",
    );
    expect(migration).toContain(
      "grant select, insert, update on table public.workflow_runs to authenticated",
    );
    expect(migration).toContain(
      "grant select, insert on table public.audit_events to authenticated",
    );
    expect(migration).toContain(
      "grant select, insert on table public.human_reviews to authenticated",
    );
  });
});
