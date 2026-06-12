"use client";

import { useState, useEffect } from "react";
import type { MealPhotoLog, MealPhotoType, PatientDetail } from "@pulso/shared";
import { isApiMode } from "../lib/data-config";
import { getApiClient, ApiError } from "../lib/api-client";
import { colors, fonts, radius, shadow } from "../lib/design-tokens";

// ─── mock data ────────────────────────────────────────────────────────────────

const MOCK_MEAL_PHOTOS: MealPhotoLog[] = [
  {
    id: "meal-photo-demo-seed-1",
    patientId: "demo-1",
    storageKey:
      "patients/demo-1/meal-photos/2026/06/ficticia-demo-0000-0000-000000000001.jpg",
    mealType: "breakfast",
    patientComment: "Desayuno de hoy: café con tostadas integrales.",
    origin: "patient_reported",
    reviewStatus: "pending",
    createdAt: "2026-06-10T09:15:00.000Z",
  },
  {
    id: "meal-photo-demo-seed-2",
    patientId: "demo-1",
    storageKey:
      "patients/demo-1/meal-photos/2026/06/ficticia-demo-0000-0000-000000000002.jpg",
    mealType: "lunch",
    patientComment: "Almuerzo en el trabajo.",
    professionalComment: "Buena porción de proteína. Sumá una fruta de postre.",
    origin: "patient_reported",
    reviewStatus: "reviewed",
    createdAt: "2026-06-09T13:05:00.000Z",
    reviewedAt: "2026-06-09T18:30:00.000Z",
    reviewedBy: "demo-professional",
  },
];

// ─── helpers ──────────────────────────────────────────────────────────────────

const MEAL_TYPE_LABELS: Record<MealPhotoType, string> = {
  breakfast: "Desayuno",
  lunch: "Almuerzo",
  snack: "Merienda",
  dinner: "Cena",
  collation: "Colación",
  other: "Otro",
};

const STATUS_STYLE: Record<string, { bg: string; text: string; label: string }> = {
  pending: { bg: colors.pendingBg, text: colors.pendingText, label: "Pendiente" },
  reviewed: { bg: colors.reviewedBg, text: colors.reviewedText, label: "Revisado" },
  accepted: { bg: colors.acceptedBg, text: colors.acceptedText, label: "Aceptado" },
  flagged: { bg: colors.flaggedBg, text: colors.flaggedText, label: "Seguimiento" },
};

// ─── placeholder ──────────────────────────────────────────────────────────────

function PhotoPlaceholder({ mealType }: { mealType: MealPhotoType }) {
  const icon =
    mealType === "breakfast"
      ? "☕"
      : mealType === "lunch"
        ? "🥗"
        : mealType === "dinner"
          ? "🍽️"
          : mealType === "snack"
            ? "🍎"
            : mealType === "collation"
              ? "🥜"
              : "📷";

  return (
    <div
      style={{
        width: "100%",
        aspectRatio: "4/3",
        background: colors.bgMuted,
        borderRadius: `${radius.sm}px ${radius.sm}px 0 0`,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: "0.4rem",
        border: `1px dashed ${colors.borderDefault}`,
        borderBottom: "none",
      }}
    >
      <span style={{ fontSize: "2.25rem" }}>{icon}</span>
      <span
        style={{
          fontSize: "0.7rem",
          color: colors.textSecondary,
          textAlign: "center",
          padding: "0 0.5rem",
        }}
      >
        Imagen pendiente de disponibilidad
      </span>
    </div>
  );
}

// ─── main component ───────────────────────────────────────────────────────────

interface MealPhotosViewProps {
  patient: PatientDetail;
}

