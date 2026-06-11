"use client";

import { useState, useEffect } from "react";
import type {
  PatientDetail,
  PatientMealLog,
  PatientWeightLog,
  PatientNote,
  ReviewInboxItem,
} from "@pulso/shared";
import { isApiMode } from "../lib/data-config";
import { getApiClient, ApiError } from "../lib/api-client";

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

// Mock inbox data — usado en modo mock
const MOCK_INBOX: ReviewInboxItemUI[] = [
  {
    id: "inbox-meal-1",
    patientId: "demo-1",
    patientName: "Valentina Morales",
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
    patientName: "Valentina Morales",
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
    patientName: "Valentina Morales",
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
    patientName: "Marcos Rodríguez",
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

function apiItemToUI(item: ReviewInboxItem): ReviewInboxItemUI {
  return {
    id: item.id,
    patientId: item.patientId,
    patientName: item.patientName,
    entryType: item.entryType,
    reviewStatus: item.reviewStatus,
    createdAt: item.createdAt,
    lastActionAt: item.lastActionAt,
    comment: item.comment,
    data: item.entry.data as PatientMealLog | PatientWeightLog | PatientNote,
    isDemoData: item.isDemoData,
  };
}

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
  const useApi = isApiMode();

  const [inboxItems, setInboxItems] = useState<ReviewInboxItemUI[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [selectedItem, setSelectedItem] = useState<ReviewInboxItemUI | null>(null);
  const [actionInProgress, setActionInProgress] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);

  useEffect(() => {
    if (useApi) {
      setLoading(true);
      setLoadError(null);
      setSelectedItem(null);
      getApiClient()
        .getReviewInbox(patient.id)
        .then((resp) => {
          setInboxItems(resp.items.map(apiItemToUI));
        })
        .catch((err) => {
          setLoadError(
            err instanceof ApiError ? err.message : "Error al cargar bandeja",
          );
          setInboxItems([]);
        })
        .finally(() => setLoading(false));
    } else {
      setInboxItems(MOCK_INBOX.filter((item) => item.patientId === patient.id));
    }
  }, [useApi, patient.id]);

  const handleAction = async (itemId: string, action: string) => {
    setActionInProgress(itemId);
    setActionError(null);
    if (useApi) {
      try {
        const result = await getApiClient().postReviewAction(itemId, action);
        setInboxItems((prev) =>
          prev.map((item) =>
            item.id === itemId
              ? { ...item, reviewStatus: result.newStatus, lastActionAt: result.executedAt }
              : item,
          ),
        );
        setSelectedItem((prev) =>
          prev?.id === itemId
            ? { ...prev, reviewStatus: result.newStatus, lastActionAt: result.executedAt }
            : prev,
        );
      } catch (err) {
        setActionError(
          err instanceof ApiError ? err.message : "Error al ejecutar acción",
        );
      } finally {
        setActionInProgress(null);
      }
    } else {
      setTimeout(() => {
        setInboxItems((prev) =>
          prev.map((item) =>
            item.id === itemId ? { ...item, reviewStatus: action === "mark_reviewed" ? "reviewed" : action === "accept" ? "accepted" : "flagged" } : item,
          ),
        );
        setActionInProgress(null);
      }, 300);
    }
  };

  if (loading) {
    return (
      <div style={{ padding: "2rem", textAlign: "center", color: "#9ca3af" }}>
        Cargando bandeja…
      </div>
    );
  }

  if (loadError) {
    return (
      <div
        style={{
          padding: "1rem",
          background: "#fef2f2",
          border: "1px solid #fecaca",
          borderRadius: 10,
          color: "#b91c1c",
          fontSize: "0.85rem",
        }}
      >
        ❌ No se pudo cargar la bandeja: {loadError}
      </div>
    );
  }

  if (inboxItems.length === 0) {
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
          {useApi
            ? "Cuando el paciente envíe registros desde Mi Pulso, aparecerán aquí."
            : "Todos los registros del paciente están revisados o aceptados."}
        </p>
      </div>
    );
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
      {/* Banner modo */}
      <div
        style={{
          background: useApi ? "#f0fdf4" : "#fffbe6",
          border: `1px solid ${useApi ? "#bbf7d0" : "#ffe58f"}`,
          borderRadius: 10,
          padding: "0.75rem 1rem",
          fontSize: "0.85rem",
          color: useApi ? "#166534" : "#614700",
        }}
      >
        {useApi
          ? "✓ Registros del paciente · Pendientes de tu revisión."
          : "Ambiente de demostración · Datos ficticios"}
      </div>

      {/* Error de acción */}
      {actionError && (
        <div
          style={{
            background: "#fef2f2",
            border: "1px solid #fecaca",
            borderRadius: 8,
            padding: "0.65rem 0.9rem",
            fontSize: "0.82rem",
            color: "#b91c1c",
          }}
        >
          ❌ {actionError}
        </div>
      )}

      {/* Lista de registros */}
      <section>
        <h3 style={{ margin: "0 0 0.75rem", fontSize: "0.95rem" }}>
          Registros pendientes/en revisión ({inboxItems.length})
        </h3>

        <div
          style={{
            border: "1px solid #e5e5e5",
            borderRadius: 12,
            overflow: "hidden",
          }}
        >
          <ul style={{ listStyle: "none", margin: 0, padding: 0 }}>
            {inboxItems.map((item, idx) => (
              <li
                key={item.id}
                style={{
                  padding: "1rem 1.25rem",
                  borderBottom:
                    idx < inboxItems.length - 1
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
              ✓ Dato del paciente pendiente de revisión. Tu acción queda registrada.
            </div>

            <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
              <button
                onClick={() => void handleAction(selectedItem.id, "mark_reviewed")}
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
                onClick={() => void handleAction(selectedItem.id, "accept")}
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
                onClick={() => void handleAction(selectedItem.id, "flag")}
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
              Ambiente de demostración · Datos ficticios
            </p>
          </div>
        </section>
      )}
    </div>
  );
}
