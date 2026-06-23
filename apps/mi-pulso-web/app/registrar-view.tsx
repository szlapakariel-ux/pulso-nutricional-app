"use client";

import { useState, useRef, useEffect } from "react";
import type {
  PatientMealLogDraft,
  PatientWeightLogDraft,
  PatientNoteDraft,
  PatientExerciseLogDraft,
  ActivityType,
  ActivityIntensity,
  MealPhotoType,
} from "@pulso/shared";
import { DEMO_ACTIVITY_MODULE_ACTIVE } from "./activity.mock";
import { getDataConfig } from "../lib/data-config";
import { ApiError, getApiClient } from "../lib/api-client";
import { usePatientAuth } from "../lib/use-patient-auth";
import { colors, fonts, radius, shadow } from "../lib/design-tokens";
import { MealPhotosHistory } from "./meal-photos-history";

interface RegistroEnviado {
  tipo: "comida" | "peso" | "nota" | "actividad";
  timestamp: string;
  apiSent?: boolean;
}

const ALLOWED_PHOTO_MIME = ["image/jpeg", "image/png", "image/webp"];
const MAX_PHOTO_BYTES = 5 * 1024 * 1024;

const MEAL_PHOTO_TYPE_LABELS: Record<MealPhotoType, string> = {
  breakfast: "Desayuno",
  lunch: "Almuerzo",
  snack: "Merienda",
  dinner: "Cena",
  collation: "Colación",
  other: "Otro",
};

const inputStyle = {
  width: "100%",
  padding: "0.55rem 0.75rem",
  border: `1px solid ${colors.borderDefault}`,
  borderRadius: radius.md,
  fontSize: "0.9rem",
  boxSizing: "border-box" as const,
  fontFamily: fonts.body,
  color: colors.textPrimary,
  background: colors.bgSurface,
};

const labelStyle = {
  display: "block",
  fontSize: "0.72rem",
  fontWeight: 600,
  marginBottom: "0.4rem",
  color: colors.textSecondary,
  textTransform: "uppercase" as const,
  letterSpacing: "0.05em",
};

const sectionTitle = {
  margin: "0 0 0.5rem",
  fontSize: "0.68rem",
  fontWeight: 700,
  color: colors.textSecondary,
  textTransform: "uppercase" as const,
  letterSpacing: "0.07em",
};

