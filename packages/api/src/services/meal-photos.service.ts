/**
 * Servicio de fotos de comidas — MC-FOTOS-MVP-1.
 *
 * REGLA CRÍTICA: toda foto nace como DATO REVISABLE.
 *   - origin: "patient_reported" (siempre; el campo nunca cambia)
 *   - reviewStatus: "pending" (al crear, siempre)
 *   - Nunca se valida automáticamente.
 *   - Solo el flujo profesional escribe professionalComment y avanza
 *     reviewStatus (el guard de la ruta lo garantiza).
 *
 * STORAGE: este servicio genera la storageKey en servidor. El binario NO
 * se sube en MC-FOTOS-MVP-1 (ver storage/meal-photo-storage.ts): los
 * registros son metadata + key reservada hasta MC-FOTOS-MVP-2.
 *
 * Fuente de datos: mock (default) | prisma según PULSO_DATA_SOURCE.
 */

import type {
  MealPhotoLog,
  MealPhotoLogDraft,
  MealPhotoReviewDraft,
} from "@pulso/shared";
import { isPrismaMode } from "../config/data-source.js";
import { buildMealPhotoStorageKey } from "../storage/meal-photo-storage.js";
import {
  generateMealPhotoLogId,
  listMockMealPhotos,
  findMockMealPhoto,
  insertMockMealPhoto,
  reviewMockMealPhoto,
} from "../mock-data/meal-photos.mock.js";
import {
  listMealPhotosFromDB,
  getMealPhotoFromDB,
  createMealPhotoInDB,
  reviewMealPhotoInDB,
} from "../repositories/meal-photos.repository.js";

/**
 * MIME type por defecto para la key reservada mientras el upload real no
 * existe (MC-FOTOS-MVP-2 recibirá el contentType real del archivo).
 */
const PLACEHOLDER_CONTENT_TYPE = "image/jpeg";

export async function listMealPhotos(
  patientId: string,
): Promise<MealPhotoLog[]> {
  if (isPrismaMode()) {
    return listMealPhotosFromDB(patientId);
  }
  return listMockMealPhotos(patientId);
}

export async function getMealPhoto(
  patientId: string,
  photoId: string,
): Promise<MealPhotoLog | null> {
  if (isPrismaMode()) {
    return getMealPhotoFromDB(patientId, photoId);
  }
  return findMockMealPhoto(patientId, photoId) ?? null;
}

/**
 * Crea un registro de foto de comida del paciente.
 * SIEMPRE nace pending / patient_reported — sin excepciones.
 */
export async function createMealPhoto(
  patientId: string,
  draft: MealPhotoLogDraft,
): Promise<MealPhotoLog> {
  const storageKey = buildMealPhotoStorageKey(
    patientId,
    PLACEHOLDER_CONTENT_TYPE,
  );

  if (isPrismaMode()) {
    return createMealPhotoInDB({
      patientId,
      storageKey,
      mealType: draft.mealType,
      patientComment: draft.patientComment,
    });
  }

  return insertMockMealPhoto({
    id: generateMealPhotoLogId(),
    patientId,
    storageKey,
    mealType: draft.mealType,
    patientComment: draft.patientComment,
    origin: "patient_reported",
    reviewStatus: "pending",
    createdAt: new Date().toISOString(),
  });
}

/**
 * Aplica una revisión profesional sobre una foto.
 * Cambia reviewStatus (nunca a "pending") y opcionalmente
 * professionalComment. NUNCA cambia origin: el dato sigue siendo
 * patient_reported — la revisión no lo convierte en dato validado.
 */
export async function reviewMealPhoto(
  patientId: string,
  photoId: string,
  review: MealPhotoReviewDraft,
  professionalId: string,
): Promise<MealPhotoLog | null> {
  if (isPrismaMode()) {
    return reviewMealPhotoInDB(patientId, photoId, {
      reviewStatus: review.reviewStatus,
      professionalComment: review.professionalComment,
      reviewedBy: professionalId,
    });
  }

  return (
    reviewMockMealPhoto(patientId, photoId, {
      reviewStatus: review.reviewStatus,
      professionalComment: review.professionalComment,
      reviewedBy: professionalId,
    }) ?? null
  );
}
