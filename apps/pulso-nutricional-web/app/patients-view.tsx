"use client";

import type { PatientStatus, PatientDetail } from "@pulso/shared";
import { colors, fonts, radius, shadow } from "../lib/design-tokens";

const STATUS_LABEL: Record<PatientStatus, string> = {
  active: "Activo",
  inactive: "Inactivo",
  pending: "Pendiente",
};

const STATUS_STYLE: Record<PatientStatus, { bg: string; text: string }> = {
  active: { bg: colors.acceptedBg, text: colors.acceptedText },
  inactive: { bg: colors.bgMuted, text: colors.textSecondary },
  pending: { bg: colors.pendingBg, text: colors.pendingText },
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
  const st = STATUS_STYLE[patient.status];
  return (
    <article
      style={{
        border: `1px solid ${colors.borderDefault}`,
        borderRadius: radius.lg,
        padding: "1.5rem",
        background: colors.bgSurface,
        boxShadow: shadow.card,
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          marginBottom: "1rem",
          gap: "1rem",
        }}
      >
        <div>
          <h3
            style={{
              margin: "0 0 0.2rem",
              fontFamily: fonts.heading,
              fontWeight: 700,
              fontSize: "1.15rem",
              color: colors.textPrimary,
            }}
          >
            {patient.fullName}
          </h3>
          <p style={{ margin: 0, color: colors.textSecondary, fontSize: "0.82rem" }}>
            Ficha del paciente
          </p>
        </div>
        <span
          style={{
            fontSize: "0.75rem",
            fontWeight: 600,
            background: st.bg,
            color: st.text,
            padding: "0.25rem 0.7rem",
            borderRadius: radius.pill,
            whiteSpace: "nowrap",
          }}
        >
          {STATUS_LABEL[patient.status]}
        </span>
      </div>

      <dl
        style={{
          display: "grid",
          gridTemplateColumns: "auto 1fr",
          gap: "0.5rem 1.25rem",
          margin: "0 0 1.25rem",
          fontSize: "0.9rem",
        }}
      >
        <dt style={{ color: colors.textSecondary, fontWeight: 500 }}>Edad</dt>
        <dd style={{ margin: 0, color: colors.textPrimary }}>{patient.age} años</dd>

        <dt style={{ color: colors.textSecondary, fontWeight: 500 }}>Objetivo</dt>
        <dd style={{ margin: 0, color: colors.textPrimary }}>{patient.goal}</dd>

        <dt style={{ color: colors.textSecondary, fontWeight: 500 }}>Último control</dt>
        <dd style={{ margin: 0, color: colors.textPrimary, fontFamily: fonts.mono, fontSize: "0.85rem" }}>
          {patient.lastControl ?? "—"}
        </dd>
      </dl>

      <div
        style={{
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
            letterSpacing: "0.05em",
          }}
        >
          Nota profesional
        </p>
        <p style={{ margin: 0, fontSize: "0.9rem", color: colors.textPrimary }}>
          {patient.professionalNote}
        </p>
        <p style={{ margin: "0.5rem 0 0", fontSize: "0.72rem", color: colors.textSecondary }}>
          Visible solo para la profesional · nunca se muestra al paciente.
        </p>
      </div>
    </article>
  );
}
