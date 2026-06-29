# SaludFlow OSS

Agente administrativo sanitario open source con supervisión humana, datos sintéticos y trazabilidad completa.

> **Estado:** workflow local funcional con Next.js.
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

La versión actual implementa un primer slice vertical local: bandeja de expedientes, análisis determinista, revisión humana simulada, audit log local, métricas y persistencia en `localStorage`.

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
- `/demo`: bandeja interactiva con filtros, búsqueda, métricas y reinicio de demo.
- `/demo/cases/[id]`: expediente sintético con análisis determinista, revisión humana y audit log.
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

## Alcance actual

- Next.js App Router con estructura `src/`.
- TypeScript estricto.
- Tailwind CSS.
- ESLint.
- Alias `@/*`.
- Componentes reutilizables de layout, badges, avisos, tarjetas y diagrama.
- Datos sintéticos locales en `src/data/synthetic-cases.ts`.
- Workflow determinista en `src/domain/process-case.ts`.
- Persistencia local en `localStorage`.
- Bandeja con filtros reales por estado, riesgo, texto y orden por fecha.
- Página de expediente con solicitud original, datos extraídos, documentación, procedimiento ficticio, resultado del análisis, borrador editable y revisión humana.
- Audit log local con eventos estructurados.
- Dashboard local calculado desde fixtures.
- Health check en `/api/health`.
- Tests unitarios con Vitest.

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
- dashboard de métricas conectado a datos reales;
- analítica externa;
- formularios que envíen información.

También sigue siendo simulado:

- la clasificación;
- la extracción de datos;
- la confianza;
- el cálculo de riesgo;
- los procedimientos;
- los tiempos administrativos;
- la revisión humana.

Todo se calcula a partir de fixtures locales y reglas deterministas. No hay llamadas externas.

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

## Qué puedes probar

1. Abrir `/demo`.
2. Filtrar por estado o riesgo.
3. Buscar por ID, asunto o categoría.
4. Ordenar por fecha.
5. Abrir un expediente.
6. Pulsar `Analizar expediente`.
7. Revisar reglas activadas, documentación faltante, borrador y audit log.
8. Registrar una decisión como `Usuario demo`.
9. Ver cómo cambian las métricas de la bandeja.

Para reiniciar:

- usa `Reiniciar caso` dentro de un expediente;
- usa `Reiniciar demo` en `/demo`;
- también puedes borrar manualmente la clave `saludflow-oss-demo-state-v1` de `localStorage`.

## Roadmap resumido

- [x] Fase 1 — Foundation Next.js, rutas iniciales, fixtures y tests básicos.
- [x] Fase 2 — Workflow local determinista, revisión humana simulada y dashboard local.
- [ ] Fase 3 — CI, documentación ampliada y smoke tests.
- [ ] Fase 4 — Supabase, migraciones y RLS.
- [ ] Fase 5 — Expedientes sintéticos persistidos sin IA.
- [ ] Fase 6 — Clasificación y extracción estructurada.
- [ ] Fase 7 — RAG sobre procedimientos.
- [ ] Fase 8 — Human-in-the-Loop real.
- [ ] Fase 9 — Auditoría y gobernanza persistente.
- [ ] Fase 10 — Evaluaciones y regresiones.
- [ ] Fase 11 — Dashboard de KPIs y ROI conectado.
- [ ] Fase 12 — Publicación v1.0.0.

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
