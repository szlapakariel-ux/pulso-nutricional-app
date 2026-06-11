import Fastify from "fastify";
import jwt from "@fastify/jwt";
import cors from "@fastify/cors";
import { resolveJwtSecret } from "./config/auth.js";
import {
  buildCorsOriginValidator,
  CORS_METHODS,
  CORS_ALLOWED_HEADERS,
} from "./config/cors.js";
import { authRoutes } from "./routes/auth.routes.js";
import { healthRoutes } from "./routes/health.routes.js";
import { patientsRoutes } from "./routes/patients.routes.js";
import { consultationsRoutes } from "./routes/consultations.routes.js";
import { mealPlansRoutes } from "./routes/meal-plans.routes.js";
import { patientTodayRoutes } from "./routes/patient-today.routes.js";
import { patientLogsRoutes } from "./routes/patient-logs.routes.js";
import { reviewInboxRoutes } from "./routes/review-inbox.routes.js";
import { pdfRoutes } from "./routes/pdf.routes.js";
import { activityRoutes } from "./routes/activity.routes.js";
import { mealPhotosRoutes } from "./routes/meal-photos.routes.js";

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

  // CORS mínimo para la web profesional Railway — MC-API-CORS-CODE.
  // Registrado antes de las rutas para que @fastify/cors responda el
  // preflight OPTIONS. Bearer token (no cookies) → credentials=false.
  app.register(cors, {
    origin: buildCorsOriginValidator(),
    methods: CORS_METHODS,
    allowedHeaders: CORS_ALLOWED_HEADERS,
    credentials: false,
  });

  // JWT plugin — registrado siempre; en modo off usa secret placeholder
  // (nunca se usa para verificación real si PULSO_AUTH_MODE=off)
  app.register(jwt, { secret: resolveJwtSecret() });

  // Rutas de auth (devuelven 501 si PULSO_AUTH_MODE=off)
  app.register(authRoutes);

  // Rutas de negocio (no protegidas todavía — MC-10.5C no aplica auth aquí)
  app.register(healthRoutes);
  app.register(patientsRoutes);
  app.register(consultationsRoutes);
  app.register(mealPlansRoutes);
  app.register(patientTodayRoutes);
  app.register(patientLogsRoutes);
  app.register(reviewInboxRoutes);
  app.register(pdfRoutes);
  app.register(activityRoutes);
  app.register(mealPhotosRoutes);

  return app;
}
