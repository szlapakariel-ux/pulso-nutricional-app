"use client";

/**
 * Historial de fotos del paciente — MC-FOTOS-MVP-4b.
 *
 * Prueba el round-trip real de almacenamiento: lista los registros desde el
 * backend (Postgres) y descarga cada binario desde el bucket (S3) con token.
 * A diferencia de la preview de carga (archivo local), esto demuestra que la
 * imagen persiste y se recupera en una sesión nueva o desde otro dispositivo.
 *
 * Seguridad: nunca usa una URL pública. Cada binario llega por el endpoint
 * con guard (getMealPhotoImageUrl → fetch autenticado → objectURL revocado al
 * desmontar). La storageKey jamás se expone al navegador.
 */

import { useEffect, useState } from "react";
import type { MealPhotoLog, MealPhotoType } from "@pulso/shared";
import { ApiError, getApiClient } from "../lib/api-client";
import { usePatientAuth } from "../lib/use-patient-auth";
import { getDataConfig } from "../lib/data-config";
import { colors, fonts, radius, shadow } from "../lib/design-tokens";

const MEAL_PHOTO_TYPE_LABELS: Record<MealPhotoType, string> = {
  breakfast: "Desayuno",
  lunch: "Almuerzo",
  snack: "Merienda",
  dinner: "Cena",
  collation: "Colación",
  other: "Otro",
};

const REVIEW_STATUS_LABELS: Record<string, string> = {
  pending: "Pendiente",
  reviewed: "Revisada",
  accepted: "Aceptada",
  flagged: "Con observación",
};

const sectionTitle = {
  margin: "0 0 0.5rem",
  fontSize: "0.68rem",
  fontWeight: 700,
  color: colors.textSecondary,
  textTransform: "uppercase" as const,
  letterSpacing: "0.07em",
};

/** Placeholder neutro mientras carga o si el binario no está disponible. */
function PhotoPlaceholder({ label }: { label: string }) {
  return (
    <div
      style={{
        width: "100%",
        aspectRatio: "4/3",
        background: colors.bgMuted,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: "0.25rem",
        borderRadius: `${radius.sm} ${radius.sm} 0 0`,
        color: colors.textSecondary,
      }}
    >
      <span style={{ fontSize: "1.5rem" }}>🍽</span>
      <span style={{ fontSize: "0.68rem" }}>{label}</span>
    </div>
  );
}

/**
 * Descarga el binario real con token y lo muestra. Mientras carga (o si el
 * binario no está disponible) cae al placeholder sin romper el layout.
 */
function PhotoThumb({ photo, patientId }: { photo: MealPhotoLog; patientId: string }) {
  const [url, setUrl] = useState<string | null>(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    let active = true;
    let objectUrl: string | null = null;
    setUrl(null);
    setFailed(false);

    getApiClient()
      .getMealPhotoImageUrl(patientId, photo.id)
      .then((u) => {
        if (active) {
          objectUrl = u;
          setUrl(u);
        } else {
          URL.revokeObjectURL(u);
        }
      })
      .catch(() => {
        if (active) setFailed(true);
      });

    return () => {
      active = false;
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    };
  }, [patientId, photo.id]);

  if (failed || !url) {
    return <PhotoPlaceholder label={MEAL_PHOTO_TYPE_LABELS[photo.mealType] ?? "Comida"} />;
  }

  return (
    <img
      src={url}
      alt={`Foto de ${MEAL_PHOTO_TYPE_LABELS[photo.mealType] ?? "comida"}`}
      style={{
        width: "100%",
        aspectRatio: "4/3",
        objectFit: "cover",
        display: "block",
        borderRadius: `${radius.sm} ${radius.sm} 0 0`,
      }}
    />
  );
}

/**
 * Lista las fotos del paciente y las recupera desde el backend.
 * `refreshKey` permite refrescar el historial tras una nueva carga.
 */
