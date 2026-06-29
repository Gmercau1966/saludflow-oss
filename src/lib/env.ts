export type RuntimeMode = "local" | "supabase";

type PublicEnv = {
  appName: string;
  demoMode: boolean;
  supabaseUrl?: string;
  supabasePublishableKey?: string;
};

function optionalTrimmed(value: string | undefined): string | undefined {
  const trimmed = value?.trim();
  return trimmed ? trimmed : undefined;
}

function isProbablySecretKey(value: string): boolean {
  const lowered = value.toLowerCase();
  return lowered.includes("service_role") || lowered.includes("secret");
}

export function getPublicEnv(): PublicEnv {
  const supabasePublishableKey = optionalTrimmed(
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY,
  );

  if (supabasePublishableKey && isProbablySecretKey(supabasePublishableKey)) {
    throw new Error(
      "La clave publica de Supabase no puede contener una clave secreta o service_role.",
    );
  }

  return {
    appName: optionalTrimmed(process.env.NEXT_PUBLIC_APP_NAME) ?? "SaludFlow OSS",
    demoMode: process.env.NEXT_PUBLIC_DEMO_MODE !== "false",
    supabaseUrl: optionalTrimmed(process.env.NEXT_PUBLIC_SUPABASE_URL),
    supabasePublishableKey,
  };
}

export function isSupabaseConfigured(): boolean {
  const env = getPublicEnv();
  return Boolean(env.supabaseUrl && env.supabasePublishableKey);
}

export function getRuntimeMode(): RuntimeMode {
  return getPublicEnv().demoMode ? "local" : "supabase";
}

export function assertSupabaseConfigured(): {
  supabaseUrl: string;
  supabasePublishableKey: string;
} {
  const env = getPublicEnv();

  if (!env.supabaseUrl || !env.supabasePublishableKey) {
    throw new Error(
      "Supabase no esta configurado. Revisa NEXT_PUBLIC_SUPABASE_URL y NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY.",
    );
  }

  return {
    supabaseUrl: env.supabaseUrl,
    supabasePublishableKey: env.supabasePublishableKey,
  };
}
