# Política de seguridad

## Alcance

SaludFlow OSS es un demostrador tecnológico. No debe utilizarse para:

- decisiones clínicas;
- diagnóstico, tratamiento o triaje;
- procesamiento de historias clínicas;
- tramitación de expedientes sanitarios reales;
- decisiones administrativas que afecten derechos sin revisión humana;
- almacenamiento de datos personales o sensibles en la demo pública.

## Versiones mantenidas

Mientras el proyecto se encuentre antes de `v1.0.0`, solo se mantiene la rama `main`.

## Reporte de vulnerabilidades

No publiques vulnerabilidades en un issue público.

Envía un reporte privado al mantenedor del proyecto e incluye:

1. descripción del problema;
2. pasos para reproducirlo;
3. impacto potencial;
4. archivos o rutas afectadas;
5. propuesta de corrección, si existe.

El objetivo inicial es confirmar la recepción en un máximo de siete días.

## Datos y secretos

- Nunca subir archivos `.env`.
- Nunca incluir claves API, tokens o credenciales.
- Usar exclusivamente datos sintéticos.
- No registrar contenido sensible en logs.
- No copiar datos reales a issues, pull requests, capturas o evaluaciones.
- Rotar inmediatamente cualquier secreto expuesto.

## Requisitos para contribuciones

Toda contribución que afecte autenticación, autorización, RLS, prompts, herramientas del agente o auditoría debe incluir:

- pruebas;
- análisis de impacto;
- escenarios de abuso;
- actualización de documentación;
- confirmación de que no introduce datos reales.

## Limitación

La existencia de esta política no convierte el proyecto en un sistema certificado para uso sanitario o administrativo real.
