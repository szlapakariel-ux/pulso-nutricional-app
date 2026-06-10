"use client";

import { useState, useEffect, useCallback } from "react";
import type { PatientTodayView } from "@pulso/shared";
import { MOCK_TODAY_VIEWS, DEMO_PATIENT_LABELS } from "./today.mock";
import { TodayContent } from "./today-content";
import { getDataConfig } from "../lib/data-config";
import { ApiError, getApiClient } from "../lib/api-client";
import { usePatientAuth } from "../lib/use-patient-auth";

const DEMO_PATIENT_IDS = ["demo-1", "demo-2", "demo-3"];

/** Credenciales demo paciente (ficticias, documentadas en el repo). */
const DEMO_PATIENT_EMAIL = "paciente-demo-uno@pulsonutricional.demo";
const DEMO_PATIENT_PASSWORD = "demo-paciente-2026";

/** Badge de modo en el header. */
function ModeBadge({ label, tone }: { label: string; tone: "mock" | "api" | "error" }) {
  const bg =
    tone === "api"
      ? "rgba(34,197,94,0.25)"
      : tone === "error"
        ? "rgba(239,68,68,0.3)"
        : "rgba(255,255,255,0.25)";
  return (
    <span
      style={{
        fontSize: "0.7rem",
        background: bg,
        padding: "0.1rem 0.45rem",
        borderRadius: 99,
        marginLeft: "0.25rem",
        whiteSpace: "nowrap",
      }}
    >
      {label}
    </span>
  );
}

