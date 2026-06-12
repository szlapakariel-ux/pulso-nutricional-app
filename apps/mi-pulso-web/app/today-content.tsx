"use client";

import type {
  AgendaItemType,
  DayMoment,
  PatientTodayView,
} from "@pulso/shared";
import { colors, fonts, radius } from "../lib/design-tokens";

/**
 * Presentación compartida de la vista "Hoy".
 *
 * Renderiza plan + agenda a partir de un PatientTodayView, sea cual sea su
 * origen. NO mezcla orígenes: recibe un único `view` ya resuelto.
 */

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

const sectionTitle = {
  margin: "0 0 0.75rem",
  fontSize: "0.7rem",
  textTransform: "uppercase" as const,
  letterSpacing: "0.07em",
  fontWeight: 700,
  color: colors.textSecondary,
};

export function TodayContent({ view }: { view: PatientTodayView }) {
  return (
    <>
      {/* Sin plan */}
      {!view.plan && (
        <div
          style={{
            background: colors.bgSurface,
            border: `1px dashed ${colors.borderDefault}`,
            borderRadius: radius.lg,
            padding: "2rem 1.25rem",
            textAlign: "center",
            color: colors.textSecondary,
          }}
        >
          <p style={{ margin: "0 0 0.4rem", fontSize: "1.5rem" }}>📋</p>
          <p style={{ margin: "0 0 0.25rem", fontWeight: 600, color: colors.textPrimary }}>
            Sin plan asignado
          </p>
          <p style={{ margin: 0, fontSize: "0.85rem" }}>
            Tu nutricionista todavía no asignó un plan para este período.
          </p>
        </div>
      )}

      {/* Plan alimentario */}
      {view.plan && (
        <section style={{ marginBottom: "1.25rem" }}>
          <h2 style={sectionTitle}>Tu plan alimentario</h2>

          <div
            style={{
              background: colors.bgSurface,
              borderRadius: radius.lg,
              border: `1px solid ${colors.borderDefault}`,
              overflow: "hidden",
            }}
          >
            {/* Plan header */}
            <div
              style={{
                padding: "1rem 1.1rem 0.9rem",
                borderBottom: `1px solid ${colors.bgMuted}`,
              }}
            >
              <p
                style={{
                  margin: "0 0 0.1rem",
                  fontWeight: 700,
                  fontSize: "1rem",
                  color: colors.textPrimary,
                  fontFamily: fonts.heading,
                }}
              >
                {view.plan.name}
              </p>
            </div>

            {/* Indicaciones generales */}
            <div
              style={{
                padding: "0.9rem 1.1rem",
                background: colors.infoBg,
                borderBottom: `1px solid ${colors.infoBorder}`,
              }}
            >
              <p
                style={{
                  margin: "0 0 0.3rem",
                  fontSize: "0.7rem",
                  fontWeight: 700,
                  color: colors.infoText,
                  textTransform: "uppercase",
                  letterSpacing: "0.04em",
                }}
              >
                Indicaciones generales
              </p>
              <p style={{ margin: 0, fontSize: "0.9rem", color: colors.textPrimary, lineHeight: 1.5 }}>
                {view.plan.generalIndications}
              </p>
            </div>

            {/* Comidas */}
            <div style={{ padding: "0.85rem 1.1rem 0.25rem" }}>
              <p
                style={{
                  margin: "0 0 0.65rem",
                  fontSize: "0.7rem",
                  fontWeight: 700,
                  color: colors.textSecondary,
                  textTransform: "uppercase",
                  letterSpacing: "0.04em",
                }}
              >
                Comidas del día
              </p>
              <ul style={{ listStyle: "none", margin: 0, padding: 0, display: "flex", flexDirection: "column", gap: "0.6rem" }}>
                {[...view.plan.meals]
                  .sort((a, b) => a.order - b.order)
                  .map((meal) => (
                    <li
                      key={meal.id}
                      style={{
                        padding: "0.7rem 0.85rem",
                        background: colors.bgBase,
                        borderRadius: radius.md,
                        border: `1px solid ${colors.borderDefault}`,
                      }}
                    >
                      <div
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "baseline",
                          marginBottom: "0.2rem",
                        }}
                      >
                        <strong style={{ fontSize: "0.9rem", color: colors.textPrimary }}>
                          {meal.name}
                        </strong>
                        <span style={{ fontSize: "0.78rem", color: colors.textSecondary, marginLeft: "0.5rem", fontFamily: fonts.mono }}>
                          {meal.timeHint}
                        </span>
                      </div>
                      <p style={{ margin: 0, fontSize: "0.83rem", color: colors.textSecondary, lineHeight: 1.45 }}>
                        {meal.description}
                      </p>
                      {meal.portionHint && (
                        <p style={{ margin: "0.2rem 0 0", fontSize: "0.75rem", color: colors.textSecondary }}>
                          {meal.portionHint}
                        </p>
                      )}
                      <span
                        style={{
                          display: "inline-block",
                          marginTop: "0.35rem",
                          fontSize: "0.7rem",
                          background: colors.bgMuted,
                          color: colors.textSecondary,
                          padding: "0.1rem 0.45rem",
                          borderRadius: radius.pill,
                          border: `1px solid ${colors.borderDefault}`,
                        }}
                      >
                        {MOMENT_LABEL[meal.moment]}
                      </span>
                    </li>
                  ))}
              </ul>
            </div>
            <div style={{ height: "0.85rem" }} />
          </div>
        </section>
      )}

      {/* Agenda del día */}
      <section>
        <h2 style={sectionTitle}>Tu agenda de hoy</h2>

        {view.agendaItems.length === 0 ? (
          <div
            style={{
              background: colors.bgSurface,
              border: `1px dashed ${colors.borderDefault}`,
              borderRadius: radius.lg,
              padding: "1.5rem",
              textAlign: "center",
              color: colors.textSecondary,
              fontSize: "0.85rem",
            }}
          >
            Sin actividades en tu agenda para hoy.
          </div>
        ) : (
          <div
            style={{
              background: colors.bgSurface,
              borderRadius: radius.lg,
              border: `1px solid ${colors.borderDefault}`,
              overflow: "hidden",
            }}
          >
            <ul style={{ listStyle: "none", margin: 0, padding: 0 }}>
              {[...view.agendaItems]
                .sort((a, b) => a.order - b.order)
                .map((item, idx) => (
                  <li
                    key={item.id}
                    style={{
                      display: "flex",
                      alignItems: "flex-start",
                      gap: "0.85rem",
                      padding: "0.9rem 1.1rem",
                      borderBottom:
                        idx < view.agendaItems.length - 1
                          ? `1px solid ${colors.bgMuted}`
                          : "none",
                    }}
                  >
                    <span
                      style={{
                        fontSize: "1.3rem",
                        lineHeight: 1.3,
                        flexShrink: 0,
                      }}
                    >
                      {ITEM_TYPE_ICON[item.type]}
                    </span>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "baseline",
                          gap: "0.5rem",
                          marginBottom: "0.1rem",
                        }}
                      >
                        <strong style={{ fontSize: "0.92rem", color: colors.textPrimary }}>
                          {item.title}
                        </strong>
                        <span
                          style={{
                            fontSize: "0.78rem",
                            color: colors.textSecondary,
                            whiteSpace: "nowrap",
                            flexShrink: 0,
                            fontFamily: fonts.mono,
                          }}
                        >
                          {item.timeHint}
                        </span>
                      </div>
                      {item.description && (
                        <p
                          style={{
                            margin: 0,
                            fontSize: "0.83rem",
                            color: colors.textSecondary,
                            lineHeight: 1.45,
                          }}
                        >
                          {item.description}
                        </p>
                      )}
                      <span
                        style={{
                          display: "inline-block",
                          marginTop: "0.35rem",
                          fontSize: "0.7rem",
                          background: colors.bgMuted,
                          color: colors.textSecondary,
                          padding: "0.1rem 0.45rem",
                          borderRadius: radius.pill,
                          border: `1px solid ${colors.borderDefault}`,
                        }}
                      >
                        {MOMENT_LABEL[item.moment]}
                      </span>
                    </div>
                  </li>
                ))}
            </ul>
          </div>
        )}
      </section>
    </>
  );
}
