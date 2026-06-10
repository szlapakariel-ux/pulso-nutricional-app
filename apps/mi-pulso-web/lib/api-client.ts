/**
 * Cliente HTTP mínimo para la API Railway desde Mi Pulso.
 *
 * MC-MIPULSO-1: lectura inicial del paciente demo.
 *   - POST /auth/login            → login demo paciente
 *   - GET  /auth/me               → usuario del token (userId, email, role)
 *   - GET  /patients/:id/today    → vista "Hoy" (plan + agenda)
 *
 * SOLO LECTURA. No escribe datos (sin registros de comidas/peso/actividad).
 * El token nunca se imprime completo.
 */

import type {
  AuthUser,
  LoginRequest,
  LoginResponse,
  PatientTodayView,
} from "@pulso/shared";

export class ApiError extends Error {
  constructor(
    message: string,
    public status?: number,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

class ApiClient {
  private baseUrl: string;
  private token: string | null = null;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl.replace(/\/$/, ""); // sin barra final
  }

  setToken(token: string | null) {
    this.token = token;
  }

  getToken() {
    return this.token;
  }

  private async fetch<T>(path: string, options?: RequestInit): Promise<T> {
    const url = `${this.baseUrl}${path}`;
    const headers = new Headers(options?.headers || {});

    if (!headers.has("Content-Type")) {
      headers.set("Content-Type", "application/json");
    }
    if (this.token) {
      headers.set("Authorization", `Bearer ${this.token}`);
    }

    const response = await fetch(url, { ...options, headers });

    if (!response.ok) {
      if (response.status === 401) {
        this.token = null;
        throw new ApiError("Unauthorized", 401);
      }
      throw new ApiError(`HTTP ${response.status}`, response.status);
    }

    const data = await response.json();
    return (data.data ?? data) as T; // soporta { data: T } y T directo
  }

  /** POST /auth/login — login demo paciente. */
  async login(email: string, password: string): Promise<LoginResponse> {
    const body: LoginRequest = { email, password };
    const response = await this.fetch<LoginResponse>("/auth/login", {
      method: "POST",
      body: JSON.stringify(body),
    });
    this.token = response.token;
    return response;
  }

  /** GET /auth/me — usuario del token. */
  async getMe(): Promise<AuthUser> {
    return this.fetch<AuthUser>("/auth/me");
  }

  /** GET /patients/:patientId/today — vista Hoy. 404 → null. */
  async getToday(patientId: string): Promise<PatientTodayView | null> {
    try {
      return await this.fetch<PatientTodayView>(
        `/patients/${patientId}/today`,
      );
    } catch (e) {
      if (e instanceof ApiError && e.status === 404) {
        return null;
      }
      throw e;
    }
  }

  logout() {
    this.token = null;
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
      "API client no inicializado. Llamá initializeApiClient() primero.",
    );
  }
  return instance;
}
