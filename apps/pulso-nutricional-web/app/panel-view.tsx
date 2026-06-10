"use client";

import { useState, useMemo } from "react";
import type { PatientDetail, PatientStatus } from "@pulso/shared";
import { DEMO_PATIENTS } from "./patients.mock";
import { PatientsView } from "./patients-view";
import { ConsultationsView } from "./consultations-view";
import { MealPlanView } from "./meal-plan-view";
import { ReviewInboxView } from "./review-inbox-view";
import { ActivityView } from "./activity-view";

const STATUS_LABEL: Record<PatientStatus, string> = {
  active: "Activo",
  inactive: "Inactivo",
  pending: "Pendiente",
};

export function PanelView() {
  const [query, setQuery] = useState("");
  const [selectedId, setSelectedId] = useState<string>(DEMO_PATIENTS[0]?.id ?? "");
  const [activeTab, setActiveTab] = useState<"ficha" | "consultas" | "plan" | "revision" | "actividad">("ficha");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (q === "") return DEMO_PATIENTS;
    return DEMO_PATIENTS.filter((p) => p.fullName.toLowerCase().includes(q));
  }, [query]);

  const selected: PatientDetail | undefined = DEMO_PATIENTS.find(
    (p) => p.id === selectedId,
  );

  return (
    <div style={{ display: "grid", gridTemplateColumns: "250px 1fr", gap: "2rem" }}>
      {/* Sidebar: lista de pacientes */}
      <aside
        style={{
          borderRight: "1px solid #e5e5e5",
          paddingRight: "1.5rem",
        }}
      >
        <h3 style={{ fontSize: "1rem", marginBottom: "1rem", margin: 0 }}>
          Pacientes
        </h3>

        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Buscar…"
          aria-label="Buscar paciente"
          style={{
            width: "100%",
            padding: "0.5rem 0.75rem",
            border: "1px solid #d9d9d9",
            borderRadius: 8,
            marginBottom: "1rem",
            boxSizing: "border-box",
          }}
        />

        <ul style={{ listStyle: "none", margin: 0, padding: 0 }}>
          {filtered.map((p) => {
            const isSelected = p.id === selectedId;
            return (
              <li key={p.id} style={{ marginBottom: "0.5rem" }}>
                <button
                  type="button"
                  onClick={() => {
                    setSelectedId(p.id);
                    setActiveTab("ficha");
                  }}
                  style={{
                    width: "100%",
                    textAlign: "left",
                    padding: "0.75rem",
                    border: isSelected ? "1px solid #1677ff" : "1px solid #e5e5e5",
                    background: isSelected ? "#e6f4ff" : "#fff",
                    borderRadius: 8,
                    cursor: "pointer",
                    fontSize: "0.9rem",
                  }}
                >
                  <strong>{p.fullName}</strong>
                  <span style={{ display: "block", color: "#888", fontSize: "0.75rem", marginTop: "0.25rem" }}>
                    {STATUS_LABEL[p.status]}
                  </span>
                </button>
              </li>
            );
          })}
          {filtered.length === 0 && (
            <li style={{ color: "#888", fontSize: "0.9rem" }}>Sin resultados.</li>
          )}
        </ul>
      </aside>

      {/* Main: ficha y consultas */}
      <main>
        {selected ? (
          <>
            {/* Tabs */}
            <div
              style={{
                display: "flex",
                gap: "1rem",
                borderBottom: "1px solid #e5e5e5",
                marginBottom: "1.5rem",
              }}
            >
              <button
                onClick={() => setActiveTab("ficha")}
                style={{
                  padding: "0.75rem 1rem",
                  border: "none",
                  borderBottom:
                    activeTab === "ficha" ? "2px solid #1677ff" : "none",
                  background: "transparent",
                  cursor: "pointer",
                  fontWeight: activeTab === "ficha" ? 600 : 400,
                  color: activeTab === "ficha" ? "#1677ff" : "#666",
                }}
              >
                Ficha
              </button>
              <button
                onClick={() => setActiveTab("consultas")}
                style={{
                  padding: "0.75rem 1rem",
                  border: "none",
                  borderBottom:
                    activeTab === "consultas" ? "2px solid #1677ff" : "none",
                  background: "transparent",
                  cursor: "pointer",
                  fontWeight: activeTab === "consultas" ? 600 : 400,
                  color: activeTab === "consultas" ? "#1677ff" : "#666",
                }}
              >
                Consultas
              </button>
              <button
                onClick={() => setActiveTab("plan")}
                style={{
                  padding: "0.75rem 1rem",
                  border: "none",
                  borderBottom:
                    activeTab === "plan" ? "2px solid #1677ff" : "none",
                  background: "transparent",
                  cursor: "pointer",
                  fontWeight: activeTab === "plan" ? 600 : 400,
                  color: activeTab === "plan" ? "#1677ff" : "#666",
                }}
              >
                Plan y agenda
              </button>
              <button
                onClick={() => setActiveTab("revision")}
                style={{
                  padding: "0.75rem 1rem",
                  border: "none",
                  borderBottom:
                    activeTab === "revision" ? "2px solid #1677ff" : "none",
                  background: "transparent",
                  cursor: "pointer",
                  fontWeight: activeTab === "revision" ? 600 : 400,
                  color: activeTab === "revision" ? "#1677ff" : "#666",
                }}
              >
                Revisión
              </button>
              <button
                onClick={() => setActiveTab("actividad")}
                style={{
                  padding: "0.75rem 1rem",
                  border: "none",
                  borderBottom:
                    activeTab === "actividad" ? "2px solid #1677ff" : "none",
                  background: "transparent",
                  cursor: "pointer",
                  fontWeight: activeTab === "actividad" ? 600 : 400,
                  color: activeTab === "actividad" ? "#1677ff" : "#666",
                }}
              >
                Actividad
              </button>
            </div>

            {/* Tab content */}
            {activeTab === "ficha" && <PatientsView patient={selected} />}
            {activeTab === "consultas" && (
              <ConsultationsView patient={selected} />
            )}
            {activeTab === "plan" && <MealPlanView patient={selected} />}
            {activeTab === "revision" && <ReviewInboxView patient={selected} />}
            {activeTab === "actividad" && <ActivityView patient={selected} />}
          </>
        ) : (
          <p style={{ color: "#888" }}>Seleccioná un paciente para comenzar.</p>
        )}
      </main>
    </div>
  );
}
