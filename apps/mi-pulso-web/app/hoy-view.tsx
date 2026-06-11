"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import type { MealPhotoType, PatientTodayView } from "@pulso/shared";
import { MOCK_TODAY_VIEWS, DEMO_PATIENT_LABELS } from "./today.mock";
import { TodayContent } from "./today-content";
import { getDataConfig } from "../lib/data-config";
import { ApiError, getApiClient } from "../lib/api-client";
import { usePatientAuth } from "../lib/use-patient-auth";

const DEMO_PATIENT_IDS = ["demo-1", "demo-2", "demo-3"];

const DEMO_PATIENT_EMAIL = "paciente-demo-uno@pulsonutricional.demo";
const DEMO_PATIENT_PASSWORD = "demo-paciente-2026";

const MEAL_TYPE_LABELS: Record<MealPhotoType, string> = {
  breakfast: "Desayuno",
  lunch: "Almuerzo",
  snack: "Merienda",
  dinner: "Cena",
  collation: "Colación",
  other: "Otro",
};

const ALLOWED_PHOTO_MIME = ["image/jpeg", "image/png", "image/webp"];
const MAX_PHOTO_BYTES = 5 * 1024 * 1024;

/** Badge de modo en el header. */
function ModeBadge({
  label,
  tone,
}: {
  label: string;
  tone: "mock" | "api" | "error";
}) {
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
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "0.5rem",
            marginBottom: "0.15rem",
            flexWrap: "wrap",
          }}
        >
          <span
            style={{
              fontSize: "1.35rem",
              fontWeight: 700,
              letterSpacing: "-0.5px",
            }}
          >
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
    <Shell date={date} badge={<ModeBadge label="Demo" tone="mock" />}>
      <DemoBanner />

      {/* Selector de paciente (solo modo demo) */}
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
          Seleccionar paciente
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

/** Botón de acceso a demo para el paciente (modo api, sin token). */
function PatientLoginForm({
  onSubmit,
  loading,
  error,
}: {
  onSubmit: (email: string, password: string) => void;
  loading: boolean;
  error: string | null;
}) {
  return (
    <div
      style={{
        background: "white",
        border: "1px solid #e5e7eb",
        borderRadius: 12,
        padding: "1.5rem",
        textAlign: "center",
      }}
    >
      <p style={{ margin: "0 0 1.25rem", fontWeight: 600, color: "#111827", fontSize: "1rem" }}>
        Mi Pulso
      </p>

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
        onClick={() => onSubmit(DEMO_PATIENT_EMAIL, DEMO_PATIENT_PASSWORD)}
        style={{
          width: "100%",
          padding: "0.8rem",
          background: loading ? "#93c5fd" : "#2563eb",
          color: "white",
          border: "none",
          borderRadius: 8,
          fontSize: "0.95rem",
          fontWeight: 600,
          cursor: loading ? "not-allowed" : "pointer",
        }}
      >
        {loading ? "Ingresando…" : "Ingresar como paciente demo"}
      </button>

      <p
        style={{
          margin: "1rem 0 0",
          fontSize: "0.72rem",
          color: "#9ca3af",
        }}
      >
        Ambiente de demostración · Datos ficticios
      </p>
    </div>
  );
}

/**
 * Formulario para registrar una foto de comida.
 * MC-FOTOS-MVP-2: primera escritura real desde Mi Pulso.
 *
 * - Acepta jpeg / png / webp, máx 5 MB.
 * - Preview antes de enviar.
 * - El registro nace como dato revisable (patient_reported / pending).
 */
