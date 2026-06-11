/**
 * DATOS FICTICIOS DE DEMOSTRACIÓN — MC-FOTOS-MVP-1.
 *
 * Store en memoria de fotos de comidas del paciente.
 * Las storageKeys son FICTICIAS: no existe ningún binario en ningún bucket.
 * No hay fotos reales. No representan datos clínicos reales.
 *
 * REGLA: todo registro nace con origin "patient_reported" y
 * reviewStatus "pending". Solo el flujo profesional lo avanza.
 *
 * El store es por proceso (se pierde al reiniciar) — suficiente para el
 * modo mock; la persistencia real usa Prisma (PULSO_DATA_SOURCE=prisma).
 */

import type { MealPhotoLog } from "@pulso/shared";

let photoCounter = 0;

export function generateMealPhotoLogId(): string {
  return `meal-photo-demo-${++photoCounter}-${Date.now()}`;
}

/**
 * Registros demo iniciales (ficticios, sin binarios).
 * demo-1 tiene una foto pendiente y una revisada para ilustrar ambos estados.
 */
const DEMO_MEAL_PHOTOS: MealPhotoLog[] = [
  {
    id: "meal-photo-demo-seed-1",
    patientId: "demo-1",
    storageKey:
      "patients/demo-1/meal-photos/2026/06/ficticia-demo-0000-0000-000000000001.jpg",
    mealType: "breakfast",
    patientComment: "Desayuno de hoy: café con tostadas integrales.",
    origin: "patient_reported",
    reviewStatus: "pending",
    createdAt: "2026-06-10T09:15:00.000Z",
  },
  {
    id: "meal-photo-demo-seed-2",
    patientId: "demo-1",
    storageKey:
      "patients/demo-1/meal-photos/2026/06/ficticia-demo-0000-0000-000000000002.jpg",
    mealType: "lunch",
    patientComment: "Almuerzo en el trabajo.",
    professionalComment:
      "Buena porción de proteína. Sumá una fruta de postre.",
    origin: "patient_reported",
    reviewStatus: "reviewed",
    createdAt: "2026-06-09T13:05:00.000Z",
    reviewedAt: "2026-06-09T18:30:00.000Z",
    reviewedBy: "demo-professional",
  },
];

/** Store mutable en memoria (modo mock). */
const store: MealPhotoLog[] = [...DEMO_MEAL_PHOTOS];

export function listMockMealPhotos(patientId: string): MealPhotoLog[] {
  return store.filter((p) => p.patientId === patientId);
}

export function findMockMealPhoto(
  patientId: string,
  photoId: string,
): MealPhotoLog | undefined {
  return store.find((p) => p.patientId === patientId && p.id === photoId);
}

export function insertMockMealPhoto(photo: MealPhotoLog): MealPhotoLog {
  store.push(photo);
  return photo;
}

/**
 * Aplica una revisión profesional en el store mock.
 * Devuelve el registro actualizado o undefined si no existe.
 */
export function reviewMockMealPhoto(
  patientId: string,
  photoId: string,
  update: {
    reviewStatus: MealPhotoLog["reviewStatus"];
    professionalComment?: string;
    reviewedBy: string;
  },
): MealPhotoLog | undefined {
  const photo = findMockMealPhoto(patientId, photoId);
  if (!photo) return undefined;

  photo.reviewStatus = update.reviewStatus;
  if (update.professionalComment !== undefined) {
    photo.professionalComment = update.professionalComment;
  }
  photo.reviewedAt = new Date().toISOString();
  photo.reviewedBy = update.reviewedBy;
  return photo;
}
