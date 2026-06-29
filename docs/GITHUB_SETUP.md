# Configuración inicial de GitHub

## 1. Crear el repositorio

Nombre recomendado:

```text
saludflow-oss
```

Configuración:

- Público.
- Sin README automático si vas a subir este starter pack.
- Sin licencia automática, porque ya se incluye Apache-2.0.
- Rama principal: `main`.

## 2. Subir los archivos

Desde la interfaz web:

1. Abre el repositorio.
2. Selecciona **Add file → Upload files**.
3. Arrastra el contenido de la carpeta `saludflow-oss-starter`, no el ZIP.
4. Escribe el commit:
   `chore: initialize repository governance and documentation`
5. Confirma en `main`.

Desde Git:

```bash
git clone https://github.com/TU_USUARIO/saludflow-oss.git
cd saludflow-oss
# Copiar aquí el contenido del starter pack
git add .
git commit -m "chore: initialize repository governance and documentation"
git push origin main
```

## 3. Crear labels

### Opción manual

Ve a:

```text
Issues → Labels → New label
```

Crea:

| Nombre | Color | Descripción |
|---|---|---|
| `feature` | `#1D76DB` | Nueva capacidad o mejora funcional |
| `security` | `#B60205` | Seguridad, privacidad, permisos o amenazas |
| `data` | `#5319E7` | Modelo de datos, migraciones, RLS o datasets |
| `ai` | `#7057FF` | Agente, prompts, modelos, tools o RAG |
| `eval` | `#0E8A16` | Evaluaciones, graders, métricas o regresiones |
| `docs` | `#0075CA` | Documentación y diagramas |
| `bug` | `#D73A4A` | Comportamiento incorrecto o regresión |

### Opción automática

Con GitHub CLI autenticado:

**Windows PowerShell**

```powershell
.\scripts\setup-labels.ps1
```

**macOS/Linux**

```bash
chmod +x scripts/setup-labels.sh
./scripts/setup-labels.sh
```

## 4. Crear Project Board

### Recomendación

Utiliza GitHub Projects con vista Board.

1. Ve al perfil u organización propietaria del repositorio.
2. Abre **Projects**.
3. Selecciona **New project**.
4. Elige **Board**.
5. Nombre: `SaludFlow OSS Delivery`.
6. Vincula el repositorio `saludflow-oss`.
7. Configura el campo `Status` con estas opciones:

```text
Backlog
Ready
In progress
Review
Done
```

8. Crea vistas adicionales:

- **Roadmap:** agrupada por milestone.
- **Security:** filtrada por `label:security`.
- **AI & Evals:** filtrada por `label:ai OR label:eval`.

## 5. Crear milestones

Recomendados:

```text
M0 — Repository foundation
M1 — Next.js foundation
M2 — Supabase and synthetic cases
M3 — Deterministic workflow
M4 — Agent and RAG
M5 — Human review and governance
M6 — Evals, dashboard and v1.0
```

## 6. Crear los primeros issues

### Issue 1

**Título:** `Initialize Next.js application`

Labels: `feature`, `docs`

Criterios:

- App Router.
- TypeScript estricto.
- Tailwind.
- Página principal.
- `/demo`.
- `/architecture`.
- `/api/health`.
- Lint, typecheck, tests y build.

### Issue 2

**Título:** `Define Supabase schema and RLS policies`

Labels: `data`, `security`

### Issue 3

**Título:** `Create synthetic case fixtures`

Labels: `data`, `eval`

### Issue 4

**Título:** `Implement deterministic case workflow`

Labels: `feature`, `data`

### Issue 5

**Título:** `Create threat model`

Labels: `security`, `docs`

## 7. Protección de la rama principal

En:

```text
Settings → Branches → Add branch protection rule
```

Para `main`:

- Require a pull request before merging.
- Require approvals: 1.
- Require status checks.
- Require conversation resolution.
- Do not allow force pushes.
- Do not allow deletions.

En un proyecto personal puedes activar estas reglas después de tener el primer workflow de CI.

## 8. Secrets

No guardes secretos en GitHub.

Cuando existan:

- Añádelos en Vercel Environment Variables.
- Usa `.env.local` solo localmente.
- Mantén `.env.example` sin valores reales.
- No utilices Supabase `service_role` en el navegador.
