"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import type { MealPhotoType, PatientTodayView } from "@pulso/shared";
import { MOCK_TODAY_VIEWS, DEMO_PATIENT_LABELS } from "./today.mock";
import { TodayContent } from "./today-content";
import { getDataConfig } from "../lib/data-config";
import { ApiError, getApiClient } from "../lib/api-client";
import { usePatientAuth } from "../lib/use-patient-auth";
import { colors, fonts, radius, shadow } from "../lib/design-tokens";

function formatDateES(dateStr: string): string {
  if (!dateStr) return "hoy";
  const parts = dateStr.split("-").map(Number);
  const date = new Date(parts[0]!, parts[1]! - 1, parts[2]!);
  return date.toLocaleDateString("es-AR", { weekday: "long", day: "numeric", month: "long" });
}

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

function ModeBadge({ label, tone }: { label: string; tone: "mock" | "api" | "error" }) {
  const bg =
    tone === "error"
      ? "rgba(239,68,68,0.3)"
      : "rgba(255,255,255,0.22)";
  return (
    <span
      style={{
        fontSize: "0.68rem",
        background: bg,
        padding: "0.1rem 0.5rem",
        borderRadius: radius.pill,
        marginLeft: "0.25rem",
        whiteSpace: "nowrap",
        fontFamily: fonts.body,
      }}
    >
      {label}
    </span>
  );
}

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
        background: colors.bgBase,
        fontFamily: fonts.body,
      }}
    >
      <header
        style={{
          background: colors.greenDark,
          color: "white",
          padding: "1rem 1.25rem 1.2rem",
          position: "sticky",
          top: 0,
          zIndex: 10,
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "0.4rem",
            marginBottom: "0.1rem",
            flexWrap: "wrap",
          }}
        >
          <span
            style={{
              fontSize: "1.3rem",
              fontWeight: 700,
              letterSpacing: "-0.3px",
              fontFamily: fonts.heading,
            }}
          >
            Mi Pulso
          </span>
          {badge}
        </div>
        <p style={{ margin: 0, fontSize: "0.82rem", opacity: 0.88, fontFamily: fonts.body, textTransform: "capitalize" }}>
          {formatDateES(date)}
        </p>
      </header>
      <main style={{ padding: "1rem 1rem 5rem" }}>{children}</main>
    </div>
  );
}

function DemoBanner() {
  return (
    <div
      style={{
        background: colors.warningBg,
        border: `1px solid ${colors.warningBorder}`,
        borderRadius: radius.md,
        padding: "0.6rem 0.9rem",
        marginBottom: "1rem",
        fontSize: "0.78rem",
        color: colors.warningText,
      }}
    >
      Datos ficticios de demostración. No representan información clínica real.
    </div>
  );
}