function RegisterPhotoForm({
  patientId,
  onClose,
}: {
  patientId: string;
  onClose: () => void;
}) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [mealType, setMealType] = useState<MealPhotoType>("breakfast");
  const [comment, setComment] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  // Liberar la URL de preview al desmontar o al cambiar archivo
  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    };
  }, [previewUrl]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] ?? null;
    setError(null);
    setSuccess(false);

    if (!file) {
      setSelectedFile(null);
      if (previewUrl) URL.revokeObjectURL(previewUrl);
      setPreviewUrl(null);
      return;
    }

    if (!ALLOWED_PHOTO_MIME.includes(file.type)) {
      setError(
        `Formato no soportado: ${file.type || "desconocido"}. Usá JPEG, PNG o WebP.`,
      );
      setSelectedFile(null);
      setPreviewUrl(null);
      return;
    }

    if (file.size > MAX_PHOTO_BYTES) {
      setError(
        `La imagen es demasiado grande (${(file.size / (1024 * 1024)).toFixed(1)} MB). Máximo: 5 MB.`,
      );
      setSelectedFile(null);
      setPreviewUrl(null);
      return;
    }

    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setSelectedFile(file);
    setPreviewUrl(URL.createObjectURL(file));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFile) return;

    setSubmitting(true);
    setError(null);
    try {
      await getApiClient().createMealPhoto(
        patientId,
        mealType,
        selectedFile,
        comment.trim() || undefined,
      );
      setSuccess(true);
      setSelectedFile(null);
      if (previewUrl) URL.revokeObjectURL(previewUrl);
      setPreviewUrl(null);
      setComment("");
      if (fileInputRef.current) fileInputRef.current.value = "";
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.message);
      } else {
        setError("Error al enviar la foto. Intentá de nuevo.");
      }
    } finally {
      setSubmitting(false);
    }
  };

  if (success) {
    return (
      <div
        style={{
          background: "white",
          border: "1px solid #e5e7eb",
          borderRadius: 12,
          padding: "1.25rem",
          marginTop: "1rem",
        }}
      >
        <div
          style={{
            background: "#f0fdf4",
            border: "1px solid #bbf7d0",
            borderRadius: 10,
            padding: "1rem",
            marginBottom: "1rem",
            textAlign: "center",
          }}
        >
          <p
            style={{
              margin: "0 0 0.25rem",
              fontSize: "1rem",
              fontWeight: 600,
              color: "#166534",
            }}
          >
            Comida registrada
          </p>
          <p style={{ margin: 0, fontSize: "0.85rem", color: "#166534" }}>
            Pendiente de revisión por tu profesional.
          </p>
        </div>
        <div style={{ display: "flex", gap: "0.5rem" }}>
          <button
            type="button"
            onClick={() => setSuccess(false)}
            style={{
              flex: 1,
              padding: "0.6rem",
              background: "#2563eb",
              color: "white",
              border: "none",
              borderRadius: 8,
              fontWeight: 600,
              fontSize: "0.85rem",
              cursor: "pointer",
            }}
          >
            Registrar otra
          </button>
          <button
            type="button"
            onClick={onClose}
            style={{
              flex: 1,
              padding: "0.6rem",
              background: "white",
              color: "#374151",
              border: "1px solid #d1d5db",
              borderRadius: 8,
              fontWeight: 500,
              fontSize: "0.85rem",
              cursor: "pointer",
            }}
          >
            Cerrar
          </button>
        </div>
      </div>
    );
  }

  return (
    <form
      onSubmit={(e) => void handleSubmit(e)}
      style={{
        background: "white",
        border: "1px solid #e5e7eb",
        borderRadius: 12,
        padding: "1.25rem",
        marginTop: "1rem",
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "1rem",
        }}
      >
        <h3 style={{ margin: 0, fontSize: "1rem", color: "#111827" }}>
          Registrar foto de comida
        </h3>
        <button
          type="button"
          onClick={onClose}
          style={{
            padding: "0.25rem 0.6rem",
            border: "1px solid #e5e7eb",
            borderRadius: 6,
            background: "white",
            color: "#6b7280",
            fontSize: "0.8rem",
            cursor: "pointer",
          }}
        >
          ✕
        </button>
      </div>

      {/* File input — sin capture: el SO ofrece cámara + galería */}
      <div style={{ marginBottom: "1rem" }}>
        <label
          style={{
            display: "block",
            fontSize: "0.85rem",
            fontWeight: 600,
            marginBottom: "0.4rem",
            color: "#374151",
          }}
        >
          Foto de la comida
        </label>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          onChange={handleFileChange}
          style={{
            display: "block",
            width: "100%",
            fontSize: "0.85rem",
            color: "#374151",
          }}
        />
        <p
          style={{
            margin: "0.3rem 0 0",
            fontSize: "0.72rem",
            color: "#9ca3af",
          }}
        >
          JPEG, PNG o WebP · máx. 5 MB
        </p>
      </div>

      {/* Preview */}
      {previewUrl && (
        <div style={{ marginBottom: "1rem" }}>
          <img
            src={previewUrl}
            alt="Preview"
            style={{
              width: "100%",
              maxHeight: 200,
              objectFit: "cover",
              borderRadius: 8,
              border: "1px solid #e5e7eb",
            }}
          />
        </div>
      )}

      {/* Tipo de comida */}
      <div style={{ marginBottom: "0.9rem" }}>
        <label
          style={{
            display: "block",
            fontSize: "0.85rem",
            fontWeight: 600,
            marginBottom: "0.4rem",
            color: "#374151",
          }}
        >
          Tipo de comida
        </label>
        <select
          value={mealType}
          onChange={(e) => setMealType(e.target.value as MealPhotoType)}
          style={{
            width: "100%",
            padding: "0.5rem",
            border: "1px solid #d1d5db",
            borderRadius: 6,
            fontSize: "0.9rem",
            boxSizing: "border-box",
            background: "white",
          }}
        >
          {Object.entries(MEAL_TYPE_LABELS).map(([val, label]) => (
            <option key={val} value={val}>
              {label}
            </option>
          ))}
        </select>
      </div>

      {/* Comentario opcional */}
      <div style={{ marginBottom: "1rem" }}>
        <label
          style={{
            display: "block",
            fontSize: "0.85rem",
            fontWeight: 600,
            marginBottom: "0.4rem",
            color: "#374151",
          }}
        >
          Comentario (opcional)
        </label>
        <input
          type="text"
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          placeholder='Ej: "comí afuera", "no había verdura"'
          maxLength={500}
          style={{
            width: "100%",
            padding: "0.5rem 0.65rem",
            border: "1px solid #d1d5db",
            borderRadius: 6,
            fontSize: "0.85rem",
            boxSizing: "border-box",
          }}
        />
      </div>

      {/* Aviso dato revisable */}
      <div
        style={{
          background: "#eff6ff",
          border: "1px solid #dbeafe",
          borderRadius: 8,
          padding: "0.65rem 0.8rem",
          marginBottom: "1rem",
          fontSize: "0.78rem",
          color: "#1e3a8a",
        }}
      >
        Tu foto quedará pendiente de revisión por tu profesional.
      </div>

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
        type="submit"
        disabled={!selectedFile || submitting}
        style={{
          width: "100%",
          padding: "0.7rem",
          background: selectedFile && !submitting ? "#2563eb" : "#d1d5db",
          color: "white",
          border: "none",
          borderRadius: 8,
          fontWeight: 600,
          fontSize: "0.9rem",
          cursor: selectedFile && !submitting ? "pointer" : "not-allowed",
        }}
      >
        {submitting ? "Enviando…" : "Registrar comida"}
      </button>
    </form>
  );
}

