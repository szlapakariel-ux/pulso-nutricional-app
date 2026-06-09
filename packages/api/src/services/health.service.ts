import type { HealthStatus } from "@pulso/shared";

/** Devuelve el estado de salud actual de la API. Sin acceso a DB. */
export function getHealthStatus(): HealthStatus {
  return {
    status: "ok",
    service: "pulso-nutricional-api",
    version: "0.0.0-mc4",
    timestamp: new Date().toISOString(),
    environment: process.env["NODE_ENV"] ?? "development",
  };
}
