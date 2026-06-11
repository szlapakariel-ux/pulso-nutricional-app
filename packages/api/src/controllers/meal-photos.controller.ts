/**
 * Controladores de fotos de comidas — MC-FOTOS-MVP-1.
 *
 * RESPUESTA: siempre metadata (MealPhotoLog), nunca el binario, nunca
 * una URL pública permanente. La entrega de la imagen será por URL
 * firmada o endpoint controlado en MC-FOTOS-MVP-2+.
 *
 * PERMISOS (guards en las rutas):
 *   - crear / listar / detalle → requirePatientSelf
 *     (paciente solo lo propio; profesional puede ver sus pacientes)
 *   - revisar → requireProfessional
 *     (el paciente NUNCA escribe professionalComment ni reviewStatus)
 */

import type { FastifyRequest, FastifyReply } from "fastify";
import type {
  AuthSession,
  MealPhotoLogDraft,
  MealPhotoReviewDraft,
  MealPhotoType,
} from "@pulso/shared";
import {
  createMealPhoto,
  getMealPhoto,
  listMealPhotos,
  reviewMealPhoto,
} from "../services/meal-photos.service.js";

interface PatientIdParams {
  patientId: string;
}

interface PhotoParams extends PatientIdParams {
  photoId: string;
}

const MEAL_PHOTO_TYPES: readonly MealPhotoType[] = [
  "breakfast",
  "lunch",
  "snack",
  "dinner",
  "collation",
  "other",
];

const REVIEW_TARGET_STATUSES = ["reviewed", "accepted", "flagged"] as const;

interface CreateMealPhotoBody {
  mealType: string;
  patientComment?: string;
}

interface ReviewMealPhotoBody {
  reviewStatus: string;
  professionalComment?: string;
}

const UPLOAD_PENDING_WARNING =
  "MC-FOTOS-MVP-1: registro de metadata con storageKey reservada. " +
  "El upload del binario llega en MC-FOTOS-MVP-2. " +
  "Dato revisable: pendiente de revisión profesional.";

/**
 * POST /patients/:patientId/meal-photos
 *
 * Crea un registro de foto de comida del paciente.
 * Rechaza mealType inválido (400). El registro nace SIEMPRE
 * pending / patient_reported.
 */
export async function createMealPhotoController(
  request: FastifyRequest<{
    Params: PatientIdParams;
    Body: CreateMealPhotoBody;
  }>,
  reply: FastifyReply,
): Promise<void> {
  const { patientId } = request.params;
  const { mealType, patientComment } = request.body;

  if (!MEAL_PHOTO_TYPES.includes(mealType as MealPhotoType)) {
    await reply.code(400).send({
      error: {
        code: "INVALID_MEAL_TYPE",
        message: `mealType inválido. Valores permitidos: ${MEAL_PHOTO_TYPES.join(", ")}.`,
        statusCode: 400,
      },
    });
    return;
  }

  const draft: MealPhotoLogDraft = {
    mealType: mealType as MealPhotoType,
    ...(patientComment !== undefined ? { patientComment } : {}),
  };

  const photo = await createMealPhoto(patientId, draft);

  await reply.code(201).send({
    data: photo,
    meta: { demo: true, warning: UPLOAD_PENDING_WARNING },
  });
}

/**
 * GET /patients/:patientId/meal-photos
 *
 * Lista las fotos de comidas del paciente (metadata, sin binarios).
 */
export async function listMealPhotosController(
  request: FastifyRequest<{ Params: PatientIdParams }>,
  reply: FastifyReply,
): Promise<void> {
  const { patientId } = request.params;
  const photos = await listMealPhotos(patientId);

  await reply.send({
    data: photos,
    meta: { demo: true, count: photos.length },
  });
}

/**
 * GET /patients/:patientId/meal-photos/:photoId
 *
 * Detalle de una foto (metadata, sin binario ni URL pública).
 */
export async function getMealPhotoController(
  request: FastifyRequest<{ Params: PhotoParams }>,
  reply: FastifyReply,
): Promise<void> {
  const { patientId, photoId } = request.params;
  const photo = await getMealPhoto(patientId, photoId);

  if (!photo) {
    await reply.code(404).send({
      error: {
        code: "MEAL_PHOTO_NOT_FOUND",
        message: "Foto de comida no encontrada para este paciente.",
        statusCode: 404,
      },
    });
    return;
  }

  await reply.send({ data: photo, meta: { demo: true } });
}

/**
 * POST /patients/:patientId/meal-photos/:photoId/review
 *
 * Revisión profesional: avanza reviewStatus (reviewed | accepted | flagged)
 * y opcionalmente agrega professionalComment.
 *
 * Se usa POST (no PATCH) por consistencia con el patrón de acciones de
 * review-inbox (MC-8) y porque CORS_METHODS solo permite GET/POST/OPTIONS.
 *
 * NUNCA cambia origin: la foto sigue siendo patient_reported.
 */
export async function reviewMealPhotoController(
  request: FastifyRequest<{
    Params: PhotoParams;
    Body: ReviewMealPhotoBody;
  }>,
  reply: FastifyReply,
): Promise<void> {
  const { patientId, photoId } = request.params;
  const { reviewStatus, professionalComment } = request.body;

  if (
    !REVIEW_TARGET_STATUSES.includes(
      reviewStatus as (typeof REVIEW_TARGET_STATUSES)[number],
    )
  ) {
    await reply.code(400).send({
      error: {
        code: "INVALID_REVIEW_STATUS",
        message: `reviewStatus inválido. Valores permitidos: ${REVIEW_TARGET_STATUSES.join(", ")}.`,
        statusCode: 400,
      },
    });
    return;
  }

  // Con enforcement demo el guard ya verificó el JWT; sin enforcement
  // (modo off) se usa un identificador demo explícito.
  const session = request.user as AuthSession | undefined;
  const professionalId = session?.id ?? "demo-professional";

  const review: MealPhotoReviewDraft = {
    reviewStatus: reviewStatus as MealPhotoReviewDraft["reviewStatus"],
    ...(professionalComment !== undefined ? { professionalComment } : {}),
  };

  const photo = await reviewMealPhoto(patientId, photoId, review, professionalId);

  if (!photo) {
    await reply.code(404).send({
      error: {
        code: "MEAL_PHOTO_NOT_FOUND",
        message: "Foto de comida no encontrada para este paciente.",
        statusCode: 404,
      },
    });
    return;
  }

  await reply.send({
    data: photo,
    meta: {
      demo: true,
      warning:
        "Revisión profesional aplicada. El dato sigue siendo patient_reported (nunca se convierte en dato validado).",
    },
  });
}
