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
import { colors, fonts, radius, shadow } from "../lib/design-tokens";

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
          padding: "2.5rem 2rem",
          textAlign: "center",
          color: colors.textSecondary,
          border: `1px dashed ${colors.borderDefault}`,
          borderRadius: radius.lg,
          background: colors.bgSurface,
        }}
      >
        <p
          style={{
            fontSize: "1rem",
            margin: "0 0 0.5rem",
            fontWeight: 500,
            color: colors.textPrimary,
          }}
        >
          Sin plan asignado
        </p>
        <p style={{ margin: 0, fontSize: "0.875rem" }}>
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
    <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
      {/* PDF del plan */}
      <section>
        <div
          style={{
            padding: "1rem 1.25rem",
            background: colors.warningBg,
            border: `1px solid ${colors.warningBorder}`,
            borderRadius: radius.lg,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: "1rem",
            flexWrap: "wrap",
            boxShadow: shadow.card,
          }}
        >
          <div>
            <p style={{ margin: 0, fontWeight: 600, fontSize: "0.9rem", color: colors.textPrimary }}>
              PDF del plan
            </p>
            <p style={{ margin: "0.15rem 0 0", fontSize: "0.78rem", color: colors.warningText }}>
              Datos de demostración
            </p>
          </div>
          <button
            onClick={handleDownloadPdf}
            disabled={pdfStatus === "loading"}
            style={{
              padding: "0.5rem 1.1rem",
              borderRadius: radius.sm,
              border: `1px solid ${colors.accentBrown}`,
              background: pdfStatus === "loading" ? colors.warningBg : colors.accentOrange,
              color: pdfStatus === "loading" ? colors.accentBrown : "white",
              fontWeight: 600,
              fontSize: "0.875rem",
              fontFamily: fonts.body,
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

      {/* Plan alimentario */}
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
          Plan alimentario
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
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "flex-start",
              marginBottom: "0.85rem",
            }}
          >
            <div>
              <h4
                style={{
                  margin: 0,
                  fontFamily: fonts.heading,
                  fontWeight: 700,
                  fontSize: "1.05rem",
                  color: colors.textPrimary,
                }}
              >
                {plan.name}
              </h4>
              <p
                style={{
                  margin: "0.2rem 0 0",
                  color: colors.textSecondary,
                  fontSize: "0.78rem",
                  fontFamily: fonts.mono,
                }}
              >
                {plan.status} · Desde: {assignment.startDate}
              </p>
            </div>
          </div>

          <p style={{ margin: "0 0 1rem", fontSize: "0.875rem", color: colors.textPrimary }}>
            {plan.description}
          </p>

          {/* Indicaciones generales */}
          <div
            style={{
              padding: "0.75rem 1rem",
              background: colors.infoBg,
              border: `1px solid ${colors.infoBorder}`,
              borderRadius: radius.sm,
              marginBottom: "1rem",
            }}
          >
            <p
              style={{
                margin: "0 0 0.25rem",
                fontWeight: 600,
                fontSize: "0.75rem",
                color: colors.infoText,
                textTransform: "uppercase",
                letterSpacing: "0.04em",
              }}
            >
              Indicaciones generales
            </p>
            <p style={{ margin: 0, fontSize: "0.875rem", color: colors.textPrimary }}>
              {plan.generalIndications}
            </p>
            <p style={{ margin: "0.4rem 0 0", fontSize: "0.72rem", color: colors.textSecondary }}>
              Visible al paciente en Mi Pulso.
            </p>
          </div>

          {/* Comidas del plan */}
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
            Comidas del plan
          </p>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(190px, 1fr))",
              gap: "0.65rem",
            }}
          >
            {[...plan.meals]
              .sort((a, b) => a.order - b.order)
              .map((meal) => (
                <div
                  key={meal.id}
                  style={{
                    padding: "0.75rem 0.85rem",
                    background: colors.bgBase,
                    border: `1px solid ${colors.borderDefault}`,
                    borderRadius: radius.md,
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      marginBottom: "0.2rem",
                    }}
                  >
                    <strong style={{ fontSize: "0.875rem", color: colors.textPrimary }}>
                      {meal.name}
                    </strong>
                    <span
                      style={{
                        color: colors.textSecondary,
                        fontSize: "0.75rem",
                        fontFamily: fonts.mono,
                      }}
                    >
                      {meal.timeHint}
                    </span>
                  </div>
                  <p style={{ margin: "0 0 0.4rem", fontSize: "0.82rem", color: colors.textSecondary }}>
                    {meal.description}
                  </p>
                  {meal.portionHint && (
                    <p style={{ margin: "0 0 0.4rem", fontSize: "0.72rem", color: colors.textSecondary }}>
                      {meal.portionHint}
                    </p>
                  )}
                  <span
                    style={{
                      display: "inline-block",
                      fontSize: "0.7rem",
                      background: colors.bgMuted,
                      padding: "0.15rem 0.45rem",
                      borderRadius: radius.pill,
                      color: colors.textSecondary,
                      border: `1px solid ${colors.borderDefault}`,
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
              marginTop: "1.1rem",
              padding: "0.75rem 1rem",
              background: colors.successBg,
              border: `1px solid ${colors.successBorder}`,
              borderRadius: radius.sm,
            }}
          >
            <p
              style={{
                margin: "0 0 0.25rem",
                fontWeight: 600,
                fontSize: "0.75rem",
                color: colors.greenDark,
                textTransform: "uppercase",
                letterSpacing: "0.04em",
              }}
            >
              Nota profesional
            </p>
            <p style={{ margin: 0, fontSize: "0.875rem", color: colors.textPrimary }}>
              {plan.professionalNote}
            </p>
            <p style={{ margin: "0.4rem 0 0", fontSize: "0.72rem", color: colors.textSecondary }}>
              Visible solo para la profesional · nunca se muestra al paciente.
            </p>
          </div>
        </div>
      </section>

      {/* Agenda diaria */}
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
          Agenda del día
          {agenda && (
            <span
              style={{
                fontWeight: 400,
                color: colors.textSecondary,
                fontFamily: fonts.mono,
                fontSize: "0.72rem",
                marginLeft: "0.5rem",
                textTransform: "none",
                letterSpacing: 0,
              }}
            >
              ({agenda.date})
            </span>
          )}
        </h3>

        {agenda ? (
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
              {[...agenda.items]
                .sort((a, b) => a.order - b.order)
                .map((item, idx) => (
                  <li
                    key={item.id}
                    style={{
                      display: "flex",
                      alignItems: "flex-start",
                      gap: "0.85rem",
                      padding: "0.85rem 1.1rem",
                      borderBottom:
                        idx < agenda.items.length - 1
                          ? `1px solid ${colors.bgMuted}`
                          : "none",
                      background: colors.bgSurface,
                    }}
                  >
                    <span style={{ fontSize: "1.25rem", lineHeight: 1.2, flexShrink: 0 }}>
                      {ITEM_TYPE_ICON[item.type]}
                    </span>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          gap: "0.5rem",
                          marginBottom: "0.15rem",
                        }}
                      >
                        <strong style={{ fontSize: "0.875rem", color: colors.textPrimary }}>
                          {item.title}
                        </strong>
                        <span
                          style={{
                            color: colors.textSecondary,
                            fontSize: "0.78rem",
                            whiteSpace: "nowrap",
                            fontFamily: fonts.mono,
                          }}
                        >
                          {item.timeHint}
                        </span>
                      </div>
                      {item.description && (
                        <p
                          style={{
                            margin: "0 0 0.3rem",
                            fontSize: "0.82rem",
                            color: colors.textSecondary,
                          }}
                        >
                          {item.description}
                        </p>
                      )}
                      <span
                        style={{
                          display: "inline-block",
                          fontSize: "0.7rem",
                          background: colors.bgMuted,
                          padding: "0.15rem 0.45rem",
                          borderRadius: radius.pill,
                          color: colors.textSecondary,
                          border: `1px solid ${colors.borderDefault}`,
                        }}
                      >
                        {MOMENT_LABEL[item.moment]}
                      </span>
                    </div>
                  </li>
                ))}
            </ul>

            {agenda.professionalNote && (
              <div
                style={{
                  padding: "0.75rem 1.1rem",
                  background: colors.successBg,
                  borderTop: `1px solid ${colors.successBorder}`,
                }}
              >
                <p
                  style={{
                    margin: "0 0 0.2rem",
                    fontWeight: 600,
                    fontSize: "0.75rem",
                    color: colors.greenDark,
                    textTransform: "uppercase",
                    letterSpacing: "0.04em",
                  }}
                >
                  Nota profesional de la agenda
                </p>
                <p style={{ margin: 0, fontSize: "0.875rem", color: colors.textPrimary }}>
                  {agenda.professionalNote}
                </p>
                <p
                  style={{
                    margin: "0.4rem 0 0",
                    fontSize: "0.72rem",
                    color: colors.textSecondary,
                  }}
                >
                  Visible solo para la profesional · nunca se muestra al paciente.
                </p>
              </div>
            )}
          </div>
        ) : (
          <div
            style={{
              padding: "1.5rem 2rem",
              textAlign: "center",
              color: colors.textSecondary,
              border: `1px dashed ${colors.borderDefault}`,
              borderRadius: radius.lg,
              background: colors.bgSurface,
            }}
          >
            Sin agenda generada para hoy.
          </div>
        )}
      </section>
    </div>
  );
}
