import { describe, expect, it } from "vitest";
import { ensureAnonymousSession } from "../src/lib/supabase/anonymous-session";
import type { SaludFlowSupabaseClient } from "../src/lib/supabase/client";

function authMock(sessionUserId: string | null, createdUserId = "anon-user-2") {
  let signInCalls = 0;
  return {
    client: {
      auth: {
        getSession: async () => ({
          data: { session: sessionUserId ? { user: { id: sessionUserId } } : null },
          error: null,
        }),
        signInAnonymously: async () => {
          signInCalls += 1;
          return { data: { user: { id: createdUserId } }, error: null };
        },
      },
    } as unknown as Pick<SaludFlowSupabaseClient, "auth">,
    get signInCalls() {
      return signInCalls;
    },
  };
}

describe("anonymous Supabase session", () => {
  it("reutiliza una sesion anonima existente", async () => {
    const mock = authMock("anon-user-1");
    const result = await ensureAnonymousSession(mock.client);

    expect(result).toEqual({ ok: true, userId: "anon-user-1", wasCreated: false });
    expect(mock.signInCalls).toBe(0);
  });

  it("crea una sesion anonima si no existe", async () => {
    const mock = authMock(null);
    const result = await ensureAnonymousSession(mock.client);

    expect(result).toEqual({ ok: true, userId: "anon-user-2", wasCreated: true });
    expect(mock.signInCalls).toBe(1);
  });

  it("devuelve error seguro si no puede leer la sesion", async () => {
    const client = {
      auth: {
        getSession: async () => ({ data: { session: null }, error: new Error("x") }),
        signInAnonymously: async () => ({ data: { user: null }, error: null }),
      },
    } as unknown as Pick<SaludFlowSupabaseClient, "auth">;

    await expect(ensureAnonymousSession(client)).resolves.toEqual({
      ok: false,
      message: "No se pudo leer la sesion anonima.",
    });
  });
});
