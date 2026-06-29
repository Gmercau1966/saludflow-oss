import type { DemoState } from "@/domain/types";

export function calculateDemoMetrics(state: DemoState) {
  const total = state.cases.length;
  const processed = state.cases.filter((caseItem) => caseItem.analysis).length;
  const completed = state.cases.filter((caseItem) =>
    ["approved", "completed"].includes(caseItem.status),
  ).length;
  const humanReview = state.cases.filter(
    (caseItem) => caseItem.requiresHumanReview || caseItem.status === "human_review",
  ).length;
  const highRisk = state.cases.filter((caseItem) => caseItem.risk === "high").length;
  const approvedWithoutEdit = state.cases.filter(
    (caseItem) => caseItem.review?.decision === "approve",
  ).length;
  const escalated = state.cases.filter(
    (caseItem) => caseItem.status === "escalated",
  ).length;
  const beforeMinutes = total * 18;
  const afterMinutes = processed * 7 + (total - processed) * 18;
  const savedHours = Math.max(0, (beforeMinutes - afterMinutes) / 60);

  return {
    total,
    pending: state.cases.filter((caseItem) => caseItem.status === "pending").length,
    humanReview,
    completed,
    highRisk,
    processed,
    humanReviewRate: total === 0 ? 0 : Math.round((humanReview / total) * 100),
    highRiskRate: total === 0 ? 0 : Math.round((highRisk / total) * 100),
    beforeMinutes,
    afterMinutes,
    savedHours,
    approvalWithoutEditRate:
      processed === 0 ? 0 : Math.round((approvedWithoutEdit / processed) * 100),
    escalationRate: total === 0 ? 0 : Math.round((escalated / total) * 100),
  };
}
