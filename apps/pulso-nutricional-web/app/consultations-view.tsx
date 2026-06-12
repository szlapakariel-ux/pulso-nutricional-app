"use client";

import { useState } from "react";
import type {
  PatientDetail,
  ConsultationDetail,
  ConsultationStatus,
  NewConsultationDraft,
} from "@pulso/shared";
import { MOCK_CONSULTATIONS } from "./consultations.mock";
import { ConsultationForm } from "./consultation-form";
import { colors, fonts, radius, shadow } from "../lib/design-tokens";

const STATUS_LABEL: Record<ConsultationStatus, string> = {
  draft: "Borrador",
  completed: "Completada",
  archived: "Archivada",
};

const MEASUREMENT_LABEL: Record<string, string> = {
  weight: "Peso",
  height: "Altura",
  waist_circumference: "Cintura",
  hip_circumference: "Cadera",
  body_fat_percentage: "% graso",
};

interface ConsultationsViewProps {
  patient: PatientDetail;
}

export function ConsultationsView({ patient }: ConsultationsViewProps) {
  const [showForm, setShowForm] = useState(false);
  const [selectedConsultationId, setSelectedConsultationId] = useState<string | null>(null);
  const [simulatedConsultations, setSimulatedConsultations] = useState<
    ConsultationDetail[]
  >([]);

  const consultations = [
    ...(MOCK_CONSULTATIONS[patient.id] ?? []),
    ...simulatedConsultations,
  ];

  const selected = selectedConsultationId
    ? consultations.find((c) => c.id === selectedConsultationId)
    : null;

  const handleNewConsultation = (draft: NewConsultationDraft) => {
    const fakeId = `consult-sim-${Date.now()}`;
    const simulated: ConsultationDetail = {
      id: fakeId,
      patientId: patient.id,
      date: draft.date,
      reason: draft.reason,
      status: "draft",
      objective: draft.objective,
      observations: draft.observations,
      professionalNote: draft.professionalNote,
      measurements: draft.measurements.map((m, i) => ({
        id: `meas-sim-${Date.now()}-${i}`,
        type: m.type,
        value: m.value,
        unit: m.unit,
        source: "professional" as const,
        takenAt: new Date().toISOString(),
        notes: m.notes,
      })),
      professionalId: "prof-demo-1",
      isDemoData: true,
      createdAt: new Date().toISOString(),
    };

    setSimulatedConsultations((prev) => [...prev, simulated]);
    setSelectedConsultationId(fakeId);
    setShowForm(false);
  };

  return (
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
        Consultas
      </h3>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1.2fr", gap: "1.5rem" }}>
        {/* Lista + botón de nueva */}
        <div>
          <button
            onClick={() => setShowForm(!showForm)}
            style={{
              width: "100%",
              padding: "0.7rem",
              marginBottom: "1rem",
              background: showForm ? colors.bgSurface : colors.greenPrimary,
              color: showForm ? colors.textSecondary : "white",
              border: showForm ? `1px solid ${colors.borderDefault}` : "none",
              borderRadius: radius.md,
              cursor: "pointer",
              fontWeight: 600,
              fontSize: "0.875rem",
              fontFamily: fonts.body,
            }}
          >
            {showForm ? "Cancelar" : "+ Nueva consulta"}
          </button>

          {!showForm && (
            <ul style={{ listStyle: "none", margin: 0, padding: 0 }}>
              {consultations.map((c) => {
                const isSelected = c.id === selectedConsultationId;
                return (
                  <li key={c.id} style={{ marginBottom: "0.5rem" }}>
                    <button
                      onClick={() => setSelectedConsultationId(c.id)}
                      style={{
                        width: "100%",
                        textAlign: "left",
                        padding: "0.75rem 0.85rem",
                        border: isSelected
                          ? `1.5px solid ${colors.greenPrimary}`
                          : `1px solid ${colors.borderDefault}`,
                        background: isSelected ? "#EBF5EF" : colors.bgSurface,
                        borderRadius: radius.md,
                        cursor: "pointer",
                        fontFamily: fonts.body,
                      }}
                    >
                      <strong
                        style={{
                          fontSize: "0.875rem",
                          color: isSelected ? colors.greenDark : colors.textPrimary,
                          fontFamily: fonts.mono,
                        }}
                      >
                        {c.date}
                      </strong>
                      <span style={{ color: colors.textSecondary, fontSize: "0.85rem" }}>
                        {" "}— {c.reason}
                      </span>
                      <span
                        style={{
                          display: "block",
                          fontSize: "0.75rem",
                          color: colors.textSecondary,
                          marginTop: "0.25rem",
                        }}
                      >
                        {STATUS_LABEL[c.status]}
                      </span>
                    </button>
                  </li>
                );
              })}
              {consultations.length === 0 && (
                <li style={{ color: colors.textSecondary, fontSize: "0.875rem", padding: "0.5rem 0" }}>
                  Sin consultas registradas.
                </li>
              )}
            </ul>
          )}
        </div>

        {/* Detalle o formulario */}
        <div>
          {showForm ? (
            <ConsultationForm
              patientId={patient.id}
              onSubmit={handleNewConsultation}
            />
          ) : selected ? (
            <ConsultationDetailCard consultation={selected} />
          ) : (
            <p style={{ color: colors.textSecondary, fontSize: "0.875rem" }}>
              Seleccioná una consulta.
            </p>
          )}
        </div>
      </div>
    </section>
  );
}

