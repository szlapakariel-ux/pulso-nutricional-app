"use client";

import { useState, useMemo, useEffect } from "react";
import type { PatientDetail, PatientStatus, PatientSummary } from "@pulso/shared";
import { DEMO_PATIENTS } from "./patients.mock";
import { PatientsView } from "./patients-view";
import { ConsultationsView } from "./consultations-view";
import { MealPlanView } from "./meal-plan-view";
import { ReviewInboxView } from "./review-inbox-view";
import { ActivityView } from "./activity-view";
import { MealPhotosView } from "./meal-photos-view";
import { useApiAuth } from "../lib/use-api-auth";
import { getDataConfig, isApiMode } from "../lib/data-config";
import { getApiClient } from "../lib/api-client";

const STATUS_LABEL: Record<PatientStatus, string> = {
  active: "Activo",
  inactive: "Inactivo",
  pending: "Pendiente",
};

export function PanelView() {
  const [query, setQuery] = useState("");
  const [selectedId, setSelectedId] = useState<string>("");
  const [activeTab, setActiveTab] = useState<"ficha" | "consultas" | "plan" | "revision" | "actividad" | "fotos">("ficha");
  const [patientSummaries, setPatientSummaries] = useState<(PatientSummary | PatientDetail)[]>([...DEMO_PATIENTS]);
  const [selectedDetail, setSelectedDetail] = useState<PatientDetail | null>(null);
  const [loadingPatients, setLoadingPatients] = useState(false);
  const [loginEmail, setLoginEmail] = useState("profesional-demo@pulsonutricional.demo");
  const [loginPassword, setLoginPassword] = useState("demo-profesional-2026");
  const [loginError, setLoginError] = useState<string | null>(null);

  const authState = useApiAuth();
  const config = getDataConfig();
  const useApi = isApiMode();

  useEffect(() => {
    if (selectedId === "" && patientSummaries.length > 0) {
      setSelectedId(patientSummaries[0]?.id ?? "");
    }
  }, [patientSummaries]);

  useEffect(() => {
    if (useApi && authState.token) {
      setLoadingPatients(true);
      getApiClient()
        .getPatients()
        .then((apiPatients) => {
          setPatientSummaries(apiPatients);
          if (selectedId === "" && apiPatients.length > 0) {
            setSelectedId(apiPatients[0].id);
          }
        })
        .catch((e) => {
          console.error("Failed to load patients from API:", e);
          setPatientSummaries([...DEMO_PATIENTS]);
        })
        .finally(() => {
          setLoadingPatients(false);
        });
    } else if (!useApi) {
      setPatientSummaries([...DEMO_PATIENTS]);
      if (selectedId === "") {
        setSelectedId(DEMO_PATIENTS[0]?.id ?? "");
      }
    }
  }, [useApi, authState.token, selectedId]);

  useEffect(() => {
    if (useApi && authState.token && selectedId) {
      getApiClient()
        .getPatient(selectedId)
        .then((detail) => {
          setSelectedDetail(detail);
        })
        .catch((e) => {
          console.error("Failed to load patient detail from API:", e);
          const fallback = patientSummaries.find((p) => p.id === selectedId);
          if (fallback && "professionalNote" in fallback) {
            setSelectedDetail(fallback as PatientDetail);
          } else {
            setSelectedDetail(null);
          }
        });
    } else if (!useApi && selectedId) {
      const detail = patientSummaries.find(
        (p) => p.id === selectedId,
      );
      if (detail && "professionalNote" in detail) {
        setSelectedDetail(detail as PatientDetail);
      }
    }
  }, [useApi, authState.token, selectedId, patientSummaries]);

  const handleLogin = async () => {
    setLoginError(null);
    try {
      await authState.login(loginEmail, loginPassword);
    } catch (e) {
      setLoginError(e instanceof Error ? e.message : "Error al iniciar sesión");
    }
  };

  const handleLogout = () => {
    authState.logout();
    setPatientSummaries([...DEMO_PATIENTS]);
    setSelectedDetail(null);
    setSelectedId("");
    setQuery("");
  };

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (q === "") return patientSummaries;
    return patientSummaries.filter((p) => p.fullName.toLowerCase().includes(q));
  }, [query, patientSummaries]);

  const selected: PatientDetail | null = selectedDetail;

  if (useApi && !authState.token) {
    return (
      <div style={{ maxWidth: "400px", margin: "3rem auto" }}>
        <div style={{ marginBottom: "2rem", textAlign: "center" }}>
          <h2>Pulso Nutricional — Panel Profesional</h2>
          <p style={{ color: "#666", fontSize: "0.9rem" }}>Modo API - Conectar a Railway</p>
        </div>

        <div
          style={{
            border: "1px solid #e5e5e5",
            borderRadius: 8,
            padding: "2rem",
            backgroundColor: "#fafafa",
          }}
        >
          <div style={{ marginBottom: "1.5rem" }}>
            <label style={{ display: "block", marginBottom: "0.5rem", fontWeight: 500 }}>
              Email
            </label>
            <input
              type="email"
              value={loginEmail}
              onChange={(e) => setLoginEmail(e.target.value)}
              placeholder="tu@email.com"
              style={{
                width: "100%",
                padding: "0.75rem",
                border: "1px solid #d9d9d9",
                borderRadius: 4,
                fontSize: "0.9rem",
                boxSizing: "border-box",
              }}
            />
          </div>

          <div style={{ marginBottom: "1.5rem" }}>
            <label style={{ display: "block", marginBottom: "0.5rem", fontWeight: 500 }}>
              Contraseña
            </label>
            <input
              type="password"
              value={loginPassword}
              onChange={(e) => setLoginPassword(e.target.value)}
              placeholder="Contraseña"
              style={{
                width: "100%",
                padding: "0.75rem",
                border: "1px solid #d9d9d9",
                borderRadius: 4,
                fontSize: "0.9rem",
                boxSizing: "border-box",
              }}
            />
          </div>

          {loginError && (
            <div
              style={{
                marginBottom: "1.5rem",
                padding: "0.75rem",
                backgroundColor: "#fff2f0",
                border: "1px solid #ffccc7",
                borderRadius: 4,
                color: "#d4380d",
                fontSize: "0.85rem",
              }}
            >
              {loginError}
            </div>
          )}

          {authState.loading && (
            <div style={{ marginBottom: "1.5rem", color: "#666", fontSize: "0.9rem" }}>
              Iniciando sesión...
            </div>
          )}

          <button
            type="button"
            onClick={handleLogin}
            disabled={authState.loading}
            style={{
              width: "100%",
              padding: "0.75rem",
              backgroundColor: authState.loading ? "#d9d9d9" : "#1677ff",
              color: "white",
              border: "none",
              borderRadius: 4,
              fontSize: "0.9rem",
              fontWeight: 500,
              cursor: authState.loading ? "not-allowed" : "pointer",
            }}
          >
            {authState.loading ? "Conectando..." : "Conectar"}
          </button>
        </div>

        <p style={{ marginTop: "2rem", color: "#888", fontSize: "0.85rem", textAlign: "center" }}>
          Credenciales demo para pruebas
        </p>
      </div>
    );
  }

  return (
    <div style={{ display: "grid", gridTemplateColumns: "250px 1fr", gap: "2rem" }}>
      {/* Mode indicator and logout */}
      <div style={{ gridColumn: "1 / -1", marginBottom: "1rem", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div style={{ fontSize: "0.85rem", color: "#666" }}>
          Modo: <strong>{useApi ? "🔗 API" : "📦 Mock"}</strong>
        </div>
        {useApi && authState.token && (
          <button
            type="button"
            onClick={handleLogout}
            style={{
              padding: "0.5rem 1rem",
              backgroundColor: "transparent",
              border: "1px solid #d9d9d9",
              borderRadius: 4,
              cursor: "pointer",
              fontSize: "0.85rem",
            }}
          >
            Desconectar
          </button>
        )}
      </div>

      {/* Sidebar: lista de pacientes */}
      <aside
        style={{
          borderRight: "1px solid #e5e5e5",
          paddingRight: "1.5rem",
        }}
      >
        <h3 style={{ fontSize: "1rem", marginBottom: "1rem", margin: 0 }}>
          Pacientes {loadingPatients && "(cargando...)"}
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
              <button
                onClick={() => setActiveTab("fotos")}
                style={{
                  padding: "0.75rem 1rem",
                  border: "none",
                  borderBottom:
                    activeTab === "fotos" ? "2px solid #1677ff" : "none",
                  background: "transparent",
                  cursor: "pointer",
                  fontWeight: activeTab === "fotos" ? 600 : 400,
                  color: activeTab === "fotos" ? "#1677ff" : "#666",
                }}
              >
                Fotos
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
            {activeTab === "fotos" && <MealPhotosView patient={selected} />}
          </>
        ) : (
          <p style={{ color: "#888" }}>Seleccioná un paciente para comenzar.</p>
        )}
      </main>
    </div>
  );
}
