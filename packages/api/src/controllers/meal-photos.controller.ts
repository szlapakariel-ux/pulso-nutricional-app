/**
 * Controladores de fotos de comidas — MC-FOTOS-MVP-2.
 *
 * RESPUESTA: siempre metadata (MealPhotoLog), nunca el binario, nunca
 * una URL pública permanente. La entrega de la imagen será por URL
 * firmada o endpoint controlado en MC-FOTOS-MVP-3.
 *
 * PERMISOS (guards en las rutas):
 *   - crear / listar / detalle → requirePatientSelf
 *     (paciente solo lo propio; profesional puede ver sus pacientes)
 *   - revisar → requireProfessional
 *     (el paciente NUNCA escribe professionalComment ni reviewStatus)
 *
 * MC-FOTOS-MVP-2: createMealPhotoController acepta multipart/form-data.
 *   Campos requeridos: file (imagen), mealType.
 *   Campos opcionales: patientComment (max 500).
 *   Campos ignorados: professionalComment, reviewStatus, origin (siempre).
 */

import type { FastifyRequest, FastifyReply } from "fastify";
import "@fastify/multipart";
import type {
  AuthSession,
  MealPhotoLogDraft,
  MealPhotoReviewDraft,
  MealPhotoType,
} from "@pulso/shared";
import {
  createMealPhoto,
  getMealPhoto,
  getMealPhotoImage,
  listMealPhotos,
  reviewMealPhoto,
} from "../services/meal-photos.service.js";
import {
  ALLOWED_IMAGE_MIME_TYPES,
  MAX_IMAGE_SIZE_BYTES,
} from "../config/storage.js";

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

interface ReviewMealPhotoBody {
  reviewStatus: string;
  professionalComment?: string;
}

/**
 * POST /patients/:patientId/meal-photos
 *
 * Acepta multipart/form-data con:
 *   - file: imagen (jpeg / png / webp, máx 5 MB) [obligatorio]
 *   - mealType: string del enum MealPhotoType [obligatorio]
 *   - patientComment: string opcional (máx 500) [opcional]
 *
 * Rechaza cualquier campo que no sea de la lista (additionalProperties
 * equivalente por parsing manual).
 * El registro SIEMPRE nace pending / patient_reported.
 */
