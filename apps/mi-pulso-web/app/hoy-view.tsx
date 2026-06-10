"use client";

import { useState } from "react";
import type { AgendaItemType, DayMoment } from "@pulso/shared";
import { MOCK_TODAY_VIEWS, DEMO_PATIENT_LABELS } from "./today.mock";

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

const DEMO_PATIENT_IDS = ["demo-1", "demo-2", "demo-3"];

export function HoyView() {
  const [patientId, setPatientId] = useState("demo-1");

  const view = MOCK_TODAY_VIEWS[patientId];

  if (!view) {
    return (
      <div style={{ padding: "2rem", textAlign: "center", color: "#888" }}>
        Paciente no encontrado.
      </div>
    );
  }

  return (
    <div
      style={{
        maxWidth: 430,
        margin: "0 auto",
        minHeight: "100dvh",
        background: "#f9fafb",
        fontFamily: "system-ui, -apple-system, sans-serif",
      }}
    >
      {/* Header */}
      <header
        style={{
          background: "#2563eb",
          color: "white",
          padding: "1rem 1.25rem 1.25rem",
          position: "sticky",
          top: 0,
          zIndex: 10,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.15rem" }}>
          <span style={{ fontSize: "1.35rem", fontWeight: 700, letterSpacing: "-0.5px" }}>
            Mi Pulso
          </span>
          <span
            style={{
              fontSize: "0.7rem",
              background: "rgba(255,255,255,0.25)",
              padding: "0.1rem 0.45rem",
              borderRadius: 99,
              marginLeft: "0.25rem",
            }}
          >
            demo
          </span>
        </div>
        <p style={{ margin: 0, fontSize: "0.85rem", opacity: 0.85 }}>
          Hoy · {view.date}
        </p>
      </header>

      <main style={{ padding: "1rem 1rem 5rem" }}>
        {/* Banner demo */}
        <div
          style={{
            background: "#fffbe6",
            border: "1px solid #ffe58f",
            borderRadius: 10,
            padding: "0.6rem 0.9rem",
            marginBottom: "1rem",
            fontSize: "0.8rem",
            color: "#614700",
          }}
        >
          ⚠️ Datos ficticios de demostración — MC-6. No representan información
          clínica real.
        </div>

        {/* Selector de paciente demo */}
        <div
          style={{
            background: "white",
            border: "1px solid #e5e7eb",
            borderRadius: 12,
            padding: "0.9rem 1rem",
            marginBottom: "1.25rem",
          }}
        >
          <p
            style={{
              margin: "0 0 0.5rem",
              fontSize: "0.75rem",
              color: "#6b7280",
              textTransform: "uppercase",
              letterSpacing: "0.05em",
              fontWeight: 600,
            }}
          >
            Paciente (selector demo)
          </p>
          <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
            {DEMO_PATIENT_IDS.map((id) => (
              <button
                key={id}
                onClick={() => setPatientId(id)}
                style={{
                  padding: "0.35rem 0.75rem",
                  borderRadius: 99,
                  border: "1px solid",
                  borderColor: patientId === id ? "#2563eb" : "#e5e7eb",
                  background: patientId === id ? "#eff6ff" : "white",
                  color: patientId === id ? "#2563eb" : "#374151",
                  fontSize: "0.82rem",
                  fontWeight: patientId === id ? 600 : 400,
                  cursor: "pointer",
                }}
              >
                {DEMO_PATIENT_LABELS[id] ?? id}
              </button>
            ))}
          </div>
        </div>

        {/* Sin plan */}
        {!view.plan && (
          <div
            style={{
              background: "white",
              border: "1px dashed #d1d5db",
              borderRadius: 12,
              padding: "2rem 1.25rem",
              textAlign: "center",
              color: "#9ca3af",
            }}
          >
            <p style={{ margin: "0 0 0.4rem", fontSize: "1.5rem" }}>📋</p>
            <p style={{ margin: "0 0 0.25rem", fontWeight: 600, color: "#374151" }}>
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
            <h2
              style={{
                margin: "0 0 0.75rem",
                fontSize: "0.75rem",
                textTransform: "uppercase",
                letterSpacing: "0.05em",
                fontWeight: 700,
                color: "#6b7280",
              }}
            >
              Tu plan alimentario
            </h2>

            <div
              style={{
                background: "white",
                borderRadius: 12,
                border: "1px solid #e5e7eb",
                overflow: "hidden",
              }}
            >
              {/* Plan header */}
              <div
                style={{
                  padding: "1rem 1.1rem 0.9rem",
                  borderBottom: "1px solid #f3f4f6",
                }}
              >
                <p
                  style={{
                    margin: "0 0 0.1rem",
                    fontWeight: 700,
                    fontSize: "1rem",
                    color: "#111827",
                  }}
                >
                  {view.plan.name}
                </p>
              </div>

              {/* Indicaciones generales */}
              <div
                style={{
                  padding: "0.9rem 1.1rem",
                  background: "#eff6ff",
                  borderBottom: "1px solid #dbeafe",
                }}
              >
                <p
                  style={{
                    margin: "0 0 0.3rem",
                    fontSize: "0.75rem",
                    fontWeight: 700,
                    color: "#1d4ed8",
                    textTransform: "uppercase",
                    letterSpacing: "0.04em",
                  }}
                >
                  Indicaciones generales
                </p>
                <p style={{ margin: 0, fontSize: "0.9rem", color: "#1e3a8a", lineHeight: 1.5 }}>
                  {view.plan.generalIndications}
                </p>
              </div>

              {/* Comidas */}
              <div style={{ padding: "0.85rem 1.1rem 0.25rem" }}>
                <p
                  style={{
                    margin: "0 0 0.65rem",
                    fontSize: "0.75rem",
                    fontWeight: 700,
                    color: "#6b7280",
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
                          background: "#f9fafb",
                          borderRadius: 9,
                          border: "1px solid #f3f4f6",
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
                          <strong style={{ fontSize: "0.9rem", color: "#111827" }}>
                            {meal.name}
                          </strong>
                          <span style={{ fontSize: "0.8rem", color: "#9ca3af", marginLeft: "0.5rem" }}>
                            {meal.timeHint}
                          </span>
                        </div>
                        <p style={{ margin: 0, fontSize: "0.83rem", color: "#4b5563", lineHeight: 1.45 }}>
                          {meal.description}
                        </p>
                        {meal.portionHint && (
                          <p style={{ margin: "0.2rem 0 0", fontSize: "0.75rem", color: "#9ca3af" }}>
                            {meal.portionHint}
                          </p>
                        )}
                        <span
                          style={{
                            display: "inline-block",
                            marginTop: "0.35rem",
                            fontSize: "0.72rem",
                            background: "#e5e7eb",
                            color: "#6b7280",
                            padding: "0.1rem 0.45rem",
                            borderRadius: 99,
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
          <h2
            style={{
              margin: "0 0 0.75rem",
              fontSize: "0.75rem",
              textTransform: "uppercase",
              letterSpacing: "0.05em",
              fontWeight: 700,
              color: "#6b7280",
            }}
          >
            Tu agenda de hoy
          </h2>

          {view.agendaItems.length === 0 ? (
            <div
              style={{
                background: "white",
                border: "1px dashed #d1d5db",
                borderRadius: 12,
                padding: "1.5rem",
                textAlign: "center",
                color: "#9ca3af",
                fontSize: "0.85rem",
              }}
            >
              Sin ítems de agenda para hoy.
            </div>
          ) : (
            <div
              style={{
                background: "white",
                borderRadius: 12,
                border: "1px solid #e5e7eb",
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
                            ? "1px solid #f3f4f6"
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
                          <strong style={{ fontSize: "0.92rem", color: "#111827" }}>
                            {item.title}
                          </strong>
                          <span
                            style={{
                              fontSize: "0.8rem",
                              color: "#9ca3af",
                              whiteSpace: "nowrap",
                              flexShrink: 0,
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
                              color: "#6b7280",
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
                            fontSize: "0.72rem",
                            background: "#f3f4f6",
                            color: "#6b7280",
                            padding: "0.1rem 0.45rem",
                            borderRadius: 99,
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
      </main>
    </div>
  );
}
