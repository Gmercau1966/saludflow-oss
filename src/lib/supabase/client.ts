"use client";

import { createBrowserClient } from "@supabase/ssr";
import type { SupabaseClient } from "@supabase/supabase-js";
import { assertSupabaseConfigured } from "@/lib/env";

export type SaludFlowSupabaseClient = SupabaseClient;

export function createClient(): SaludFlowSupabaseClient {
  const { supabaseUrl, supabasePublishableKey } = assertSupabaseConfigured();
  return createBrowserClient(supabaseUrl, supabasePublishableKey);
}
