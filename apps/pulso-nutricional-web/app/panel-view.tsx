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
import { isApiMode } from "../lib/data-config";
import { getApiClient, ApiError } from "../lib/api-client";
import { colors, fonts, radius, shadow } from "../lib/design-tokens";

const STATUS_LABEL: Record<PatientStatus, string> = {
  active: "Activo",
  inactive: "Inactivo",
  pending: "Pendiente",
};

const STATUS_DOT: Record<PatientStatus, string> = {
  active: colors.greenPrimary,
  inactive: colors.bgSubtle,
  pending: colors.accentOrange,
};

const DEMO_PROF_EMAIL = "profesional-demo@pulsonutricional.demo";
const DEMO_PROF_PASSWORD = "demo-profesional-2026";

const TABS = [
  { key: "ficha", label: "Ficha" },
  { key: "consultas", label: "Consultas" },
  { key: "plan", label: "Plan y agenda" },
  { key: "revision", label: "Revisión" },
  { key: "actividad", label: "Actividad" },
  { key: "fotos", label: "Fotos" },
] as const;

type TabKey = (typeof TABS)[number]["key"];

export function PanelView() {
  const [query, setQuery] = useState("");
  const [selectedId, setSelectedId] = useState<string>("");
  const [activeTab, setActiveTab] = useState<TabKey>("ficha");
  const [patientSummaries, setPatientSummaries] = useState<(PatientSummary | PatientDetail)[]>([...DEMO_PATIENTS]);
  const [selectedDetail, setSelectedDetail] = useState<PatientDetail | null>(null);
  const [loadingPatients, setLoadingPatients] = useState(false);
  const [loginError, setLoginError] = useState<string | null>(null);
  const [showNewPatientModal, setShowNewPatientModal] = useState(false);
  const [newPatientForm, setNewPatientForm] = useState({ fullName: "", age: "", goal: "" });
  const [newPatientSubmitting, setNewPatientSubmitting] = useState(false);
  const [newPatientError, setNewPatientError] = useState<string | null>(null);

  const authState = useApiAuth();
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
      const detail = patientSummaries.find((p) => p.id === selectedId);
      if (detail && "professionalNote" in detail) {
        setSelectedDetail(detail as PatientDetail);
      }
    }
  }, [useApi, authState.token, selectedId, patientSummaries]);

  const handleLogin = async () => {
    setLoginError(null);
    try {
      await authState.login(DEMO_PROF_EMAIL, DEMO_PROF_PASSWORD);
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

  const handleCreatePatient = async () => {
    if (!newPatientForm.fullName.trim()) return;
    setNewPatientSubmitting(true);
    setNewPatientError(null);
    try {
      const patient = await getApiClient().createPatient({
        fullName: newPatientForm.fullName.trim(),
        age: newPatientForm.age ? parseInt(newPatientForm.age, 10) : undefined,
        goal: newPatientForm.goal.trim() || undefined,
      });
      setPatientSummaries((prev) => [...prev, patient]);
      setSelectedId(patient.id);
      setActiveTab("ficha");
      setShowNewPatientModal(false);
      setNewPatientForm({ fullName: "", age: "", goal: "" });
    } catch (err) {
      setNewPatientError(err instanceof Error ? err.message : "Error al crear paciente");
    } finally {
      setNewPatientSubmitting(false);
    }
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
          <h2
            style={{
              margin: "0 0 0.4rem",
              fontFamily: fonts.heading,
              fontWeight: 700,
              color: colors.greenDark,
              fontSize: "1.5rem",
            }}
          >
            Pulso Nutricional
          </h2>
          <p style={{ color: colors.textSecondary, fontSize: "0.9rem", margin: 0 }}>
            Panel profesional
          </p>
        </div>

        <div
          style={{
            border: `1px solid ${colors.borderDefault}`,
            borderRadius: radius.lg,
            padding: "2rem",
            backgroundColor: colors.bgSurface,
            boxShadow: shadow.elevated,
          }}
        >
          {loginError && (
            <div
              style={{
                marginBottom: "1.5rem",
                padding: "0.75rem 1rem",
                backgroundColor: colors.errorBg,
                border: `1px solid ${colors.errorBorder}`,
                borderRadius: radius.sm,
                color: colors.errorText,
                fontSize: "0.85rem",
              }}
            >
              {loginError}
            </div>
          )}

          <button
            type="button"
            onClick={() => void handleLogin()}
            disabled={authState.loading}
            style={{
              width: "100%",
              padding: "0.9rem",
              backgroundColor: authState.loading ? colors.bgMuted : colors.greenPrimary,
              color: "white",
              border: "none",
              borderRadius: radius.md,
              fontSize: "1rem",
              fontWeight: 600,
              fontFamily: fonts.body,
              cursor: authState.loading ? "not-allowed" : "pointer",
              letterSpacing: "0.01em",
            }}
          >
            {authState.loading ? "Ingresando…" : "Ingresar a la demo profesional"}
          </button>
        </div>

        <p
          style={{
            marginTop: "1.5rem",
            color: colors.textSecondary,
            fontSize: "0.78rem",
            textAlign: "center",
            opacity: 0.8,
          }}
        >
          Ambiente de demostración · Datos ficticios
        </p>
      </div>
    );
  }

  return (
    <div style={{ display: "grid", gridTemplateColumns: "240px 1fr", gap: "2rem" }}>
      {/* Top bar */}
      <div
        style={{
          gridColumn: "1 / -1",
          marginBottom: "0.5rem",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <div
          style={{
            fontSize: "0.75rem",
            color: colors.textSecondary,
            background: colors.bgMuted,
            padding: "0.3rem 0.8rem",
            borderRadius: radius.pill,
            border: `1px solid ${colors.borderDefault}`,
          }}
        >
          Ambiente de demostración · Datos ficticios
        </div>
        {useApi && authState.token && (
          <button
            type="button"
            onClick={handleLogout}
            style={{
              padding: "0.4rem 0.9rem",
              backgroundColor: "transparent",
              border: `1px solid ${colors.borderDefault}`,
              borderRadius: radius.sm,
              cursor: "pointer",
              fontSize: "0.82rem",
              color: colors.textSecondary,
              fontFamily: fonts.body,
            }}
          >
            Cerrar sesión
          </button>
        )}
      </div>

      {/* Sidebar: lista de pacientes */}
      <aside
        style={{
          borderRight: `1px solid ${colors.borderDefault}`,
          paddingRight: "1.5rem",
        }}
      >
        <h3
          style={{
            fontSize: "0.75rem",
            fontWeight: 600,
            letterSpacing: "0.07em",
            textTransform: "uppercase",
            color: colors.textSecondary,
            margin: "0 0 0.85rem",
          }}
        >
          Pacientes {loadingPatients && <span style={{ fontWeight: 400, opacity: 0.7 }}>(cargando…)</span>}
        </h3>

        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Buscar paciente…"
          aria-label="Buscar paciente"
          style={{
            width: "100%",
            padding: "0.5rem 0.75rem",
            border: `1px solid ${colors.borderDefault}`,
            borderRadius: radius.md,
            marginBottom: "0.75rem",
            boxSizing: "border-box",
            fontSize: "0.875rem",
            fontFamily: fonts.body,
            color: colors.textPrimary,
            background: colors.bgSurface,
            outline: "none",
          }}
        />

        <ul style={{ listStyle: "none", margin: 0, padding: 0 }}>
          {filtered.map((p) => {
            const isSelected = p.id === selectedId;
            return (
              <li key={p.id} style={{ marginBottom: "0.35rem" }}>
                <button
                  type="button"
                  onClick={() => {
                    setSelectedId(p.id);
                    setActiveTab("ficha");
                  }}
                  style={{
                    width: "100%",
                    textAlign: "left",
                    padding: "0.7rem 0.85rem",
                    border: isSelected
                      ? `1.5px solid ${colors.greenPrimary}`
                      : `1px solid ${colors.borderDefault}`,
                    background: isSelected ? "#EBF5EF" : colors.bgSurface,
                    borderRadius: radius.md,
                    cursor: "pointer",
                    fontFamily: fonts.body,
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                    <span
                      style={{
                        width: 7,
                        height: 7,
                        borderRadius: "50%",
                        background: STATUS_DOT[p.status],
                        flexShrink: 0,
                        display: "inline-block",
                      }}
                    />
                    <strong
                      style={{
                        fontSize: "0.875rem",
                        color: isSelected ? colors.greenDark : colors.textPrimary,
                        fontWeight: isSelected ? 600 : 500,
                      }}
                    >
                      {p.fullName}
                    </strong>
                  </div>
                  <span
                    style={{
                      display: "block",
                      color: colors.textSecondary,
                      fontSize: "0.72rem",
                      marginTop: "0.2rem",
                      marginLeft: "1.1rem",
                    }}
                  >
                    {STATUS_LABEL[p.status]}
                  </span>
                </button>
              </li>
            );
          })}
          {filtered.length === 0 && (
            <li style={{ color: colors.textSecondary, fontSize: "0.875rem", padding: "0.5rem 0" }}>
              Sin resultados.
            </li>
          )}
        </ul>

        <button
          type="button"
          onClick={() => { setShowNewPatientModal(true); setNewPatientError(null); }}
          style={{
            width: "100%",
            marginTop: "0.75rem",
            padding: "0.55rem",
            border: `1px dashed ${colors.greenPrimary}`,
            background: "transparent",
            color: colors.greenDark,
            borderRadius: radius.md,
            fontSize: "0.82rem",
            fontWeight: 600,
            fontFamily: fonts.body,
            cursor: "pointer",
          }}
        >
          + Nuevo paciente
        </button>
      </aside>

      {/* Main content */}
      <main>
        {selected ? (
          <>
            {/* Patient name header */}
            <div style={{ marginBottom: "1.25rem" }}>
              <h2
                style={{
                  margin: 0,
                  fontFamily: fonts.heading,
                  fontWeight: 700,
                  fontSize: "1.3rem",
                  color: colors.textPrimary,
                  letterSpacing: "-0.2px",
                }}
              >
                {selected.fullName}
              </h2>
            </div>

            {/* Tabs */}
            <div
              style={{
                display: "flex",
                gap: "0",
                borderBottom: `1px solid ${colors.borderDefault}`,
                marginBottom: "1.5rem",
              }}
            >
              {TABS.map((tab) => {
                const active = activeTab === tab.key;
                return (
                  <button
                    key={tab.key}
                    onClick={() => setActiveTab(tab.key)}
                    style={{
                      padding: "0.65rem 1rem",
                      border: "none",
                      borderBottom: active
                        ? `2px solid ${colors.greenPrimary}`
                        : "2px solid transparent",
                      background: "transparent",
                      cursor: "pointer",
                      fontWeight: active ? 600 : 400,
                      fontSize: "0.875rem",
                      color: active ? colors.greenDark : colors.textSecondary,
                      fontFamily: fonts.body,
                      transition: "color 0.15s",
                    }}
                  >
                    {tab.label}
                  </button>
                );
              })}
            </div>

            {/* Tab content */}
            {activeTab === "ficha" && <PatientsView patient={selected} />}
            {activeTab === "consultas" && <ConsultationsView patient={selected} />}
            {activeTab === "plan" && <MealPlanView patient={selected} />}
            {activeTab === "revision" && <ReviewInboxView patient={selected} />}
            {activeTab === "actividad" && <ActivityView patient={selected} />}
            {activeTab === "fotos" && <MealPhotosView patient={selected} />}
          </>
        ) : (
          <p style={{ color: colors.textSecondary }}>Seleccioná un paciente para comenzar.</p>
        )}
      </main>

      {/* Modal: Nuevo paciente */}
      {showNewPatientModal && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.4)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 50,
          }}
          onClick={(e) => { if (e.target === e.currentTarget) setShowNewPatientModal(false); }}
        >
          <div
            style={{
              background: colors.bgSurface,
              maxWidth: 420,
              width: "100%",
              padding: "2rem",
              borderRadius: radius.lg,
              boxShadow: shadow.elevated,
            }}
          >
            <h2
              style={{
                margin: "0 0 1.25rem",
                fontFamily: fonts.heading,
                fontWeight: 700,
                fontSize: "1.2rem",
                color: colors.textPrimary,
              }}
            >
              Nuevo paciente
            </h2>

            {!useApi && (
              <div
                style={{
                  marginBottom: "1rem",
                  padding: "0.75rem 1rem",
                  background: colors.warningBg,
                  border: `1px solid ${colors.warningBorder}`,
                  borderRadius: radius.sm,
                  color: colors.warningText,
                  fontSize: "0.82rem",
                }}
              >
                Solo disponible en modo API. Los cambios no se persisten en demo.
              </div>
            )}

            {newPatientError && (
              <div
                style={{
                  marginBottom: "1rem",
                  padding: "0.75rem 1rem",
                  background: colors.errorBg,
                  border: `1px solid ${colors.errorBorder}`,
                  borderRadius: radius.sm,
                  color: colors.errorText,
                  fontSize: "0.82rem",
                }}
              >
                {newPatientError}
              </div>
            )}

            <div style={{ display: "flex", flexDirection: "column", gap: "0.85rem" }}>
              <div>
                <label
                  style={{
                    display: "block",
                    fontSize: "0.8rem",
                    fontWeight: 600,
                    color: colors.textSecondary,
                    marginBottom: "0.3rem",
                    fontFamily: fonts.body,
                  }}
                >
                  Nombre completo *
                </label>
                <input
                  type="text"
                  value={newPatientForm.fullName}
                  onChange={(e) => setNewPatientForm((prev) => ({ ...prev, fullName: e.target.value }))}
                  disabled={!useApi || newPatientSubmitting}
                  placeholder="Nombre y apellido del paciente"
                  style={{
                    width: "100%",
                    boxSizing: "border-box",
                    padding: "0.55rem 0.75rem",
                    border: `1px solid ${colors.borderDefault}`,
                    borderRadius: radius.md,
                    fontSize: "0.875rem",
                    fontFamily: fonts.body,
                    color: colors.textPrimary,
                    background: (!useApi || newPatientSubmitting) ? colors.bgMuted : colors.bgSurface,
                    outline: "none",
                  }}
                />
              </div>

              <div>
                <label
                  style={{
                    display: "block",
                    fontSize: "0.8rem",
                    fontWeight: 600,
                    color: colors.textSecondary,
                    marginBottom: "0.3rem",
                    fontFamily: fonts.body,
                  }}
                >
                  Edad (opcional)
                </label>
                <input
                  type="number"
                  value={newPatientForm.age}
                  onChange={(e) => setNewPatientForm((prev) => ({ ...prev, age: e.target.value }))}
                  disabled={!useApi || newPatientSubmitting}
                  placeholder="Ej: 35"
                  min={1}
                  max={120}
                  style={{
                    width: "100%",
                    boxSizing: "border-box",
                    padding: "0.55rem 0.75rem",
                    border: `1px solid ${colors.borderDefault}`,
                    borderRadius: radius.md,
                    fontSize: "0.875rem",
                    fontFamily: fonts.body,
                    color: colors.textPrimary,
                    background: (!useApi || newPatientSubmitting) ? colors.bgMuted : colors.bgSurface,
                    outline: "none",
                  }}
                />
              </div>

              <div>
                <label
                  style={{
                    display: "block",
                    fontSize: "0.8rem",
                    fontWeight: 600,
                    color: colors.textSecondary,
                    marginBottom: "0.3rem",
                    fontFamily: fonts.body,
                  }}
                >
                  Objetivo (opcional)
                </label>
                <input
                  type="text"
                  value={newPatientForm.goal}
                  onChange={(e) => setNewPatientForm((prev) => ({ ...prev, goal: e.target.value }))}
                  disabled={!useApi || newPatientSubmitting}
                  placeholder="Ej: Bajar de peso, mejorar hábitos…"
                  style={{
                    width: "100%",
                    boxSizing: "border-box",
                    padding: "0.55rem 0.75rem",
                    border: `1px solid ${colors.borderDefault}`,
                    borderRadius: radius.md,
                    fontSize: "0.875rem",
                    fontFamily: fonts.body,
                    color: colors.textPrimary,
                    background: (!useApi || newPatientSubmitting) ? colors.bgMuted : colors.bgSurface,
                    outline: "none",
                  }}
                />
              </div>
            </div>

            <div style={{ display: "flex", gap: "0.75rem", marginTop: "1.5rem", justifyContent: "flex-end" }}>
              <button
                type="button"
                onClick={() => { setShowNewPatientModal(false); setNewPatientForm({ fullName: "", age: "", goal: "" }); }}
                disabled={newPatientSubmitting}
                style={{
                  padding: "0.55rem 1.1rem",
                  background: "transparent",
                  border: `1px solid ${colors.borderDefault}`,
                  borderRadius: radius.md,
                  color: colors.textSecondary,
                  fontWeight: 600,
                  fontSize: "0.82rem",
                  fontFamily: fonts.body,
                  cursor: newPatientSubmitting ? "not-allowed" : "pointer",
                  opacity: newPatientSubmitting ? 0.6 : 1,
                }}
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={() => void handleCreatePatient()}
                disabled={!useApi || newPatientSubmitting || !newPatientForm.fullName.trim()}
                style={{
                  padding: "0.55rem 1.1rem",
                  background: colors.greenPrimary,
                  border: "none",
                  borderRadius: radius.md,
                  color: "white",
                  fontWeight: 600,
                  fontSize: "0.82rem",
                  fontFamily: fonts.body,
                  cursor: (!useApi || newPatientSubmitting || !newPatientForm.fullName.trim()) ? "not-allowed" : "pointer",
                  opacity: (!useApi || newPatientSubmitting || !newPatientForm.fullName.trim()) ? 0.6 : 1,
                }}
              >
                {newPatientSubmitting ? "Creando…" : "Crear paciente"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