export function MealPhotosView({ patient }: MealPhotosViewProps) {
  const useApi = isApiMode();

  const [photos, setPhotos] = useState<MealPhotoLog[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [selectedPhoto, setSelectedPhoto] = useState<MealPhotoLog | null>(null);
  const [actionInProgress, setActionInProgress] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [commentDraft, setCommentDraft] = useState("");

  useEffect(() => {
    setSelectedPhoto(null);
    setCommentDraft("");
    if (useApi) {
      setLoading(true);
      setLoadError(null);
      getApiClient()
        .listMealPhotos(patient.id)
        .then((data) => setPhotos(data))
        .catch((err) => {
          setLoadError(err instanceof ApiError ? err.message : "Error al cargar fotos");
          setPhotos([]);
        })
        .finally(() => setLoading(false));
    } else {
      setPhotos(MOCK_MEAL_PHOTOS.filter((p) => p.patientId === patient.id));
    }
  }, [useApi, patient.id]);

  const handleReview = async (
    photoId: string,
    reviewStatus: "reviewed" | "accepted" | "flagged",
    comment?: string,
  ) => {
    setActionInProgress(photoId);
    setActionError(null);

    if (useApi) {
      try {
        const updated = await getApiClient().reviewMealPhoto(
          patient.id,
          photoId,
          { reviewStatus, professionalComment: comment || undefined },
        );
        setPhotos((prev) => prev.map((p) => (p.id === photoId ? updated : p)));
        setSelectedPhoto((prev) => (prev?.id === photoId ? updated : prev));
      } catch (err) {
        setActionError(err instanceof ApiError ? err.message : "Error al revisar foto");
      } finally {
        setActionInProgress(null);
      }
    } else {
      setTimeout(() => {
        const now = new Date().toISOString();
        setPhotos((prev) =>
          prev.map((p) =>
            p.id === photoId
              ? {
                  ...p,
                  reviewStatus,
                  professionalComment: comment || p.professionalComment,
                  reviewedAt: now,
                  reviewedBy: "prof-demo-mock",
                }
              : p,
          ),
        );
        setSelectedPhoto((prev) =>
          prev?.id === photoId
            ? {
                ...prev,
                reviewStatus,
                professionalComment: comment || prev.professionalComment,
                reviewedAt: now,
                reviewedBy: "prof-demo-mock",
              }
            : prev,
        );
        setActionInProgress(null);
      }, 300);
    }
  };

  if (loading) {
    return (
      <div style={{ padding: "2rem", textAlign: "center", color: colors.textSecondary }}>
        Cargando fotos…
      </div>
    );
  }

  if (loadError) {
    return (
      <div
        style={{
          padding: "1rem",
          background: colors.errorBg,
          border: `1px solid ${colors.errorBorder}`,
          borderRadius: radius.md,
          color: colors.errorText,
          fontSize: "0.85rem",
        }}
      >
        No se pudieron cargar las fotos: {loadError}
      </div>
    );
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
      {/* Banner modo */}
      <div
        style={{
          background: useApi ? colors.successBg : colors.warningBg,
          border: `1px solid ${useApi ? colors.successBorder : colors.warningBorder}`,
          borderRadius: radius.md,
          padding: "0.65rem 1rem",
          fontSize: "0.82rem",
          color: useApi ? colors.successText : colors.warningText,
        }}
      >
        {useApi
          ? "Registros de fotos del paciente · Las imágenes no están disponibles en este ambiente."
          : "Ambiente de demostración · Datos ficticios"}
      </div>

      {/* Error de acción */}
      {actionError && (
        <div
          style={{
            background: colors.errorBg,
            border: `1px solid ${colors.errorBorder}`,
            borderRadius: radius.sm,
            padding: "0.65rem 0.9rem",
            fontSize: "0.82rem",
            color: colors.errorText,
          }}
        >
          {actionError}
        </div>
      )}

      {photos.length === 0 ? (
        <div
          style={{
            padding: "2.5rem 2rem",
            textAlign: "center",
            color: colors.textSecondary,
            border: `1px dashed ${colors.borderDefault}`,
            borderRadius: radius.lg,
            background: colors.bgSurface,
          }}
        >
          <p style={{ fontSize: "1rem", margin: "0 0 0.5rem", fontWeight: 500, color: colors.textPrimary }}>
            Sin fotos registradas
          </p>
          <p style={{ margin: 0, fontSize: "0.875rem" }}>
            {useApi
              ? "Cuando el paciente suba fotos desde Mi Pulso, aparecerán aquí."
              : "No hay fotos ficticias para este paciente."}
          </p>
        </div>
      ) : (
        <>
          {/* Grid de fotos */}
          <section>
            <h3
              style={{
                margin: "0 0 0.75rem",
                fontSize: "0.75rem",
                fontWeight: 600,
                textTransform: "uppercase",
                letterSpacing: "0.07em",
                color: colors.textSecondary,
              }}
            >
              Fotos de comidas ({photos.length})
            </h3>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fill, minmax(190px, 1fr))",
                gap: "0.85rem",
              }}
            >
              {photos.map((photo) => {
                const isSelected = selectedPhoto?.id === photo.id;
                const st = STATUS_STYLE[photo.reviewStatus] ?? STATUS_STYLE.pending;
                return (
                  <div
                    key={photo.id}
                    onClick={() => {
                      setSelectedPhoto(photo);
                      setCommentDraft("");
                    }}
                    style={{
                      border: isSelected
                        ? `2px solid ${colors.greenPrimary}`
                        : `1px solid ${colors.borderDefault}`,
                      borderRadius: radius.lg,
                      overflow: "hidden",
                      background: colors.bgSurface,
                      cursor: "pointer",
                      boxShadow: isSelected ? shadow.elevated : shadow.card,
                      transition: "box-shadow 0.15s",
                    }}
                  >
                    <PhotoPlaceholder mealType={photo.mealType} />

                    <div style={{ padding: "0.7rem 0.85rem" }}>
                      <div
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center",
                          marginBottom: "0.3rem",
                        }}
                      >
                        <strong style={{ fontSize: "0.875rem", color: colors.textPrimary }}>
                          {MEAL_TYPE_LABELS[photo.mealType]}
                        </strong>
                        <span
                          style={{
                            fontSize: "0.68rem",
                            background: st.bg,
                            color: st.text,
                            padding: "0.2rem 0.5rem",
                            borderRadius: radius.pill,
                            fontWeight: 600,
                          }}
                        >
                          {st.label}
                        </span>
                      </div>

                      <p style={{ margin: 0, fontSize: "0.75rem", color: colors.textSecondary, fontFamily: fonts.mono }}>
                        {new Date(photo.createdAt).toLocaleDateString("es-AR", {
                          day: "2-digit",
                          month: "short",
                          year: "numeric",
                        })}
                      </p>

                      {photo.patientComment && (
                        <p
                          style={{
                            margin: "0.3rem 0 0",
                            fontSize: "0.75rem",
                            color: colors.textSecondary,
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                            whiteSpace: "nowrap",
                          }}
                        >
                          "{photo.patientComment}"
                        </p>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </section>

          {/* Panel de revisión */}
          {selectedPhoto && (
            <section
              style={{
                border: `1px solid ${colors.borderDefault}`,
                borderRadius: radius.lg,
                padding: "1.25rem",
                background: colors.bgSurface,
                boxShadow: shadow.card,
              }}
            >
              <h3
                style={{
                  margin: "0 0 1rem",
                  fontFamily: fonts.heading,
                  fontWeight: 600,
                  fontSize: "0.95rem",
                  color: colors.textPrimary,
                }}
              >
                {MEAL_TYPE_LABELS[selectedPhoto.mealType]}
                {" · "}
                <span style={{ fontFamily: fonts.mono, fontWeight: 400, fontSize: "0.82rem", color: colors.textSecondary }}>
                  {new Date(selectedPhoto.createdAt).toLocaleDateString("es-AR", {
                    day: "2-digit",
                    month: "long",
                    year: "numeric",
                  })}
                </span>
              </h3>

              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "190px 1fr",
                  gap: "1.25rem",
                  marginBottom: "1rem",
                }}
              >
                <PhotoPlaceholder mealType={selectedPhoto.mealType} />

                <div style={{ fontSize: "0.875rem", color: colors.textPrimary }}>
                  <div style={{ marginBottom: "0.6rem", display: "flex", alignItems: "center", gap: "0.5rem" }}>
                    <span style={{ color: colors.textSecondary, fontWeight: 500, fontSize: "0.82rem" }}>
                      Estado:
                    </span>
                    {(() => {
                      const st = STATUS_STYLE[selectedPhoto.reviewStatus] ?? STATUS_STYLE.pending;
                      return (
                        <span
                          style={{
                            background: st.bg,
                            color: st.text,
                            padding: "0.2rem 0.55rem",
                            borderRadius: radius.pill,
                            fontWeight: 600,
                            fontSize: "0.75rem",
                          }}
                        >
                          {st.label}
                        </span>
                      );
                    })()}
                  </div>

                  {selectedPhoto.patientComment && (
                    <div style={{ marginBottom: "0.6rem" }}>
                      <p style={{ margin: "0 0 0.2rem", color: colors.textSecondary, fontWeight: 500, fontSize: "0.78rem" }}>
                        Comentario del paciente
                      </p>
                      <p style={{ margin: 0, color: colors.textPrimary }}>
                        "{selectedPhoto.patientComment}"
                      </p>
                    </div>
                  )}

                  {selectedPhoto.professionalComment && (
                    <div style={{ marginBottom: "0.6rem" }}>
                      <p style={{ margin: "0 0 0.2rem", color: colors.textSecondary, fontWeight: 500, fontSize: "0.78rem" }}>
                        Tu comentario previo
                      </p>
                      <p style={{ margin: 0, color: colors.reviewedText }}>
                        "{selectedPhoto.professionalComment}"
                      </p>
                    </div>
                  )}

                  {selectedPhoto.reviewedAt && (
                    <p style={{ margin: "0 0 0.6rem", color: colors.textSecondary, fontSize: "0.75rem", fontFamily: fonts.mono }}>
                      Revisado:{" "}
                      {new Date(selectedPhoto.reviewedAt).toLocaleString("es-AR")}
                    </p>
                  )}
                </div>
              </div>

              {/* Nota revisable */}
              <div
                style={{
                  background: colors.infoBg,
                  border: `1px solid ${colors.infoBorder}`,
                  borderRadius: radius.sm,
                  padding: "0.65rem 0.9rem",
                  marginBottom: "1rem",
                  fontSize: "0.82rem",
                  color: colors.infoText,
                }}
              >
                Registro del paciente pendiente de tu revisión.
              </div>

              {/* Comentario profesional */}
              <div style={{ marginBottom: "1rem" }}>
                <label
                  style={{
                    display: "block",
                    fontSize: "0.75rem",
                    fontWeight: 600,
                    textTransform: "uppercase",
                    letterSpacing: "0.04em",
                    marginBottom: "0.35rem",
                    color: colors.textSecondary,
                  }}
                >
                  Comentario profesional (opcional)
                </label>
                <textarea
                  value={commentDraft}
                  onChange={(e) => setCommentDraft(e.target.value)}
                  placeholder="Escribí tu observación sobre esta foto…"
                  rows={3}
                  style={{
                    width: "100%",
                    padding: "0.55rem 0.75rem",
                    border: `1px solid ${colors.borderDefault}`,
                    borderRadius: radius.sm,
                    fontSize: "0.875rem",
                    resize: "vertical",
                    boxSizing: "border-box",
                    fontFamily: fonts.body,
                    color: colors.textPrimary,
                    background: colors.bgSurface,
                    outline: "none",
                  }}
                />
              </div>

              {/* Botones de acción */}
              <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
                <button
                  onClick={() => void handleReview(selectedPhoto.id, "reviewed", commentDraft || undefined)}
                  disabled={actionInProgress === selectedPhoto.id}
                  style={{
                    padding: "0.55rem 1rem",
                    background: colors.reviewedBg,
                    border: `1px solid ${colors.reviewedText}22`,
                    borderRadius: radius.sm,
                    color: colors.reviewedText,
                    fontWeight: 600,
                    fontSize: "0.82rem",
                    fontFamily: fonts.body,
                    cursor: actionInProgress === selectedPhoto.id ? "wait" : "pointer",
                    opacity: actionInProgress === selectedPhoto.id ? 0.6 : 1,
                  }}
                >
                  Marcar revisado
                </button>

                <button
                  onClick={() => void handleReview(selectedPhoto.id, "accepted", commentDraft || undefined)}
                  disabled={actionInProgress === selectedPhoto.id}
                  style={{
                    padding: "0.55rem 1rem",
                    background: colors.acceptedBg,
                    border: `1px solid ${colors.acceptedText}22`,
                    borderRadius: radius.sm,
                    color: colors.acceptedText,
                    fontWeight: 600,
                    fontSize: "0.82rem",
                    fontFamily: fonts.body,
                    cursor: actionInProgress === selectedPhoto.id ? "wait" : "pointer",
                    opacity: actionInProgress === selectedPhoto.id ? 0.6 : 1,
                  }}
                >
                  Aceptar
                </button>

                <button
                  onClick={() => void handleReview(selectedPhoto.id, "flagged", commentDraft || undefined)}
                  disabled={actionInProgress === selectedPhoto.id}
                  style={{
                    padding: "0.55rem 1rem",
                    background: colors.flaggedBg,
                    border: `1px solid ${colors.flaggedText}22`,
                    borderRadius: radius.sm,
                    color: colors.flaggedText,
                    fontWeight: 600,
                    fontSize: "0.82rem",
                    fontFamily: fonts.body,
                    cursor: actionInProgress === selectedPhoto.id ? "wait" : "pointer",
                    opacity: actionInProgress === selectedPhoto.id ? 0.6 : 1,
                  }}
                >
                  Marcar seguimiento
                </button>
              </div>

              <p style={{ margin: "0.75rem 0 0", fontSize: "0.72rem", color: colors.textSecondary }}>
                Ambiente de demostración · Datos ficticios
              </p>
            </section>
          )}
        </>
      )}
    </div>
  );
}
