"use client";

import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { getRuntimeMode, isSupabaseConfigured, type RuntimeMode } from "@/lib/env";
import { ensureAnonymousSession } from "@/lib/supabase/anonymous-session";
import {
  createClient,
  type SaludFlowSupabaseClient,
} from "@/lib/supabase/client";

type SessionStatus = "ready" | "loading" | "error";

type AnonymousSessionContextValue = {
  mode: RuntimeMode;
  status: SessionStatus;
  userId: string | null;
  supabase: SaludFlowSupabaseClient | null;
  message: string;
  retry(): void;
};

const AnonymousSessionContext =
  createContext<AnonymousSessionContextValue | null>(null);

export function AnonymousSessionProvider({ children }: { children: ReactNode }) {
  const [attempt, setAttempt] = useState(0);
  const [status, setStatus] = useState<SessionStatus>("loading");
  const [userId, setUserId] = useState<string | null>(null);
  const [message, setMessage] = useState("");
  const mode = getRuntimeMode();
  const supabase = useMemo(
    () => (mode === "supabase" && isSupabaseConfigured() ? createClient() : null),
    [mode],
  );

  useEffect(() => {
    let cancelled = false;

    async function startSession() {
      if (mode === "local") {
        setStatus("ready");
        setMessage("Modo local activo. Los expedientes se guardan en este navegador.");
        return;
      }

      if (!supabase) {
        setStatus("error");
        setMessage("Supabase no esta configurado para iniciar la demo.");
        return;
      }

      setStatus("loading");
      const result = await ensureAnonymousSession(supabase);
      if (cancelled) {
        return;
      }

      if (!result.ok) {
        setStatus("error");
        setMessage(result.message);
        return;
      }

      setUserId(result.userId);
      setStatus("ready");
      setMessage(
        result.wasCreated
          ? "Sesion anonima de demostracion creada."
          : "Sesion anonima de demostracion activa.",
      );
    }

    void startSession();

    return () => {
      cancelled = true;
    };
  }, [attempt, mode, supabase]);

  const value = useMemo<AnonymousSessionContextValue>(
    () => ({
      mode,
      status,
      userId,
      supabase,
      message,
      retry: () => setAttempt((current) => current + 1),
    }),
    [message, mode, status, supabase, userId],
  );

  return (
    <AnonymousSessionContext.Provider value={value}>
      {children}
    </AnonymousSessionContext.Provider>
  );
}

export function useAnonymousSession() {
  const context = useContext(AnonymousSessionContext);
  if (!context) {
    throw new Error("useAnonymousSession debe usarse dentro de AnonymousSessionProvider.");
  }

  return context;
}
