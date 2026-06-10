import Fastify from "fastify";
import { healthRoutes } from "./routes/health.routes.js";
import { patientsRoutes } from "./routes/patients.routes.js";
import { consultationsRoutes } from "./routes/consultations.routes.js";
import { mealPlansRoutes } from "./routes/meal-plans.routes.js";
import { patientTodayRoutes } from "./routes/patient-today.routes.js";
import { patientLogsRoutes } from "./routes/patient-logs.routes.js";

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
  app.register(consultationsRoutes);
  app.register(mealPlansRoutes);
  app.register(patientTodayRoutes);
  app.register(patientLogsRoutes);

  return app;
}
