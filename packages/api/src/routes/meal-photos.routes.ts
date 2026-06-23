import type { FastifyInstance } from "fastify";
import {
  createMealPhotoController,
  listMealPhotosController,
  getMealPhotoController,
  getMealPhotoImageController,
  reviewMealPhotoController,
} from "../controllers/meal-photos.controller.js";
import {
  requirePatientSelf,
  requireProfessional,
} from "../middleware/auth-guards.js";

/**
 * Rutas de fotos de comidas — MC-FOTOS-MVP-2.
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
 * MC-FOTOS-MVP-2: el endpoint de creación acepta multipart/form-data
 * (campos: file[obligatorio], mealType[obligatorio], patientComment[opcional]).
 * No hay schema.body en esa ruta: los campos se validan manualmente en el
 * controller. professionalComment, reviewStatus y origin son descartados
 * aunque el cliente los envíe.
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
  // Content-Type: multipart/form-data
  // Campos: file (imagen), mealType, patientComment (opcional)
  // No hay schema.body — el multipart se parsea manualmente en el controller.
  app.post(
    "/patients/:patientId/meal-photos",
    {
      preHandler: requirePatientSelf as any,
      schema: { params: patientIdSchema },
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

  // GET /patients/:patientId/meal-photos/:photoId/image — binario (MC-FOTOS-MVP-4)
  // Streaming proxy con guard: nunca expone URL pública.
  app.get(
    "/patients/:patientId/meal-photos/:photoId/image",
    {
      preHandler: requirePatientSelf as any,
      schema: { params: photoParamsSchema },
    },
    getMealPhotoImageController,
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
