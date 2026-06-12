import Fastify from "fastify";
import type { FastifyError } from "fastify";
import jwt from "@fastify/jwt";
import cors from "@fastify/cors";
import multipart from "@fastify/multipart";
import { resolveJwtSecret } from "./config/auth.js";
import {
  buildCorsOriginValidator,
  CORS_METHODS,
  CORS_ALLOWED_HEADERS,
} from "./config/cors.js";
import { MAX_IMAGE_SIZE_BYTES } from "./config/storage.js";
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

  // Multipart — para subida de fotos de comidas (MC-FOTOS-MVP-2).
  // Solo intercepta peticiones con content-type multipart/form-data;
  // las rutas JSON quedan intactas.
  app.register(multipart, {
    limits: {
      fileSize: MAX_IMAGE_SIZE_BYTES,
      files: 1,
      fields: 5,
    },
  });

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

  // Manejador global de errores no capturados — evita que Fastify devuelva
  // un 500 crudo con stack trace cuando un handler lanza sin try/catch.
  // Preserva el statusCode de errores controlados (validación de schema,
  // 4xx) y solo cae a 500 cuando no hay un status válido.
  app.setErrorHandler((error: FastifyError, request, reply) => {
    const rawStatus = error.statusCode;
    const statusCode =
      typeof rawStatus === "number" && rawStatus >= 400 && rawStatus <= 599
        ? rawStatus
        : 500;

    // Loguear como error solo los 5xx; los 4xx son esperables (cliente).
    if (statusCode >= 500) {
      request.log.error({ err: error }, "Error no controlado en handler");
    } else {
      request.log.warn({ err: error }, "Solicitud rechazada");
    }

    const { code, message } =
      statusCode >= 500
        ? {
            code: "INTERNAL_ERROR",
            message: "Ocurrió un error inesperado. Intentá de nuevo más tarde.",
          }
        : {
            code: "REQUEST_ERROR",
            message:
              "No fue posible procesar la solicitud. Revisá los datos e intentá nuevamente.",
          };

    void reply.status(statusCode).send({
      error: { code, message, statusCode },
    });
  });

  return app;
}
