/**
 * Cliente HTTP mínimo para la API Railway desde Mi Pulso.
 *
 * MC-MIPULSO-1: lectura inicial del paciente demo.
 *   - POST /auth/login            → login demo paciente
 *   - GET  /auth/me               → usuario del token (userId, email, role)
 *   - GET  /patients/:id/today    → vista "Hoy" (plan + agenda)
 *
 * MC-FOTOS-MVP-2: escritura de fotos de comidas.
 *   - POST /patients/:id/meal-photos → crea registro con imagen (multipart)
 *     Responde metadata (MealPhotoLog), nunca el binario.
 *
 * El token nunca se imprime completo.
 */

import type {
  AuthUser,
  LoginRequest,
  LoginResponse,
  MealPhotoLog,
  MealPhotoType,
  PatientTodayView,
  PatientMealLogDraft,
  PatientWeightLogDraft,
  PatientNoteDraft,
  PatientMealLogReviewable,
  PatientWeightLogReviewable,
  PatientNoteReviewable,
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
    return (data.data ?? data) as T;
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

  /** POST /patients/:patientId/meal-logs — registra comida (MC-INTEGRACION-1). */
  async createMealLog(
    patientId: string,
    draft: PatientMealLogDraft,
  ): Promise<PatientMealLogReviewable> {
    return this.fetch<PatientMealLogReviewable>(
      `/patients/${patientId}/meal-logs`,
      { method: "POST", body: JSON.stringify(draft) },
    );
  }

  /** POST /patients/:patientId/weight-logs — registra peso (MC-INTEGRACION-1). */
  async createWeightLog(
    patientId: string,
    draft: PatientWeightLogDraft,
  ): Promise<PatientWeightLogReviewable> {
    return this.fetch<PatientWeightLogReviewable>(
      `/patients/${patientId}/weight-logs`,
      { method: "POST", body: JSON.stringify(draft) },
    );
  }

  /** POST /patients/:patientId/notes — registra nota (MC-INTEGRACION-1). */
  async createNote(
    patientId: string,
    draft: PatientNoteDraft,
  ): Promise<PatientNoteReviewable> {
    return this.fetch<PatientNoteReviewable>(
      `/patients/${patientId}/notes`,
      { method: "POST", body: JSON.stringify(draft) },
    );
  }

  /**
   * POST /patients/:patientId/meal-photos — sube foto de comida.
   *
   * Envía multipart/form-data con los campos:
   *   - file: la imagen (jpeg / png / webp, máx 5 MB)
   *   - mealType: valor de MealPhotoType
   *   - patientComment: comentario opcional
   *
   * Devuelve metadata (MealPhotoLog); nunca el binario ni URL pública.
   * El registro nace con origin "patient_reported" y reviewStatus "pending".
   */
  async createMealPhoto(
    patientId: string,
    mealType: MealPhotoType,
    file: File,
    patientComment?: string,
  ): Promise<MealPhotoLog> {
    const url = `${this.baseUrl}/patients/${patientId}/meal-photos`;
    const formData = new FormData();
    formData.append("file", file);
    formData.append("mealType", mealType);
    if (patientComment?.trim()) {
      formData.append("patientComment", patientComment.trim());
    }

    // No establecer Content-Type manualmente: el browser lo fija con boundary
    const headers = new Headers();
    if (this.token) {
      headers.set("Authorization", `Bearer ${this.token}`);
    }

    const response = await fetch(url, {
      method: "POST",
      headers,
      body: formData,
    });

    if (!response.ok) {
      if (response.status === 401) {
        this.token = null;
        throw new ApiError("Unauthorized", 401);
      }
      const body = await response
        .json()
        .catch(() => ({ error: { message: `HTTP ${response.status}` } }));
      const msg =
        (body as { error?: { message?: string } }).error?.message ??
        `HTTP ${response.status}`;
      throw new ApiError(msg, response.status);
    }

    const data = await response.json();
    return ((data as { data?: MealPhotoLog }).data ?? data) as MealPhotoLog;
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