function ConsultationDetailCard({ consultation }: { consultation: ConsultationDetail }) {
  return (
    <article
      style={{
        border: `1px solid ${colors.borderDefault}`,
        borderRadius: radius.lg,
        padding: "1.25rem",
        background: colors.bgSurface,
        boxShadow: shadow.card,
      }}
    >
      <h4
        style={{
          margin: "0 0 0.2rem",
          fontFamily: fonts.heading,
          fontWeight: 700,
          fontSize: "1.05rem",
          color: colors.textPrimary,
        }}
      >
        {consultation.date}
      </h4>
      <p style={{ margin: "0 0 1rem", color: colors.textSecondary, fontSize: "0.82rem" }}>
        {consultation.reason} · {STATUS_LABEL[consultation.status]}
      </p>

      <dl
        style={{
          display: "grid",
          gridTemplateColumns: "auto 1fr",
          gap: "0.5rem 1.25rem",
          margin: 0,
          fontSize: "0.9rem",
        }}
      >
        <dt style={{ color: colors.textSecondary, fontWeight: 500 }}>Objetivo</dt>
        <dd style={{ margin: 0, color: colors.textPrimary }}>{consultation.objective}</dd>

        <dt style={{ color: colors.textSecondary, fontWeight: 500 }}>Observaciones</dt>
        <dd style={{ margin: 0, color: colors.textPrimary }}>{consultation.observations}</dd>
      </dl>

      {consultation.measurements.length > 0 && (
        <div style={{ marginTop: "1.25rem" }}>
          <p
            style={{
              margin: "0 0 0.65rem",
              fontSize: "0.75rem",
              fontWeight: 600,
              textTransform: "uppercase",
              letterSpacing: "0.06em",
              color: colors.textSecondary,
            }}
          >
            Mediciones
          </p>
          <ul
            style={{
              listStyle: "none",
              margin: 0,
              padding: 0,
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))",
              gap: "0.65rem",
            }}
          >
            {consultation.measurements.map((m) => (
              <li
                key={m.id}
                style={{
                  padding: "0.75rem 0.85rem",
                  background: colors.bgBase,
                  border: `1px solid ${colors.borderDefault}`,
                  borderRadius: radius.md,
                }}
              >
                <div style={{ fontSize: "0.78rem", color: colors.textSecondary }}>
                  {MEASUREMENT_LABEL[m.type] ?? m.type.replace(/_/g, " ")}
                </div>
                <div style={{ fontSize: "1.1rem", fontWeight: 600, color: colors.textPrimary, fontFamily: fonts.mono }}>
                  {m.value}
                  <span style={{ fontSize: "0.8rem", color: colors.textSecondary, marginLeft: "0.2rem" }}>
                    {m.unit}
                  </span>
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}

      <div
        style={{
          marginTop: "1.25rem",
          padding: "0.85rem 1rem",
          background: colors.successBg,
          border: `1px solid ${colors.successBorder}`,
          borderRadius: radius.md,
        }}
      >
        <p
          style={{
            margin: "0 0 0.35rem",
            fontWeight: 600,
            fontSize: "0.8rem",
            color: colors.greenDark,
            textTransform: "uppercase",
            letterSpacing: "0.04em",
          }}
        >
          Nota profesional
        </p>
        <p style={{ margin: 0, fontSize: "0.9rem", color: colors.textPrimary }}>
          {consultation.professionalNote}
        </p>
        <p style={{ margin: "0.5rem 0 0", fontSize: "0.72rem", color: colors.textSecondary }}>
          Visible solo para la profesional · nunca se muestra al paciente.
        </p>
      </div>
    </article>
  );
}
