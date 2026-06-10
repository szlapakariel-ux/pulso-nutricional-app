/**
 * Hook para manejo de autenticación demo profesional contra la API Railway.
 *
 * MC-WEB-1: login demo + token en memoria.
 */

"use client";

import { useState, useCallback } from "react";
import type { AuthUser } from "@pulso/shared";
import { getApiClient, ApiError, initializeApiClient } from "./api-client";
import { getDataConfig } from "./data-config";

export interface ApiAuthState {
  token: string | null;
  user: AuthUser | null;
  loading: boolean;
  error: string | null;
}

export function useApiAuth(): ApiAuthState & {
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
} {
  const [token, setToken] = useState<string | null>(null);
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

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
    } catch (e) {
      const msg =
        e instanceof ApiError ? e.message : e instanceof Error ? e.message : "Error desconocido";
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
    const client = getApiClient();
    client.logout();
  }, []);

  return {
    token,
    user,
    loading,
    error,
    login,
    logout,
  };
}
