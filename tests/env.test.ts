import { afterEach, describe, expect, it, vi } from "vitest";
import {
  assertSupabaseConfigured,
  getPublicEnv,
  getRuntimeMode,
  isSupabaseConfigured,
} from "../src/lib/env";

describe("public environment", () => {
  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it("usa modo local por defecto", () => {
    vi.stubEnv("NEXT_PUBLIC_DEMO_MODE", undefined);

    expect(getRuntimeMode()).toBe("local");
  });

  it("activa modo Supabase solo cuando demo mode es false", () => {
    vi.stubEnv("NEXT_PUBLIC_DEMO_MODE", "false");

    expect(getRuntimeMode()).toBe("supabase");
  });

  it("detecta configuracion Supabase completa", () => {
    vi.stubEnv("NEXT_PUBLIC_SUPABASE_URL", "https://demo.supabase.co");
    vi.stubEnv("NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY", "sb_publishable_demo");

    expect(isSupabaseConfigured()).toBe(true);
  });

  it("rechaza claves con aspecto de service_role en variables publicas", () => {
    vi.stubEnv("NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY", "service_role_fake");

    expect(() => getPublicEnv()).toThrow("service_role");
  });

  it("falla de forma explicita si Supabase no esta configurado", () => {
    vi.stubEnv("NEXT_PUBLIC_SUPABASE_URL", "");
    vi.stubEnv("NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY", "");

    expect(() => assertSupabaseConfigured()).toThrow("Supabase no esta configurado");
  });
});
