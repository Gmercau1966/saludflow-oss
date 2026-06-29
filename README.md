# SaludFlow OSS

Agente administrativo sanitario open source con supervisión humana, datos sintéticos y trazabilidad completa.

> **Estado:** foundation técnica y visual con Next.js.
> **Uso:** demostrador tecnológico y portfolio profesional.  
> **Restricción:** no está diseñado para diagnóstico, tratamiento, decisiones clínicas ni procesamiento de expedientes sanitarios reales.

## Objetivo

SaludFlow OSS demuestra cómo automatizar de forma segura tareas administrativas sanitarias simuladas:

- clasificación de solicitudes;
- extracción estructurada de datos;
- comprobación de documentación;
- consulta de procedimientos;
- generación de borradores;
- evaluación de riesgo y confianza;
- revisión humana obligatoria cuando corresponde;
- registro de auditoría;
- medición de calidad, eficiencia y ROI.

La foundation actual solo implementa la base visual, rutas iniciales, fixtures sintéticos locales y pruebas unitarias básicas.

## Principios de diseño

1. **Human-in-the-Loop:** ninguna acción sensible o irreversible se ejecuta sin validación humana.
2. **Datos sintéticos:** la demo pública no utiliza información clínica ni datos personales reales.
3. **Trazabilidad:** cada decisión, herramienta, fuente y revisión debe poder quedar registrada en fases futuras.
4. **Arquitectura modular:** proveedor de IA, base de datos y componentes sustituibles.
5. **Evaluación continua:** cada versión se valida contra casos sintéticos.
6. **Open source:** código, documentación, evaluaciones y decisiones arquitectónicas públicas.

## Requisitos previos

- Node.js 20.9 o superior.
- npm.

## Instalación

```bash
npm install
```

No crees `.env.local` para esta iteración. La foundation no necesita secretos ni servicios externos.

## Ejecución local

```bash
npm run dev
```

Rutas disponibles:

- `/`: landing profesional con aviso de alcance.
- `/demo`: bandeja simulada con expedientes sintéticos locales.
- `/architecture`: arquitectura objetivo, separando presente y futuro.
- `/api/health`: health check JSON sin caché.

## Comandos de calidad

```bash
npm run lint
npm run typecheck
npm test
npm run build
```

## Arquitectura objetivo

- **Frontend y backend:** Next.js App Router + TypeScript.
- **Despliegue:** Vercel Hobby.
- **Base de datos y autenticación:** Supabase Free en fases futuras.
- **IA:** proveedor configurable y modo Replay en fases futuras.
- **Búsqueda semántica:** PostgreSQL + pgvector en fases futuras.
- **Pruebas:** Vitest ahora; Playwright queda para fases posteriores.
- **CI/CD:** GitHub + Vercel Preview Deployments en fases posteriores.
- **Licencia:** Apache-2.0.

## Alcance de esta foundation

- Next.js App Router con estructura `src/`.
- TypeScript estricto.
- Tailwind CSS.
- ESLint.
- Alias `@/*`.
- Componentes reutilizables de layout, badges, avisos, tarjetas y diagrama.
- Datos sintéticos locales en `src/data/synthetic-cases.ts`.
- Health check en `/api/health`.
- Tests iniciales con Vitest.

## Limitaciones actuales

No está implementado todavía:

- Supabase;
- autenticación;
- base de datos;
- almacenamiento;
- IA;
- RAG;
- embeddings;
- workflows persistentes;
- aprobación humana real;
- dashboard de métricas;
- analítica externa;
- formularios que envíen información.

## Flujo funcional objetivo

```text
Solicitud sintética
        ↓
Clasificación
        ↓
Extracción de datos
        ↓
Validación documental
        ↓
Consulta de procedimientos
        ↓
Generación de borrador
        ↓
Evaluación de riesgo y confianza
        ↓
Revisión humana si corresponde
        ↓
Auditoría, métricas y cierre
```

## Estructura inicial

```text
saludflow-oss/
├── README.md
├── LICENSE
├── SECURITY.md
├── AGENTS.md
├── .gitignore
├── .env.example
├── package.json
├── src/
│   ├── app/
│   ├── components/
│   ├── data/
│   └── lib/
├── tests/
├── docs/
├── scripts/
└── .github/
```

## Datos sintéticos

Todos los expedientes incluidos son fixtures locales y están marcados con `synthetic: true`. No contienen DNI, números de historia clínica, direcciones, datos clínicos ni información administrativa real.

Las puntuaciones de confianza son valores de demostración entre `0` y `1`; no proceden de un modelo real.

## Roadmap resumido

- [x] Fase 1 — Foundation Next.js, rutas iniciales, fixtures y tests básicos.
- [ ] Fase 2 — CI, documentación ampliada y smoke tests.
- [ ] Fase 3 — Supabase, migraciones y RLS.
- [ ] Fase 4 — Expedientes sintéticos persistidos sin IA.
- [ ] Fase 5 — Clasificación y extracción estructurada.
- [ ] Fase 6 — RAG sobre procedimientos.
- [ ] Fase 7 — Human-in-the-Loop.
- [ ] Fase 8 — Auditoría y gobernanza.
- [ ] Fase 9 — Evaluaciones y regresiones.
- [ ] Fase 10 — Dashboard de KPIs y ROI.
- [ ] Fase 11 — Publicación v1.0.0.

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

## Próximos pasos

1. Revisar visualmente `/`, `/demo`, `/architecture` y `/api/health`.
2. Añadir CI de lint, typecheck, tests y build.
3. Definir documentación técnica en Markdown para arquitectura y threat model.
4. Preparar el siguiente slice sin introducir datos reales ni integraciones externas.

## Licencia

Apache License 2.0. Consulta [LICENSE](LICENSE).
