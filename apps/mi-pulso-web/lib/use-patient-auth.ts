/**
 * Hook de autenticación demo paciente para Mi Pulso — MC-MIPULSO-1.
 *
 * - login(email, password) contra POST /auth/login.
 * - Token persistido en localStorage (simple, solo para demo).
 * - logout() limpia token y sesión.
 * - El token nunca se expone completo en UI ni en logs.
 *
 * SOLO LECTURA: no realiza ninguna escritura de datos del paciente.
 */

"use client";

import { useState, useCallback, useEffect } from "react";
import type { AuthUser } from "@pulso/shared";
import { ApiError, getApiClient, initializeApiClient } from "./api-client";
import { getDataConfig } from "./data-config";

const TOKEN_STORAGE_KEY = "pulso_mi_pulso_demo_token";

export interface PatientAuthState {
  token: string | null;
  user: AuthUser | null;
  loading: boolean;
  error: string | null;
}

export function usePatientAuth(): PatientAuthState & {
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
} {
  const [token, setToken] = useState<string | null>(null);
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Rehidratar token desde localStorage al montar (solo navegador).
  useEffect(() => {
    const config = getDataConfig();
    if (config.mode !== "api" || !config.apiBaseUrl) return;

    const stored =
      typeof window !== "undefined"
        ? window.localStorage.getItem(TOKEN_STORAGE_KEY)
        : null;
    if (!stored) return;

    const client = initializeApiClient(config.apiBaseUrl);
    client.setToken(stored);
    setToken(stored);

    // Validar el token contra /auth/me; si falla, limpiar sesión.
    client
      .getMe()
      .then((me) => setUser(me))
      .catch(() => {
        window.localStorage.removeItem(TOKEN_STORAGE_KEY);
        client.setToken(null);
        setToken(null);
        setUser(null);
      });
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    setLoading(true);
    setError(null);
    try {
      const config = getDataConfig();
      if (config.mode !== "api" || !config.apiBaseUrl) {
        throw new Error("API no configurada");
      }

      const client = initializeApiClient(config.apiBaseUrl);
      const response = await client.login(email, password);

      setToken(response.token);
      setUser(response.user);
      if (typeof window !== "undefined") {
        window.localStorage.setItem(TOKEN_STORAGE_KEY, response.token);
      }
    } catch (e) {
      const msg =
        e instanceof ApiError
          ? e.message
          : e instanceof Error
            ? e.message
            : "Error desconocido";
      setError(msg);
      setToken(null);
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  const logout = useCallback(() => {
    setToken(null);
    setUser(null);
    setError(null);
    if (typeof window !== "undefined") {
      window.localStorage.removeItem(TOKEN_STORAGE_KEY);
    }
    try {
      getApiClient().logout();
    } catch {
      // cliente no inicializado — nada que limpiar
    }
  }, []);

  return { token, user, loading, error, login, logout };
}