function HoyMockView() {
  const [patientId, setPatientId] = useState("demo-1");
  const view = MOCK_TODAY_VIEWS[patientId];
  const date = view?.date ?? new Date().toISOString().split("T")[0] ?? "";

  return (
    <Shell date={date} badge={<ModeBadge label="Demo" tone="mock" />}>
      <DemoBanner />

      <div
        style={{
          background: colors.bgSurface,
          border: `1px solid ${colors.borderDefault}`,
          borderRadius: radius.lg,
          padding: "0.85rem 1rem",
          marginBottom: "1.25rem",
          boxShadow: shadow.card,
        }}
      >
        <p
          style={{
            margin: "0 0 0.5rem",
            fontSize: "0.68rem",
            color: colors.textSecondary,
            textTransform: "uppercase",
            letterSpacing: "0.07em",
            fontWeight: 600,
          }}
        >
          Seleccionar paciente
        </p>
        <div style={{ display: "flex", gap: "0.45rem", flexWrap: "wrap" }}>
          {DEMO_PATIENT_IDS.map((id) => (
            <button
              key={id}
              onClick={() => setPatientId(id)}
              style={{
                padding: "0.3rem 0.7rem",
                borderRadius: radius.pill,
                border: "1px solid",
                borderColor: patientId === id ? colors.greenPrimary : colors.borderDefault,
                background: patientId === id ? "#EBF5EF" : colors.bgSurface,
                color: patientId === id ? colors.greenDark : colors.textPrimary,
                fontSize: "0.82rem",
                fontWeight: patientId === id ? 600 : 400,
                cursor: "pointer",
                fontFamily: fonts.body,
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
        <div style={{ padding: "2rem", textAlign: "center", color: colors.textSecondary }}>
          Paciente no encontrado.
        </div>
      )}
    </Shell>
  );
}

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
        background: colors.bgSurface,
        border: `1px solid ${colors.borderDefault}`,
        borderRadius: radius.lg,
        padding: "1.5rem",
        textAlign: "center",
      }}
    >
      <p
        style={{
          margin: "0 0 1.25rem",
          fontWeight: 700,
          color: colors.textPrimary,
          fontSize: "1.05rem",
          fontFamily: fonts.heading,
        }}
      >
        Mi Pulso
      </p>

      {error && (
        <div
          style={{
            marginBottom: "1rem",
            padding: "0.6rem 0.75rem",
            background: colors.errorBg,
            border: `1px solid ${colors.errorBorder}`,
            borderRadius: radius.sm,
            color: colors.errorText,
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
          background: loading ? colors.bgMuted : colors.greenPrimary,
          color: loading ? colors.textSecondary : "white",
          border: "none",
          borderRadius: radius.md,
          fontSize: "0.95rem",
          fontWeight: 600,
          fontFamily: fonts.body,
          cursor: loading ? "not-allowed" : "pointer",
        }}
      >
        {loading ? "Ingresando…" : "Ingresar como paciente demo"}
      </button>

      <p style={{ margin: "1rem 0 0", fontSize: "0.72rem", color: colors.textSecondary }}>
        Ambiente de demostración · Datos ficticios
      </p>
    </div>
  );
}

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
      setError(`Formato no soportado: ${file.type || "desconocido"}. Usá JPEG, PNG o WebP.`);
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
          background: colors.bgSurface,
          border: `1px solid ${colors.borderDefault}`,
          borderRadius: radius.lg,
          padding: "1.25rem",
          marginTop: "1rem",
        }}
      >
        <div
          style={{
            background: colors.successBg,
            border: `1px solid ${colors.successBorder}`,
            borderRadius: radius.md,
            padding: "1rem",
            marginBottom: "1rem",
            textAlign: "center",
          }}
        >
          <p style={{ margin: "0 0 0.25rem", fontSize: "1rem", fontWeight: 600, color: colors.successText }}>
            Comida registrada
          </p>
          <p style={{ margin: 0, fontSize: "0.85rem", color: colors.successText }}>
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
              background: colors.greenPrimary,
              color: "white",
              border: "none",
              borderRadius: radius.sm,
              fontWeight: 600,
              fontSize: "0.85rem",
              cursor: "pointer",
              fontFamily: fonts.body,
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
              background: colors.bgSurface,
              color: colors.textPrimary,
              border: `1px solid ${colors.borderDefault}`,
              borderRadius: radius.sm,
              fontWeight: 500,
              fontSize: "0.85rem",
              cursor: "pointer",
              fontFamily: fonts.body,
            }}
          >
            Cerrar
          </button>
        </div>
      </div>
    );
  }

  const inputStyle = {
    display: "block",
    width: "100%",
    padding: "0.5rem 0.65rem",
    border: `1px solid ${colors.borderDefault}`,
    borderRadius: radius.sm,
    fontSize: "0.875rem",
    boxSizing: "border-box" as const,
    fontFamily: fonts.body,
    color: colors.textPrimary,
    background: colors.bgSurface,
  };

  const labelStyle = {
    display: "block",
    fontSize: "0.78rem",
    fontWeight: 600,
    marginBottom: "0.35rem",
    color: colors.textSecondary,
    textTransform: "uppercase" as const,
    letterSpacing: "0.04em",
  };

  return (
    <form
      onSubmit={(e) => void handleSubmit(e)}
      style={{
        background: colors.bgSurface,
        border: `1px solid ${colors.borderDefault}`,
        borderRadius: radius.lg,
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
        <h3 style={{ margin: 0, fontSize: "0.95rem", color: colors.textPrimary, fontFamily: fonts.heading }}>
          Registrar foto de comida
        </h3>
        <button
          type="button"
          onClick={onClose}
          style={{
            padding: "0.25rem 0.6rem",
            border: `1px solid ${colors.borderDefault}`,
            borderRadius: radius.sm,
            background: colors.bgSurface,
            color: colors.textSecondary,
            fontSize: "0.8rem",
            cursor: "pointer",
          }}
        >
          ✕
        </button>
      </div>

      <div style={{ marginBottom: "1rem" }}>
        <label style={labelStyle}>Foto de la comida</label>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          onChange={handleFileChange}
          style={{ display: "block", width: "100%", fontSize: "0.85rem", color: colors.textPrimary }}
        />
        <p style={{ margin: "0.3rem 0 0", fontSize: "0.72rem", color: colors.textSecondary }}>
          JPEG, PNG o WebP · máx. 5 MB
        </p>
      </div>

      {previewUrl && (
        <div style={{ marginBottom: "1rem" }}>
          <img
            src={previewUrl}
            alt="Preview"
            style={{
              width: "100%",
              maxHeight: 200,
              objectFit: "cover",
              borderRadius: radius.sm,
              border: `1px solid ${colors.borderDefault}`,
            }}
          />
        </div>
      )}

      <div style={{ marginBottom: "0.9rem" }}>
        <label style={labelStyle}>Tipo de comida</label>
        <select
          value={mealType}
          onChange={(e) => setMealType(e.target.value as MealPhotoType)}
          style={inputStyle}
        >
          {Object.entries(MEAL_TYPE_LABELS).map(([val, label]) => (
            <option key={val} value={val}>
              {label}
            </option>
          ))}
        </select>
      </div>

      <div style={{ marginBottom: "1rem" }}>
        <label style={labelStyle}>Comentario (opcional)</label>
        <input
          type="text"
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          placeholder='Ej: "comí afuera", "no había verdura"'
          maxLength={500}
          style={inputStyle}
        />
      </div>

      <div
        style={{
          background: colors.infoBg,
          border: `1px solid ${colors.infoBorder}`,
          borderRadius: radius.sm,
          padding: "0.65rem 0.8rem",
          marginBottom: "1rem",
          fontSize: "0.78rem",
          color: colors.infoText,
        }}
      >
        Tu foto quedará pendiente de revisión por tu profesional.
      </div>

      {error && (
        <div
          style={{
            marginBottom: "1rem",
            padding: "0.6rem 0.75rem",
            background: colors.errorBg,
            border: `1px solid ${colors.errorBorder}`,
            borderRadius: radius.sm,
            color: colors.errorText,
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
          background: selectedFile && !submitting ? colors.greenPrimary : colors.bgMuted,
          color: selectedFile && !submitting ? "white" : colors.textSecondary,
          border: "none",
          borderRadius: radius.md,
          fontWeight: 600,
          fontSize: "0.9rem",
          fontFamily: fonts.body,
          cursor: selectedFile && !submitting ? "pointer" : "not-allowed",
        }}
      >
        {submitting ? "Enviando…" : "Registrar comida"}
      </button>
    </form>
  );
}

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
          setTodayError("No pudimos cargar tu día en este momento.");
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
            e instanceof Error ? e.message : "No pudimos conectar con tu espacio de seguimiento.",
          );
        }
      } finally {
        setTodayLoading(false);
      }
    },
    [auth.logout],
  );

  useEffect(() => {
    if (auth.user?.patientId) {
      void loadToday(auth.user.patientId);
    } else if (auth.user) {
      setBlocked("No pudimos asociar esta sesión con un paciente de la demo.");
      setTodayView(null);
    } else {
      setTodayView(null);
    }
  }, [auth.user, loadToday]);

  const today = todayView?.date ?? new Date().toISOString().split("T")[0] ?? "";

  if (!auth.token) {
    return (
      <Shell date={today} badge={<ModeBadge label="Demo" tone="api" />}>
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
          background: colors.bgSurface,
          border: `1px solid ${colors.borderDefault}`,
          borderRadius: radius.lg,
          padding: "0.6rem 0.9rem",
          marginBottom: "1rem",
        }}
      >
        <span style={{ fontSize: "0.8rem", color: colors.textPrimary }}>
          {auth.user?.email ?? "Sesión activa"}
        </span>
        <button
          type="button"
          onClick={() => auth.logout()}
          style={{
            padding: "0.3rem 0.7rem",
            border: `1px solid ${colors.borderDefault}`,
            borderRadius: radius.sm,
            background: colors.bgSurface,
            color: colors.textSecondary,
            fontSize: "0.75rem",
            cursor: "pointer",
            fontFamily: fonts.body,
          }}
        >
          Cerrar sesión
        </button>
      </div>

      <DemoBanner />

      {blocked && (
        <div
          style={{
            background: colors.warningBg,
            border: `1px solid ${colors.warningBorder}`,
            borderRadius: radius.md,
            padding: "0.8rem 0.9rem",
            fontSize: "0.82rem",
            color: colors.warningText,
          }}
        >
          {blocked}
        </div>
      )}

      {todayError && !blocked && (
        <div
          style={{
            background: colors.errorBg,
            border: `1px solid ${colors.errorBorder}`,
            borderRadius: radius.md,
            padding: "0.8rem 0.9rem",
            fontSize: "0.82rem",
            color: colors.errorText,
          }}
        >
          No se pudo cargar tu información: {todayError}
        </div>
      )}

      {todayLoading && (
        <div style={{ padding: "2rem", textAlign: "center", color: colors.textSecondary }}>
          Cargando tu día…
        </div>
      )}

      {!todayLoading && !hasError && todayView && (
        <TodayContent view={todayView} />
      )}

      {auth.user?.patientId && !blocked && (
        <div style={{ marginTop: "1.25rem" }}>
          {!showPhotoForm ? (
            <button
              type="button"
              onClick={() => setShowPhotoForm(true)}
              style={{
                width: "100%",
                padding: "0.75rem",
                background: colors.bgSurface,
                border: `2px dashed ${colors.greenPrimary}`,
                borderRadius: radius.lg,
                color: colors.greenDark,
                fontSize: "0.9rem",
                fontWeight: 600,
                fontFamily: fonts.body,
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
