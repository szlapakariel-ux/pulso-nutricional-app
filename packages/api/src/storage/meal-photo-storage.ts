/**
 * Storage adapter para fotos de comidas — MC-FOTOS-MVP-2.
 *
 * Dos implementaciones:
 *   - S3MealPhotoStorage: upload real a bucket S3-compatible usando
 *     @aws-sdk/client-s3 (PutObjectCommand). Solo se instancia cuando
 *     las 5 variables de entorno S3_* están definidas.
 *   - LocalFallbackStorage: descarta el binario con aviso. Se usa cuando
 *     el bucket no está configurado (desarrollo local, smoke tests).
 *     El metadata se guarda igual; el binario no se persiste.
 *
 * REGLAS (invariantes que no cambian en MC-FOTOS-MVP-2):
 *   - storageKey SIEMPRE generada en servidor (UUID, nunca nombre original).
 *   - Patrón: patients/{patientId}/meal-photos/{year}/{month}/{fileId}.{ext}
 *   - NUNCA URLs públicas permanentes.
 *   - Postgres guarda solo la key, nunca el binario.
 *   - Sin credenciales hardcodeadas: todo por variables de entorno.
 */

import { randomUUID } from "node:crypto";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import {
  getStorageConfig,
  IMAGE_EXTENSION_BY_MIME,
  type StorageConfig,
} from "../config/storage.js";

/**
 * Contrato del adapter. Implementado por S3MealPhotoStorage (real)
 * y LocalFallbackStorage (sin credenciales / desarrollo local).
 */
export interface MealPhotoStorageAdapter {
  /** true si el adapter subirá el binario a un bucket real. */
  isConfigured(): boolean;
  /**
   * Sube el binario de la foto al path indicado.
   * En modo fallback, descarta el binario y registra un aviso.
   */
  putObject(key: string, body: Buffer, contentType: string): Promise<void>;
}

/**
 * Construye la storageKey de una foto de comida.
 *
 * patients/{patientId}/meal-photos/{year}/{month}/{fileId}.{ext}
 *
 * - year/month: del momento de la carga (UTC).
 * - fileId: UUID generado en servidor.
 * - ext: derivada del MIME type aceptado; "bin" como fallback defensivo.
 */
export function buildMealPhotoStorageKey(
  patientId: string,
  contentType: string,
  now: Date = new Date(),
): string {
  const year = now.getUTCFullYear();
  const month = String(now.getUTCMonth() + 1).padStart(2, "0");
  const fileId = randomUUID();
  const ext = IMAGE_EXTENSION_BY_MIME[contentType] ?? "bin";
  return `patients/${patientId}/meal-photos/${year}/${month}/${fileId}.${ext}`;
}

/** Upload real a bucket S3-compatible. */
class S3MealPhotoStorage implements MealPhotoStorageAdapter {
  private client: S3Client;
  private bucket: string;

  constructor(config: StorageConfig) {
    this.client = new S3Client({
      endpoint: config.endpoint,
      region: config.region,
      credentials: {
        accessKeyId: config.accessKeyId,
        secretAccessKey: config.secretAccessKey,
      },
      // forcePathStyle necesario para buckets S3-compatibles (MinIO, Railway, etc.)
      forcePathStyle: true,
    });
    this.bucket = config.bucket;
  }

  isConfigured(): boolean {
    return true;
  }

  async putObject(key: string, body: Buffer, contentType: string): Promise<void> {
    await this.client.send(
      new PutObjectCommand({
        Bucket: this.bucket,
        Key: key,
        Body: body,
        ContentType: contentType,
      }),
    );
  }
}

/**
 * Adapter de fallback para entornos sin S3 configurado.
 * Descarta el binario (no lo persiste) y loguea un aviso.
 * Usado en desarrollo local y smoke tests: el metadata se guarda
 * igual y el upload "tiene éxito", pero la imagen no existe en bucket.
 */
class LocalFallbackStorage implements MealPhotoStorageAdapter {
  isConfigured(): boolean {
    return false;
  }

  async putObject(key: string): Promise<void> {
    console.warn(
      `[storage] S3 no configurado — binario descartado (fallback local). ` +
        `key=${key}. Configura S3_ENDPOINT, S3_REGION, S3_ACCESS_KEY_ID, ` +
        `S3_SECRET_ACCESS_KEY y S3_BUCKET para producción.`,
    );
  }
}

let adapter: MealPhotoStorageAdapter | null = null;

/** Singleton del adapter. S3 real si hay credenciales; fallback si no. */
export function getMealPhotoStorage(): MealPhotoStorageAdapter {
  if (!adapter) {
    const config = getStorageConfig();
    adapter = config ? new S3MealPhotoStorage(config) : new LocalFallbackStorage();
  }
  return adapter;
}
