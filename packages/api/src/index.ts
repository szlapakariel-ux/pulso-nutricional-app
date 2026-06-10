/**
 * @pulso/api — API común de Pulso Nutricional.
 *
 * Exporta buildApp para que quien importe el paquete pueda crear la app
 * sin levantarla automáticamente. El arranque real vive en server.ts.
 *
 * MC-2: API mínima con /health. Sin base de datos, sin auth, sin endpoints
 * de negocio. Fastify + TypeScript. Prisma/Postgres/Railway deferidos a MC-3+.
 */

export { buildApp } from "./app.js";
export const API_PACKAGE_VERSION = "0.0.0-mc5";
