import type { FastifyInstance } from "fastify";
import {
  createMealPhotoController,
  listMealPhotosController,
  getMealPhotoController,
  reviewMealPhotoController,
} from "../controllers/meal-photos.controller.js";
import {
  requirePatientSelf,
  requireProfessional,
} from "../middleware/auth-guards.js";

/**
 * Rutas de fotos de comidas — MC-FOTOS-MVP-1.
 *
 * DATO REVISABLE: las fotos nacen origin "patient_reported" y
 * reviewStatus "pending". Nunca se validan automáticamente.
 *
 * Guards (activos cuando PULSO_AUTH_ENFORCEMENT=demo):
 *   - crear/listar/detalle → requirePatientSelf
 *     (paciente solo lo propio; profesional accede a sus pacientes)
 *   - review → requireProfessional
 *     (el paciente no puede escribir professionalComment ni reviewStatus)
 *
 * El body de creación NO acepta professionalComment, reviewStatus ni
 * origin (additionalProperties: false): el paciente no puede inyectarlos.
 *
 * Upload del binario: NO implementado en este ciclo (MC-FOTOS-MVP-2).
 */
export async function mealPhotosRoutes(app: FastifyInstance): Promise<void> {
  const patientIdSchema = {
    type: "object" as const,
    properties: { patientId: { type: "string" } },
    required: ["patientId"],
  };

  const photoParamsSchema = {
    type: "object" as const,
    properties: {
      patientId: { type: "string" },
      photoId: { type: "string" },
    },
    required: ["patientId", "photoId"],
  };

  const createMealPhotoSchema = {
    type: "object" as const,
    additionalProperties: false,
    properties: {
      mealType: { type: "string" },
      patientComment: { type: "string", maxLength: 500 },
    },
    required: ["mealType"],
  };

  const reviewMealPhotoSchema = {
    type: "object" as const,
    additionalProperties: false,
    properties: {
      reviewStatus: { type: "string" },
      professionalComment: { type: "string", maxLength: 1000 },
    },
    required: ["reviewStatus"],
  };

  // POST /patients/:patientId/meal-photos — paciente crea su registro
  app.post(
    "/patients/:patientId/meal-photos",
    {
      preHandler: requirePatientSelf as any,
      schema: { params: patientIdSchema, body: createMealPhotoSchema },
    },
    createMealPhotoController,
  );

  // GET /patients/:patientId/meal-photos — listado (paciente propio / profesional)
  app.get(
    "/patients/:patientId/meal-photos",
    {
      preHandler: requirePatientSelf as any,
      schema: { params: patientIdSchema },
    },
    listMealPhotosController,
  );

  // GET /patients/:patientId/meal-photos/:photoId — detalle
  app.get(
    "/patients/:patientId/meal-photos/:photoId",
    {
      preHandler: requirePatientSelf as any,
      schema: { params: photoParamsSchema },
    },
    getMealPhotoController,
  );

  // POST /patients/:patientId/meal-photos/:photoId/review — solo profesional
  app.post(
    "/patients/:patientId/meal-photos/:photoId/review",
    {
      preHandler: requireProfessional as any,
      schema: { params: photoParamsSchema, body: reviewMealPhotoSchema },
    },
    reviewMealPhotoController,
  );
}
