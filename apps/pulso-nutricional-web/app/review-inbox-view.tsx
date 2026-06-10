"use client";

import { useState } from "react";
import type { PatientDetail, PatientMealLog, PatientWeightLog, PatientNote } from "@pulso/shared";

interface ReviewInboxItemUI {
  id: string;
  patientId: string;
  patientName: string;
  entryType: "meal_log" | "weight_log" | "note";
  reviewStatus: "pending" | "reviewed" | "accepted" | "flagged";
  createdAt: string;
  lastActionAt?: string;
  comment?: string;
  data: PatientMealLog | PatientWeightLog | PatientNote;
  isDemoData: boolean;
}

// Mock inbox data — en producción vendría de la API
const MOCK_INBOX: ReviewInboxItemUI[] = [
  {
    id: "inbox-meal-1",
    patientId: "demo-1",
    patientName: "Paciente Demo Uno",
    entryType: "meal_log",
    reviewStatus: "pending",
    createdAt: new Date(Date.now() - 3600000).toISOString(),
    data: {
      id: "meal-1",
      patientId: "demo-1",
      date: "2026-06-10",
      timeOfDay: "breakfast",
      foodDescription: "Desayuno: café, tostadas integrales, mermelada",
      portion: "Una taza de café, dos tostadas medianas",
      notes: "Desayuno normal sin complicaciones",
      createdAt: new Date(Date.now() - 3600000).toISOString(),
    },
    isDemoData: true,
  },
  {
    id: "inbox-weight-1",
    patientId: "demo-1",
    patientName: "Paciente Demo Uno",
    entryType: "weight_log",
    reviewStatus: "reviewed",
    createdAt: new Date(Date.now() - 7200000).toISOString(),
    lastActionAt: new Date(Date.now() - 1800000).toISOString(),
    data: {
      id: "weight-1",
      patientId: "demo-1",
      date: "2026-06-10",
      weight: 72.3,
      unit: "kg",
      notes: "Medida de la mañana",
      createdAt: new Date(Date.now() - 7200000).toISOString(),
    },
    isDemoData: true,
  },
  {
    id: "inbox-note-1",
    patientId: "demo-1",
    patientName: "Paciente Demo Uno",
    entryType: "note",
    reviewStatus: "pending",
    createdAt: new Date(Date.now() - 1800000).toISOString(),
    data: {
      id: "note-1",
      patientId: "demo-1",
      type: "question",
      subject: "Dudas sobre los horarios del plan",
      body: "¿Puedo cambiar la hora del almuerzo porque trabajo hasta tarde algunos días?",
      createdAt: new Date(Date.now() - 1800000).toISOString(),
    },
    isDemoData: true,
  },
  {
    id: "inbox-weight-2",
    patientId: "demo-2",
    patientName: "Paciente Demo Dos",
    entryType: "weight_log",
    reviewStatus: "pending",
    createdAt: new Date(Date.now() - 5400000).toISOString(),
    data: {
      id: "weight-2",
      patientId: "demo-2",
      date: "2026-06-10",
      weight: 68.7,
      unit: "kg",
      notes: "Peso de control semanal",
      createdAt: new Date(Date.now() - 5400000).toISOString(),
    },
    isDemoData: true,
  },
];

const STATUS_COLORS: Record<string, string> = {
  pending: "#fef3c7",
  reviewed: "#dbeafe",
  accepted: "#dcfce7",
  flagged: "#fecaca",
};

const STATUS_LABELS: Record<string, string> = {
  pending: "⏳ Pendiente",
  reviewed: "👁️ Revisado",
  accepted: "✅ Aceptado",
  flagged: "🚩 Marcado",
};

interface ReviewionViewProps {
  patient: PatientDetail;
}

