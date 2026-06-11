"use client";

import type { PatientDetail } from "@pulso/shared";
import {
  MOCK_ACTIVITY_SETTINGS,
  MOCK_EXERCISE_PRESCRIPTIONS,
} from "./activity.mock";
import { colors, fonts, radius, shadow } from "../lib/design-tokens";

const ACTIVITY_LABEL: Record<string, string> = {
  walking: "Caminata",
  gym: "Gimnasio / fuerza",
  bike: "Bicicleta",
  running: "Trote / carrera",
  soccer: "Fútbol / deportes de equipo",
  mobility: "Movilidad / elongación",
  other: "Otra actividad",
};

const INTENSITY_LABEL: Record<string, string> = {
  low: "Baja",
  moderate: "Moderada",
  high: "Alta",
};

const INTENSITY_STYLE: Record<string, { bg: string; text: string }> = {
  low: { bg: colors.acceptedBg, text: colors.acceptedText },
  moderate: { bg: colors.pendingBg, text: colors.pendingText },
  high: { bg: colors.flaggedBg, text: colors.flaggedText },
};

interface ActivityViewProps {
  patient: PatientDetail;
}

export function ActivityView({ patient }: ActivityViewProps) {
  const settings = MOCK_ACTIVITY_SETTINGS[patient.id];
  const prescriptions = MOCK_EXERCISE_PRESCRIPTIONS[patient.id] ?? [];

  const isActive = settings?.moduleStatus === "active";

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
      {/* Banner demo */}
      <div
        style={{
          padding: "0.65rem 1rem",
          background: colors.warningBg,
          border: `1px solid ${colors.warningBorder}`,
          borderRadius: radius.md,
          fontSize: "0.82rem",
          color: colors.warningText,
        }}
      >
        Actividad física · Datos de demostración. No representan recomendaciones médicas ni planes de entrenamiento reales.
      </div>

      {/* Estado del módulo */}
      <section>
        <h3
          style={{
            fontSize: "0.75rem",
            fontWeight: 600,
            textTransform: "uppercase",
            letterSpacing: "0.07em",
            color: colors.textSecondary,
            margin: "0 0 0.75rem",
          }}
        >
          Estado del módulo
        </h3>

        <div
          style={{
            border: `1px solid ${colors.borderDefault}`,
            borderRadius: radius.lg,
            padding: "1.1rem 1.25rem",
            display: "flex",
            alignItems: "center",
            gap: "1rem",
            background: colors.bgSurface,
            boxShadow: shadow.card,
          }}
        >
          <div
            style={{
              width: 10,
              height: 10,
              borderRadius: "50%",
              background: isActive ? colors.greenPrimary : colors.bgSubtle,
              flexShrink: 0,
            }}
          />
          <div style={{ flex: 1 }}>
            <p
              style={{
                margin: 0,
                fontWeight: 600,
                fontSize: "0.9rem",
                color: colors.textPrimary,
              }}
            >
              {isActive ? "Módulo activo" : "Módulo inactivo"}
            </p>
            {isActive && settings?.activatedAt && (
              <p style={{ margin: "0.15rem 0 0", fontSize: "0.78rem", color: colors.textSecondary, fontFamily: fonts.mono }}>
                Activado: {settings.activatedAt}
              </p>
            )}
            {!isActive && (
              <p style={{ margin: "0.15rem 0 0", fontSize: "0.78rem", color: colors.textSecondary }}>
                La profesional no habilitó el módulo de actividad para este paciente.
              </p>
            )}
          </div>
          <span
            style={{
              fontSize: "0.72rem",
              background: colors.bgMuted,
              color: colors.textSecondary,
              padding: "0.2rem 0.65rem",
              borderRadius: radius.pill,
              fontWeight: 500,
              border: `1px solid ${colors.borderDefault}`,
            }}
          >
            Módulo opcional
          </span>
        </div>
      </section>

      {/* Prescripciones profesionales */}
      <section>
        <h3
          style={{
            fontSize: "0.75rem",
            fontWeight: 600,
            textTransform: "uppercase",
            letterSpacing: "0.07em",
            color: colors.textSecondary,
            margin: "0 0 0.75rem",
          }}
        >
          Prescripciones de actividad
        </h3>

        {!isActive ? (
          <div
            style={{
              padding: "1.5rem 2rem",
              textAlign: "center",
              color: colors.textSecondary,
              border: `1px dashed ${colors.borderDefault}`,
              borderRadius: radius.lg,
              background: colors.bgSurface,
            }}
          >
            <p style={{ margin: 0, fontSize: "0.9rem" }}>Módulo inactivo</p>
            <p style={{ margin: "0.4rem 0 0", fontSize: "0.82rem" }}>
              Para habilitar prescripciones de actividad, activar el módulo para este paciente.
            </p>
          </div>
        ) : prescriptions.length === 0 ? (
          <div
            style={{
              padding: "1.5rem 2rem",
              textAlign: "center",
              color: colors.textSecondary,
              border: `1px dashed ${colors.borderDefault}`,
              borderRadius: radius.lg,
              background: colors.bgSurface,
            }}
          >
            Sin prescripciones de actividad cargadas.
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
            {prescriptions.map((pres) => {
              const intStyle = INTENSITY_STYLE[pres.intensity] ?? { bg: colors.bgMuted, text: colors.textSecondary };
              return (
                <div
                  key={pres.id}
                  style={{
                    border: `1px solid ${colors.borderDefault}`,
                    borderRadius: radius.lg,
                    padding: "1rem 1.25rem",
                    background: colors.bgSurface,
                    boxShadow: shadow.card,
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "flex-start",
                      marginBottom: "0.5rem",
                      gap: "0.5rem",
                      flexWrap: "wrap",
                    }}
                  >
                    <strong
                      style={{
                        fontSize: "0.95rem",
                        color: colors.textPrimary,
                        fontFamily: fonts.heading,
                      }}
                    >
                      {ACTIVITY_LABEL[pres.activityType] ?? pres.activityType}
                    </strong>
                    <span
                      style={{
                        fontSize: "0.72rem",
                        background: intStyle.bg,
                        color: intStyle.text,
                        padding: "0.2rem 0.55rem",
                        borderRadius: radius.pill,
                        fontWeight: 600,
                      }}
                    >
                      {INTENSITY_LABEL[pres.intensity] ?? pres.intensity}
                    </span>
                  </div>

                  <div
                    style={{
                      display: "flex",
                      gap: "1.25rem",
                      marginBottom: "0.5rem",
                      fontSize: "0.82rem",
                      color: colors.textSecondary,
                      fontFamily: fonts.mono,
                    }}
                  >
                    <span>{pres.durationMinutes} min / sesión</span>
                    <span>{pres.frequency}</span>
                    <span>Desde: {pres.startDate}</span>
                  </div>

                  {pres.generalNotes && (
                    <div
                      style={{
                        padding: "0.65rem 0.85rem",
                        background: colors.infoBg,
                        border: `1px solid ${colors.infoBorder}`,
                        borderRadius: radius.sm,
                        fontSize: "0.82rem",
                        color: colors.infoText,
                      }}
                    >
                      <p
                        style={{
                          margin: "0 0 0.2rem",
                          fontWeight: 600,
                          fontSize: "0.75rem",
                          textTransform: "uppercase",
                          letterSpacing: "0.04em",
                        }}
                      >
                        Indicaciones para el paciente
                      </p>
                      <p style={{ margin: 0 }}>{pres.generalNotes}</p>
                      <p style={{ margin: "0.4rem 0 0", fontSize: "0.7rem", opacity: 0.8 }}>
                        Visible al paciente en Mi Pulso · No es recomendación médica automatizada.
                      </p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* Nota de dominio */}
      <div
        style={{
          padding: "0.65rem 1rem",
          background: colors.successBg,
          border: `1px solid ${colors.successBorder}`,
          borderRadius: radius.md,
          fontSize: "0.78rem",
          color: colors.successText,
        }}
      >
        Las prescripciones son datos profesionales. Los registros que cargue el paciente en Mi Pulso quedan pendientes de revisión. Nunca se validan automáticamente.
      </div>
    </div>
  );
}
