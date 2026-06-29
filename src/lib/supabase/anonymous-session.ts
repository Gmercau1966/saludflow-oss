import type { SaludFlowSupabaseClient } from "@/lib/supabase/client";

export type AnonymousSessionResult =
  | { ok: true; userId: string; wasCreated: boolean }
  | { ok: false; message: string };

export async function ensureAnonymousSession(
  supabase: Pick<SaludFlowSupabaseClient, "auth">,
): Promise<AnonymousSessionResult> {
  const currentSession = await supabase.auth.getSession();
  if (currentSession.error) {
    return { ok: false, message: "No se pudo leer la sesion anonima." };
  }

  const existingUserId = currentSession.data.session?.user.id;
  if (existingUserId) {
    return { ok: true, userId: existingUserId, wasCreated: false };
  }

  const newSession = await supabase.auth.signInAnonymously();
  if (newSession.error || !newSession.data.user?.id) {
    return { ok: false, message: "No se pudo crear la sesion anonima." };
  }

  return { ok: true, userId: newSession.data.user.id, wasCreated: true };
}
