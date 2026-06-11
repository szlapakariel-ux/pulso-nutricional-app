/**
 * Repositorio de fotos de comidas — MC-FOTOS-MVP-1.
 *
 * Solo se llama cuando PULSO_DATA_SOURCE=prisma.
 * En modo mock estas funciones nunca se invocan.
 *
 * REGLA: los registros nacen con origin patient_reported y reviewStatus
 * pending (defaults del schema). La revisión solo actualiza reviewStatus,
 * professionalComment, reviewedAt y reviewedBy — NUNCA origin.
 *
 * Postgres guarda solo storageKey, nunca el binario.
 */

import type {
  MealPhotoLog,
  MealPhotoType,
  ReviewStatus,
} from "@pulso/shared";
import { getPrismaClient } from "../lib/prisma.js";

/** Fila de Prisma → contrato compartido (fechas a ISO string). */
function mapRow(row: {
  id: string;
  patientId: string;
  storageKey: string;
  mealType: string;
  patientComment: string | null;
  professionalComment: string | null;
  reviewStatus: string;
  createdAt: Date;
  reviewedAt: Date | null;
  reviewedBy: string | null;
}): MealPhotoLog {
  return {
    id: row.id,
    patientId: row.patientId,
    storageKey: row.storageKey,
    mealType: row.mealType as MealPhotoType,
    patientComment: row.patientComment ?? undefined,
    professionalComment: row.professionalComment ?? undefined,
    origin: "patient_reported",
    reviewStatus: row.reviewStatus as ReviewStatus,
    createdAt: row.createdAt.toISOString(),
    reviewedAt: row.reviewedAt?.toISOString(),
    reviewedBy: row.reviewedBy ?? undefined,
  };
}

export async function listMealPhotosFromDB(
  patientId: string,
): Promise<MealPhotoLog[]> {
  const prisma = getPrismaClient();
  const rows = await prisma.mealPhotoLog.findMany({
    where: { patientId },
    orderBy: { createdAt: "desc" },
  });
  return rows.map(mapRow);
}

export async function getMealPhotoFromDB(
  patientId: string,
  photoId: string,
): Promise<MealPhotoLog | null> {
  const prisma = getPrismaClient();
  const row = await prisma.mealPhotoLog.findFirst({
    where: { id: photoId, patientId },
  });
  return row ? mapRow(row) : null;
}

export async function createMealPhotoInDB(input: {
  patientId: string;
  storageKey: string;
  mealType: MealPhotoType;
  patientComment?: string;
}): Promise<MealPhotoLog> {
  const prisma = getPrismaClient();
  // origin y reviewStatus quedan en sus defaults del schema:
  // patient_reported / pending. No se setean desde acá a propósito.
  const row = await prisma.mealPhotoLog.create({
    data: {
      patientId: input.patientId,
      storageKey: input.storageKey,
      mealType: input.mealType,
      patientComment: input.patientComment ?? null,
    },
  });
  return mapRow(row);
}

export async function reviewMealPhotoInDB(
  patientId: string,
  photoId: string,
  update: {
    reviewStatus: Exclude<ReviewStatus, "pending">;
    professionalComment?: string;
    reviewedBy: string;
  },
): Promise<MealPhotoLog | null> {
  const prisma = getPrismaClient();

  const existing = await prisma.mealPhotoLog.findFirst({
    where: { id: photoId, patientId },
  });
  if (!existing) return null;

  const row = await prisma.mealPhotoLog.update({
    where: { id: photoId },
    data: {
      reviewStatus: update.reviewStatus,
      ...(update.professionalComment !== undefined
        ? { professionalComment: update.professionalComment }
        : {}),
      reviewedAt: new Date(),
      reviewedBy: update.reviewedBy,
    },
  });
  return mapRow(row);
}
