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
import { colors, fonts, radius, shadow } from "../lib/design-tokens";

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

const STATUS_STYLE: Record<string, { bg: string; text: string; label: string }> = {
  pending: { bg: colors.pendingBg, text: colors.pendingText, label: "Pendiente" },
  reviewed: { bg: colors.reviewedBg, text: colors.reviewedText, label: "Revisado" },
  accepted: { bg: colors.acceptedBg, text: colors.acceptedText, label: "Aceptado" },
  flagged: { bg: colors.flaggedBg, text: colors.flaggedText, label: "Seguimiento" },
};

interface ReviewionViewProps {
  patient: PatientDetail;
}

const PREDEFINED_REPLIES = [
  "Revisé tu nota. Seguí el plan indicado sin cambios por ahora.",
  "Gracias por avisarme. Lo tenemos en cuenta para la próxima consulta.",
  "Sin problemas, ese cambio de horario es compatible con tu plan.",
  "Podés sustituir ese ingrediente por una opción equivalente — lo vemos en la próxima consulta.",
  "Muy bien, el progreso es el esperado. Continuá así.",
  "Agendamos para aclarar este punto en la próxima consulta.",
  "Consultá con tu médico si el síntoma persiste — yo reviso el aspecto nutricional en la consulta.",
];

export function ReviewInboxView({ patient }: ReviewionViewProps) {
  const useApi = isApiMode();

  const [inboxItems, setInboxItems] = useState<ReviewInboxItemUI[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [selectedItem, setSelectedItem] = useState<ReviewInboxItemUI | null>(null);
  const [actionInProgress, setActionInProgress] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [replyDrafts, setReplyDrafts] = useState<Map<string, string>>(new Map());
  const [sentReplies, setSentReplies] = useState<Map<string, string>>(new Map());
  const [sendingReply, setSendingReply] = useState<string | null>(null);

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
          setLoadError(err instanceof ApiError ? err.message : "Error al cargar bandeja");
          setInboxItems([]);
        })
        .finally(() => setLoading(false));
    } else {
      setInboxItems(MOCK_INBOX.filter((item) => item.patientId === patient.id));
    }
  }, [useApi, patient.id]);

  const handleAction = async (itemId: string, action: string, comment?: string) => {
    setActionInProgress(itemId);
    setActionError(null);
    if (useApi) {
      try {
        const result = await getApiClient().postReviewAction(itemId, action, comment);
        setInboxItems((prev) =>
          prev.map((item) =>
            item.id === itemId
              ? { ...item, reviewStatus: result.newStatus, lastActionAt: result.executedAt, comment: result.comment ?? item.comment }
              : item,
          ),
        );
        setSelectedItem((prev) =>
          prev?.id === itemId
            ? { ...prev, reviewStatus: result.newStatus, lastActionAt: result.executedAt, comment: result.comment ?? prev.comment }
            : prev,
        );
      } catch (err) {
        setActionError(err instanceof ApiError ? err.message : "Error al ejecutar acción");
      } finally {
        setActionInProgress(null);
      }
    } else {
      setTimeout(() => {
        setInboxItems((prev) =>
          prev.map((item) =>
            item.id === itemId
              ? {
                  ...item,
                  reviewStatus:
                    action === "comment"
                      ? item.reviewStatus
                      : action === "mark_reviewed"
                        ? "reviewed"
                        : action === "accept"
                          ? "accepted"
                          : "flagged",
                  comment: action === "comment" ? comment ?? item.comment : item.comment,
                }
              : item,
          ),
        );
        setActionInProgress(null);
      }, 300);
    }
  };

  const handleSendReply = async (itemId: string) => {
    const text = replyDrafts.get(itemId)?.trim();
    if (!text) return;
    setSendingReply(itemId);
    if (useApi) {
      try {
        await getApiClient().postReviewAction(itemId, "comment", text);
        setSentReplies((prev) => new Map(prev).set(itemId, text));
        setReplyDrafts((prev) => { const m = new Map(prev); m.delete(itemId); return m; });
      } catch (err) {
        setActionError(err instanceof ApiError ? err.message : "Error al enviar respuesta");
      } finally {
        setSendingReply(null);
      }
    } else {
      // mock: just record locally
      setTimeout(() => {
        setSentReplies((prev) => new Map(prev).set(itemId, text));
        setReplyDrafts((prev) => { const m = new Map(prev); m.delete(itemId); return m; });
        setSendingReply(null);
      }, 200);
    }
  };

  if (loading) {
    return (
      <div style={{ padding: "2rem", textAlign: "center", color: colors.textSecondary }}>
        Cargando bandeja…
      </div>
    );
  }

  if (loadError) {
    return (
      <div
        style={{
          padding: "1rem",
          background: colors.errorBg,
          border: `1px solid ${colors.errorBorder}`,
          borderRadius: radius.md,
          color: colors.errorText,
          fontSize: "0.85rem",
        }}
      >
        No se pudo cargar la bandeja: {loadError}
      </div>
    );
  }

  if (inboxItems.length === 0) {
    return (
      <div
        style={{
          padding: "2.5rem 2rem",
          textAlign: "center",
          color: colors.textSecondary,
          border: `1px dashed ${colors.borderDefault}`,
          borderRadius: radius.lg,
          background: colors.bgSurface,
        }}
      >
        <p style={{ fontSize: "1rem", margin: "0 0 0.5rem", color: colors.textPrimary, fontWeight: 500 }}>
          Sin registros pendientes de revisión
        </p>
        <p style={{ margin: 0, fontSize: "0.875rem" }}>
          {useApi
            ? "Cuando el paciente envíe registros desde Mi Pulso, aparecerán aquí."
            : "Todos los registros del paciente están revisados o aceptados."}
        </p>
      </div>
    );
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
      {/* Banner modo */}
      <div
        style={{
          background: useApi ? colors.successBg : colors.warningBg,
          border: `1px solid ${useApi ? colors.successBorder : colors.warningBorder}`,
          borderRadius: radius.md,
          padding: "0.65rem 1rem",
          fontSize: "0.82rem",
          color: useApi ? colors.successText : colors.warningText,
        }}
      >
        {useApi
          ? "Registros del paciente · Pendientes de tu revisión."
          : "Ambiente de demostración · Datos ficticios"}
      </div>

      {/* Error de acción */}
      {actionError && (
        <div
          style={{
            background: colors.errorBg,
            border: `1px solid ${colors.errorBorder}`,
            borderRadius: radius.sm,
            padding: "0.65rem 0.9rem",
            fontSize: "0.82rem",
            color: colors.errorText,
          }}
        >
          {actionError}
        </div>
      )}

      {/* Lista de registros */}
      <section>
        <h3
          style={{
            margin: "0 0 0.75rem",
            fontSize: "0.75rem",
            fontWeight: 600,
            textTransform: "uppercase",
            letterSpacing: "0.07em",
            color: colors.textSecondary,
          }}
        >
          Registros ({inboxItems.length})
        </h3>

        <div
          style={{
            border: `1px solid ${colors.borderDefault}`,
            borderRadius: radius.lg,
            overflow: "hidden",
            background: colors.bgSurface,
            boxShadow: shadow.card,
          }}
        >
          <ul style={{ listStyle: "none", margin: 0, padding: 0 }}>
            {inboxItems.map((item, idx) => {
              const st = STATUS_STYLE[item.reviewStatus] ?? STATUS_STYLE.pending;
              const isActive = selectedItem?.id === item.id;
              return (
                <li
                  key={item.id}
                  style={{
                    padding: "0.9rem 1.1rem",
                    borderBottom:
                      idx < inboxItems.length - 1 ? `1px solid ${colors.bgMuted}` : "none",
                    background: isActive ? "#EBF5EF" : colors.bgSurface,
                    cursor: "pointer",
                    transition: "background 0.15s",
                  }}
                  onClick={() => setSelectedItem(item)}
                  onMouseEnter={(e) => {
                    if (!isActive) (e.currentTarget as HTMLElement).style.background = colors.bgBase;
                  }}
                  onMouseLeave={(e) => {
                    if (!isActive) (e.currentTarget as HTMLElement).style.background = colors.bgSurface;
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
                      <div style={{ display: "flex", gap: "0.5rem", alignItems: "center", marginBottom: "0.2rem" }}>
                        <strong style={{ fontSize: "0.875rem", color: colors.textPrimary }}>
                          {item.entryType === "meal_log" && "Comida"}
                          {item.entryType === "weight_log" && "Peso"}
                          {item.entryType === "note" && "Nota"}
                        </strong>
                        <span
                          style={{
                            color: colors.textSecondary,
                            fontSize: "0.78rem",
                            fontFamily: fonts.mono,
                          }}
                        >
                          {new Date(item.createdAt).toLocaleString("es-AR", {
                            day: "numeric",
                            month: "short",
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </span>
                      </div>

                      {item.entryType === "meal_log" && (
                        <p style={{ margin: 0, fontSize: "0.82rem", color: colors.textSecondary }}>
                          {(item.data as PatientMealLog).foodDescription}
                        </p>
                      )}
                      {item.entryType === "weight_log" && (
                        <p style={{ margin: 0, fontSize: "0.82rem", color: colors.textSecondary }}>
                          <span style={{ fontFamily: fonts.mono }}>{(item.data as PatientWeightLog).weight}</span> kg
                        </p>
                      )}
                      {item.entryType === "note" && (
                        <p style={{ margin: 0, fontSize: "0.82rem", color: colors.textSecondary }}>
                          {(item.data as PatientNote).subject}
                        </p>
                      )}
                    </div>

                    <span
                      style={{
                        fontSize: "0.72rem",
                        background: st.bg,
                        color: st.text,
                        padding: "0.25rem 0.6rem",
                        borderRadius: radius.pill,
                        fontWeight: 600,
                        whiteSpace: "nowrap",
                      }}
                    >
                      {st.label}
                    </span>
                  </div>
                </li>
              );
            })}
          </ul>
        </div>
      </section>

      {/* Panel de detalles y acciones */}
      {selectedItem && (
        <section>
          <h3
            style={{
              margin: "0 0 0.75rem",
              fontSize: "0.75rem",
              fontWeight: 600,
              textTransform: "uppercase",
              letterSpacing: "0.07em",
              color: colors.textSecondary,
            }}
          >
            Detalles y acciones
          </h3>

          <div
            style={{
              border: `1px solid ${colors.borderDefault}`,
              borderRadius: radius.lg,
              padding: "1.25rem",
              background: colors.bgSurface,
              boxShadow: shadow.card,
            }}
          >
            <div style={{ marginBottom: "1rem" }}>
              <h4
                style={{
                  margin: "0 0 0.75rem",
                  fontFamily: fonts.heading,
                  fontWeight: 600,
                  fontSize: "1rem",
                  color: colors.textPrimary,
                }}
              >
                {selectedItem.entryType === "meal_log" && "Registro de comida"}
                {selectedItem.entryType === "weight_log" && "Registro de peso"}
                {selectedItem.entryType === "note" && "Nota del paciente"}
              </h4>

              {selectedItem.entryType === "meal_log" && (
                <div
                  style={{
                    fontSize: "0.875rem",
                    color: colors.textPrimary,
                    display: "flex",
                    flexDirection: "column",
                    gap: "0.35rem",
                  }}
                >
                  <p style={{ margin: 0 }}>
                    <span style={{ color: colors.textSecondary, fontWeight: 500 }}>Descripción: </span>
                    {(selectedItem.data as PatientMealLog).foodDescription}
                  </p>
                  {(selectedItem.data as PatientMealLog).portion && (
                    <p style={{ margin: 0 }}>
                      <span style={{ color: colors.textSecondary, fontWeight: 500 }}>Porción: </span>
                      {(selectedItem.data as PatientMealLog).portion}
                    </p>
                  )}
                  {(selectedItem.data as PatientMealLog).notes && (
                    <p style={{ margin: 0 }}>
                      <span style={{ color: colors.textSecondary, fontWeight: 500 }}>Notas: </span>
                      {(selectedItem.data as PatientMealLog).notes}
                    </p>
                  )}
                </div>
              )}

              {selectedItem.entryType === "weight_log" && (
                <div style={{ fontSize: "0.875rem", color: colors.textPrimary }}>
                  <p style={{ margin: "0 0 0.35rem" }}>
                    <span style={{ color: colors.textSecondary, fontWeight: 500 }}>Peso: </span>
                    <span style={{ fontFamily: fonts.mono }}>{(selectedItem.data as PatientWeightLog).weight}</span> kg
                  </p>
                  {(selectedItem.data as PatientWeightLog).notes && (
                    <p style={{ margin: 0 }}>
                      <span style={{ color: colors.textSecondary, fontWeight: 500 }}>Notas: </span>
                      {(selectedItem.data as PatientWeightLog).notes}
                    </p>
                  )}
                </div>
              )}

              {selectedItem.entryType === "note" && (
                <div style={{ fontSize: "0.875rem", color: colors.textPrimary, display: "flex", flexDirection: "column", gap: "0.35rem" }}>
                  <p style={{ margin: 0 }}>
                    <span style={{ color: colors.textSecondary, fontWeight: 500 }}>Asunto: </span>
                    {(selectedItem.data as PatientNote).subject}
                  </p>
                  <p style={{ margin: 0 }}>
                    <span style={{ color: colors.textSecondary, fontWeight: 500 }}>Contenido: </span>
                    {(selectedItem.data as PatientNote).body}
                  </p>
                </div>
              )}

              {/* Respuesta enviada */}
              {selectedItem.entryType === "note" && (sentReplies.get(selectedItem.id) ?? selectedItem.comment) && (
                <div
                  style={{
                    marginTop: "0.85rem",
                    background: colors.successBg,
                    border: `1px solid ${colors.successBorder}`,
                    borderRadius: radius.md,
                    padding: "0.75rem 1rem",
                    fontSize: "0.85rem",
                    color: colors.successText,
                  }}
                >
                  <span style={{ fontWeight: 600, display: "block", marginBottom: "0.25rem" }}>Respuesta enviada</span>
                  {sentReplies.get(selectedItem.id) ?? selectedItem.comment}
                </div>
              )}

              {/* Compositor de respuesta */}
              {selectedItem.entryType === "note" && (
                <div
                  style={{
                    marginTop: "1rem",
                    border: `1px solid ${colors.borderDefault}`,
                    borderRadius: radius.md,
                    padding: "1rem",
                    background: colors.bgBase,
                  }}
                >
                  <p
                    style={{
                      margin: "0 0 0.6rem",
                      fontSize: "0.82rem",
                      fontWeight: 600,
                      color: colors.textPrimary,
                      fontFamily: fonts.body,
                    }}
                  >
                    Responder
                  </p>

                  {/* Chips de respuestas predefinidas */}
                  <div
                    style={{
                      display: "flex",
                      flexWrap: "wrap",
                      gap: "0.4rem",
                      marginBottom: "0.75rem",
                    }}
                  >
                    {PREDEFINED_REPLIES.map((reply) => (
                      <button
                        key={reply}
                        type="button"
                        onClick={() =>
                          setReplyDrafts((prev) => new Map(prev).set(selectedItem.id, reply))
                        }
                        style={{
                          padding: "0.3rem 0.65rem",
                          border: `1px solid ${colors.borderDefault}`,
                          borderRadius: radius.pill,
                          background: colors.bgSurface,
                          color: colors.textSecondary,
                          fontSize: "0.75rem",
                          fontFamily: fonts.body,
                          cursor: "pointer",
                          transition: "border-color 0.15s, color 0.15s",
                        }}
                        onMouseEnter={(e) => {
                          (e.currentTarget as HTMLElement).style.borderColor = colors.greenPrimary;
                          (e.currentTarget as HTMLElement).style.color = colors.greenDark;
                        }}
                        onMouseLeave={(e) => {
                          (e.currentTarget as HTMLElement).style.borderColor = colors.borderDefault;
                          (e.currentTarget as HTMLElement).style.color = colors.textSecondary;
                        }}
                      >
                        {reply}
                      </button>
                    ))}
                  </div>

                  <textarea
                    value={replyDrafts.get(selectedItem.id) ?? ""}
                    onChange={(e) =>
                      setReplyDrafts((prev) => new Map(prev).set(selectedItem.id, e.target.value))
                    }
                    placeholder="Escribí tu respuesta al paciente…"
                    rows={3}
                    style={{
                      width: "100%",
                      boxSizing: "border-box",
                      padding: "0.6rem 0.75rem",
                      border: `1px solid ${colors.borderDefault}`,
                      borderRadius: radius.md,
                      fontSize: "0.875rem",
                      fontFamily: fonts.body,
                      color: colors.textPrimary,
                      background: colors.bgSurface,
                      resize: "vertical",
                      outline: "none",
                      marginBottom: "0.6rem",
                    }}
                  />

                  <button
                    type="button"
                    onClick={() => void handleSendReply(selectedItem.id)}
                    disabled={sendingReply === selectedItem.id || !(replyDrafts.get(selectedItem.id)?.trim())}
                    style={{
                      padding: "0.55rem 1.1rem",
                      background: colors.greenPrimary,
                      border: "none",
                      borderRadius: radius.md,
                      color: "white",
                      fontWeight: 600,
                      fontSize: "0.82rem",
                      fontFamily: fonts.body,
                      cursor: (sendingReply === selectedItem.id || !(replyDrafts.get(selectedItem.id)?.trim())) ? "not-allowed" : "pointer",
                      opacity: (sendingReply === selectedItem.id || !(replyDrafts.get(selectedItem.id)?.trim())) ? 0.6 : 1,
                    }}
                  >
                    {sendingReply === selectedItem.id ? "Enviando…" : "Enviar respuesta"}
                  </button>
                </div>
              )}
            </div>

            <div
              style={{
                background: colors.infoBg,
                border: `1px solid ${colors.infoBorder}`,
                borderRadius: radius.sm,
                padding: "0.65rem 0.85rem",
                marginBottom: "1rem",
                fontSize: "0.82rem",
                color: colors.infoText,
              }}
            >
              Dato del paciente pendiente de revisión. Tu acción queda registrada.
            </div>

            <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
              <button
                onClick={() => void handleAction(selectedItem.id, "mark_reviewed")}
                disabled={actionInProgress === selectedItem.id}
                style={{
                  padding: "0.55rem 1rem",
                  background: colors.reviewedBg,
                  border: `1px solid ${colors.reviewedText}22`,
                  borderRadius: radius.sm,
                  color: colors.reviewedText,
                  fontWeight: 600,
                  fontSize: "0.82rem",
                  fontFamily: fonts.body,
                  cursor: actionInProgress === selectedItem.id ? "wait" : "pointer",
                  opacity: actionInProgress === selectedItem.id ? 0.6 : 1,
                }}
              >
                Marcar revisado
              </button>

              <button
                onClick={() => void handleAction(selectedItem.id, "accept")}
                disabled={actionInProgress === selectedItem.id}
                style={{
                  padding: "0.55rem 1rem",
                  background: colors.acceptedBg,
                  border: `1px solid ${colors.acceptedText}22`,
                  borderRadius: radius.sm,
                  color: colors.acceptedText,
                  fontWeight: 600,
                  fontSize: "0.82rem",
                  fontFamily: fonts.body,
                  cursor: actionInProgress === selectedItem.id ? "wait" : "pointer",
                  opacity: actionInProgress === selectedItem.id ? 0.6 : 1,
                }}
              >
                Aceptar
              </button>

              <button
                onClick={() => void handleAction(selectedItem.id, "flag")}
                disabled={actionInProgress === selectedItem.id}
                style={{
                  padding: "0.55rem 1rem",
                  background: colors.flaggedBg,
                  border: `1px solid ${colors.flaggedText}22`,
                  borderRadius: radius.sm,
                  color: colors.flaggedText,
                  fontWeight: 600,
                  fontSize: "0.82rem",
                  fontFamily: fonts.body,
                  cursor: actionInProgress === selectedItem.id ? "wait" : "pointer",
                  opacity: actionInProgress === selectedItem.id ? 0.6 : 1,
                }}
              >
                Marcar seguimiento
              </button>
            </div>

            <p
              style={{
                margin: "0.75rem 0 0",
                fontSize: "0.72rem",
                color: colors.textSecondary,
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