/** Shell común: contenedor + header. */
function Shell({
  date,
  badge,
  children,
}: {
  date: string;
  badge: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div
      style={{
        maxWidth: 430,
        margin: "0 auto",
        minHeight: "100dvh",
        background: "#f9fafb",
        fontFamily: "system-ui, -apple-system, sans-serif",
      }}
    >
      <header
        style={{
          background: "#2563eb",
          color: "white",
          padding: "1rem 1.25rem 1.25rem",
          position: "sticky",
          top: 0,
          zIndex: 10,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.15rem", flexWrap: "wrap" }}>
          <span style={{ fontSize: "1.35rem", fontWeight: 700, letterSpacing: "-0.5px" }}>
            Mi Pulso
          </span>
          {badge}
        </div>
        <p style={{ margin: 0, fontSize: "0.85rem", opacity: 0.85 }}>
          Hoy · {date}
        </p>
      </header>
      <main style={{ padding: "1rem 1rem 5rem" }}>{children}</main>
    </div>
  );
}

/** Banner de demo/ficticio. */
function DemoBanner() {
  return (
    <div
      style={{
        background: "#fffbe6",
        border: "1px solid #ffe58f",
        borderRadius: 10,
        padding: "0.6rem 0.9rem",
        marginBottom: "1rem",
        fontSize: "0.8rem",
        color: "#614700",
      }}
    >
      ⚠️ Datos ficticios de demostración. No representan información clínica
      real.
    </div>
  );
}

/** Vista Hoy en modo mock — comportamiento previo (selector demo). */
function HoyMockView() {
  const [patientId, setPatientId] = useState("demo-1");
  const view = MOCK_TODAY_VIEWS[patientId];

  const date = view?.date ?? new Date().toISOString().split("T")[0] ?? "";

  return (
    <Shell date={date} badge={<ModeBadge label="Modo mock" tone="mock" />}>
      <DemoBanner />

      {/* Selector de paciente demo (solo modo mock) */}
      <div
        style={{
          background: "white",
          border: "1px solid #e5e7eb",
          borderRadius: 12,
          padding: "0.9rem 1rem",
          marginBottom: "1.25rem",
        }}
      >
        <p
          style={{
            margin: "0 0 0.5rem",
            fontSize: "0.75rem",
            color: "#6b7280",
            textTransform: "uppercase",
            letterSpacing: "0.05em",
            fontWeight: 600,
          }}
        >
          Paciente (selector demo)
        </p>
        <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
          {DEMO_PATIENT_IDS.map((id) => (
            <button
              key={id}
              onClick={() => setPatientId(id)}
              style={{
                padding: "0.35rem 0.75rem",
                borderRadius: 99,
                border: "1px solid",
                borderColor: patientId === id ? "#2563eb" : "#e5e7eb",
                background: patientId === id ? "#eff6ff" : "white",
                color: patientId === id ? "#2563eb" : "#374151",
                fontSize: "0.82rem",
                fontWeight: patientId === id ? 600 : 400,
                cursor: "pointer",
              }}
            >
              {DEMO_PATIENT_LABELS[id] ?? id}
            </button>
          ))}
        </div>
      </div>

      {view ? (
        <TodayContent view={view} />
      ) : (
        <div style={{ padding: "2rem", textAlign: "center", color: "#888" }}>
          Paciente no encontrado.
        </div>
      )}
    </Shell>
  );
}

/** Formulario de login demo paciente (modo api, sin token). */
function PatientLoginForm({
  onSubmit,
  loading,
  error,
}: {
  onSubmit: (email: string, password: string) => void;
  loading: boolean;
  error: string | null;
}) {
  const [email, setEmail] = useState(DEMO_PATIENT_EMAIL);
  const [password, setPassword] = useState(DEMO_PATIENT_PASSWORD);

  return (
    <div
      style={{
        background: "white",
        border: "1px solid #e5e7eb",
        borderRadius: 12,
        padding: "1.25rem",
      }}
    >
      <p style={{ margin: "0 0 1rem", fontWeight: 600, color: "#111827" }}>
        Iniciar sesión demo paciente
      </p>

      <label style={{ display: "block", marginBottom: "0.75rem" }}>
        <span style={{ display: "block", fontSize: "0.78rem", color: "#6b7280", marginBottom: "0.25rem" }}>
          Email
        </span>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          style={{
            width: "100%",
            padding: "0.6rem 0.75rem",
            border: "1px solid #d1d5db",
            borderRadius: 8,
            fontSize: "0.85rem",
            boxSizing: "border-box",
          }}
        />
      </label>

      <label style={{ display: "block", marginBottom: "1rem" }}>
        <span style={{ display: "block", fontSize: "0.78rem", color: "#6b7280", marginBottom: "0.25rem" }}>
          Contraseña
        </span>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          style={{
            width: "100%",
            padding: "0.6rem 0.75rem",
            border: "1px solid #d1d5db",
            borderRadius: 8,
            fontSize: "0.85rem",
            boxSizing: "border-box",
          }}
        />
      </label>

      {error && (
        <div
          style={{
            marginBottom: "1rem",
            padding: "0.6rem 0.75rem",
            background: "#fef2f2",
            border: "1px solid #fecaca",
            borderRadius: 8,
            color: "#b91c1c",
            fontSize: "0.82rem",
          }}
        >
          {error}
        </div>
      )}

      <button
        type="button"
        disabled={loading}
        onClick={() => onSubmit(email, password)}
        style={{
          width: "100%",
          padding: "0.7rem",
          background: loading ? "#93c5fd" : "#2563eb",
          color: "white",
          border: "none",
          borderRadius: 8,
          fontSize: "0.9rem",
          fontWeight: 600,
          cursor: loading ? "not-allowed" : "pointer",
        }}
      >
        {loading ? "Conectando…" : "Conectar"}
      </button>

      <p style={{ margin: "0.9rem 0 0", fontSize: "0.75rem", color: "#9ca3af", textAlign: "center" }}>
        Credenciales demo precargadas (ficticias).
      </p>
    </div>
  );
}

/** Vista Hoy en modo api — login demo paciente + carga desde API. */
function HoyApiView() {
  const auth = usePatientAuth();
  const [todayView, setTodayView] = useState<PatientTodayView | null>(null);
  const [todayLoading, setTodayLoading] = useState(false);
  const [todayError, setTodayError] = useState<string | null>(null);
  const [blocked, setBlocked] = useState<string | null>(null);

  const loadToday = useCallback(async (patientId: string) => {
    setTodayError(null);
    setBlocked(null);
    setTodayLoading(true);
    try {
      const view = await getApiClient().getToday(patientId);
      if (!view) {
        setTodayError("La API no devolvió la vista Hoy (404).");
        setTodayView(null);
      } else {
        setTodayView(view);
      }
    } catch (e) {
      if (e instanceof ApiError && e.status === 401) {
        auth.logout();
        setTodayView(null);
      } else {
        setTodayError(
          e instanceof Error ? e.message : "Error de conexión con la API.",
        );
      }
    } finally {
      setTodayLoading(false);
    }
  }, [auth]);

  // Cuando hay usuario autenticado, cargar la vista Hoy.
  useEffect(() => {
    if (auth.user?.patientId) {
      void loadToday(auth.user.patientId);
    } else if (auth.user) {
      setBlocked("La API no devolvió el patientId del paciente autenticado.");
      setTodayView(null);
    } else {
      setTodayView(null);
    }
  }, [auth.user, loadToday]);

  const today = todayView?.date ?? new Date().toISOString().split("T")[0] ?? "";

  // Sin token → login.
  if (!auth.token) {
    return (
      <Shell
        date={today}
        badge={<ModeBadge label="Conectado a API" tone="api" />}
      >
        <PatientLoginForm
          onSubmit={(email, password) => void auth.login(email, password)}
          loading={auth.loading}
          error={auth.error}
        />
      </Shell>
    );
  }

  // Con token: barra de sesión + estado de carga / error / contenido.
  const hasError = Boolean(todayError || blocked);
  return (
    <Shell
      date={today}
      badge={
        <ModeBadge
          label={hasError ? "Error de conexión" : "Sesión demo paciente"}
          tone={hasError ? "error" : "api"}
        />
      }
    >
      {/* Barra de sesión */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          background: "white",
          border: "1px solid #e5e7eb",
          borderRadius: 12,
          padding: "0.6rem 0.9rem",
          marginBottom: "1rem",
        }}
      >
        <span style={{ fontSize: "0.8rem", color: "#374151" }}>
          {auth.user?.email ?? "Sesión activa"}
        </span>
        <button
          type="button"
          onClick={() => auth.logout()}
          style={{
            padding: "0.35rem 0.75rem",
            border: "1px solid #d1d5db",
            borderRadius: 8,
            background: "white",
            color: "#374151",
            fontSize: "0.78rem",
            cursor: "pointer",
          }}
        >
          Cerrar sesión
        </button>
      </div>

      <DemoBanner />

      {blocked && (
        <div
          style={{
            background: "#fff7ed",
            border: "1px solid #fed7aa",
            borderRadius: 10,
            padding: "0.8rem 0.9rem",
            fontSize: "0.82rem",
            color: "#9a3412",
          }}
        >
          ⚠️ {blocked}
        </div>
      )}

      {todayError && !blocked && (
        <div
          style={{
            background: "#fef2f2",
            border: "1px solid #fecaca",
            borderRadius: 10,
            padding: "0.8rem 0.9rem",
            fontSize: "0.82rem",
            color: "#b91c1c",
          }}
        >
          No se pudo cargar tu información: {todayError}
        </div>
      )}

      {todayLoading && (
        <div style={{ padding: "2rem", textAlign: "center", color: "#9ca3af" }}>
          Cargando tu día…
        </div>
      )}

      {!todayLoading && !hasError && todayView && (
        <TodayContent view={todayView} />
      )}
    </Shell>
  );
}

export function HoyView() {
  const mode = getDataConfig().mode;
  if (mode === "api") return <HoyApiView />;
  return <HoyMockView />;
}
