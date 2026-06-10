/**
 * Selector de fuente de datos — MC-10.5B.
 *
 * Variable de entorno: PULSO_DATA_SOURCE
 *   "mock"   → comportamiento anterior (default si no se define)
 *   "prisma" → usa Prisma para endpoints soportados
 *
 * REGLAS:
 *   - Si PULSO_DATA_SOURCE no está definida → mock
 *   - En modo mock, DATABASE_URL no se requiere
 *   - En modo prisma, DATABASE_URL debe estar presente
 *   - No hay fallback silencioso de prisma a mock: si falla Prisma en modo
 *     prisma, el error se propaga al caller
 */

export type DataSourceMode = "mock" | "prisma";

export function getDataSourceMode(): DataSourceMode {
  const value = process.env["PULSO_DATA_SOURCE"];
  if (value === "prisma") return "prisma";
  return "mock";
}

export function isPrismaMode(): boolean {
  return getDataSourceMode() === "prisma";
}
