import { describe, expect, it } from "vitest";
import { getSyntheticCases } from "../src/data/synthetic-cases";
import { processCase } from "../src/domain/process-case";
import {
  createInitialDemoState,
  parseDemoState,
  resetCaseInState,
  serializeDemoState,
} from "../src/lib/demo-storage";

describe("demo local persistence", () => {
  it("recupera estado seguro si localStorage contiene JSON inválido", () => {
    const state = parseDemoState("{bad-json");

    expect(state.cases.length).toBeGreaterThanOrEqual(5);
    expect(state.storageVersion).toBe(1);
  });

  it("serializa y recupera casos sintéticos válidos", () => {
    const state = createInitialDemoState();
    const parsed = parseDemoState(serializeDemoState(state));

    expect(parsed.cases.length).toBe(state.cases.length);
    expect(parsed.cases.every((caseItem) => caseItem.synthetic)).toBe(true);
  });

  it("reinicia un expediente a su fixture original", () => {
    const initial = createInitialDemoState();
    const processed = processCase(getSyntheticCases()[0]);
    const modifiedState = {
      ...initial,
      cases: initial.cases.map((caseItem) =>
        caseItem.id === processed.id ? processed : caseItem,
      ),
    };
    const reset = resetCaseInState(modifiedState, processed.id);
    const resetCase = reset.cases.find((caseItem) => caseItem.id === processed.id);

    expect(resetCase?.status).toBe("pending");
    expect(resetCase?.draftResponse).toBe("");
  });
});
