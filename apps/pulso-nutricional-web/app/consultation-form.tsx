"use client";

import { useState } from "react";
import type { NewConsultationDraft, MeasurementType } from "@pulso/shared";

interface ConsultationFormProps {
  patientId: string;
  onSubmit: (draft: NewConsultationDraft) => void;
  isLoading?: boolean;
}

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
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
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
        <label style={{ display: "block", marginBottom: "0.25rem", fontWeight: 600 }}>
          Fecha de consulta
        </label>
        <input
          type="date"
          name="date"
          value={formData.date}
          onChange={handleChange}
          required
          style={{
            width: "100%",
            padding: "0.5rem",
            border: "1px solid #d9d9d9",
            borderRadius: 4,
            boxSizing: "border-box",
          }}
        />
      </div>

      <div>
        <label style={{ display: "block", marginBottom: "0.25rem", fontWeight: 600 }}>
          Motivo / razón
        </label>
        <input
          type="text"
          name="reason"
          value={formData.reason}
          onChange={handleChange}
          placeholder="Ej: Seguimiento mensual"
          required
          style={{
            width: "100%",
            padding: "0.5rem",
            border: "1px solid #d9d9d9",
            borderRadius: 4,
            boxSizing: "border-box",
          }}
        />
      </div>

      <div>
        <label style={{ display: "block", marginBottom: "0.25rem", fontWeight: 600 }}>
          Objetivo
        </label>
        <textarea
          name="objective"
          value={formData.objective}
          onChange={handleChange}
          placeholder="Objetivo de esta consulta"
          required
          style={{
            width: "100%",
            padding: "0.5rem",
            border: "1px solid #d9d9d9",
            borderRadius: 4,
            minHeight: "80px",
            boxSizing: "border-box",
            fontFamily: "inherit",
          }}
        />
      </div>

      <div>
        <label style={{ display: "block", marginBottom: "0.25rem", fontWeight: 600 }}>
          Observaciones generales
        </label>
        <textarea
          name="observations"
          value={formData.observations}
          onChange={handleChange}
          placeholder="Observaciones de la consulta"
          required
          style={{
            width: "100%",
            padding: "0.5rem",
            border: "1px solid #d9d9d9",
            borderRadius: 4,
            minHeight: "80px",
            boxSizing: "border-box",
            fontFamily: "inherit",
          }}
        />
      </div>

      <div
        style={{
          padding: "1rem",
          background: "#f6ffed",
          border: "1px solid #b7eb8f",
          borderRadius: 8,
        }}
      >
        <label style={{ display: "block", marginBottom: "0.5rem", fontWeight: 600 }}>
          Nota profesional (datos internos)
        </label>
        <textarea
          name="professionalNote"
          value={formData.professionalNote}
          onChange={handleChange}
          placeholder="Nota interna para seguimiento futuro (no se muestra al paciente)"
          required
          style={{
            width: "100%",
            padding: "0.5rem",
            border: "1px solid #b7eb8f",
            borderRadius: 4,
            minHeight: "80px",
            boxSizing: "border-box",
            fontFamily: "inherit",
            background: "white",
          }}
        />
        <p style={{ margin: "0.5rem 0 0", fontSize: "0.75rem", color: "#666" }}>
          Visible solo para la profesional · nunca se muestra al paciente.
        </p>
      </div>

      <div
        style={{
          border: "1px solid #d9d9d9",
          borderRadius: 8,
          padding: "1rem",
          background: "#fafafa",
        }}
      >
        <h4 style={{ margin: "0 0 1rem 0" }}>Mediciones profesionales</h4>

        {formData.measurements.map((measurement, index) => (
          <div
            key={index}
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr 1fr auto",
              gap: "0.75rem",
              marginBottom: "0.75rem",
              padding: "0.75rem",
              background: "white",
              border: "1px solid #e5e5e5",
              borderRadius: 4,
            }}
          >
            <div>
              <label style={{ display: "block", fontSize: "0.85rem", marginBottom: "0.25rem" }}>
                Tipo
              </label>
              <select
                value={measurement.type}
                onChange={(e) =>
                  handleMeasurementChange(index, "type", e.target.value as MeasurementType)
                }
                style={{
                  width: "100%",
                  padding: "0.5rem",
                  border: "1px solid #d9d9d9",
                  borderRadius: 4,
                  boxSizing: "border-box",
                }}
              >
                <option value="weight">Peso</option>
                <option value="height">Altura</option>
                <option value="waist_circumference">Cintura</option>
                <option value="hip_circumference">Cadera</option>
                <option value="body_fat_percentage">% graso</option>
              </select>
            </div>

            <div>
              <label style={{ display: "block", fontSize: "0.85rem", marginBottom: "0.25rem" }}>
                Valor
              </label>
              <input
                type="number"
                step="0.1"
                value={measurement.value}
                onChange={(e) =>
                  handleMeasurementChange(index, "value", parseFloat(e.target.value))
                }
                required
                style={{
                  width: "100%",
                  padding: "0.5rem",
                  border: "1px solid #d9d9d9",
                  borderRadius: 4,
                  boxSizing: "border-box",
                }}
              />
            </div>

            <div>
              <label style={{ display: "block", fontSize: "0.85rem", marginBottom: "0.25rem" }}>
                Unidad
              </label>
              <select
                value={measurement.unit}
                onChange={(e) => handleMeasurementChange(index, "unit", e.target.value)}
                style={{
                  width: "100%",
                  padding: "0.5rem",
                  border: "1px solid #d9d9d9",
                  borderRadius: 4,
                  boxSizing: "border-box",
                }}
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
                  padding: "0.5rem 0.75rem",
                  background: "#ff4d4f",
                  color: "white",
                  border: "none",
                  borderRadius: 4,
                  cursor: "pointer",
                  alignSelf: "flex-end",
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
            padding: "0.5rem 1rem",
            background: "white",
            border: "1px solid #1677ff",
            color: "#1677ff",
            borderRadius: 4,
            cursor: "pointer",
            fontSize: "0.9rem",
            marginTop: "0.5rem",
          }}
        >
          + Agregar medición
        </button>
      </div>

      <button
        type="submit"
        disabled={isLoading}
        style={{
          padding: "0.75rem 1.5rem",
          background: isLoading ? "#d9d9d9" : "#1677ff",
          color: "white",
          border: "none",
          borderRadius: 4,
          cursor: isLoading ? "not-allowed" : "pointer",
          fontSize: "1rem",
          fontWeight: 600,
        }}
      >
        {isLoading ? "Procesando..." : "Guardar consulta (demo)"}
      </button>

      <p style={{ fontSize: "0.85rem", color: "#888", marginTop: "1rem" }}>
        Nota: Esta es una simulación de MC-4. Los datos no se guardan.
      </p>
    </form>
  );
}
