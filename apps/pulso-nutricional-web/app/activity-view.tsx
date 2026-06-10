"use client";

import type { PatientDetail } from "@pulso/shared";
import {
  MOCK_ACTIVITY_SETTINGS,
  MOCK_EXERCISE_PRESCRIPTIONS,
} from "./activity.mock";

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

const INTENSITY_COLOR: Record<string, string> = {
  low: "#d1fae5",
  moderate: "#fef3c7",
  high: "#fee2e2",
};

const INTENSITY_TEXT: Record<string, string> = {
  low: "#065f46",
  moderate: "#92400e",
  high: "#991b1b",
};

interface ActivityViewProps {
  patient: PatientDetail;
}

export function ActivityView({ patient }: ActivityViewProps) {
  const settings = MOCK_ACTIVITY_SETTINGS[patient.id];
  const prescriptions = MOCK_EXERCISE_PRESCRIPTIONS[patient.id] ?? [];

  const isActive = settings?.moduleStatus === "active";

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
      {/* Banner demo + módulo opcional */}
      <div
        style={{
          padding: "0.75rem 1rem",
          background: "#fffbe6",
          border: "1px solid #ffe58f",
          borderRadius: 10,
          fontSize: "0.8rem",
          color: "#614700",
        }}
      >
        ⚠️ Módulo opcional de actividad física — MC-10. Datos ficticios de demostración.
        No representan recomendaciones médicas ni planes de entrenamiento reales.
        Sin persistencia. Sin métricas avanzadas.
      </div>

      {/* Estado del módulo */}
      <section>
        <h3 style={{ fontSize: "1.1rem", margin: "0 0 1rem" }}>
          Estado del módulo
        </h3>

        <div
          style={{
            border: "1px solid #e5e5e5",
            borderRadius: 12,
            padding: "1.25rem",
            display: "flex",
            alignItems: "center",
            gap: "1rem",
          }}
        >
          <div
            style={{
              width: 12,
              height: 12,
              borderRadius: "50%",
              background: isActive ? "#22c55e" : "#d1d5db",
              flexShrink: 0,
            }}
          />
          <div style={{ flex: 1 }}>
            <p style={{ margin: 0, fontWeight: 600, fontSize: "0.95rem" }}>
              {isActive ? "Módulo activo" : "Módulo inactivo"}
            </p>
            {isActive && settings?.activatedAt && (
              <p style={{ margin: "0.2rem 0 0", fontSize: "0.8rem", color: "#888" }}>
                Activado: {settings.activatedAt}
              </p>
            )}
            {!isActive && (
              <p style={{ margin: "0.2rem 0 0", fontSize: "0.8rem", color: "#888" }}>
                La profesional no habilitó el módulo de actividad para este paciente demo.
              </p>
            )}
          </div>
          <span
            style={{
              fontSize: "0.75rem",
              background: "#f3f4f6",
              color: "#6b7280",
              padding: "0.2rem 0.6rem",
              borderRadius: 99,
              fontWeight: 500,
            }}
          >
            Módulo opcional
          </span>
        </div>
      </section>

      {/* Prescripciones profesionales */}
      <section>
        <h3 style={{ fontSize: "1.1rem", margin: "0 0 1rem" }}>
          Prescripciones de actividad
          <span style={{ fontWeight: 400, color: "#888", fontSize: "0.85rem", marginLeft: "0.5rem" }}>
            (datos profesionales/validados)
          </span>
        </h3>

        {!isActive ? (
          <div
            style={{
              padding: "1.5rem",
              textAlign: "center",
              color: "#888",
              border: "1px dashed #d9d9d9",
              borderRadius: 12,
            }}
          >
            <p style={{ margin: 0, fontSize: "0.95rem" }}>Módulo inactivo</p>
            <p style={{ margin: "0.5rem 0 0", fontSize: "0.85rem" }}>
              Para habilitar prescripciones de actividad, activar el módulo para este paciente.
            </p>
          </div>
        ) : prescriptions.length === 0 ? (
          <div
            style={{
              padding: "1.5rem",
              textAlign: "center",
              color: "#888",
              border: "1px dashed #d9d9d9",
              borderRadius: 12,
            }}
          >
            Sin prescripciones de actividad cargadas.
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
            {prescriptions.map((pres) => (
              <div
                key={pres.id}
                style={{
                  border: "1px solid #e5e5e5",
                  borderRadius: 12,
                  padding: "1.1rem 1.25rem",
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
                  <strong style={{ fontSize: "1rem" }}>
                    {ACTIVITY_LABEL[pres.activityType] ?? pres.activityType}
                  </strong>
                  <div style={{ display: "flex", gap: "0.5rem", alignItems: "center" }}>
                    <span
                      style={{
                        fontSize: "0.75rem",
                        background: INTENSITY_COLOR[pres.intensity] ?? "#f3f4f6",
                        color: INTENSITY_TEXT[pres.intensity] ?? "#374151",
                        padding: "0.2rem 0.5rem",
                        borderRadius: 4,
                        fontWeight: 600,
                      }}
                    >
                      Intensidad {INTENSITY_LABEL[pres.intensity] ?? pres.intensity}
                    </span>
                  </div>
                </div>

                <div
                  style={{
                    display: "flex",
                    gap: "1.5rem",
                    marginBottom: "0.5rem",
                    fontSize: "0.85rem",
                    color: "#555",
                  }}
                >
                  <span>{pres.durationMinutes} min por sesión</span>
                  <span>{pres.frequency}</span>
                  <span style={{ color: "#aaa" }}>Desde: {pres.startDate}</span>
                </div>

                {pres.generalNotes && (
                  <div
                    style={{
                      padding: "0.65rem 0.85rem",
                      background: "#e6f7ff",
                      border: "1px solid #91d5ff",
                      borderRadius: 8,
                      fontSize: "0.85rem",
                      color: "#0c4a6e",
                    }}
                  >
                    <p style={{ margin: "0 0 0.2rem", fontWeight: 600, fontSize: "0.8rem" }}>
                      Indicaciones para el paciente
                    </p>
                    <p style={{ margin: 0 }}>{pres.generalNotes}</p>
                    <p style={{ margin: "0.4rem 0 0", fontSize: "0.72rem", color: "#0369a1" }}>
                      Visible al paciente en Mi Pulso · No es recomendación médica automatizada.
                    </p>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Nota de dominio */}
      <div
        style={{
          padding: "0.75rem 1rem",
          background: "#f6ffed",
          border: "1px solid #b7eb8f",
          borderRadius: 10,
          fontSize: "0.8rem",
          color: "#14532d",
        }}
      >
        <strong>Separación de datos:</strong> Las prescripciones son datos profesionales/validados.
        Los registros que cargue el paciente en Mi Pulso serán datos revisables (pendiente).
        Nunca se validan automáticamente.
      </div>
    </div>
  );
}
