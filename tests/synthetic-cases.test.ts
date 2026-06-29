import { describe, expect, it } from "vitest";
import {
  getSyntheticCases,
  validateConfidence,
} from "../src/data/synthetic-cases";

describe("synthetic cases", () => {
  it("contiene expedientes sintéticos válidos", () => {
    const cases = getSyntheticCases();
    const ids = new Set(cases.map((caseItem) => caseItem.id));

    expect(cases.length).toBeGreaterThanOrEqual(4);
    expect(ids.size).toBe(cases.length);

    cases.forEach((caseItem) => {
      expect(caseItem.synthetic).toBe(true);
      expect(validateConfidence(caseItem.confidence)).toBe(true);
      expect(caseItem.id.trim()).not.toBe("");
      expect(caseItem.subject.trim()).not.toBe("");
      expect(caseItem.category.trim()).not.toBe("");
      expect(caseItem.status.trim()).not.toBe("");
      expect(caseItem.risk.trim()).not.toBe("");
      expect(caseItem.receivedAt.trim()).not.toBe("");
      expect(caseItem.originalText.trim()).not.toBe("");
      expect(caseItem.auditEvents.length).toBeGreaterThan(0);
    });
  });
});
