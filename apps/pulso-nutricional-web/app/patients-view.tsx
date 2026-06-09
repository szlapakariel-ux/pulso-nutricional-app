"use client";

import type { PatientStatus, PatientDetail } from "@pulso/shared";

const STATUS_LABEL: Record<PatientStatus, string> = {
  active: "Activo",
  inactive: "Inactivo",
  pending: "Pendiente",
};

interface PatientsViewProps {
  patient: PatientDetail;
}

export function PatientsView({ patient }: PatientsViewProps) {
  return (
    <div>
      <PatientCard patient={patient} />
    </div>
  );
}

function PatientCard({ patient }: { patient: PatientDetail }) {
  return (
    <article
      style={{
        border: "1px solid #e5e5e5",
        borderRadius: 12,
        padding: "1.25rem",
      }}
    >
      <h3 style={{ margin: "0 0 0.25rem" }}>{patient.fullName}</h3>
      <p style={{ margin: "0 0 1rem", color: "#888", fontSize: "0.85rem" }}>
        Ficha mínima · estado: {STATUS_LABEL[patient.status]}
      </p>

      <dl style={{ display: "grid", gridTemplateColumns: "auto 1fr", gap: "0.4rem 1rem", margin: 0 }}>
        <dt style={{ color: "#666" }}>Edad</dt>
        <dd style={{ margin: 0 }}>{patient.age} años</dd>

        <dt style={{ color: "#666" }}>Objetivo</dt>
        <dd style={{ margin: 0 }}>{patient.goal}</dd>

        <dt style={{ color: "#666" }}>Último control</dt>
        <dd style={{ margin: 0 }}>{patient.lastControl ?? "—"}</dd>
      </dl>

      {/* Bloque explícito de datos profesionales */}
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
          Datos profesionales
        </p>
        <p style={{ margin: 0, fontSize: "0.9rem" }}>{patient.professionalNote}</p>
        <p style={{ margin: "0.5rem 0 0", fontSize: "0.75rem", color: "#888" }}>
          Visible solo para la profesional · nunca se muestra al paciente.
        </p>
      </div>
    </article>
  );
}
