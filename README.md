# SaludFlow OSS

Agente administrativo sanitario open source con supervisión humana, datos sintéticos y trazabilidad completa.

> **Estado:** demo funcional con formulario web, workflow determinista, revisión humana simulada y foundation opcional de Supabase.
> **Uso:** demostrador tecnológico y portfolio profesional.  
> **Restricción:** no está diseñado para diagnóstico, tratamiento, decisiones clínicas ni procesamiento de expedientes sanitarios reales.

## Objetivo

SaludFlow OSS demuestra cómo automatizar de forma segura tareas administrativas sanitarias simuladas:

- recepción de solicitudes sintéticas mediante formulario web;
- clasificación de solicitudes;
- extracción estructurada de datos;
- comprobación de documentación;
- consulta de procedimientos ficticios;
- generación de borradores;
- evaluación de riesgo y confianza simulada;
- revisión humana cuando corresponde;
- registro de auditoría;
- métricas locales de la demo.

## Qué puedes probar

1. Abre `/solicitud`.
2. Completa una solicitud ficticia o usa un preset.
3. Revisa la vista previa.
4. Confirma el envío.
5. Abre el expediente creado o vuelve a `/demo`.
6. Filtra la bandeja por origen `Formulario web`.
7. Ejecuta el análisis determinista del expediente.
8. Registra una decisión humana simulada si el caso lo requiere.

El expediente se guarda en `localStorage` en modo local o en Supabase cuando `NEXT_PUBLIC_DEMO_MODE=false`, aparece al inicio de `/demo` y puede procesarse con el workflow existente.

## Rutas disponibles

- `/`: landing profesional con aviso de alcance.
- `/solicitud`: formulario público para crear solicitudes sintéticas.
- `/demo`: bandeja interactiva con filtros, búsqueda, métricas y reinicio de demo.
- `/demo/cases/[id]`: expediente sintético con análisis determinista, revisión humana y audit log.
- `/architecture`: arquitectura actual y componentes futuros.
- `/api/health`: health check JSON sin caché.

## Arquitectura actual

- Next.js App Router con TypeScript estricto.
- Tailwind CSS.
- Datos sintéticos versionados en `src/data/synthetic-cases.ts`.
- Modelo de dominio en `src/domain/types.ts`.
- Validación del formulario en `src/domain/validate-web-form.ts`.
- Creación de expedientes web en `src/domain/web-form-intake.ts`.
- Workflow determinista en `src/domain/process-case.ts`.
- Persistencia local en `src/lib/demo-storage.ts`.
- Repositorio de expedientes en `src/lib/repositories`.
- Clientes Supabase SSR/browser en `src/lib/supabase`.
- Migración SQL en `supabase/migrations`.
- Tests unitarios con Vitest.

## Flujo del canal web

```text
Formulario
        ↓
Validación y vista previa
        ↓
Confirmación
        ↓
Expediente canónico
        ↓
Repositorio local o Supabase
        ↓
Bandeja /demo
        ↓
Workflow determinista
        ↓
Revisión humana simulada
```

## Datos sintéticos

Usa únicamente datos ficticios. No introduzcas nombres reales, documentos de identidad, información clínica, teléfonos, direcciones, correos reales ni datos de contacto reales.

Los expedientes de semilla usan `source: "seed_fixture"`. Los expedientes creados desde `/solicitud` usan `source: "web_form"`.

## Persistencia

La demo guarda el estado en `localStorage` bajo una clave local del navegador por defecto. Si se activa Supabase, usa sesión anónima, RLS por propietario y tablas `cases`, `workflow_runs`, `audit_events` y `human_reviews`.

Para reiniciar:

- usa `Reiniciar demo` en `/demo`;
- usa `Reiniciar caso` dentro de un expediente;
- o borra manualmente la clave `saludflow-oss-demo-state-v1` de `localStorage`.

## Supabase foundation

Se añadieron `@supabase/supabase-js` y `@supabase/ssr` para soportar un backend opcional. No se usa `@supabase/auth-helpers-nextjs`.

Variables públicas:

```env
NEXT_PUBLIC_DEMO_MODE=true
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=
```

Para probar Supabase, activa `NEXT_PUBLIC_DEMO_MODE=false`, configura un proyecto de demostración, habilita usuarios anónimos y aplica la migración local. No uses claves `service_role` ni claves secretas en variables `NEXT_PUBLIC_`.

Consulta [docs/SUPABASE_SETUP.md](docs/SUPABASE_SETUP.md).

## Limitaciones actuales

No está implementado todavía:

- email real;
- Gmail, IMAP o webhooks;
- IA;
- RAG;
- embeddings;
- adjuntos reales;
- notificaciones;
- analytics;
- datos personales o clínicos.

El canal email queda previsto para una fase futura: `email → análisis con IA → normalización → expediente canónico`. Supabase ya tiene foundation local, pero no se ha conectado a un proyecto remoto desde este repositorio.

## Requisitos previos

- Node.js 20.9 o superior.
- npm.

## Instalación

```bash
npm install
```

La demo local no necesita secretos ni servicios externos. Si pruebas Supabase, crea `.env.local` con valores públicos de un proyecto de demostración y mantén fuera del repositorio cualquier secreto.

## Ejecución local

```bash
npm run dev
```

## Comandos de calidad

```bash
npm run lint
npm run typecheck
npm test
npm run build
```

## Principios de diseño

1. **Human-in-the-Loop:** ninguna acción sensible o irreversible se ejecuta sin validación humana.
2. **Datos sintéticos:** la demo pública no utiliza información clínica ni datos personales reales.
3. **Trazabilidad:** cada decisión, herramienta, fuente y revisión queda registrada.
4. **Arquitectura modular:** proveedor de IA, base de datos y componentes sustituibles.
5. **Evaluación continua:** cada versión se valida contra un conjunto de casos sintéticos.
6. **Open source:** código, documentación, evaluaciones y decisiones arquitectónicas públicas.

## Roadmap resumido

- [x] Foundation Next.js.
- [x] Workflow determinista local.
- [x] Canal web de recepción sintética.
- [x] Supabase foundation, migración y RLS.
- [ ] Canal email normalizado.
- [ ] Proveedor de IA configurable.
- [ ] RAG sobre procedimientos.
- [ ] Human-in-the-Loop real y persistente.
- [ ] Evaluaciones y dashboard de KPIs.
- [ ] Publicación v1.0.0.

## Documentación

- [PRD técnico y funcional](docs/PRD_SaludFlow_OSS_Tecnico_Funcional.docx)
- [Configuración inicial de GitHub](docs/GITHUB_SETUP.md)
- [Política de seguridad](SECURITY.md)
- [Reglas para agentes de desarrollo](AGENTS.md)

## Seguridad y privacidad

- No subir datos reales.
- No incluir claves API en el repositorio.
- No registrar prompts o respuestas con datos sensibles.
- No usar la aplicación para decisiones clínicas.
- No desplegar sin autenticación rutas futuras de revisión y administración.
- Reportar vulnerabilidades según [SECURITY.md](SECURITY.md).

## Licencia

Apache License 2.0. Consulta [LICENSE](LICENSE).