/** Vista Hoy en modo api — login demo paciente + carga desde API. */
function HoyApiView() {
  const auth = usePatientAuth();
  const [todayView, setTodayView] = useState<PatientTodayView | null>(null);
  const [todayLoading, setTodayLoading] = useState(false);
  const [todayError, setTodayError] = useState<string | null>(null);
  const [blocked, setBlocked] = useState<string | null>(null);
  const [showPhotoForm, setShowPhotoForm] = useState(false);

  const loadToday = useCallback(
    async (patientId: string) => {
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
      // auth.logout has a stable reference (useCallback with [] deps in usePatientAuth).
      // Using [auth] caused a new loadToday on every render → infinite fetch loop.
    },
    [auth.logout],
  );

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

  if (!auth.token) {
    return (
      <Shell
        date={today}
        badge={<ModeBadge label="Demo" tone="api" />}
      >
        <PatientLoginForm
          onSubmit={(email, password) => void auth.login(email, password)}
          loading={auth.loading}
          error={auth.error}
        />
      </Shell>
    );
  }

  const hasError = Boolean(todayError || blocked);
  return (
    <Shell
      date={today}
      badge={
        <ModeBadge
          label={hasError ? "Error de conexión" : "Sesión activa"}
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

      {/* Botón y formulario de registro de foto de comida */}
      {auth.user?.patientId && !blocked && (
        <div style={{ marginTop: "1.25rem" }}>
          {!showPhotoForm ? (
            <button
              type="button"
              onClick={() => setShowPhotoForm(true)}
              style={{
                width: "100%",
                padding: "0.75rem",
                background: "white",
                border: "2px dashed #93c5fd",
                borderRadius: 12,
                color: "#2563eb",
                fontSize: "0.9rem",
                fontWeight: 600,
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "0.4rem",
              }}
            >
              📷 Registrar foto de comida
            </button>
          ) : (
            <RegisterPhotoForm
              patientId={auth.user.patientId}
              onClose={() => setShowPhotoForm(false)}
            />
          )}
        </div>
      )}
    </Shell>
  );
}

export function HoyView() {
  const mode = getDataConfig().mode;
  if (mode === "api") return <HoyApiView />;
  return <HoyMockView />;
}
