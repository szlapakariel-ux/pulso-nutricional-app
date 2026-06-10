/**
 * Cliente HTTP mínimo para la API Railway de Pulso Nutricional.
 *
 * MC-WEB-1: lectura inicial (pacientes, ficha, plan, agenda).
 * No escribe datos; solo consulta endpoints públicos y protegidos con token.
 */

import type {
  PatientSummary,
  PatientDetail,
  PatientPlanAssignment,
  PatientDailyAgenda,
  LoginResponse,
  LoginRequest,
} from "@pulso/shared";

export interface ApiClientConfig {
  baseUrl: string;
  token?: string;
}

class ApiClient {
  private baseUrl: string;
  private token: string | null = null;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl.replace(/\/$/, ""); // remove trailing slash
  }

  setToken(token: string | null) {
    this.token = token;
  }

  getToken() {
    return this.token;
  }

  private async fetch<T>(
    path: string,
    options?: RequestInit,
  ): Promise<T> {
    const url = `${this.baseUrl}${path}`;
    const headers = new Headers(options?.headers || {});

    if (!headers.has("Content-Type")) {
      headers.set("Content-Type", "application/json");
    }

    if (this.token) {
      headers.set("Authorization", `Bearer ${this.token}`);
    }

    const response = await fetch(url, {
      ...options,
      headers,
    });

    if (!response.ok) {
      if (response.status === 401) {
        this.token = null;
        throw new ApiError("Unauthorized", response.status);
      }
      throw new ApiError(`HTTP ${response.status}`, response.status);
    }

    const data = await response.json();
    return data.data ?? data; // handle both { data: T } and direct T
  }

  async login(email: string, password: string): Promise<LoginResponse> {
    const body: LoginRequest = { email, password };
    const response = await this.fetch<LoginResponse>("/auth/login", {
      method: "POST",
      body: JSON.stringify(body),
    });
    this.token = response.token;
    return response;
  }

  async logout() {
    this.token = null;
  }

  async getPatients(): Promise<PatientSummary[]> {
    return this.fetch<PatientSummary[]>("/patients");
  }

  async getPatient(id: string): Promise<PatientDetail> {
    return this.fetch<PatientDetail>(`/patients/${id}`);
  }

  async getMealPlan(
    patientId: string,
  ): Promise<PatientPlanAssignment | null> {
    try {
      return await this.fetch<PatientPlanAssignment>(
        `/patients/${patientId}/meal-plan`,
      );
    } catch (e) {
      if (e instanceof ApiError && e.status === 404) {
        return null;
      }
      throw e;
    }
  }

  async getAgenda(patientId: string): Promise<PatientDailyAgenda | null> {
    try {
      return await this.fetch<PatientDailyAgenda>(
        `/patients/${patientId}/agenda`,
      );
    } catch (e) {
      if (e instanceof ApiError && e.status === 404) {
        return null;
      }
      throw e;
    }
  }
}

export class ApiError extends Error {
  constructor(
    message: string,
    public status?: number,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

let instance: ApiClient | null = null;

export function initializeApiClient(baseUrl: string): ApiClient {
  instance = new ApiClient(baseUrl);
  return instance;
}

export function getApiClient(): ApiClient {
  if (!instance) {
    throw new Error(
      "API client not initialized. Call initializeApiClient() first.",
    );
  }
  return instance;
}
