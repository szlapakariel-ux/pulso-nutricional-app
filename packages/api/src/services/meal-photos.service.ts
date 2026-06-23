/**
 * Servicio de fotos de comidas — MC-FOTOS-MVP-2.
 *
 * REGLA CRÍTICA: toda foto nace como DATO REVISABLE.
 *   - origin: "patient_reported" (siempre; el campo nunca cambia)
 *   - reviewStatus: "pending" (al crear, siempre)
 *   - Nunca se valida automáticamente.
 *   - Solo el flujo profesional escribe professionalComment y avanza
 *     reviewStatus (el guard de la ruta lo garantiza).
 *
 * STORAGE (MC-FOTOS-MVP-2):
 *   - createMealPhoto recibe buffer + contentType del controller.
 *   - Llama al storage adapter (S3 real si configurado; fallback local si no).
 *   - El binario se sube ANTES de guardar el metadata: si el upload falla,
 *     el registro no se crea (no quedan keys huérfanas sin binario en S3).
 *   - En modo fallback (sin S3), el binario es descartado con aviso y el
 *     metadata se guarda igual (útil para desarrollo y smoke tests).
 *
 * Fuente de datos: mock (default) | prisma según PULSO_DATA_SOURCE.
 */

import type {
  MealPhotoLog,
  MealPhotoLogDraft,
  MealPhotoReviewDraft,
} from "@pulso/shared";
import { isPrismaMode } from "../config/data-source.js";
import { contentTypeFromKey } from "../config/storage.js";
import {
  buildMealPhotoStorageKey,
  getMealPhotoStorage,
  type StoredObject,
} from "../storage/meal-photo-storage.js";
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
 * Recupera el binario de una foto de comida — MC-FOTOS-MVP-4.
 *
 * Valida que la foto exista y pertenezca al paciente (vía getMealPhoto), luego
 * pide el binario al storage. Devuelve null si la foto no existe o si el binario
 * no está disponible (objeto inexistente o fallback local sin bucket): el caller
 * responde 404 y la UI cae al placeholder con gracia.
 *
 * El Content-Type sale del bucket cuando lo expone; si no, se deriva de la
 * extensión de la storageKey.
 */
export async function getMealPhotoImage(
  patientId: string,
  photoId: string,
): Promise<StoredObject | null> {
  const photo = await getMealPhoto(patientId, photoId);
  if (!photo) return null;

  const obj = await getMealPhotoStorage().getObject(photo.storageKey);
  if (!obj) return null;

  return {
    body: obj.body,
    contentType: obj.contentType ?? contentTypeFromKey(photo.storageKey),
  };
}

/**
 * Crea un registro de foto de comida del paciente.
 *
 * MC-FOTOS-MVP-2: recibe el buffer real de la imagen y su MIME type.
 * Sube el binario al storage antes de persistir el metadata.
 * SIEMPRE nace pending / patient_reported — sin excepciones.
 */
export async function createMealPhoto(
  patientId: string,
  draft: MealPhotoLogDraft,
  fileBuffer: Buffer,
  contentType: string,
): Promise<MealPhotoLog> {
  const storageKey = buildMealPhotoStorageKey(patientId, contentType);

  // Upload binario (S3 real o fallback local que descarta con aviso).
  // Si falla (solo S3 real), la excepción propaga y no se guarda metadata.
  await getMealPhotoStorage().putObject(storageKey, fileBuffer, contentType);

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