export function ReviewInboxView({ patient }: ReviewionViewProps) {
  const [selectedItem, setSelectedItem] = useState<ReviewInboxItemUI | null>(null);
  const [actionInProgress, setActionInProgress] = useState<string | null>(null);

  // Filtrar por paciente seleccionado
  const patientInboxItems = MOCK_INBOX.filter((item) => item.patientId === patient.id);

  const handleAction = (itemId: string, action: string) => {
    setActionInProgress(itemId);
    console.log(`Acción simulada: ${action} en registro ${itemId}`);
    setTimeout(() => {
      setActionInProgress(null);
    }, 500);
  };

  if (patientInboxItems.length === 0) {
    return (
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
          Sin registros pendientes de revisión
        </p>
        <p style={{ margin: 0, fontSize: "0.9rem" }}>
          Todos los registros del paciente están revisados o aceptados.
        </p>
      </div>
    );
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
      {/* Banner demo */}
      <div
        style={{
          background: "#fffbe6",
          border: "1px solid #ffe58f",
          borderRadius: 10,
          padding: "0.75rem 1rem",
          fontSize: "0.85rem",
          color: "#614700",
        }}
      >
        ⚠️ Bandeja simulada — MC-8. Los registros permanecen como datos revisables
        (ReviewableData) incluso después de las acciones. No hay persistencia real.
      </div>

      {/* Lista de registros */}
      <section>
        <h3 style={{ margin: "0 0 0.75rem", fontSize: "0.95rem" }}>
          Registros pendientes/en revisión ({patientInboxItems.length})
        </h3>

        <div
          style={{
            border: "1px solid #e5e5e5",
            borderRadius: 12,
            overflow: "hidden",
          }}
        >
          <ul style={{ listStyle: "none", margin: 0, padding: 0 }}>
            {patientInboxItems.map((item, idx) => (
              <li
                key={item.id}
                style={{
                  padding: "1rem 1.25rem",
                  borderBottom:
                    idx < patientInboxItems.length - 1
                      ? "1px solid #f0f0f0"
                      : "none",
                  background: "white",
                  cursor: "pointer",
                  transition: "background 0.2s",
                }}
                onClick={() => setSelectedItem(item)}
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLElement).style.background = "#fafafa";
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLElement).style.background = "white";
                }}
              >
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "flex-start",
                    gap: "1rem",
                  }}
                >
                  <div style={{ flex: 1 }}>
                    <div style={{ display: "flex", gap: "0.5rem", marginBottom: "0.25rem" }}>
                      <strong style={{ fontSize: "0.95rem", color: "#111" }}>
                        {item.entryType === "meal_log" && "🍽️ Comida"}
                        {item.entryType === "weight_log" && "⚖️ Peso"}
                        {item.entryType === "note" && "💬 Nota"}
                      </strong>
                      <span style={{ color: "#666", fontSize: "0.85rem" }}>
                        {new Date(item.createdAt).toLocaleString()}
                      </span>
                    </div>

                    {/* Resumen del contenido */}
                    {item.entryType === "meal_log" && (
                      <p style={{ margin: "0.25rem 0 0", fontSize: "0.85rem", color: "#555" }}>
                        {(item.data as PatientMealLog).foodDescription}
                      </p>
                    )}
                    {item.entryType === "weight_log" && (
                      <p style={{ margin: "0.25rem 0 0", fontSize: "0.85rem", color: "#555" }}>
                        Peso: {(item.data as PatientWeightLog).weight} kg
                      </p>
                    )}
                    {item.entryType === "note" && (
                      <p style={{ margin: "0.25rem 0 0", fontSize: "0.85rem", color: "#555" }}>
                        {(item.data as PatientNote).subject}
                      </p>
                    )}

                    <p style={{ margin: "0.35rem 0 0", fontSize: "0.75rem", color: "#999" }}>
                      Origen: paciente · Dato revisable
                    </p>
                  </div>

                  <span
                    style={{
                      fontSize: "0.75rem",
                      background: STATUS_COLORS[item.reviewStatus],
                      color: "#333",
                      padding: "0.35rem 0.65rem",
                      borderRadius: 6,
                      fontWeight: 600,
                      whiteSpace: "nowrap",
                    }}
                  >
                    {STATUS_LABELS[item.reviewStatus]}
                  </span>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* Panel de detalles y acciones */}
      {selectedItem && (
        <section>
          <h3 style={{ margin: "0 0 0.75rem", fontSize: "0.95rem" }}>
            Detalles y acciones
          </h3>

          <div
            style={{
              border: "1px solid #e5e5e5",
              borderRadius: 12,
              padding: "1.25rem",
              background: "#fafafa",
            }}
          >
            <div style={{ marginBottom: "1rem" }}>
              <h4 style={{ margin: "0 0 0.5rem", color: "#111" }}>
                {selectedItem.entryType === "meal_log" && "🍽️ Registro de comida"}
                {selectedItem.entryType === "weight_log" && "⚖️ Registro de peso"}
                {selectedItem.entryType === "note" && "💬 Nota/Pregunta"}
              </h4>

              {selectedItem.entryType === "meal_log" && (
                <div style={{ fontSize: "0.9rem", color: "#555" }}>
                  <p>
                    <strong>Descripción:</strong>{" "}
                    {(selectedItem.data as PatientMealLog).foodDescription}
                  </p>
                  {(selectedItem.data as PatientMealLog).portion && (
                    <p>
                      <strong>Porción:</strong>{" "}
                      {(selectedItem.data as PatientMealLog).portion}
                    </p>
                  )}
                  {(selectedItem.data as PatientMealLog).notes && (
                    <p>
                      <strong>Notas:</strong> {(selectedItem.data as PatientMealLog).notes}
                    </p>
                  )}
                </div>
              )}

              {selectedItem.entryType === "weight_log" && (
                <div style={{ fontSize: "0.9rem", color: "#555" }}>
                  <p>
                    <strong>Peso:</strong> {(selectedItem.data as PatientWeightLog).weight} kg
                  </p>
                  {(selectedItem.data as PatientWeightLog).notes && (
                    <p>
                      <strong>Notas:</strong> {(selectedItem.data as PatientWeightLog).notes}
                    </p>
                  )}
                </div>
              )}

              {selectedItem.entryType === "note" && (
                <div style={{ fontSize: "0.9rem", color: "#555" }}>
                  <p>
                    <strong>Asunto:</strong> {(selectedItem.data as PatientNote).subject}
                  </p>
                  <p>
                    <strong>Contenido:</strong> {(selectedItem.data as PatientNote).body}
                  </p>
                </div>
              )}
            </div>

            <div
              style={{
                background: "white",
                border: "1px solid #dbeafe",
                borderRadius: 8,
                padding: "0.75rem",
                marginBottom: "1rem",
                fontSize: "0.85rem",
                color: "#1e3a8a",
              }}
            >
              ✓ Este es un dato revisable del paciente (ReviewableData). Permanece así
              incluso después de tus acciones de revisión.
            </div>

            <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
              <button
                onClick={() => handleAction(selectedItem.id, "mark_reviewed")}
                disabled={actionInProgress === selectedItem.id}
                style={{
                  padding: "0.6rem 1rem",
                  background: "#dbeafe",
                  border: "1px solid #91d5ff",
                  borderRadius: 6,
                  color: "#0c63e4",
                  fontWeight: 600,
                  fontSize: "0.85rem",
                  cursor: actionInProgress === selectedItem.id ? "wait" : "pointer",
                  opacity: actionInProgress === selectedItem.id ? 0.6 : 1,
                }}
              >
                👁️ Marcar revisado
              </button>

              <button
                onClick={() => handleAction(selectedItem.id, "accept")}
                disabled={actionInProgress === selectedItem.id}
                style={{
                  padding: "0.6rem 1rem",
                  background: "#dcfce7",
                  border: "1px solid #86efac",
                  borderRadius: 6,
                  color: "#166534",
                  fontWeight: 600,
                  fontSize: "0.85rem",
                  cursor: actionInProgress === selectedItem.id ? "wait" : "pointer",
                  opacity: actionInProgress === selectedItem.id ? 0.6 : 1,
                }}
              >
                ✅ Aceptar
              </button>

              <button
                onClick={() => handleAction(selectedItem.id, "flag")}
                disabled={actionInProgress === selectedItem.id}
                style={{
                  padding: "0.6rem 1rem",
                  background: "#fecaca",
                  border: "1px solid #fca5a5",
                  borderRadius: 6,
                  color: "#992211",
                  fontWeight: 600,
                  fontSize: "0.85rem",
                  cursor: actionInProgress === selectedItem.id ? "wait" : "pointer",
                  opacity: actionInProgress === selectedItem.id ? 0.6 : 1,
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
              Acciones simuladas — MC-8. No hay persistencia. El registro sigue siendo
              ReviewableData (nunca se convierte en ValidatedData).
            </p>
          </div>
        </section>
      )}
    </div>
  );
}
