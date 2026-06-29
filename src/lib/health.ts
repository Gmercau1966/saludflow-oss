export const healthPayload = {
  status: "ok",
  service: "saludflow-oss",
  mode: "foundation",
} as const;

export function getHealthPayload() {
  return healthPayload;
}
