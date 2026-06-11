"use client";

import { useState, useEffect } from "react";
import type { MealPhotoLog, MealPhotoType, PatientDetail } from "@pulso/shared";
import { isApiMode } from "../lib/data-config";
import { getApiClient, ApiError } from "../lib/api-client";

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

const STATUS_COLORS: Record<string, string> = {
  pending: "#fef3c7",
  reviewed: "#dbeafe",
  accepted: "#dcfce7",
  flagged: "#fecaca",
};

const STATUS_TEXT_COLORS: Record<string, string> = {
  pending: "#92400e",
  reviewed: "#1e40af",
  accepted: "#166534",
  flagged: "#991b1b",
};

const STATUS_LABELS: Record<string, string> = {
  pending: "⏳ Pendiente",
  reviewed: "👁️ Revisado",
  accepted: "✅ Aceptado",
  flagged: "🚩 Seguimiento",
};

// ─── placeholder SVG ──────────────────────────────────────────────────────────

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
        background: "linear-gradient(135deg, #f3f4f6 0%, #e5e7eb 100%)",
        borderRadius: 8,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: "0.5rem",
        border: "1px dashed #d1d5db",
      }}
    >
      <span style={{ fontSize: "2.5rem" }}>{icon}</span>
      <span
        style={{
          fontSize: "0.75rem",
          color: "#9ca3af",
          fontStyle: "italic",
          textAlign: "center",
          padding: "0 0.5rem",
        }}
      >
        Foto no disponible
        <br />
        Imagen no disponible
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
          setLoadError(
            err instanceof ApiError ? err.message : "Error al cargar fotos",
          );
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
        setPhotos((prev) =>
          prev.map((p) => (p.id === photoId ? updated : p)),
        );
        setSelectedPhoto((prev) => (prev?.id === photoId ? updated : prev));
      } catch (err) {
        setActionError(
          err instanceof ApiError ? err.message : "Error al revisar foto",
        );
      } finally {
        setActionInProgress(null);
      }
    } else {
      // mock mode: update locally
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
      <div style={{ padding: "2rem", textAlign: "center", color: "#9ca3af" }}>
        Cargando fotos…
      </div>
    );
  }

  if (loadError) {
    return (
      <div
        style={{
          padding: "1rem",
          background: "#fef2f2",
          border: "1px solid #fecaca",
          borderRadius: 10,
          color: "#b91c1c",
          fontSize: "0.85rem",
        }}
      >
        ❌ No se pudieron cargar las fotos: {loadError}
      </div>
    );
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
      {/* Banner modo */}
      <div
        style={{
          background: useApi ? "#f0fdf4" : "#fffbe6",
          border: `1px solid ${useApi ? "#bbf7d0" : "#ffe58f"}`,
          borderRadius: 10,
          padding: "0.75rem 1rem",
          fontSize: "0.85rem",
          color: useApi ? "#166534" : "#614700",
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
            background: "#fef2f2",
            border: "1px solid #fecaca",
            borderRadius: 8,
            padding: "0.65rem 0.9rem",
            fontSize: "0.82rem",
            color: "#b91c1c",
          }}
        >
          ❌ {actionError}
        </div>
      )}

      {photos.length === 0 ? (
        <div
          style={{
            padding: "2rem",
            textAlign: "center",
            color: "#888",
            border: "1px dashed #d9d9d9",
            borderRadius: 12,
          }}
        >
          <p style={{ fontSize: "1.1rem", margin: "0 0 0.5rem" }}>
            Sin fotos registradas
          </p>
          <p style={{ margin: 0, fontSize: "0.9rem" }}>
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
                fontSize: "0.95rem",
                color: "#111",
              }}
            >
              Fotos de comidas ({photos.length})
            </h3>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))",
                gap: "1rem",
              }}
            >
              {photos.map((photo) => {
                const isSelected = selectedPhoto?.id === photo.id;
                return (
                  <div
                    key={photo.id}
                    onClick={() => {
                      setSelectedPhoto(photo);
                      setCommentDraft("");
                    }}
                    style={{
                      border: isSelected
                        ? "2px solid #1677ff"
                        : "1px solid #e5e5e5",
                      borderRadius: 12,
                      overflow: "hidden",
                      background: "white",
                      cursor: "pointer",
                      transition: "box-shadow 0.15s",
                      boxShadow: isSelected
                        ? "0 0 0 3px rgba(22,119,255,0.15)"
                        : "none",
                    }}
                  >
                    {/* Placeholder imagen */}
                    <PhotoPlaceholder mealType={photo.mealType} />

                    {/* Metadata */}
                    <div style={{ padding: "0.75rem" }}>
                      <div
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center",
                          marginBottom: "0.4rem",
                        }}
                      >
                        <strong style={{ fontSize: "0.9rem", color: "#111" }}>
                          {MEAL_TYPE_LABELS[photo.mealType]}
                        </strong>
                        <span
                          style={{
                            fontSize: "0.7rem",
                            background: STATUS_COLORS[photo.reviewStatus],
                            color: STATUS_TEXT_COLORS[photo.reviewStatus],
                            padding: "0.2rem 0.5rem",
                            borderRadius: 4,
                            fontWeight: 600,
                          }}
                        >
                          {STATUS_LABELS[photo.reviewStatus]}
                        </span>
                      </div>

                      <p
                        style={{
                          margin: 0,
                          fontSize: "0.78rem",
                          color: "#666",
                        }}
                      >
                        {new Date(photo.createdAt).toLocaleDateString("es-AR", {
                          day: "2-digit",
                          month: "short",
                          year: "numeric",
                        })}
                      </p>

                      {photo.patientComment && (
                        <p
                          style={{
                            margin: "0.35rem 0 0",
                            fontSize: "0.78rem",
                            color: "#444",
                            fontStyle: "italic",
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
                border: "1px solid #e5e5e5",
                borderRadius: 12,
                padding: "1.25rem",
                background: "#fafafa",
              }}
            >
              <h3 style={{ margin: "0 0 1rem", fontSize: "0.95rem" }}>
                Revisión —{" "}
                {MEAL_TYPE_LABELS[selectedPhoto.mealType]}{" "}
                ·{" "}
                {new Date(selectedPhoto.createdAt).toLocaleDateString("es-AR", {
                  day: "2-digit",
                  month: "long",
                  year: "numeric",
                })}
              </h3>

              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "200px 1fr",
                  gap: "1.25rem",
                  marginBottom: "1rem",
                }}
              >
                {/* Placeholder grande */}
                <PhotoPlaceholder mealType={selectedPhoto.mealType} />

                {/* Detalles */}
                <div style={{ fontSize: "0.875rem", color: "#444" }}>
                  <div style={{ marginBottom: "0.6rem" }}>
                    <span style={{ color: "#888", fontWeight: 500 }}>
                      Estado actual:
                    </span>{" "}
                    <span
                      style={{
                        background: STATUS_COLORS[selectedPhoto.reviewStatus],
                        color: STATUS_TEXT_COLORS[selectedPhoto.reviewStatus],
                        padding: "0.2rem 0.5rem",
                        borderRadius: 4,
                        fontWeight: 600,
                        fontSize: "0.8rem",
                      }}
                    >
                      {STATUS_LABELS[selectedPhoto.reviewStatus]}
                    </span>
                  </div>

                  {selectedPhoto.patientComment && (
                    <div style={{ marginBottom: "0.6rem" }}>
                      <span style={{ color: "#888", fontWeight: 500 }}>
                        Comentario del paciente:
                      </span>
                      <p
                        style={{
                          margin: "0.25rem 0 0",
                          fontStyle: "italic",
                          color: "#555",
                        }}
                      >
                        "{selectedPhoto.patientComment}"
                      </p>
                    </div>
                  )}

                  {selectedPhoto.professionalComment && (
                    <div style={{ marginBottom: "0.6rem" }}>
                      <span style={{ color: "#888", fontWeight: 500 }}>
                        Tu comentario previo:
                      </span>
                      <p
                        style={{
                          margin: "0.25rem 0 0",
                          color: "#1e40af",
                          fontStyle: "italic",
                        }}
                      >
                        "{selectedPhoto.professionalComment}"
                      </p>
                    </div>
                  )}

                  {selectedPhoto.reviewedAt && (
                    <div style={{ marginBottom: "0.6rem", color: "#888", fontSize: "0.8rem" }}>
                      Revisado:{" "}
                      {new Date(selectedPhoto.reviewedAt).toLocaleString(
                        "es-AR",
                      )}
                    </div>
                  )}

                  {/* storageKey — solo como metadata interna discreta */}
                  <div
                    style={{
                      marginTop: "0.75rem",
                      padding: "0.35rem 0.6rem",
                      background: "#f3f4f6",
                      borderRadius: 4,
                      fontSize: "0.7rem",
                      color: "#9ca3af",
                      fontFamily: "monospace",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                    }}
                    title={selectedPhoto.storageKey}
                  >
                    key: {selectedPhoto.storageKey}
                  </div>
                </div>
              </div>

              {/* Nota ReviewableData */}
              <div
                style={{
                  background: "white",
                  border: "1px solid #dbeafe",
                  borderRadius: 8,
                  padding: "0.65rem 0.9rem",
                  marginBottom: "1rem",
                  fontSize: "0.82rem",
                  color: "#1e3a8a",
                }}
              >
                ✓ Registro del paciente pendiente de tu revisión.
              </div>

              {/* Comentario profesional */}
              <div style={{ marginBottom: "1rem" }}>
                <label
                  style={{
                    display: "block",
                    fontSize: "0.85rem",
                    fontWeight: 500,
                    marginBottom: "0.4rem",
                    color: "#374151",
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
                    padding: "0.6rem 0.75rem",
                    border: "1px solid #d1d5db",
                    borderRadius: 6,
                    fontSize: "0.85rem",
                    resize: "vertical",
                    boxSizing: "border-box",
                    fontFamily: "inherit",
                  }}
                />
              </div>

              {/* Botones de acción */}
              <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
                <button
                  onClick={() =>
                    void handleReview(
                      selectedPhoto.id,
                      "reviewed",
                      commentDraft || undefined,
                    )
                  }
                  disabled={actionInProgress === selectedPhoto.id}
                  style={{
                    padding: "0.6rem 1rem",
                    background: "#dbeafe",
                    border: "1px solid #91d5ff",
                    borderRadius: 6,
                    color: "#0c63e4",
                    fontWeight: 600,
                    fontSize: "0.85rem",
                    cursor:
                      actionInProgress === selectedPhoto.id
                        ? "wait"
                        : "pointer",
                    opacity: actionInProgress === selectedPhoto.id ? 0.6 : 1,
                  }}
                >
                  👁️ Marcar revisado
                </button>

                <button
                  onClick={() =>
                    void handleReview(
                      selectedPhoto.id,
                      "accepted",
                      commentDraft || undefined,
                    )
                  }
                  disabled={actionInProgress === selectedPhoto.id}
                  style={{
                    padding: "0.6rem 1rem",
                    background: "#dcfce7",
                    border: "1px solid #86efac",
                    borderRadius: 6,
                    color: "#166534",
                    fontWeight: 600,
                    fontSize: "0.85rem",
                    cursor:
                      actionInProgress === selectedPhoto.id
                        ? "wait"
                        : "pointer",
                    opacity: actionInProgress === selectedPhoto.id ? 0.6 : 1,
                  }}
                >
                  ✅ Aceptar
                </button>

                <button
                  onClick={() =>
                    void handleReview(
                      selectedPhoto.id,
                      "flagged",
                      commentDraft || undefined,
                    )
                  }
                  disabled={actionInProgress === selectedPhoto.id}
                  style={{
                    padding: "0.6rem 1rem",
                    background: "#fecaca",
                    border: "1px solid #fca5a5",
                    borderRadius: 6,
                    color: "#992211",
                    fontWeight: 600,
                    fontSize: "0.85rem",
                    cursor:
                      actionInProgress === selectedPhoto.id
                        ? "wait"
                        : "pointer",
                    opacity: actionInProgress === selectedPhoto.id ? 0.6 : 1,
                  }}
                >
                  🚩 Marcar seguimiento
                </button>
              </div>

              <p
                style={{
                  margin: "0.75rem 0 0",
                  fontSize: "0.75rem",
                  color: "#666",
                  fontStyle: "italic",
                }}
              >
                Ambiente de demostración · Datos ficticios
              </p>
            </section>
          )}
        </>
      )}
    </div>
  );
}
