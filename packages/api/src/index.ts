/**
 * @pulso/api — API común de Pulso Nutricional.
 *
 * Placeholder de MC-1. Este archivo NO levanta ningún servidor y NO define
 * endpoints. No hay Fastify, ni rutas, ni autenticación, ni acceso a base de
 * datos. Es solo un export mínimo para dejar el paquete preparado.
 *
 * Decisiones de stack (ver docs/decisiones/0002-estructura-tecnica-inicial.md):
 *  - El servidor se construirá con Fastify en MC-2 (API mínima con healthcheck).
 *  - El acceso a Postgres (vía Prisma) queda pendiente; en MC-1 no se conecta
 *    ninguna base de datos ni se crean migraciones.
 *
 * Regla central que la API deberá garantizar cuando exista:
 *  - Separar siempre datos REVISABLES (paciente) de datos VALIDADOS (profesional).
 *  - Nunca promover automáticamente un dato revisable a validado.
 */

/** Marca de versión del paquete de API. Sin servidor ni endpoints todavía. */
export const API_PACKAGE_VERSION = "0.0.0-mc1";
