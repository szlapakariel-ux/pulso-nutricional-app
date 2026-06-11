"use client";

import { useState } from "react";
import type {
  PatientDetail,
  PatientPlanAssignment,
  PatientDailyAgenda,
  AgendaItemType,
  DayMoment,
} from "@pulso/shared";
import { MOCK_PLAN_ASSIGNMENTS, MOCK_DAILY_AGENDAS } from "./meal-plans.mock";

const MOMENT_LABEL: Record<DayMoment, string> = {
  morning: "Mañana",
  breakfast: "Desayuno",
  mid_morning: "Media mañana",
  lunch: "Almuerzo",
  afternoon: "Tarde",
  snack: "Merienda",
  dinner: "Cena",
  night: "Noche",
};

const ITEM_TYPE_ICON: Record<AgendaItemType, string> = {
  meal: "🍽",
  hydration: "💧",
  medication: "💊",
  activity: "🏃",
  reminder: "🔔",
};

interface MealPlanViewProps {
  patient: PatientDetail;
}

export function MealPlanView({ patient }: MealPlanViewProps) {
  const [pdfStatus, setPdfStatus] = useState<"idle" | "loading" | "done" | "error">("idle");

  const assignment: PatientPlanAssignment | null =
    MOCK_PLAN_ASSIGNMENTS[patient.id] ?? null;
  const agenda: PatientDailyAgenda | null =
    MOCK_DAILY_AGENDAS[patient.id] ?? null;

  if (!assignment) {
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
          Sin plan asignado
        </p>
        <p style={{ margin: 0, fontSize: "0.9rem" }}>
          Este paciente todavía no tiene un plan alimentario asignado.
          Podrás asignar un plan alimentario próximamente.
        </p>
      </div>
    );
  }

  const plan = assignment.mealPlan;

  async function handleDownloadPdf() {
    setPdfStatus("loading");
    try {
      const res = await fetch(
        `http://localhost:3001/patients/${patient.id}/pdf/plan/download`,
      );
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `plan-${patient.id}-demo.pdf`;
      a.click();
      URL.revokeObjectURL(url);
      setPdfStatus("done");
      setTimeout(() => setPdfStatus("idle"), 3000);
    } catch {
      setPdfStatus("error");
      setTimeout(() => setPdfStatus("idle"), 4000);
    }
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
      {/* PDF del plan */}
      {assignment && (
        <section>
          <div
            style={{
              padding: "1rem 1.25rem",
              background: "#fffbe6",
              border: "1px solid #ffe58f",
              borderRadius: 12,
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              gap: "1rem",
              flexWrap: "wrap",
            }}
          >
            <div>
              <p style={{ margin: 0, fontWeight: 600, fontSize: "0.95rem" }}>
                PDF del plan
              </p>
              <p style={{ margin: "0.2rem 0 0", fontSize: "0.8rem", color: "#92400e" }}>
                Datos de demostración
              </p>
            </div>
            <button
              onClick={handleDownloadPdf}
              disabled={pdfStatus === "loading"}
              style={{
                padding: "0.5rem 1.1rem",
                borderRadius: 8,
                border: "1px solid #d97706",
                background: pdfStatus === "loading" ? "#fef3c7" : "#f59e0b",
                color: pdfStatus === "loading" ? "#92400e" : "white",
                fontWeight: 600,
                fontSize: "0.9rem",
                cursor: pdfStatus === "loading" ? "wait" : "pointer",
                whiteSpace: "nowrap",
              }}
            >
              {pdfStatus === "loading"
                ? "Generando..."
                : pdfStatus === "done"
                  ? "Descargado"
                  : pdfStatus === "error"
                    ? "Error al descargar"
                    : "Descargar PDF"}
            </button>
          </div>
        </section>
      )}

      {/* Plan alimentario */}
      <section>
        <h3 style={{ fontSize: "1.1rem", margin: "0 0 1rem" }}>
          Plan alimentario
        </h3>

        <div
          style={{
            border: "1px solid #e5e5e5",
            borderRadius: 12,
            padding: "1.25rem",
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "flex-start",
              marginBottom: "0.75rem",
            }}
          >
            <div>
              <h4 style={{ margin: 0 }}>{plan.name}</h4>
              <p style={{ margin: "0.25rem 0 0", color: "#888", fontSize: "0.85rem" }}>
                Estado: {plan.status} · Desde: {assignment.startDate}
              </p>
            </div>
          </div>

          <p style={{ margin: "0 0 1rem", fontSize: "0.9rem", color: "#444" }}>
            {plan.description}
          </p>

          {/* Indicaciones generales — visible al paciente */}
          <div
            style={{
              padding: "0.75rem 1rem",
              background: "#e6f7ff",
              border: "1px solid #91d5ff",
              borderRadius: 8,
              marginBottom: "1rem",
            }}
          >
            <p style={{ margin: "0 0 0.25rem", fontWeight: 600, fontSize: "0.85rem" }}>
              Indicaciones generales
            </p>
            <p style={{ margin: 0, fontSize: "0.9rem" }}>{plan.generalIndications}</p>
            <p style={{ margin: "0.5rem 0 0", fontSize: "0.75rem", color: "#666" }}>
              Visible al paciente en Mi Pulso.
            </p>
          </div>

          {/* Comidas del plan */}
          <h5 style={{ margin: "0 0 0.75rem", fontSize: "0.95rem" }}>
            Comidas del plan
          </h5>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
              gap: "0.75rem",
            }}
          >
            {[...plan.meals]
              .sort((a, b) => a.order - b.order)
              .map((meal) => (
                <div
                  key={meal.id}
                  style={{
                    padding: "0.75rem",
                    background: "#fafafa",
                    border: "1px solid #e5e5e5",
                    borderRadius: 8,
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      marginBottom: "0.25rem",
                    }}
                  >
                    <strong style={{ fontSize: "0.9rem" }}>{meal.name}</strong>
                    <span style={{ color: "#888", fontSize: "0.8rem" }}>
                      {meal.timeHint}
                    </span>
                  </div>
                  <p style={{ margin: 0, fontSize: "0.85rem", color: "#555" }}>
                    {meal.description}
                  </p>
                  {meal.portionHint && (
                    <p style={{ margin: "0.25rem 0 0", fontSize: "0.75rem", color: "#aaa" }}>
                      {meal.portionHint}
                    </p>
                  )}
                  <span
                    style={{
                      display: "inline-block",
                      marginTop: "0.5rem",
                      fontSize: "0.75rem",
                      background: "#f0f0f0",
                      padding: "0.1rem 0.4rem",
                      borderRadius: 4,
                      color: "#666",
                    }}
                  >
                    {MOMENT_LABEL[meal.moment]}
                  </span>
                </div>
              ))}
          </div>

          {/* Nota profesional interna */}
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
            <p style={{ margin: 0, fontSize: "0.9rem" }}>{plan.professionalNote}</p>
            <p style={{ margin: "0.5rem 0 0", fontSize: "0.75rem", color: "#888" }}>
              Visible solo para la profesional · nunca se muestra al paciente.
            </p>
          </div>
        </div>
      </section>

      {/* Agenda diaria */}
      <section>
        <h3 style={{ fontSize: "1.1rem", margin: "0 0 1rem" }}>
          Agenda del día
          {agenda && (
            <span style={{ fontWeight: 400, color: "#888", fontSize: "0.85rem", marginLeft: "0.5rem" }}>
              ({agenda.date})
            </span>
          )}
        </h3>

        {agenda ? (
          <div
            style={{
              border: "1px solid #e5e5e5",
              borderRadius: 12,
              overflow: "hidden",
            }}
          >
            <ul style={{ listStyle: "none", margin: 0, padding: 0 }}>
              {[...agenda.items]
                .sort((a, b) => a.order - b.order)
                .map((item, idx) => (
                  <li
                    key={item.id}
                    style={{
                      display: "flex",
                      alignItems: "flex-start",
                      gap: "1rem",
                      padding: "0.9rem 1.25rem",
                      borderBottom:
                        idx < agenda.items.length - 1
                          ? "1px solid #f0f0f0"
                          : "none",
                      background: "white",
                    }}
                  >
                    <span style={{ fontSize: "1.4rem", lineHeight: 1.2 }}>
                      {ITEM_TYPE_ICON[item.type]}
                    </span>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          gap: "0.5rem",
                        }}
                      >
                        <strong style={{ fontSize: "0.95rem" }}>{item.title}</strong>
                        <span
                          style={{
                            color: "#888",
                            fontSize: "0.85rem",
                            whiteSpace: "nowrap",
                          }}
                        >
                          {item.timeHint}
                        </span>
                      </div>
                      {item.description && (
                        <p
                          style={{
                            margin: "0.2rem 0 0",
                            fontSize: "0.85rem",
                            color: "#555",
                          }}
                        >
                          {item.description}
                        </p>
                      )}
                      <span
                        style={{
                          display: "inline-block",
                          marginTop: "0.35rem",
                          fontSize: "0.75rem",
                          background: "#f5f5f5",
                          padding: "0.1rem 0.4rem",
                          borderRadius: 4,
                          color: "#888",
                        }}
                      >
                        {MOMENT_LABEL[item.moment]}
                      </span>
                    </div>
                  </li>
                ))}
            </ul>

            {/* Nota profesional de la agenda */}
            {agenda.professionalNote && (
              <div
                style={{
                  padding: "0.75rem 1.25rem",
                  background: "#f6ffed",
                  borderTop: "1px solid #b7eb8f",
                }}
              >
                <p
                  style={{
                    margin: "0 0 0.25rem",
                    fontWeight: 600,
                    fontSize: "0.85rem",
                  }}
                >
                  Nota profesional de la agenda
                </p>
                <p style={{ margin: 0, fontSize: "0.9rem" }}>
                  {agenda.professionalNote}
                </p>
                <p
                  style={{
                    margin: "0.5rem 0 0",
                    fontSize: "0.75rem",
                    color: "#888",
                  }}
                >
                  Visible solo para la profesional · nunca se muestra al
                  paciente.
                </p>
              </div>
            )}
          </div>
        ) : (
          <div
            style={{
              padding: "1.5rem",
              textAlign: "center",
              color: "#888",
              border: "1px dashed #d9d9d9",
              borderRadius: 12,
            }}
          >
            Sin agenda generada para hoy.
          </div>
        )}
      </section>
    </div>
  );
}
