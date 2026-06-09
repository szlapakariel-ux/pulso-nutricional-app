"use client";

import { useMemo, useState } from "react";
import type { PatientDetail, PatientStatus } from "@pulso/shared";
import { DEMO_PATIENTS } from "./patients.mock";

const STATUS_LABEL: Record<PatientStatus, string> = {
  active: "Activo",
  inactive: "Inactivo",
  pending: "Pendiente",
};

export function PatientsView() {
  const [query, setQuery] = useState("");
  const [selectedId, setSelectedId] = useState<string>(DEMO_PATIENTS[0]?.id ?? "");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (q === "") return DEMO_PATIENTS;
    return DEMO_PATIENTS.filter((p) => p.fullName.toLowerCase().includes(q));
  }, [query]);

  const selected: PatientDetail | undefined = DEMO_PATIENTS.find(
    (p) => p.id === selectedId,
  );

  return (
    <section>
      <h2 style={{ fontSize: "1.25rem", marginBottom: "0.75rem" }}>Pacientes</h2>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1.2fr", gap: "1.5rem" }}>
        {/* Lista + buscador */}
        <div>
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Buscar paciente…"
            aria-label="Buscar paciente"
            style={{
              width: "100%",
              padding: "0.5rem 0.75rem",
              border: "1px solid #d9d9d9",
              borderRadius: 8,
              marginBottom: "0.75rem",
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
                    onClick={() => setSelectedId(p.id)}
                    style={{
                      width: "100%",
                      textAlign: "left",
                      padding: "0.75rem",
                      border: isSelected ? "1px solid #1677ff" : "1px solid #e5e5e5",
                      background: isSelected ? "#e6f4ff" : "#fff",
                      borderRadius: 8,
                      cursor: "pointer",
                    }}
                  >
                    <strong>{p.fullName}</strong>
                    <span style={{ color: "#888", marginLeft: 8, fontSize: "0.85rem" }}>
                      {STATUS_LABEL[p.status]}
                    </span>
                  </button>
                </li>
              );
            })}
            {filtered.length === 0 && (
              <li style={{ color: "#888" }}>Sin resultados.</li>
            )}
          </ul>
        </div>

        {/* Ficha mínima */}
        <div>
          {selected ? (
            <PatientCard patient={selected} />
          ) : (
            <p style={{ color: "#888" }}>Seleccioná un paciente.</p>
          )}
        </div>
      </div>
    </section>
  );
}

function PatientCard({ patient }: { patient: PatientDetail }) {
  return (
    <article
      style={{
        border: "1px solid #e5e5e5",
        borderRadius: 12,
        padding: "1.25rem",
      }}
    >
      <h3 style={{ margin: "0 0 0.25rem" }}>{patient.fullName}</h3>
      <p style={{ margin: "0 0 1rem", color: "#888", fontSize: "0.85rem" }}>
        Ficha mínima · estado: {STATUS_LABEL[patient.status]}
      </p>

      <dl style={{ display: "grid", gridTemplateColumns: "auto 1fr", gap: "0.4rem 1rem", margin: 0 }}>
        <dt style={{ color: "#666" }}>Edad</dt>
        <dd style={{ margin: 0 }}>{patient.age} años</dd>

        <dt style={{ color: "#666" }}>Objetivo</dt>
        <dd style={{ margin: 0 }}>{patient.goal}</dd>

        <dt style={{ color: "#666" }}>Último control</dt>
        <dd style={{ margin: 0 }}>{patient.lastControl ?? "—"}</dd>
      </dl>

      {/* Bloque explícito de datos profesionales */}
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
          Datos profesionales
        </p>
        <p style={{ margin: 0, fontSize: "0.9rem" }}>{patient.professionalNote}</p>
        <p style={{ margin: "0.5rem 0 0", fontSize: "0.75rem", color: "#888" }}>
          Visible solo para la profesional · nunca se muestra al paciente.
        </p>
      </div>
    </article>
  );
}
