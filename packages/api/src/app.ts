import Fastify from "fastify";
import { healthRoutes } from "./routes/health.routes.js";
import { patientsRoutes } from "./routes/patients.routes.js";

/**
 * Crea y configura la instancia de Fastify.
 * No levanta el servidor — eso lo hace server.ts.
 * Separar creación de arranque facilita el testing.
 */
export function buildApp() {
  const app = Fastify({
    logger: {
      level: process.env["LOG_LEVEL"] ?? "info",
    },
  });

  // Rutas
  app.register(healthRoutes);
  app.register(patientsRoutes);

  return app;
}
