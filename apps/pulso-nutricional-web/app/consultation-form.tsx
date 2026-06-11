"use client";

import { useState } from "react";
import type { NewConsultationDraft, MeasurementType } from "@pulso/shared";
import { colors, fonts, radius } from "../lib/design-tokens";

interface ConsultationFormProps {
  patientId: string;
  onSubmit: (draft: NewConsultationDraft) => void;
  isLoading?: boolean;
}

const inputStyle = {
  width: "100%",
  padding: "0.55rem 0.75rem",
  border: `1px solid ${colors.borderDefault}`,
  borderRadius: radius.sm,
  boxSizing: "border-box" as const,
  fontFamily: fonts.body,
  fontSize: "0.875rem",
  color: colors.textPrimary,
  background: colors.bgSurface,
  outline: "none",
};

const labelStyle = {
  display: "block",
  marginBottom: "0.3rem",
  fontWeight: 600,
  fontSize: "0.82rem",
  color: colors.textSecondary,
  textTransform: "uppercase" as const,
  letterSpacing: "0.04em",
};

export function ConsultationForm({
  patientId,
  onSubmit,
  isLoading = false,
}: ConsultationFormProps) {
  const [formData, setFormData] = useState<NewConsultationDraft>({
    date: new Date().toISOString().split("T")[0],
    reason: "",
    objective: "",
    observations: "",
    professionalNote: "",
    measurements: [
      { type: "weight" as MeasurementType, value: 0, unit: "kg" },
    ],
  });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleMeasurementChange = (
    index: number,
    field: string,
    value: string | number,
  ) => {
    setFormData((prev) => ({
      ...prev,
      measurements: prev.measurements.map((m, i) =>
        i === index ? { ...m, [field]: value } : m,
      ),
    }));
  };

  const addMeasurement = () => {
    setFormData((prev) => ({
      ...prev,
      measurements: [
        ...prev.measurements,
        { type: "height" as MeasurementType, value: 0, unit: "cm" },
      ],
    }));
  };

  const removeMeasurement = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      measurements: prev.measurements.filter((_, i) => i !== index),
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
      <div>
        <label style={labelStyle}>Fecha de consulta</label>
        <input
          type="date"
          name="date"
          value={formData.date}
          onChange={handleChange}
          required
          style={inputStyle}
        />
      </div>

      <div>
        <label style={labelStyle}>Motivo / razón</label>
        <input
          type="text"
          name="reason"
          value={formData.reason}
          onChange={handleChange}
          placeholder="Ej: Seguimiento mensual"
          required
          style={inputStyle}
        />
      </div>

      <div>
        <label style={labelStyle}>Objetivo</label>
        <textarea
          name="objective"
          value={formData.objective}
          onChange={handleChange}
          placeholder="Objetivo de esta consulta"
          required
          style={{ ...inputStyle, minHeight: "80px", resize: "vertical" }}
        />
      </div>

      <div>
        <label style={labelStyle}>Observaciones generales</label>
        <textarea
          name="observations"
          value={formData.observations}
          onChange={handleChange}
          placeholder="Observaciones de la consulta"
          required
          style={{ ...inputStyle, minHeight: "80px", resize: "vertical" }}
        />
      </div>

      <div
        style={{
          padding: "1rem",
          background: colors.successBg,
          border: `1px solid ${colors.successBorder}`,
          borderRadius: radius.md,
        }}
      >
        <label style={{ ...labelStyle, color: colors.greenDark }}>
          Nota profesional
        </label>
        <textarea
          name="professionalNote"
          value={formData.professionalNote}
          onChange={handleChange}
          placeholder="Nota interna para seguimiento futuro (no se muestra al paciente)"
          required
          style={{
            ...inputStyle,
            minHeight: "80px",
            resize: "vertical",
            border: `1px solid ${colors.successBorder}`,
          }}
        />
        <p style={{ margin: "0.4rem 0 0", fontSize: "0.72rem", color: colors.textSecondary }}>
          Visible solo para la profesional · nunca se muestra al paciente.
        </p>
      </div>

      <div
        style={{
          border: `1px solid ${colors.borderDefault}`,
          borderRadius: radius.md,
          padding: "1rem",
          background: colors.bgBase,
        }}
      >
        <h4
          style={{
            margin: "0 0 0.85rem",
            fontSize: "0.82rem",
            fontWeight: 600,
            textTransform: "uppercase",
            letterSpacing: "0.05em",
            color: colors.textSecondary,
          }}
        >
          Mediciones profesionales
        </h4>

        {formData.measurements.map((measurement, index) => (
          <div
            key={index}
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr 1fr auto",
              gap: "0.75rem",
              marginBottom: "0.75rem",
              padding: "0.75rem",
              background: colors.bgSurface,
              border: `1px solid ${colors.borderDefault}`,
              borderRadius: radius.sm,
            }}
          >
            <div>
              <label style={labelStyle}>Tipo</label>
              <select
                value={measurement.type}
                onChange={(e) =>
                  handleMeasurementChange(index, "type", e.target.value as MeasurementType)
                }
                style={inputStyle}
              >
                <option value="weight">Peso</option>
                <option value="height">Altura</option>
                <option value="waist_circumference">Cintura</option>
                <option value="hip_circumference">Cadera</option>
                <option value="body_fat_percentage">% graso</option>
              </select>
            </div>

            <div>
              <label style={labelStyle}>Valor</label>
              <input
                type="number"
                step="0.1"
                value={measurement.value}
                onChange={(e) =>
                  handleMeasurementChange(index, "value", parseFloat(e.target.value))
                }
                required
                style={{ ...inputStyle, fontFamily: fonts.mono }}
              />
            </div>

            <div>
              <label style={labelStyle}>Unidad</label>
              <select
                value={measurement.unit}
                onChange={(e) => handleMeasurementChange(index, "unit", e.target.value)}
                style={inputStyle}
              >
                <option value="kg">kg</option>
                <option value="cm">cm</option>
                <option value="%">%</option>
              </select>
            </div>

            {formData.measurements.length > 1 && (
              <button
                type="button"
                onClick={() => removeMeasurement(index)}
                style={{
                  padding: "0.4rem 0.65rem",
                  background: colors.flaggedBg,
                  color: colors.flaggedText,
                  border: "none",
                  borderRadius: radius.sm,
                  cursor: "pointer",
                  alignSelf: "flex-end",
                  fontSize: "0.8rem",
                  fontWeight: 600,
                }}
              >
                ✕
              </button>
            )}
          </div>
        ))}

        <button
          type="button"
          onClick={addMeasurement}
          style={{
            padding: "0.45rem 0.9rem",
            background: colors.bgSurface,
            border: `1px solid ${colors.greenPrimary}`,
            color: colors.greenDark,
            borderRadius: radius.sm,
            cursor: "pointer",
            fontSize: "0.82rem",
            fontWeight: 600,
            fontFamily: fonts.body,
            marginTop: "0.25rem",
          }}
        >
          + Agregar medición
        </button>
      </div>

      <button
        type="submit"
        disabled={isLoading}
        style={{
          padding: "0.8rem 1.5rem",
          background: isLoading ? colors.bgMuted : colors.greenPrimary,
          color: isLoading ? colors.textSecondary : "white",
          border: "none",
          borderRadius: radius.md,
          cursor: isLoading ? "not-allowed" : "pointer",
          fontSize: "0.95rem",
          fontWeight: 600,
          fontFamily: fonts.body,
        }}
      >
        {isLoading ? "Procesando..." : "Guardar consulta"}
      </button>

      <p style={{ fontSize: "0.78rem", color: colors.textSecondary, marginTop: "0.5rem" }}>
        Ambiente de demostración. Los datos no se guardan de forma permanente.
      </p>
    </form>
  );
}
