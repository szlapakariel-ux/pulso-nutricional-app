/**
 * Configuración de fuente de datos (mock vs API) para Mi Pulso.
 *
 * MC-MIPULSO-1: lectura inicial desde API Railway para el paciente demo.
 *
 * - "mock" (default): sigue usando los mocks locales (comportamiento previo).
 * - "api": consume la API real con login demo paciente.
 *
 * Si NEXT_PUBLIC_PULSO_DATA_MODE no existe → "mock".
 * Si mode="api" pero falta NEXT_PUBLIC_PULSO_API_BASE_URL → fallback a "mock".
 */

export type DataMode = "mock" | "api";

export interface DataConfig {
  mode: DataMode;
  apiBaseUrl?: string;
}

export function getDataConfig(): DataConfig {
  const mode = (process.env.NEXT_PUBLIC_PULSO_DATA_MODE || "mock") as DataMode;
  const apiBaseUrl = process.env.NEXT_PUBLIC_PULSO_API_BASE_URL;

  if (mode === "api" && !apiBaseUrl) {
    console.warn(
      "[DataConfig] NEXT_PUBLIC_PULSO_DATA_MODE=api pero NEXT_PUBLIC_PULSO_API_BASE_URL no está definido. Usando mocks como fallback.",
    );
    return { mode: "mock" };
  }

  return { mode, apiBaseUrl };
}

export function isMockMode(): boolean {
  return getDataConfig().mode === "mock";
}

export function isApiMode(): boolean {
  return getDataConfig().mode === "api";
}
