/**
 * Configuración de storage S3-compatible — MC-FOTOS-MVP-1.
 *
 * Bucket futuro: "orderly-suitcase" (Railway). En este microciclo NO se
 * conecta nada: solo se define el contrato de configuración por variables
 * de entorno, sin valores reales, sin credenciales hardcodeadas.
 *
 * REGLAS:
 *   - NUNCA hardcodear credenciales ni URLs públicas.
 *   - Postgres guarda solo storageKey; el binario vive en el bucket.
 *   - Las fotos NUNCA se exponen por URL pública permanente: la entrega
 *     será por URL firmada o endpoint controlado (MC-FOTOS-MVP-2+).
 */

export interface StorageConfig {
  endpoint: string;
  region: string;
  accessKeyId: string;
  secretAccessKey: string;
  bucket: string;
}

/** Formatos de imagen aceptados para fotos de comidas. */
export const ALLOWED_IMAGE_MIME_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
] as const;

/** Extensión de archivo por MIME type aceptado (para la storageKey). */
export const IMAGE_EXTENSION_BY_MIME: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
};

/** MIME type por extensión (para servir el binario con el Content-Type correcto). */
export const MIME_BY_IMAGE_EXTENSION: Record<string, string> = {
  jpg: "image/jpeg",
  jpeg: "image/jpeg",
  png: "image/png",
  webp: "image/webp",
};

/** Deriva el Content-Type desde la extensión de una storageKey. */
export function contentTypeFromKey(key: string): string {
  const ext = key.split(".").pop()?.toLowerCase() ?? "";
  return MIME_BY_IMAGE_EXTENSION[ext] ?? "application/octet-stream";
}

/** Límite preliminar de tamaño de imagen: 5 MB. */
export const MAX_IMAGE_SIZE_BYTES = 5 * 1024 * 1024;

/**
 * Lee la configuración de storage desde el entorno.
 * Devuelve null si falta alguna variable: el módulo de fotos funciona en
 * modo metadata-only (sin upload real) hasta que el bucket se configure
 * en un ciclo autorizado.
 */
export function getStorageConfig(): StorageConfig | null {
  const endpoint = process.env["S3_ENDPOINT"];
  const region = process.env["S3_REGION"];
  const accessKeyId = process.env["S3_ACCESS_KEY_ID"];
  const secretAccessKey = process.env["S3_SECRET_ACCESS_KEY"];
  const bucket = process.env["S3_BUCKET"];

  if (!endpoint || !region || !accessKeyId || !secretAccessKey || !bucket) {
    return null;
  }

  return { endpoint, region, accessKeyId, secretAccessKey, bucket };
}

export function isStorageConfigured(): boolean {
  return getStorageConfig() !== null;
}
