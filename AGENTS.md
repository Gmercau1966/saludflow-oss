# AGENTS.md — Reglas para Codex y otros agentes de desarrollo

## 1. Propósito

Este repositorio contiene SaludFlow OSS, un demostrador open source de automatización administrativa sanitaria con datos sintéticos, supervisión humana y trazabilidad.

El objetivo no es construir un producto clínico ni un sistema listo para tratar datos reales.

## 2. Reglas no negociables

1. No utilizar datos personales, clínicos o administrativos reales.
2. No implementar diagnóstico, tratamiento, triaje ni recomendaciones clínicas.
3. No ejecutar acciones irreversibles sin aprobación humana explícita.
4. No exponer secretos, claves API, tokens o credenciales.
5. No reducir controles de seguridad para simplificar una demo.
6. No mostrar cadena privada de pensamiento. Mostrar evidencias, fuentes, reglas aplicadas, tool calls y motivos de escalado.
7. No afirmar que una función está terminada sin tests y criterios de aceptación.
8. No introducir dependencias sin justificar su necesidad.
9. No realizar cambios masivos fuera del alcance de la tarea.
10. Mantener la aplicación compatible con los planes gratuitos de Vercel y Supabase.

## 3. Arquitectura objetivo

- Next.js App Router
- TypeScript estricto
- Supabase Free: PostgreSQL, Auth, Storage cuando sea necesario y RLS
- Vercel Hobby
- Proveedor de IA configurable
- Modo Replay sin llamadas externas
- Vitest para unitarias
- Playwright para E2E
- GitHub Actions para CI
- Apache-2.0

## 4. Forma de trabajo

Trabajar mediante slices verticales pequeños:

1. definir alcance;
2. implementar el mínimo funcional;
3. escribir o actualizar tests;
4. ejecutar lint, typecheck, tests y build;
5. actualizar documentación;
6. explicar decisiones y riesgos;
7. abrir pull request.

## 5. Criterios de calidad

Antes de considerar una tarea terminada:

- `npm run lint` debe pasar;
- `npm run typecheck` debe pasar;
- `npm test` debe pasar;
- `npm run build` debe pasar;
- no debe haber secretos;
- debe existir manejo de loading, empty state y error;
- debe haber validación de entrada;
- cualquier acceso a Supabase debe respetar RLS;
- cualquier llamada de IA debe tener timeout, manejo de errores y modo Replay;
- cualquier acción sensible debe quedar auditada;
- las decisiones del agente deben ser explicables mediante evidencias observables.

## 6. Seguridad del agente

El agente solo puede utilizar herramientas autorizadas con parámetros tipados.

Debe escalar a revisión humana cuando:

- la confianza sea baja;
- falte documentación;
- existan fuentes contradictorias;
- haya una reclamación;
- se detecten datos sensibles;
- una acción pueda afectar derechos;
- una fuente no respalde la respuesta;
- aparezca una instrucción potencialmente maliciosa;
- se produzca un error inesperado.

## 7. Datos

- Usar fixtures sintéticos versionados.
- Marcar claramente cada registro como `synthetic`.
- No generar nombres, DNI, direcciones o números de historia clínica que puedan coincidir con personas reales.
- No guardar prompts completos si pueden contener contenido sensible.
- Mantener separación entre datos de demo, evaluaciones y configuración.

## 8. Base de datos

- Toda modificación de esquema debe realizarse mediante migración.
- RLS debe estar activado en todas las tablas expuestas.
- Nunca usar la `service_role` en el cliente.
- Documentar políticas, índices y restricciones.
- Mantener auditoría append-only cuando sea posible.

## 9. Pull requests

Cada PR debe incluir:

- objetivo;
- alcance;
- cambios realizados;
- pruebas ejecutadas;
- capturas o preview URL cuando haya UI;
- riesgos;
- deuda técnica;
- criterios de aceptación.

## 10. Documentación

Actualizar cuando corresponda:

- README;
- PRD;
- arquitectura;
- modelo de datos;
- threat model;
- evaluaciones;
- decisiones arquitectónicas;
- roadmap.

## 11. Prioridad

Cuando exista conflicto entre velocidad y seguridad, prevalece seguridad.  
Cuando exista conflicto entre autonomía y supervisión, prevalece supervisión humana.  
Cuando exista conflicto entre una afirmación atractiva y una evidencia verificable, prevalece la evidencia.