export function MealPhotosHistory({ refreshKey = 0 }: { refreshKey?: number }) {
  const auth = usePatientAuth();
  const useApi = getDataConfig().mode === "api";
  const patientId = auth.user?.patientId;

  const [photos, setPhotos] = useState<MealPhotoLog[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!useApi || !patientId) return;
    let active = true;
    setLoading(true);
    setError(null);

    getApiClient()
      .listMealPhotos(patientId)
      .then((list) => {
        if (!active) return;
        // Más recientes primero.
        const sorted = [...list].sort((a, b) =>
          b.createdAt.localeCompare(a.createdAt),
        );
        setPhotos(sorted);
      })
      .catch((err) => {
        if (!active) return;
        setError(
          err instanceof ApiError
            ? "No pudimos cargar tus fotos. Intentá de nuevo más tarde."
            : "Error al cargar el historial de fotos.",
        );
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [useApi, patientId, refreshKey]);

  // Sin API o sin sesión: no mostramos historial (solo aplica al flujo real).
  if (!useApi || !patientId) return null;

  return (
    <section style={{ marginTop: "2rem" }}>
      <h3 style={sectionTitle}>Mis fotos</h3>

      {loading && photos.length === 0 && (
        <p style={{ fontSize: "0.82rem", color: colors.textSecondary, margin: 0 }}>
          Cargando tus fotos…
        </p>
      )}

      {error && (
        <div
          style={{
            background: colors.errorBg,
            border: `1px solid ${colors.errorBorder}`,
            borderRadius: radius.md,
            padding: "0.6rem 0.9rem",
            fontSize: "0.78rem",
            color: colors.errorText,
          }}
        >
          {error}
        </div>
      )}

      {!loading && !error && photos.length === 0 && (
        <p style={{ fontSize: "0.82rem", color: colors.textSecondary, margin: 0 }}>
          Todavía no subiste ninguna foto. Cuando registres una comida con foto,
          va a aparecer acá.
        </p>
      )}

      {photos.length > 0 && (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(2, 1fr)",
            gap: "0.75rem",
          }}
        >
          {photos.map((photo) => (
            <div
              key={photo.id}
              style={{
                background: colors.bgSurface,
                border: `1px solid ${colors.borderDefault}`,
                borderRadius: radius.md,
                overflow: "hidden",
                boxShadow: shadow.card,
              }}
            >
              <PhotoThumb photo={photo} patientId={patientId} />
              <div style={{ padding: "0.55rem 0.65rem" }}>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    gap: "0.4rem",
                  }}
                >
                  <strong style={{ fontSize: "0.8rem", color: colors.textPrimary }}>
                    {MEAL_PHOTO_TYPE_LABELS[photo.mealType] ?? "Comida"}
                  </strong>
                  <span
                    style={{
                      fontSize: "0.66rem",
                      background:
                        photo.reviewStatus === "pending"
                          ? colors.pendingBg
                          : colors.acceptedBg,
                      color:
                        photo.reviewStatus === "pending"
                          ? colors.pendingText
                          : colors.acceptedText,
                      padding: "0.12rem 0.45rem",
                      borderRadius: radius.pill,
                      fontWeight: 600,
                      whiteSpace: "nowrap",
                    }}
                  >
                    {REVIEW_STATUS_LABELS[photo.reviewStatus] ?? photo.reviewStatus}
                  </span>
                </div>
                <p
                  style={{
                    margin: "0.2rem 0 0",
                    fontSize: "0.68rem",
                    color: colors.textSecondary,
                    fontFamily: fonts.mono,
                  }}
                >
                  {new Date(photo.createdAt).toLocaleDateString()}
                </p>
                {photo.patientComment && (
                  <p
                    style={{
                      margin: "0.3rem 0 0",
                      fontSize: "0.74rem",
                      color: colors.textSecondary,
                      lineHeight: 1.35,
                    }}
                  >
                    {photo.patientComment}
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
