/**
 * Storage adapter para fotos de comidas — MC-FOTOS-MVP-1.
 *
 * CONTRATO preparado para un bucket S3-compatible ("orderly-suitcase"),
 * sin implementación real todavía:
 *   - El SDK de S3 NO se agrega en este ciclo (sin dependencia nueva).
 *   - El upload real del binario llega en MC-FOTOS-MVP-2.
 *   - Compila y corre sin credenciales: si el storage no está configurado,
 *     el adapter lo reporta de forma explícita en lugar de fallar silencioso.
 *
 * REGLAS:
 *   - storageKey SIEMPRE generada en servidor (nunca el nombre original
 *     del archivo: evita colisiones y fuga de metadatos del dispositivo).
 *   - Patrón de key: patients/{patientId}/meal-photos/{year}/{month}/{fileId}
 *   - NUNCA URLs públicas permanentes: la entrega futura será por URL
 *     firmada o endpoint controlado.
 */

import { randomUUID } from "node:crypto";
import {
  getStorageConfig,
  IMAGE_EXTENSION_BY_MIME,
} from "../config/storage.js";

/**
 * Contrato del adapter. La implementación S3 real (con SDK y URLs firmadas)
 * se agrega en MC-FOTOS-MVP-2 cuando se autorice el upload.
 */
export interface MealPhotoStorageAdapter {
  /** true si hay configuración S3 completa en el entorno. */
  isConfigured(): boolean;
  /**
   * Sube el binario de la foto a la key indicada.
   * En MC-FOTOS-MVP-1 NO está implementado: rechaza con error explícito.
   */
  putObject(key: string, body: Buffer, contentType: string): Promise<void>;
}

/**
 * Construye la storageKey de una foto de comida.
 *
 * patients/{patientId}/meal-photos/{year}/{month}/{fileId}.{ext}
 *
 * - year/month: del momento de la carga (UTC) — evita directorios gigantes.
 * - fileId: UUID generado en servidor.
 * - ext: derivada del MIME type aceptado; "bin" como fallback defensivo
 *   (el MIME ya se valida antes, en la capa de entrada).
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

/**
 * Adapter actual: contrato sin upload real.
 * MC-FOTOS-MVP-2 lo reemplaza por la implementación S3 (SDK + credenciales
 * vía variables de entorno, nunca hardcodeadas).
 */
class NotImplementedMealPhotoStorage implements MealPhotoStorageAdapter {
  isConfigured(): boolean {
    return getStorageConfig() !== null;
  }

  async putObject(): Promise<void> {
    throw new Error(
      "Upload de fotos no implementado en MC-FOTOS-MVP-1. " +
        "El binario se sube en MC-FOTOS-MVP-2 (requiere autorización).",
    );
  }
}

let adapter: MealPhotoStorageAdapter | null = null;

/** Singleton del adapter de storage de fotos de comidas. */
export function getMealPhotoStorage(): MealPhotoStorageAdapter {
  if (!adapter) {
    adapter = new NotImplementedMealPhotoStorage();
  }
  return adapter;
}
