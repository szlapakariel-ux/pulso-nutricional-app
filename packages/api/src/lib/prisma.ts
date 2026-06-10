/**
 * Singleton del cliente Prisma — MC-10.5A.
 *
 * ESTADO MC-10.5A:
 *   Este archivo existe como infraestructura de base pero NO es importado
 *   por ningún servicio existente. Los servicios actuales siguen usando mocks.
 *
 * PRÓXIMO USO (MC-10.5B+):
 *   Importar `getPrismaClient()` en los servicios que se conecten a la DB real.
 *   Reemplazar progresivamente los mocks, sin romper los endpoints actuales.
 *
 * REQUISITO:
 *   Ejecutar `pnpm --filter @pulso/api db:generate` al menos una vez antes de
 *   que TypeScript pueda compilar este archivo (el cliente se genera de schema.prisma).
 *
 * NO HACER:
 *   - No conectar a Railway en MC-10.5A
 *   - No importar desde servicios actuales en MC-10.5A
 */

import { PrismaClient } from "@prisma/client";

let _client: PrismaClient | undefined;

/**
 * Retorna una instancia singleton del cliente Prisma.
 *
 * Lazy initialization: el cliente se crea al primer llamado, no al importar.
 * Esto evita conexiones involuntarias durante tests o builds.
 */
export function getPrismaClient(): PrismaClient {
  if (!_client) {
    _client = new PrismaClient({
      log:
        process.env["NODE_ENV"] === "development"
          ? ["error", "warn"]
          : ["error"],
    });
  }
  return _client;
}

/**
 * Desconecta el cliente Prisma.
 *
 * Llamar en el shutdown del servidor para liberar conexiones del pool.
 */
export async function disconnectPrisma(): Promise<void> {
  if (_client) {
    await _client.$disconnect();
    _client = undefined;
  }
}
