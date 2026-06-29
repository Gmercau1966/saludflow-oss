# Supabase foundation

Esta iteracion incorpora una foundation opcional de Supabase para persistir la demo con usuarios anonimos y RLS.

## Modo por defecto

El modo local sigue activo por defecto:

```env
NEXT_PUBLIC_DEMO_MODE=true
```

En este modo la demo usa `localStorage` y no abre sesiones, cookies ni llamadas a Supabase.

## Activar modo Supabase

1. Crea un proyecto Supabase de demostracion.
2. Activa el proveedor de usuarios anonimos en Auth.
3. Copia valores publicos en `.env.local`:

```env
NEXT_PUBLIC_DEMO_MODE=false
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=
```

No uses claves `service_role`, claves secretas ni variables no publicas en el cliente.

## Migracion

La migracion local esta en:

```text
supabase/migrations/20260629173052_saludflow_foundation.sql
```

Define:

- `cases`;
- `workflow_runs`;
- `audit_events`;
- `human_reviews`;
- RLS por `owner_id`;
- permisos explicitos para `authenticated`;
- revocacion de acceso para `anon`.

No se ha ejecutado `supabase link`, `supabase db push` ni ninguna operacion remota desde este slice.

## Limitaciones

- No hay email real.
- No hay IA.
- No hay adjuntos reales.
- No hay datos personales ni clinicos.
- La revision humana sigue siendo una simulacion de demo.
- La auditoria y las revisiones son append-only a nivel de permisos.
