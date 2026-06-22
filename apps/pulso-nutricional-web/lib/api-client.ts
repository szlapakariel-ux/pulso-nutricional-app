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
  ReviewInboxResponse,
  ReviewActionPreview,
  MealPhotoLog,
  MealPhotoReviewDraft,
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

  async createPatient(draft: { fullName: string; age?: number; goal?: string }): Promise<PatientDetail> {
    return this.fetch<PatientDetail>("/patients", {
      method: "POST",
      body: JSON.stringify(draft),
    });
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

  /** GET /patients/:patientId/review-inbox — bandeja de revisión (MC-INTEGRACION-1). */
  async getReviewInbox(patientId: string): Promise<ReviewInboxResponse> {
    return this.fetch<ReviewInboxResponse>(
      `/patients/${patientId}/review-inbox`,
    );
  }

  /** POST /review-inbox/:entryId/action/preview — acción de revisión (MC-INTEGRACION-1). */
  async postReviewAction(
    entryId: string,
    actionType: string,
    comment?: string,
  ): Promise<ReviewActionPreview> {
    return this.fetch<ReviewActionPreview>(
      `/review-inbox/${entryId}/action/preview`,
      {
        method: "POST",
        body: JSON.stringify({ actionType, comment }),
      },
    );
  }

  /** GET /patients/:patientId/meal-photos — listado de fotos (MC-FOTOS-MVP-3). */
  async listMealPhotos(patientId: string): Promise<MealPhotoLog[]> {
    return this.fetch<MealPhotoLog[]>(`/patients/${patientId}/meal-photos`);
  }

  /**
   * GET /patients/:patientId/meal-photos/:photoId/image — binario (MC-FOTOS-MVP-4).
   *
   * Descarga el binario autenticado (Bearer) y devuelve un object URL para usar
   * en <img src>. El caller debe revocar la URL (URL.revokeObjectURL) al
   * desmontar. Lanza ApiError si el binario no está disponible (404) — la UI
   * cae al placeholder.
   */
  async getMealPhotoImageUrl(
    patientId: string,
    photoId: string,
  ): Promise<string> {
    const url = `${this.baseUrl}/patients/${patientId}/meal-photos/${photoId}/image`;
    const headers = new Headers();
    if (this.token) {
      headers.set("Authorization", `Bearer ${this.token}`);
    }
    const response = await fetch(url, { headers });
    if (!response.ok) {
      if (response.status === 401) {
        this.token = null;
      }
      throw new ApiError(`HTTP ${response.status}`, response.status);
    }
    const blob = await response.blob();
    return URL.createObjectURL(blob);
  }

  /** POST /patients/:patientId/meal-photos/:photoId/review — revisar foto (MC-FOTOS-MVP-3). */
  async reviewMealPhoto(
    patientId: string,
    photoId: string,
    draft: MealPhotoReviewDraft,
  ): Promise<MealPhotoLog> {
    return this.fetch<MealPhotoLog>(
      `/patients/${patientId}/meal-photos/${photoId}/review`,
      {
        method: "POST",
        body: JSON.stringify(draft),
      },
    );
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
