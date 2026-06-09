/** Tipos del endpoint /health de la API. */

export interface HealthStatus {
  status: "ok" | "degraded" | "down";
  service: string;
  version: string;
  timestamp: string;
  environment: string;
}

export interface HealthResponse {
  data: HealthStatus;
}