export function RegistrarView() {
  const auth = usePatientAuth();
  const dataConfig = getDataConfig();
  const useApi = dataConfig.mode === "api";

  const [activeTab, setActiveTab] = useState<"comida" | "peso" | "nota" | "actividad">("comida");
  const [registrosEnviados, setRegistrosEnviados] = useState<RegistroEnviado[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  // --- Comida: modo de entrada ---
  const [mealMode, setMealMode] = useState<"choose" | "photo" | "text">("choose");
  const [mealSubmitSuccess, setMealSubmitSuccess] = useState(false);
  // Se incrementa al subir una foto OK: dispara el refetch del historial real.
  const [photosRefreshKey, setPhotosRefreshKey] = useState(0);

  // --- Comida con foto ---
  const cameraInputRef = useRef<HTMLInputElement>(null);
  const galleryInputRef = useRef<HTMLInputElement>(null);
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoPreviewUrl, setPhotoPreviewUrl] = useState<string | null>(null);
  const [submittedPhotoPreviewUrl, setSubmittedPhotoPreviewUrl] = useState<string | null>(null);
  const [photoMealType, setPhotoMealType] = useState<MealPhotoType>("breakfast");
  const [photoComment, setPhotoComment] = useState("");
  const [photoError, setPhotoError] = useState<string | null>(null);

  // --- Comida sin foto ---
  const [mealDate, setMealDate] = useState(new Date().toISOString().split("T")[0] ?? "");
  const [mealTime, setMealTime] = useState("breakfast");
  const [mealDescription, setMealDescription] = useState("");
  const [mealPortion, setMealPortion] = useState("");
  const [mealNotes, setMealNotes] = useState("");

  // --- Peso ---
  const [weightDate, setWeightDate] = useState(new Date().toISOString().split("T")[0] ?? "");
  const [weight, setWeight] = useState("");
  const [weightNotes, setWeightNotes] = useState("");

  // --- Nota ---
  const [noteType, setNoteType] = useState<"question" | "observation" | "concern">("question");
  const [noteSubject, setNoteSubject] = useState("");
  const [noteBody, setNoteBody] = useState("");

  // --- Actividad ---
  const [actDate, setActDate] = useState(new Date().toISOString().split("T")[0] ?? "");
  const [actType, setActType] = useState<ActivityType>("walking");
  const [actDuration, setActDuration] = useState("");
  const [actIntensity, setActIntensity] = useState<ActivityIntensity>("low");
  const [actNotes, setActNotes] = useState("");

  useEffect(() => {
    return () => {
      if (photoPreviewUrl) URL.revokeObjectURL(photoPreviewUrl);
    };
  }, [photoPreviewUrl]);

  useEffect(() => {
    return () => {
      if (submittedPhotoPreviewUrl) URL.revokeObjectURL(submittedPhotoPreviewUrl);
    };
  }, [submittedPhotoPreviewUrl]);

  const handlePhotoFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] ?? null;
    setPhotoError(null);

    if (!file) return;

    if (!ALLOWED_PHOTO_MIME.includes(file.type)) {
      setPhotoError("Formato no soportado. Usá una imagen JPEG, PNG o WebP.");
      return;
    }

    if (file.size > MAX_PHOTO_BYTES) {
      setPhotoError(`La imagen supera los 5 MB. Elegí una más liviana.`);
      return;
    }

    if (photoPreviewUrl) URL.revokeObjectURL(photoPreviewUrl);
    setPhotoFile(file);
    setPhotoPreviewUrl(URL.createObjectURL(file));
    setMealMode("photo");
  };

  const clearPhoto = () => {
    if (photoPreviewUrl) URL.revokeObjectURL(photoPreviewUrl);
    setPhotoFile(null);
    setPhotoPreviewUrl(null);
    setPhotoError(null);
    if (cameraInputRef.current) cameraInputRef.current.value = "";
    if (galleryInputRef.current) galleryInputRef.current.value = "";
  };

  const resetMealForm = () => {
    clearPhoto();
    if (submittedPhotoPreviewUrl) {
      URL.revokeObjectURL(submittedPhotoPreviewUrl);
      setSubmittedPhotoPreviewUrl(null);
    }
    setPhotoComment("");
    setPhotoMealType("breakfast");
    setMealDescription("");
    setMealPortion("");
    setMealNotes("");
    setMealSubmitSuccess(false);
    setMealMode("choose");
  };

  const handleSubmitMealWithPhoto = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!photoFile || submitting) return;

    setSubmitting(true);
    setSubmitError(null);

    if (useApi && auth.user?.patientId) {
      try {
        await getApiClient().createMealPhoto(
          auth.user.patientId,
          photoMealType,
          photoFile,
          photoComment.trim() || undefined,
        );
        // Preserve the local preview for the success screen (before clearPhoto revokes it)
        if (photoPreviewUrl) setSubmittedPhotoPreviewUrl(photoPreviewUrl);
        setRegistrosEnviados((prev) => [
          ...prev,
          { tipo: "comida", timestamp: new Date().toISOString(), apiSent: true },
        ]);
        // Refresca el historial para traer la foto recién subida desde el backend.
        setPhotosRefreshKey((k) => k + 1);
        setMealSubmitSuccess(true);
      } catch (err) {
        setSubmitError(
          err instanceof ApiError
            ? err.message
            : "No fue posible enviar la foto. Intentá de nuevo.",
        );
      } finally {
        setSubmitting(false);
      }
    } else {
      // mock / demo
      if (photoPreviewUrl) setSubmittedPhotoPreviewUrl(photoPreviewUrl);
      setRegistrosEnviados((prev) => [
        ...prev,
        { tipo: "comida", timestamp: new Date().toISOString(), apiSent: false },
      ]);
      setSubmitting(false);
      setMealSubmitSuccess(true);
    }
  };

  const handleSubmitMeal = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!mealDescription.trim() || submitting) return;

    const draft: PatientMealLogDraft = {
      date: mealDate,
      timeOfDay: mealTime as any,
      foodDescription: mealDescription,
      portion: mealPortion || undefined,
      notes: mealNotes || undefined,
    };

    if (useApi && auth.user?.patientId) {
      setSubmitting(true);
      setSubmitError(null);
      try {
        await getApiClient().createMealLog(auth.user.patientId, draft);
        setRegistrosEnviados((prev) => [
          ...prev,
          { tipo: "comida", timestamp: new Date().toISOString(), apiSent: true },
        ]);
        setMealSubmitSuccess(true);
      } catch (err) {
        setSubmitError(err instanceof ApiError ? err.message : "Error al enviar comida");
      } finally {
        setSubmitting(false);
      }
    } else {
      setRegistrosEnviados((prev) => [
        ...prev,
        { tipo: "comida", timestamp: new Date().toISOString(), apiSent: false },
      ]);
      setMealSubmitSuccess(true);
    }
  };

  const handleSubmitWeight = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!weight.trim() || submitting) return;

    const draft: PatientWeightLogDraft = {
      date: weightDate,
      weight: parseFloat(weight),
      notes: weightNotes || undefined,
    };

    if (useApi && auth.user?.patientId) {
      setSubmitting(true);
      setSubmitError(null);
      try {
        await getApiClient().createWeightLog(auth.user.patientId, draft);
        setRegistrosEnviados((prev) => [
          ...prev,
          { tipo: "peso", timestamp: new Date().toISOString(), apiSent: true },
        ]);
        setWeight("");
        setWeightNotes("");
      } catch (err) {
        setSubmitError(err instanceof ApiError ? err.message : "Error al enviar peso");
      } finally {
        setSubmitting(false);
      }
    } else {
      setRegistrosEnviados((prev) => [
        ...prev,
        { tipo: "peso", timestamp: new Date().toISOString(), apiSent: false },
      ]);
      setWeight("");
      setWeightNotes("");
    }
  };

  const handleSubmitActivity = (e: React.FormEvent) => {
    e.preventDefault();
    if (!actDuration.trim() || isNaN(Number(actDuration)) || Number(actDuration) <= 0) return;

    const draft: PatientExerciseLogDraft = {
      date: actDate,
      activityType: actType,
      durationMinutes: Number(actDuration),
      intensity: actIntensity,
      notes: actNotes || undefined,
    };

    console.log("Actividad enviada (demo):", draft);
    setRegistrosEnviados((prev) => [
      ...prev,
      { tipo: "actividad", timestamp: new Date().toISOString(), apiSent: false },
    ]);
    setActDuration("");
    setActNotes("");
  };

  const handleSubmitNote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!noteSubject.trim() || !noteBody.trim() || submitting) return;

    const draft: PatientNoteDraft = {
      type: noteType,
      subject: noteSubject,
      body: noteBody,
    };

    if (useApi && auth.user?.patientId) {
      setSubmitting(true);
      setSubmitError(null);
      try {
        await getApiClient().createNote(auth.user.patientId, draft);
        setRegistrosEnviados((prev) => [
          ...prev,
          { tipo: "nota", timestamp: new Date().toISOString(), apiSent: true },
        ]);
        setNoteSubject("");
        setNoteBody("");
      } catch (err) {
        setSubmitError(err instanceof ApiError ? err.message : "Error al enviar nota");
      } finally {
        setSubmitting(false);
      }
    } else {
      setRegistrosEnviados((prev) => [
        ...prev,
        { tipo: "nota", timestamp: new Date().toISOString(), apiSent: false },
      ]);
      setNoteSubject("");
      setNoteBody("");
    }
  };

  // --- Sección Comida ---
  function renderComida() {
    // Éxito: feedback inline antes de resetear
    if (mealSubmitSuccess) {
      return (
        <div
          style={{
            background: colors.bgSurface,
            border: `1px solid ${colors.borderDefault}`,
            borderRadius: radius.lg,
            padding: "1.5rem 1.25rem",
            marginBottom: "1.5rem",
            boxShadow: shadow.card,
          }}
        >
          {submittedPhotoPreviewUrl && (
            <div style={{ marginBottom: "1rem" }}>
              <img
                src={submittedPhotoPreviewUrl}
                alt="Foto registrada"
                style={{
                  width: "100%",
                  maxHeight: 240,
                  objectFit: "cover",
                  borderRadius: radius.md,
                  border: `1px solid ${colors.borderDefault}`,
                  display: "block",
                }}
              />
            </div>
          )}
          <div
            style={{
              background: colors.successBg,
              border: `1px solid ${colors.successBorder}`,
              borderRadius: radius.md,
              padding: "1.1rem",
              textAlign: "center",
              marginBottom: "1.25rem",
            }}
          >
            <p style={{ margin: "0 0 0.2rem", fontSize: "1rem", fontWeight: 700, color: colors.successText }}>
              Comida registrada
            </p>
            <p style={{ margin: 0, fontSize: "0.82rem", color: colors.successText }}>
              Pendiente de revisión por tu nutricionista.
            </p>
          </div>
          <div style={{ display: "flex", gap: "0.5rem" }}>
            <button
              type="button"
              onClick={resetMealForm}
              style={{
                flex: 1,
                padding: "0.7rem",
                background: colors.greenPrimary,
                color: "white",
                border: "none",
                borderRadius: radius.md,
                fontWeight: 600,
                fontSize: "0.9rem",
                cursor: "pointer",
                fontFamily: fonts.body,
              }}
            >
              Registrar otra
            </button>
          </div>
        </div>
      );
    }

    // Elegir modo: foto principal, galería secundaria, sin foto terciaria
    if (mealMode === "choose") {
      return (
        <div
          style={{
            background: colors.bgSurface,
            border: `1px solid ${colors.borderDefault}`,
            borderRadius: radius.lg,
            padding: "1.5rem 1.25rem",
            marginBottom: "1.5rem",
            boxShadow: shadow.card,
          }}
        >
          {/* Inputs ocultos: cámara y galería */}
          <input
            ref={cameraInputRef}
            type="file"
            accept="image/*"
            capture="environment"
            onChange={handlePhotoFileChange}
            style={{ display: "none" }}
          />
          <input
            ref={galleryInputRef}
            type="file"
            accept="image/*"
            onChange={handlePhotoFileChange}
            style={{ display: "none" }}
          />

          {/* Hero */}
          <div style={{ textAlign: "center", marginBottom: "1.5rem" }}>
            <div
              style={{
                width: 56,
                height: 56,
                background: "#EBF5EF",
                borderRadius: radius.pill,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "1.6rem",
                margin: "0 auto 0.9rem",
              }}
            >
              📷
            </div>
            <h3
              style={{
                margin: "0 0 0.4rem",
                fontSize: "1.05rem",
                fontWeight: 700,
                color: colors.textPrimary,
                fontFamily: fonts.heading,
              }}
            >
              Registrar comida
            </h3>
            <p
              style={{
                margin: 0,
                fontSize: "0.85rem",
                color: colors.textSecondary,
                lineHeight: 1.5,
              }}
            >
              Sacá una foto o contanos qué comiste para que tu nutricionista pueda revisarlo.
            </p>
          </div>

          {/* CTA principal: cámara */}
          <button
            type="button"
            onClick={() => cameraInputRef.current?.click()}
            style={{
              width: "100%",
              padding: "0.85rem",
              background: colors.greenPrimary,
              color: "white",
              border: "none",
              borderRadius: radius.md,
              fontWeight: 700,
              fontSize: "0.95rem",
              fontFamily: fonts.body,
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "0.5rem",
              marginBottom: "0.65rem",
            }}
          >
            <span>📷</span> Sacar foto de comida
          </button>

          {/* CTA secundario: galería */}
          <button
            type="button"
            onClick={() => galleryInputRef.current?.click()}
            style={{
              width: "100%",
              padding: "0.75rem",
              background: colors.bgSurface,
              color: colors.textPrimary,
              border: `1px solid ${colors.borderDefault}`,
              borderRadius: radius.md,
              fontWeight: 600,
              fontSize: "0.9rem",
              fontFamily: fonts.body,
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "0.5rem",
              marginBottom: "1.1rem",
            }}
          >
            <span>🖼</span> Elegir foto de galería
          </button>

          {/* Separador */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "0.75rem",
              marginBottom: "1.1rem",
            }}
          >
            <div style={{ flex: 1, height: 1, background: colors.borderDefault }} />
            <span style={{ fontSize: "0.75rem", color: colors.textSecondary }}>o</span>
            <div style={{ flex: 1, height: 1, background: colors.borderDefault }} />
          </div>

          {/* Sin foto */}
          <button
            type="button"
            onClick={() => setMealMode("text")}
            style={{
              width: "100%",
              padding: "0.6rem",
              background: "transparent",
              color: colors.textSecondary,
              border: "none",
              fontSize: "0.85rem",
              fontFamily: fonts.body,
              cursor: "pointer",
              textDecoration: "underline",
              textDecorationStyle: "dotted",
              textUnderlineOffset: "3px",
            }}
          >
            Registrar sin foto
          </button>

          {/* Hint desktop */}
          <p
            style={{
              margin: "0.75rem 0 0",
              fontSize: "0.72rem",
              color: colors.textSecondary,
              textAlign: "center",
              lineHeight: 1.4,
            }}
          >
            En celular se abrirá la cámara. En computadora podés elegir una imagen.
          </p>

          {photoError && (
            <div
              style={{
                marginTop: "0.75rem",
                padding: "0.55rem 0.75rem",
                background: colors.errorBg,
                border: `1px solid ${colors.errorBorder}`,
                borderRadius: radius.sm,
                color: colors.errorText,
                fontSize: "0.82rem",
              }}
            >
              {photoError}
            </div>
          )}
        </div>
      );
    }

    // Modo foto seleccionada
    if (mealMode === "photo") {
      return (
        <form
          onSubmit={(e) => void handleSubmitMealWithPhoto(e)}
          style={{
            background: colors.bgSurface,
            border: `1px solid ${colors.borderDefault}`,
            borderRadius: radius.lg,
            padding: "1.25rem",
            marginBottom: "1.5rem",
            boxShadow: shadow.card,
          }}
        >
          {/* Inputs ocultos también aquí para "Cambiar foto" */}
          <input
            ref={cameraInputRef}
            type="file"
            accept="image/*"
            capture="environment"
            onChange={handlePhotoFileChange}
            style={{ display: "none" }}
          />
          <input
            ref={galleryInputRef}
            type="file"
            accept="image/*"
            onChange={handlePhotoFileChange}
            style={{ display: "none" }}
          />

          {/* Header */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "0.5rem",
              marginBottom: "1rem",
            }}
          >
            <button
              type="button"
              onClick={() => { clearPhoto(); setMealMode("choose"); }}
              style={{
                padding: "0.2rem 0.5rem",
                border: `1px solid ${colors.borderDefault}`,
                borderRadius: radius.sm,
                background: colors.bgSurface,
                color: colors.textSecondary,
                fontSize: "0.78rem",
                cursor: "pointer",
                fontFamily: fonts.body,
              }}
            >
              ← Volver
            </button>
            <h3
              style={{
                margin: 0,
                fontSize: "0.95rem",
                fontWeight: 700,
                color: colors.textPrimary,
                fontFamily: fonts.heading,
              }}
            >
              Registrar comida con foto
            </h3>
          </div>

          {/* Preview */}
          {photoPreviewUrl && (
            <div style={{ marginBottom: "0.9rem" }}>
              <img
                src={photoPreviewUrl}
                alt="Vista previa de la foto"
                style={{
                  width: "100%",
                  maxHeight: 220,
                  objectFit: "cover",
                  borderRadius: radius.md,
                  border: `1px solid ${colors.borderDefault}`,
                  display: "block",
                }}
              />
              <div style={{ display: "flex", gap: "0.5rem", marginTop: "0.5rem" }}>
                <button
                  type="button"
                  onClick={() => cameraInputRef.current?.click()}
                  style={{
                    flex: 1,
                    padding: "0.4rem",
                    border: `1px solid ${colors.borderDefault}`,
                    borderRadius: radius.sm,
                    background: colors.bgSurface,
                    color: colors.textSecondary,
                    fontSize: "0.78rem",
                    cursor: "pointer",
                    fontFamily: fonts.body,
                  }}
                >
                  📷 Cambiar foto
                </button>
                <button
                  type="button"
                  onClick={() => { clearPhoto(); setMealMode("choose"); }}
                  style={{
                    flex: 1,
                    padding: "0.4rem",
                    border: `1px solid ${colors.errorBorder}`,
                    borderRadius: radius.sm,
                    background: colors.errorBg,
                    color: colors.errorText,
                    fontSize: "0.78rem",
                    cursor: "pointer",
                    fontFamily: fonts.body,
                  }}
                >
                  Quitar foto
                </button>
              </div>
            </div>
          )}

          {/* Tipo de comida */}
          <div style={{ marginBottom: "0.9rem" }}>
            <label style={labelStyle}>Tipo de comida</label>
            <select
              value={photoMealType}
              onChange={(e) => setPhotoMealType(e.target.value as MealPhotoType)}
              style={inputStyle}
            >
              {Object.entries(MEAL_PHOTO_TYPE_LABELS).map(([val, label]) => (
                <option key={val} value={val}>
                  {label}
                </option>
              ))}
            </select>
          </div>

          {/* Comentario */}
          <div style={{ marginBottom: "1rem" }}>
            <label style={labelStyle}>Comentario (opcional)</label>
            <input
              type="text"
              value={photoComment}
              onChange={(e) => setPhotoComment(e.target.value)}
              placeholder='Ej: "comí afuera", "no tenía verdura"'
              maxLength={500}
              style={inputStyle}
            />
          </div>

          {/* Info */}
          <div
            style={{
              background: colors.infoBg,
              border: `1px solid ${colors.infoBorder}`,
              borderRadius: radius.sm,
              padding: "0.6rem 0.8rem",
              marginBottom: "1rem",
              fontSize: "0.78rem",
              color: colors.infoText,
            }}
          >
            Tu foto quedará pendiente de revisión por tu nutricionista.
          </div>

          {submitError && (
            <div
              style={{
                marginBottom: "1rem",
                padding: "0.55rem 0.75rem",
                background: colors.errorBg,
                border: `1px solid ${colors.errorBorder}`,
                borderRadius: radius.sm,
                color: colors.errorText,
                fontSize: "0.82rem",
              }}
            >
              {submitError}
            </div>
          )}

          <button
            type="submit"
            disabled={!photoFile || submitting}
            style={{
              width: "100%",
              padding: "0.8rem",
              background: photoFile && !submitting ? colors.greenPrimary : colors.bgMuted,
              color: photoFile && !submitting ? "white" : colors.textSecondary,
              border: "none",
              borderRadius: radius.md,
              fontWeight: 700,
              fontSize: "0.95rem",
              fontFamily: fonts.body,
              cursor: photoFile && !submitting ? "pointer" : "not-allowed",
            }}
          >
            {submitting ? "Enviando…" : "Registrar comida con foto"}
          </button>
        </form>
      );
    }

    // Modo texto: sin foto
    return (
      <form
        onSubmit={(e) => void handleSubmitMeal(e)}
        style={{
          background: colors.bgSurface,
          border: `1px solid ${colors.borderDefault}`,
          borderRadius: radius.lg,
          padding: "1.25rem",
          marginBottom: "1.5rem",
          boxShadow: shadow.card,
        }}
      >
        {/* Header */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "0.5rem",
            marginBottom: "1rem",
          }}
        >
          <button
            type="button"
            onClick={() => setMealMode("choose")}
            style={{
              padding: "0.2rem 0.5rem",
              border: `1px solid ${colors.borderDefault}`,
              borderRadius: radius.sm,
              background: colors.bgSurface,
              color: colors.textSecondary,
              fontSize: "0.78rem",
              cursor: "pointer",
              fontFamily: fonts.body,
            }}
          >
            ← Volver
          </button>
          <h3
            style={{
              margin: 0,
              fontSize: "0.95rem",
              fontWeight: 700,
              color: colors.textPrimary,
              fontFamily: fonts.heading,
            }}
          >
            Registrar sin foto
          </h3>
        </div>

        <div style={{ marginBottom: "0.9rem" }}>
          <label style={labelStyle}>Fecha</label>
          <input type="date" value={mealDate} onChange={(e) => setMealDate(e.target.value)} style={inputStyle} />
        </div>

        <div style={{ marginBottom: "0.9rem" }}>
          <label style={labelStyle}>Momento del día</label>
          <select value={mealTime} onChange={(e) => setMealTime(e.target.value)} style={inputStyle}>
            <option value="breakfast">Desayuno</option>
            <option value="mid_morning">Media mañana</option>
            <option value="lunch">Almuerzo</option>
            <option value="afternoon">Tarde</option>
            <option value="snack">Merienda</option>
            <option value="dinner">Cena</option>
            <option value="night">Noche</option>
          </select>
        </div>

        <div style={{ marginBottom: "0.9rem" }}>
          <label style={labelStyle}>¿Qué comiste?</label>
          <textarea
            value={mealDescription}
            onChange={(e) => setMealDescription(e.target.value)}
            placeholder="Ej: café, tostadas con mermelada, jugo"
            style={{ ...inputStyle, minHeight: "80px", resize: "vertical" }}
          />
        </div>

        <div style={{ marginBottom: "0.9rem" }}>
          <label style={labelStyle}>Porción (opcional)</label>
          <input
            type="text"
            value={mealPortion}
            onChange={(e) => setMealPortion(e.target.value)}
            placeholder="Ej: 1 taza, 2 rebanadas"
            style={inputStyle}
          />
        </div>

        <div style={{ marginBottom: "1rem" }}>
          <label style={labelStyle}>Notas (opcional)</label>
          <input
            type="text"
            value={mealNotes}
            onChange={(e) => setMealNotes(e.target.value)}
            placeholder="Cómo te sentiste, si faltaban ingredientes, etc."
            style={inputStyle}
          />
        </div>

        <div
          style={{
            background: colors.infoBg,
            border: `1px solid ${colors.infoBorder}`,
            borderRadius: radius.sm,
            padding: "0.65rem 0.75rem",
            marginBottom: "1rem",
            fontSize: "0.78rem",
            color: colors.infoText,
          }}
        >
          Tu comida se enviará a revisión de tu nutricionista. Estado: pendiente.
        </div>

        {submitError && (
          <div
            style={{
              marginBottom: "1rem",
              padding: "0.55rem 0.75rem",
              background: colors.errorBg,
              border: `1px solid ${colors.errorBorder}`,
              borderRadius: radius.sm,
              color: colors.errorText,
              fontSize: "0.82rem",
            }}
          >
            {submitError}
          </div>
        )}

        <button
          type="submit"
          disabled={!mealDescription.trim() || submitting}
          style={{
            width: "100%",
            padding: "0.8rem",
            background: mealDescription.trim() && !submitting ? colors.greenPrimary : colors.bgMuted,
            color: mealDescription.trim() && !submitting ? "white" : colors.textSecondary,
            border: "none",
            borderRadius: radius.md,
            fontWeight: 700,
            fontFamily: fonts.body,
            cursor: mealDescription.trim() && !submitting ? "pointer" : "not-allowed",
            fontSize: "0.95rem",
          }}
        >
          {submitting ? "Enviando…" : "Enviar comida"}
        </button>
      </form>
    );
  }

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
        <div style={{ display: "flex", alignItems: "center", gap: "0.4rem", marginBottom: "0.1rem" }}>
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
          <span
            style={{
              fontSize: "0.68rem",
              background: "rgba(255,255,255,0.22)",
              padding: "0.1rem 0.5rem",
              borderRadius: radius.pill,
              fontFamily: fonts.body,
            }}
          >
            demo
          </span>
        </div>
        <p style={{ margin: 0, fontSize: "0.82rem", opacity: 0.85, fontFamily: fonts.body }}>
          Registrá tu día
        </p>
      </header>

      <main style={{ padding: "1rem 1rem 5rem" }}>
        {/* Banner modo */}
        {useApi && auth.user?.patientId ? (
          <div
            style={{
              background: colors.successBg,
              border: `1px solid ${colors.successBorder}`,
              borderRadius: radius.md,
              padding: "0.6rem 0.9rem",
              marginBottom: "1rem",
              fontSize: "0.78rem",
              color: colors.successText,
            }}
          >
            Sesión activa ({auth.user.email ?? "paciente"}). Tus registros se envían a tu profesional.
          </div>
        ) : useApi ? (
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
            Iniciá sesión en la vista Hoy para enviar tus registros a tu profesional.
          </div>
        ) : (
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
            Datos ficticios de demostración. Tus registros quedarán pendientes de revisión.
          </div>
        )}

        {/* Tabs */}
        <div
          style={{
            display: "flex",
            gap: "0.35rem",
            marginBottom: "1.25rem",
            background: colors.bgMuted,
            borderRadius: radius.md,
            padding: "0.3rem",
          }}
        >
          {(["comida", "peso", "nota"] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => { setActiveTab(tab); if (tab !== "comida") setSubmitError(null); }}
              style={{
                flex: 1,
                padding: "0.5rem 0.4rem",
                border: "none",
                background: activeTab === tab ? colors.bgSurface : "transparent",
                boxShadow: activeTab === tab ? shadow.card : "none",
                color: activeTab === tab ? colors.greenDark : colors.textSecondary,
                fontWeight: activeTab === tab ? 600 : 400,
                cursor: "pointer",
                fontSize: "0.82rem",
                fontFamily: fonts.body,
                borderRadius: radius.sm,
                transition: "background 0.15s",
              }}
            >
              {tab === "comida" && "🍽 Comida"}
              {tab === "peso" && "⚖️ Peso"}
              {tab === "nota" && "💬 Nota"}
            </button>
          ))}
          {DEMO_ACTIVITY_MODULE_ACTIVE && (
            <button
              onClick={() => { setActiveTab("actividad"); setSubmitError(null); }}
              style={{
                flex: 1,
                padding: "0.5rem 0.4rem",
                border: "none",
                background: activeTab === "actividad" ? colors.bgSurface : "transparent",
                boxShadow: activeTab === "actividad" ? shadow.card : "none",
                color: activeTab === "actividad" ? colors.greenDark : colors.textSecondary,
                fontWeight: activeTab === "actividad" ? 600 : 400,
                cursor: "pointer",
                fontSize: "0.82rem",
                fontFamily: fonts.body,
                borderRadius: radius.sm,
              }}
            >
              🏃 Activ.
            </button>
          )}
        </div>

        {/* Error de envío general */}
        {submitError && activeTab !== "comida" && (
          <div
            style={{
              background: colors.errorBg,
              border: `1px solid ${colors.errorBorder}`,
              borderRadius: radius.md,
              padding: "0.6rem 0.9rem",
              marginBottom: "1rem",
              fontSize: "0.78rem",
              color: colors.errorText,
            }}
          >
            {submitError}
          </div>
        )}

        {/* Comida */}
        {activeTab === "comida" && renderComida()}

        {/* Historial real de fotos (recuperadas desde el backend, no la preview local) */}
        {activeTab === "comida" && <MealPhotosHistory refreshKey={photosRefreshKey} />}

        {/* Peso */}
        {activeTab === "peso" && (
          <form
            onSubmit={(e) => void handleSubmitWeight(e)}
            style={{
              background: colors.bgSurface,
              border: `1px solid ${colors.borderDefault}`,
              borderRadius: radius.lg,
              padding: "1.25rem",
              marginBottom: "1.5rem",
              boxShadow: shadow.card,
            }}
          >
            <h3 style={{ margin: "0 0 1rem", fontSize: "0.95rem", color: colors.textPrimary, fontFamily: fonts.heading, fontWeight: 700 }}>
              Registrar peso
            </h3>

            <div style={{ marginBottom: "0.9rem" }}>
              <label style={labelStyle}>Fecha</label>
              <input type="date" value={weightDate} onChange={(e) => setWeightDate(e.target.value)} style={inputStyle} />
            </div>

            <div style={{ marginBottom: "0.9rem" }}>
              <label style={labelStyle}>Peso (kg)</label>
              <input
                type="number"
                step="0.1"
                value={weight}
                onChange={(e) => setWeight(e.target.value)}
                placeholder="Ej: 72.5"
                style={{ ...inputStyle, fontFamily: fonts.mono }}
              />
            </div>

            <div style={{ marginBottom: "1rem" }}>
              <label style={labelStyle}>Notas (opcional)</label>
              <input
                type="text"
                value={weightNotes}
                onChange={(e) => setWeightNotes(e.target.value)}
                placeholder="Hora, circunstancias, cómo te sentís"
                style={inputStyle}
              />
            </div>

            <div
              style={{
                background: colors.infoBg,
                border: `1px solid ${colors.infoBorder}`,
                borderRadius: radius.sm,
                padding: "0.65rem 0.75rem",
                marginBottom: "1rem",
                fontSize: "0.78rem",
                color: colors.infoText,
              }}
            >
              Tu peso se enviará a revisión de tu profesional. Estado: pendiente.
            </div>

            <button
              type="submit"
              disabled={!weight.trim() || submitting}
              style={{
                width: "100%",
                padding: "0.8rem",
                background: weight.trim() && !submitting ? colors.greenPrimary : colors.bgMuted,
                color: weight.trim() && !submitting ? "white" : colors.textSecondary,
                border: "none",
                borderRadius: radius.md,
                fontWeight: 700,
                fontFamily: fonts.body,
                cursor: weight.trim() && !submitting ? "pointer" : "not-allowed",
                fontSize: "0.95rem",
              }}
            >
              {submitting ? "Enviando…" : "Enviar peso"}
            </button>
          </form>
        )}

        {/* Nota */}
        {activeTab === "nota" && (
          <form
            onSubmit={(e) => void handleSubmitNote(e)}
            style={{
              background: colors.bgSurface,
              border: `1px solid ${colors.borderDefault}`,
              borderRadius: radius.lg,
              padding: "1.25rem",
              marginBottom: "1.5rem",
              boxShadow: shadow.card,
            }}
          >
            <h3 style={{ margin: "0 0 1rem", fontSize: "0.95rem", color: colors.textPrimary, fontFamily: fonts.heading, fontWeight: 700 }}>
              Enviar nota o pregunta
            </h3>

            <div style={{ marginBottom: "0.9rem" }}>
              <label style={labelStyle}>Tipo</label>
              <select value={noteType} onChange={(e) => setNoteType(e.target.value as any)} style={inputStyle}>
                <option value="question">Pregunta</option>
                <option value="observation">Observación</option>
                <option value="concern">Preocupación</option>
              </select>
            </div>

            <div style={{ marginBottom: "0.9rem" }}>
              <label style={labelStyle}>Asunto</label>
              <input
                type="text"
                value={noteSubject}
                onChange={(e) => setNoteSubject(e.target.value)}
                placeholder="Ej: Dudas sobre el plan"
                style={inputStyle}
              />
            </div>

            <div style={{ marginBottom: "1rem" }}>
              <label style={labelStyle}>Detalle</label>
              <textarea
                value={noteBody}
                onChange={(e) => setNoteBody(e.target.value)}
                placeholder="Contanos más…"
                style={{ ...inputStyle, minHeight: "100px", resize: "vertical" }}
              />
            </div>

            <div
              style={{
                background: colors.infoBg,
                border: `1px solid ${colors.infoBorder}`,
                borderRadius: radius.sm,
                padding: "0.65rem 0.75rem",
                marginBottom: "1rem",
                fontSize: "0.78rem",
                color: colors.infoText,
              }}
            >
              Tu nota se enviará a tu profesional. Estado: pendiente.
            </div>

            <button
              type="submit"
              disabled={!noteSubject.trim() || !noteBody.trim() || submitting}
              style={{
                width: "100%",
                padding: "0.8rem",
                background: noteSubject.trim() && noteBody.trim() && !submitting ? colors.greenPrimary : colors.bgMuted,
                color: noteSubject.trim() && noteBody.trim() && !submitting ? "white" : colors.textSecondary,
                border: "none",
                borderRadius: radius.md,
                fontWeight: 700,
                fontFamily: fonts.body,
                cursor: noteSubject.trim() && noteBody.trim() && !submitting ? "pointer" : "not-allowed",
                fontSize: "0.95rem",
              }}
            >
              {submitting ? "Enviando…" : "Enviar nota"}
            </button>
          </form>
        )}

        {/* Actividad */}
        {activeTab === "actividad" && DEMO_ACTIVITY_MODULE_ACTIVE && (
          <form
            onSubmit={handleSubmitActivity}
            style={{
              background: colors.bgSurface,
              border: `1px solid ${colors.borderDefault}`,
              borderRadius: radius.lg,
              padding: "1.25rem",
              marginBottom: "1.5rem",
              boxShadow: shadow.card,
            }}
          >
            <h3 style={{ margin: "0 0 0.25rem", fontSize: "0.95rem", color: colors.textPrimary, fontFamily: fonts.heading, fontWeight: 700 }}>
              Registrar actividad física
            </h3>
            <p style={{ margin: "0 0 1rem", fontSize: "0.78rem", color: colors.textSecondary }}>
              Módulo opcional habilitado por tu profesional.
            </p>

            <div style={{ marginBottom: "0.9rem" }}>
              <label style={labelStyle}>Fecha</label>
              <input type="date" value={actDate} onChange={(e) => setActDate(e.target.value)} style={inputStyle} />
            </div>

            <div style={{ marginBottom: "0.9rem" }}>
              <label style={labelStyle}>Tipo de actividad</label>
              <select value={actType} onChange={(e) => setActType(e.target.value as ActivityType)} style={inputStyle}>
                <option value="walking">Caminata</option>
                <option value="gym">Gimnasio / fuerza</option>
                <option value="bike">Bicicleta</option>
                <option value="running">Trote / carrera</option>
                <option value="soccer">Fútbol / deporte de equipo</option>
                <option value="mobility">Movilidad / elongación</option>
                <option value="other">Otra</option>
              </select>
            </div>

            <div style={{ marginBottom: "0.9rem" }}>
              <label style={labelStyle}>Duración (minutos)</label>
              <input
                type="number"
                min="1"
                max="480"
                value={actDuration}
                onChange={(e) => setActDuration(e.target.value)}
                placeholder="Ej: 30"
                style={{ ...inputStyle, fontFamily: fonts.mono }}
              />
            </div>

            <div style={{ marginBottom: "0.9rem" }}>
              <label style={labelStyle}>Intensidad percibida</label>
              <select
                value={actIntensity}
                onChange={(e) => setActIntensity(e.target.value as ActivityIntensity)}
                style={inputStyle}
              >
                <option value="low">Baja — me costó poco</option>
                <option value="moderate">Moderada — me costó algo</option>
                <option value="high">Alta — me esforcé mucho</option>
              </select>
            </div>

            <div style={{ marginBottom: "1rem" }}>
              <label style={labelStyle}>Notas (opcional)</label>
              <input
                type="text"
                value={actNotes}
                onChange={(e) => setActNotes(e.target.value)}
                placeholder="Cómo te sentiste, dónde lo hiciste, etc."
                style={inputStyle}
              />
            </div>

            <div
              style={{
                background: colors.infoBg,
                border: `1px solid ${colors.infoBorder}`,
                borderRadius: radius.sm,
                padding: "0.65rem 0.75rem",
                marginBottom: "1rem",
                fontSize: "0.78rem",
                color: colors.infoText,
              }}
            >
              Tu actividad se enviará a revisión de tu profesional.
            </div>

            <button
              type="submit"
              disabled={!actDuration.trim() || Number(actDuration) <= 0}
              style={{
                width: "100%",
                padding: "0.8rem",
                background: actDuration.trim() && Number(actDuration) > 0 ? colors.greenPrimary : colors.bgMuted,
                color: actDuration.trim() && Number(actDuration) > 0 ? "white" : colors.textSecondary,
                border: "none",
                borderRadius: radius.md,
                fontWeight: 700,
                fontFamily: fonts.body,
                cursor: actDuration.trim() && Number(actDuration) > 0 ? "pointer" : "not-allowed",
                fontSize: "0.95rem",
              }}
            >
              Enviar actividad
            </button>
          </form>
        )}

        {/* Histórico de registros enviados */}
        {registrosEnviados.length > 0 && (
          <section style={{ marginTop: "2rem" }}>
            <h3 style={sectionTitle}>Registros enviados esta sesión</h3>
            <div
              style={{
                background: colors.bgSurface,
                border: `1px solid ${colors.borderDefault}`,
                borderRadius: radius.lg,
                overflow: "hidden",
                boxShadow: shadow.card,
              }}
            >
              <ul style={{ listStyle: "none", margin: 0, padding: 0 }}>
                {registrosEnviados.map((r, idx) => (
                  <li
                    key={idx}
                    style={{
                      padding: "0.8rem 1rem",
                      borderBottom:
                        idx < registrosEnviados.length - 1
                          ? `1px solid ${colors.bgMuted}`
                          : "none",
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                    }}
                  >
                    <div>
                      <strong style={{ fontSize: "0.875rem", color: colors.textPrimary }}>
                        {r.tipo === "comida" && "Comida"}
                        {r.tipo === "peso" && "Peso"}
                        {r.tipo === "nota" && "Nota"}
                        {r.tipo === "actividad" && "Actividad"}
                      </strong>
                      <p
                        style={{
                          margin: "0.1rem 0 0",
                          fontSize: "0.72rem",
                          color: colors.textSecondary,
                          fontFamily: fonts.mono,
                        }}
                      >
                        {new Date(r.timestamp).toLocaleTimeString()}
                      </p>
                    </div>
                    <span
                      style={{
                        fontSize: "0.72rem",
                        background: r.apiSent ? colors.acceptedBg : colors.pendingBg,
                        color: r.apiSent ? colors.acceptedText : colors.pendingText,
                        padding: "0.2rem 0.55rem",
                        borderRadius: radius.pill,
                        fontWeight: 600,
                      }}
                    >
                      {r.apiSent ? "Enviado" : "Pendiente"}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          </section>
        )}
      </main>
    </div>
  );
}
