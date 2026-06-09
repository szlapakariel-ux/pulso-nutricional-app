"use client";

import { useState } from "react";
import type { PatientDetail, ConsultationDetail, NewConsultationDraft } from "@pulso/shared";
import { MOCK_CONSULTATIONS } from "./consultations.mock";
import { ConsultationForm } from "./consultation-form";

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
      <h3 style={{ fontSize: "1.1rem", marginBottom: "1rem" }}>Consultas</h3>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1.2fr", gap: "1.5rem" }}>
        {/* Lista + botón de nueva */}
        <div>
          <button
            onClick={() => setShowForm(!showForm)}
            style={{
              width: "100%",
              padding: "0.75rem",
              marginBottom: "1rem",
              background: "#52c41a",
              color: "white",
              border: "none",
              borderRadius: 8,
              cursor: "pointer",
              fontWeight: 600,
            }}
          >
            {showForm ? "✕ Cancelar" : "+ Nueva consulta"}
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
                        padding: "0.75rem",
                        border: isSelected ? "1px solid #1677ff" : "1px solid #e5e5e5",
                        background: isSelected ? "#e6f4ff" : "#fff",
                        borderRadius: 8,
                        cursor: "pointer",
                      }}
                    >
                      <strong>{c.date}</strong> — {c.reason}
                      <span
                        style={{
                          display: "block",
                          fontSize: "0.8rem",
                          color: "#888",
                          marginTop: "0.25rem",
                        }}
                      >
                        Estado: {c.status}
                      </span>
                    </button>
                  </li>
                );
              })}
              {consultations.length === 0 && (
                <li style={{ color: "#888" }}>Sin consultas registradas.</li>
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
            <ConsultationDetail consultation={selected} />
          ) : (
            <p style={{ color: "#888" }}>Seleccioná una consulta.</p>
          )}
        </div>
      </div>
    </section>
  );
}

function ConsultationDetail({ consultation }: { consultation: ConsultationDetail }) {
  return (
    <article
      style={{
        border: "1px solid #e5e5e5",
        borderRadius: 12,
        padding: "1.25rem",
      }}
    >
      <h4 style={{ margin: "0 0 0.25rem" }}>{consultation.date}</h4>
      <p style={{ margin: "0 0 1rem", color: "#888", fontSize: "0.85rem" }}>
        {consultation.reason} · {consultation.status}
      </p>

      <dl style={{ display: "grid", gridTemplateColumns: "auto 1fr", gap: "0.4rem 1rem", margin: 0 }}>
        <dt style={{ color: "#666", fontWeight: 600 }}>Objetivo</dt>
        <dd style={{ margin: 0 }}>{consultation.objective}</dd>

        <dt style={{ color: "#666", fontWeight: 600 }}>Observaciones</dt>
        <dd style={{ margin: 0 }}>{consultation.observations}</dd>
      </dl>

      {consultation.measurements.length > 0 && (
        <div style={{ marginTop: "1.25rem" }}>
          <h5 style={{ margin: "0 0 0.75rem", fontSize: "0.95rem" }}>Mediciones</h5>
          <ul
            style={{
              listStyle: "none",
              margin: 0,
              padding: 0,
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))",
              gap: "0.75rem",
            }}
          >
            {consultation.measurements.map((m) => (
              <li
                key={m.id}
                style={{
                  padding: "0.75rem",
                  background: "#f5f5f5",
                  border: "1px solid #e5e5e5",
                  borderRadius: 8,
                }}
              >
                <div style={{ fontSize: "0.8rem", color: "#666" }}>
                  {m.type.replace(/_/g, " ")}
                </div>
                <div style={{ fontSize: "1.1rem", fontWeight: 600 }}>
                  {m.value}
                </div>
                <div style={{ fontSize: "0.8rem", color: "#888" }}>{m.unit}</div>
              </li>
            ))}
          </ul>
        </div>
      )}

      <div
        style={{
          marginTop: "1.25rem",
          padding: "0.75rem 1rem",
          background: "#f6ffed",
          border: "1px solid #b7eb8f",
          borderRadius: 8,
        }}
      >
        <p style={{ margin: "0 0 0.25rem", fontWeight: 600, fontSize: "0.85rem" }}>
          Nota profesional
        </p>
        <p style={{ margin: 0, fontSize: "0.9rem" }}>{consultation.professionalNote}</p>
        <p style={{ margin: "0.5rem 0 0", fontSize: "0.75rem", color: "#888" }}>
          Visible solo para la profesional · nunca se muestra al paciente.
        </p>
      </div>
    </article>
  );
}