export async function createMealPhotoController(
  request: FastifyRequest<{ Params: PatientIdParams }>,
  reply: FastifyReply,
): Promise<void> {
  const { patientId } = request.params;

  // Verificar content-type antes de iterar partes
  const contentType = request.headers["content-type"] ?? "";
  if (!contentType.includes("multipart/form-data")) {
    await reply.code(415).send({
      error: {
        code: "UNSUPPORTED_MEDIA_TYPE",
        message:
          "Esta ruta requiere multipart/form-data con los campos: file, mealType y (opcional) patientComment.",
        statusCode: 415,
      },
    });
    return;
  }

  let fileBuffer: Buffer | null = null;
  let fileMimeType: string | null = null;
  let mealType: string | undefined;
  let patientComment: string | undefined;
  let fileTooLarge = false;

  // Parsear partes del multipart
  for await (const part of request.parts()) {
    if (part.type === "file") {
      // Solo se acepta un archivo; si hay más, se ignoran
      if (fileBuffer !== null) {
        await part.toBuffer(); // drain
        continue;
      }

      // Validar MIME antes de leer el buffer completo
      if (
        !ALLOWED_IMAGE_MIME_TYPES.includes(
          part.mimetype as (typeof ALLOWED_IMAGE_MIME_TYPES)[number],
        )
      ) {
        await part.toBuffer(); // drain para no dejar el stream colgado
        await reply.code(400).send({
          error: {
            code: "INVALID_MIME_TYPE",
            message: `Formato de imagen no soportado: ${part.mimetype}. Formatos permitidos: ${ALLOWED_IMAGE_MIME_TYPES.join(", ")}.`,
            statusCode: 400,
          },
        });
        return;
      }

      try {
        fileBuffer = await part.toBuffer();
      } catch (err: unknown) {
        const code = (err as { code?: string }).code;
        if (code === "FST_REQ_FILE_TOO_LARGE") {
          fileTooLarge = true;
          break;
        }
        throw err;
      }

      // Verificación defensiva de tamaño (por si limits no lanzó)
      if (fileBuffer.length > MAX_IMAGE_SIZE_BYTES) {
        fileTooLarge = true;
        break;
      }

      fileMimeType = part.mimetype;
    } else {
      // Campo de texto — ignorar campos no permitidos (additionalProperties equiv.)
      const name = part.fieldname;
      const value = String(part.value ?? "");
      if (name === "mealType") {
        mealType = value;
      } else if (name === "patientComment") {
        // Truncar al límite de 500 sin rechazar
        patientComment = value.slice(0, 500) || undefined;
      }
      // professionalComment, reviewStatus, origin: descartados siempre
    }
  }

  if (fileTooLarge) {
    await reply.code(400).send({
      error: {
        code: "FILE_TOO_LARGE",
        message: `La imagen supera el límite de ${MAX_IMAGE_SIZE_BYTES / (1024 * 1024)} MB.`,
        statusCode: 400,
      },
    });
    return;
  }

  if (!fileBuffer || !fileMimeType) {
    await reply.code(400).send({
      error: {
        code: "MISSING_FILE",
        message:
          "Se requiere una imagen en el campo 'file' (multipart/form-data).",
        statusCode: 400,
      },
    });
    return;
  }

  if (!mealType || !MEAL_PHOTO_TYPES.includes(mealType as MealPhotoType)) {
    await reply.code(400).send({
      error: {
        code: "INVALID_MEAL_TYPE",
        message: `mealType inválido o ausente. Valores permitidos: ${MEAL_PHOTO_TYPES.join(", ")}.`,
        statusCode: 400,
      },
    });
    return;
  }

  const draft: MealPhotoLogDraft = {
    mealType: mealType as MealPhotoType,
    ...(patientComment !== undefined ? { patientComment } : {}),
  };

  let photo: Awaited<ReturnType<typeof createMealPhoto>>;
  try {
    // createMealPhoto guarda el binario y luego persiste la metadata:
    // este catch cubre fallos de cualquiera de las dos etapas (guardado
    // de foto en general), no solo del almacenamiento de imágenes.
    photo = await createMealPhoto(patientId, draft, fileBuffer, fileMimeType);
  } catch (err) {
    request.log.error({ err, patientId }, "Error al guardar foto de comida");
    await reply.code(503).send({
      error: {
        code: "PHOTO_SAVE_UNAVAILABLE",
        message:
          "No fue posible guardar la foto en este momento. Intentá de nuevo más tarde.",
        statusCode: 503,
      },
    });
    return;
  }

  await reply.code(201).send({
    data: photo,
    meta: {
      demo: true,
      storageConfigured: photo.storageKey.startsWith("patients/"),
    },
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
 * GET /patients/:patientId/meal-photos/:photoId/image — MC-FOTOS-MVP-4
 *
 * Entrega el binario de la foto vía streaming proxy con guard
 * (requirePatientSelf): el paciente accede a lo propio, el profesional a sus
 * pacientes. NUNCA expone una URL pública permanente: la storageKey no se
 * convierte en URL, el binario se sirve desde el endpoint controlado.
 *
 * 404 si la foto no existe, no pertenece al paciente, o el binario no está
 * disponible (objeto inexistente o fallback local sin bucket). La UI cae al
 * placeholder con gracia.
 */
export async function getMealPhotoImageController(
  request: FastifyRequest<{ Params: PhotoParams }>,
  reply: FastifyReply,
): Promise<void> {
  const { patientId, photoId } = request.params;

  const image = await getMealPhotoImage(patientId, photoId);
  if (!image) {
    await reply.code(404).send({
      error: {
        code: "MEAL_PHOTO_IMAGE_NOT_AVAILABLE",
        message: "La imagen de esta foto no está disponible.",
        statusCode: 404,
      },
    });
    return;
  }

  await reply
    .header("Content-Type", image.contentType ?? "application/octet-stream")
    // Cache privado de corta duración: el binario no cambia, pero es dato
    // sensible — nunca cache compartido/público.
    .header("Cache-Control", "private, max-age=300")
    .send(image.body);
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
