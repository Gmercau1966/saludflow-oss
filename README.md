# SaludFlow OSS

Agente administrativo sanitario open source con supervisión humana, datos sintéticos y trazabilidad completa.

> **Estado:** fase de diseño y scaffolding.  
> **Uso:** demostrador tecnológico y portfolio profesional.  
> **Restricción:** no está diseñado para diagnóstico, tratamiento, decisiones clínicas ni procesamiento de expedientes sanitarios reales.

## Objetivo

SaludFlow OSS automatiza de forma segura tareas administrativas simuladas de un servicio de salud:

- clasificación de solicitudes;
- extracción estructurada de datos;
- comprobación de documentación;
- consulta de procedimientos;
- generación de borradores;
- evaluación de riesgo y confianza;
- revisión humana obligatoria cuando corresponde;
- registro de auditoría;
- medición de calidad, eficiencia y ROI.

## Principios de diseño

1. **Human-in-the-Loop:** ninguna acción sensible o irreversible se ejecuta sin validación humana.
2. **Datos sintéticos:** la demo pública no utiliza información clínica ni datos personales reales.
3. **Trazabilidad:** cada decisión, herramienta, fuente y revisión queda registrada.
4. **Arquitectura modular:** proveedor de IA, base de datos y componentes sustituibles.
5. **Evaluación continua:** cada versión se valida contra un conjunto de casos sintéticos.
6. **Open source:** código, documentación, evaluaciones y decisiones arquitectónicas públicas.

## Arquitectura objetivo

- **Frontend y backend:** Next.js + TypeScript
- **Despliegue:** Vercel Hobby
- **Base de datos y autenticación:** Supabase Free
- **IA:** proveedor configurable; modo Replay sin consumo de API
- **Búsqueda semántica:** PostgreSQL + pgvector
- **Pruebas:** Vitest + Playwright
- **CI/CD:** GitHub + Vercel Preview Deployments
- **Licencia:** Apache-2.0

## Flujo funcional

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
├── docs/
│   ├── PRD_SaludFlow_OSS_Tecnico_Funcional.docx
│   └── GITHUB_SETUP.md
├── scripts/
│   ├── setup-labels.sh
│   └── setup-labels.ps1
└── .github/
    └── ISSUE_TEMPLATE/
        ├── bug.yml
        └── feature.yml
```

## Roadmap resumido

- [ ] Fase 1 — Repositorio, documentación y CI básico
- [ ] Fase 2 — Scaffolding Next.js
- [ ] Fase 3 — Supabase, migraciones y RLS
- [ ] Fase 4 — Expedientes sintéticos sin IA
- [ ] Fase 5 — Clasificación y extracción estructurada
- [ ] Fase 6 — RAG sobre procedimientos
- [ ] Fase 7 — Human-in-the-Loop
- [ ] Fase 8 — Auditoría y gobernanza
- [ ] Fase 9 — Evaluaciones y regresiones
- [ ] Fase 10 — Dashboard de KPIs y ROI
- [ ] Fase 11 — Publicación v1.0.0

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
- No desplegar sin autenticación las rutas de revisión y administración.
- Reportar vulnerabilidades según [SECURITY.md](SECURITY.md).

## Licencia

Apache License 2.0. Consulta [LICENSE](LICENSE).
