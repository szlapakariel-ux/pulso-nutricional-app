"use client";

import { useState } from "react";
import type {
  PatientMealLogDraft,
  PatientWeightLogDraft,
  PatientNoteDraft,
  PatientExerciseLogDraft,
  ActivityType,
  ActivityIntensity,
} from "@pulso/shared";
import { DEMO_ACTIVITY_MODULE_ACTIVE } from "./activity.mock";

interface RegistroEnviado {
  tipo: "comida" | "peso" | "nota" | "actividad";
  timestamp: string;
}

export function RegistrarView() {
  const [activeTab, setActiveTab] = useState<"comida" | "peso" | "nota" | "actividad">(
    "comida"
  );
  const [registrosEnviados, setRegistrosEnviados] = useState<RegistroEnviado[]>(
    []
  );

  // Comida
  const [mealDate, setMealDate] = useState(
    new Date().toISOString().split("T")[0] ?? ""
  );
  const [mealTime, setMealTime] = useState("breakfast");
  const [mealDescription, setMealDescription] = useState("");
  const [mealPortion, setMealPortion] = useState("");
  const [mealNotes, setMealNotes] = useState("");

  // Peso
  const [weightDate, setWeightDate] = useState(
    new Date().toISOString().split("T")[0] ?? ""
  );
  const [weight, setWeight] = useState("");
  const [weightNotes, setWeightNotes] = useState("");

  // Nota
  const [noteType, setNoteType] = useState<"question" | "observation" | "concern">(
    "question"
  );
  const [noteSubject, setNoteSubject] = useState("");
  const [noteBody, setNoteBody] = useState("");

  // Actividad
  const [actDate, setActDate] = useState(
    new Date().toISOString().split("T")[0] ?? ""
  );
  const [actType, setActType] = useState<ActivityType>("walking");
  const [actDuration, setActDuration] = useState("");
  const [actIntensity, setActIntensity] = useState<ActivityIntensity>("low");
  const [actNotes, setActNotes] = useState("");

  const handleSubmitMeal = (e: React.FormEvent) => {
    e.preventDefault();
    if (!mealDescription.trim()) return;

    const draft: PatientMealLogDraft = {
      date: mealDate,
      timeOfDay: mealTime as any,
      foodDescription: mealDescription,
      portion: mealPortion || undefined,
      notes: mealNotes || undefined,
    };

    console.log("Comida enviada (demo):", draft);
    setRegistrosEnviados((prev) => [
      ...prev,
      { tipo: "comida", timestamp: new Date().toISOString() },
    ]);

    // Limpiar formulario
    setMealDescription("");
    setMealPortion("");
    setMealNotes("");
  };

  const handleSubmitWeight = (e: React.FormEvent) => {
    e.preventDefault();
    if (!weight.trim()) return;

    const draft: PatientWeightLogDraft = {
      date: weightDate,
      weight: parseFloat(weight),
      notes: weightNotes || undefined,
    };

    console.log("Peso enviado (demo):", draft);
    setRegistrosEnviados((prev) => [
      ...prev,
      { tipo: "peso", timestamp: new Date().toISOString() },
    ]);

    // Limpiar formulario
    setWeight("");
    setWeightNotes("");
  };

  const handleSubmitActivity = (e: React.FormEvent) => {
    e.preventDefault();
    if (!actDuration.trim() || isNaN(Number(actDuration)) || Number(actDuration) <= 0) return;

    const draft: PatientExerciseLogDraft = {
      date: actDate,
      activityType: actType,
      durationMinutes: Number(actDuration),
      intensity: actIntensity,
      notes: actNotes || undefined,
    };

    console.log("Actividad enviada (demo):", draft);
    setRegistrosEnviados((prev) => [
      ...prev,
      { tipo: "actividad", timestamp: new Date().toISOString() },
    ]);

    setActDuration("");
    setActNotes("");
  };

  const handleSubmitNote = (e: React.FormEvent) => {
    e.preventDefault();
    if (!noteSubject.trim() || !noteBody.trim()) return;

    const draft: PatientNoteDraft = {
      type: noteType,
      subject: noteSubject,
      body: noteBody,
    };

    console.log("Nota enviada (demo):", draft);
    setRegistrosEnviados((prev) => [
      ...prev,
      { tipo: "nota", timestamp: new Date().toISOString() },
    ]);

    // Limpiar formulario
    setNoteSubject("");
    setNoteBody("");
  };

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
          Registrar
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
          ⚠️ Datos ficticios de demostración — MC-7. Tus registros quedarán
          pendientes de revisión por tu profesional.
        </div>

        {/* Tabs */}
        <div
          style={{
            display: "flex",
            gap: "0.5rem",
            marginBottom: "1.25rem",
            borderBottom: "1px solid #e5e7eb",
            flexWrap: "wrap",
          }}
        >
          {(["comida", "peso", "nota"] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              style={{
                padding: "0.75rem 1rem",
                border: "none",
                background: "transparent",
                borderBottom: activeTab === tab ? "2px solid #2563eb" : "none",
                color: activeTab === tab ? "#2563eb" : "#6b7280",
                fontWeight: activeTab === tab ? 600 : 400,
                cursor: "pointer",
                fontSize: "0.9rem",
              }}
            >
              {tab === "comida" && "🍽 Comida"}
              {tab === "peso" && "⚖️ Peso"}
              {tab === "nota" && "💬 Nota"}
            </button>
          ))}
          {DEMO_ACTIVITY_MODULE_ACTIVE && (
            <button
              onClick={() => setActiveTab("actividad")}
              style={{
                padding: "0.75rem 1rem",
                border: "none",
                background: "transparent",
                borderBottom: activeTab === "actividad" ? "2px solid #2563eb" : "none",
                color: activeTab === "actividad" ? "#2563eb" : "#6b7280",
                fontWeight: activeTab === "actividad" ? 600 : 400,
                cursor: "pointer",
                fontSize: "0.9rem",
              }}
            >
              🏃 Actividad
            </button>
          )}
        </div>

        {/* Comida */}
        {activeTab === "comida" && (
          <form
            onSubmit={handleSubmitMeal}
            style={{
              background: "white",
              border: "1px solid #e5e7eb",
              borderRadius: 12,
              padding: "1.25rem",
              marginBottom: "1.5rem",
            }}
          >
            <h3
              style={{
                margin: "0 0 1rem",
                fontSize: "1rem",
                color: "#111827",
              }}
            >
              Registrar comida
            </h3>

            <div style={{ marginBottom: "0.9rem" }}>
              <label style={{ display: "block", fontSize: "0.85rem", fontWeight: 600, marginBottom: "0.4rem", color: "#374151" }}>
                Fecha
              </label>
              <input
                type="date"
                value={mealDate}
                onChange={(e) => setMealDate(e.target.value)}
                style={{
                  width: "100%",
                  padding: "0.5rem",
                  border: "1px solid #d1d5db",
                  borderRadius: 6,
                  fontSize: "0.9rem",
                  boxSizing: "border-box",
                }}
              />
            </div>

            <div style={{ marginBottom: "0.9rem" }}>
              <label style={{ display: "block", fontSize: "0.85rem", fontWeight: 600, marginBottom: "0.4rem", color: "#374151" }}>
                Momento del día
              </label>
              <select
                value={mealTime}
                onChange={(e) => setMealTime(e.target.value)}
                style={{
                  width: "100%",
                  padding: "0.5rem",
                  border: "1px solid #d1d5db",
                  borderRadius: 6,
                  fontSize: "0.9rem",
                  boxSizing: "border-box",
                }}
              >
                <option value="breakfast">Desayuno</option>
                <option value="mid_morning">Media mañana</option>
                <option value="lunch">Almuerzo</option>
                <option value="afternoon">Tarde</option>
                <option value="snack">Merienda</option>
                <option value="dinner">Cena</option>
                <option value="night">Noche</option>
              </select>
            </div>

            <div style={{ marginBottom: "0.9rem" }}>
              <label style={{ display: "block", fontSize: "0.85rem", fontWeight: 600, marginBottom: "0.4rem", color: "#374151" }}>
                ¿Qué comiste?
              </label>
              <textarea
                value={mealDescription}
                onChange={(e) => setMealDescription(e.target.value)}
                placeholder="Ej: café, tostadas con mermelada, jugo"
                style={{
                  width: "100%",
                  padding: "0.5rem",
                  border: "1px solid #d1d5db",
                  borderRadius: 6,
                  fontSize: "0.9rem",
                  minHeight: "80px",
                  fontFamily: "inherit",
                  boxSizing: "border-box",
                  resize: "vertical",
                }}
              />
            </div>

            <div style={{ marginBottom: "0.9rem" }}>
              <label style={{ display: "block", fontSize: "0.85rem", fontWeight: 600, marginBottom: "0.4rem", color: "#374151" }}>
                Porción (opcional)
              </label>
              <input
                type="text"
                value={mealPortion}
                onChange={(e) => setMealPortion(e.target.value)}
                placeholder="Ej: 1 taza, 2 rebanadas, medianas"
                style={{
                  width: "100%",
                  padding: "0.5rem",
                  border: "1px solid #d1d5db",
                  borderRadius: 6,
                  fontSize: "0.9rem",
                  boxSizing: "border-box",
                }}
              />
            </div>

            <div style={{ marginBottom: "1rem" }}>
              <label style={{ display: "block", fontSize: "0.85rem", fontWeight: 600, marginBottom: "0.4rem", color: "#374151" }}>
                Notas (opcional)
              </label>
              <input
                type="text"
                value={mealNotes}
                onChange={(e) => setMealNotes(e.target.value)}
                placeholder="Cómo te sentiste, si faltaban ingredientes, etc."
                style={{
                  width: "100%",
                  padding: "0.5rem",
                  border: "1px solid #d1d5db",
                  borderRadius: 6,
                  fontSize: "0.9rem",
                  boxSizing: "border-box",
                }}
              />
            </div>

            <div
              style={{
                background: "#eff6ff",
                border: "1px solid #dbeafe",
                borderRadius: 8,
                padding: "0.75rem",
                marginBottom: "1rem",
                fontSize: "0.8rem",
                color: "#1e3a8a",
              }}
            >
              ✓ Tu comida se enviará a revisión de tu profesional. Estado:
              pendiente.
            </div>

            <button
              type="submit"
              disabled={!mealDescription.trim()}
              style={{
                width: "100%",
                padding: "0.7rem",
                background:
                  mealDescription.trim() ? "#2563eb" : "#d1d5db",
                color: "white",
                border: "none",
                borderRadius: 8,
                fontWeight: 600,
                cursor: mealDescription.trim() ? "pointer" : "not-allowed",
                fontSize: "0.9rem",
              }}
            >
              Enviar comida
            </button>
          </form>
        )}

        {/* Peso */}
        {activeTab === "peso" && (
          <form
            onSubmit={handleSubmitWeight}
            style={{
              background: "white",
              border: "1px solid #e5e7eb",
              borderRadius: 12,
              padding: "1.25rem",
              marginBottom: "1.5rem",
            }}
          >
            <h3 style={{ margin: "0 0 1rem", fontSize: "1rem", color: "#111827" }}>
              Registrar peso
            </h3>

            <div style={{ marginBottom: "0.9rem" }}>
              <label style={{ display: "block", fontSize: "0.85rem", fontWeight: 600, marginBottom: "0.4rem", color: "#374151" }}>
                Fecha
              </label>
              <input
                type="date"
                value={weightDate}
                onChange={(e) => setWeightDate(e.target.value)}
                style={{
                  width: "100%",
                  padding: "0.5rem",
                  border: "1px solid #d1d5db",
                  borderRadius: 6,
                  fontSize: "0.9rem",
                  boxSizing: "border-box",
                }}
              />
            </div>

            <div style={{ marginBottom: "0.9rem" }}>
              <label style={{ display: "block", fontSize: "0.85rem", fontWeight: 600, marginBottom: "0.4rem", color: "#374151" }}>
                Peso (kg)
              </label>
              <input
                type="number"
                step="0.1"
                value={weight}
                onChange={(e) => setWeight(e.target.value)}
                placeholder="Ej: 72.5"
                style={{
                  width: "100%",
                  padding: "0.5rem",
                  border: "1px solid #d1d5db",
                  borderRadius: 6,
                  fontSize: "0.9rem",
                  boxSizing: "border-box",
                }}
              />
            </div>

            <div style={{ marginBottom: "1rem" }}>
              <label style={{ display: "block", fontSize: "0.85rem", fontWeight: 600, marginBottom: "0.4rem", color: "#374151" }}>
                Notas (opcional)
              </label>
              <input
                type="text"
                value={weightNotes}
                onChange={(e) => setWeightNotes(e.target.value)}
                placeholder="Hora, circunstancias, cómo te sientes"
                style={{
                  width: "100%",
                  padding: "0.5rem",
                  border: "1px solid #d1d5db",
                  borderRadius: 6,
                  fontSize: "0.9rem",
                  boxSizing: "border-box",
                }}
              />
            </div>

            <div
              style={{
                background: "#eff6ff",
                border: "1px solid #dbeafe",
                borderRadius: 8,
                padding: "0.75rem",
                marginBottom: "1rem",
                fontSize: "0.8rem",
                color: "#1e3a8a",
              }}
            >
              ✓ Tu peso se enviará a revisión de tu profesional. Estado:
              pendiente.
            </div>

            <button
              type="submit"
              disabled={!weight.trim()}
              style={{
                width: "100%",
                padding: "0.7rem",
                background: weight.trim() ? "#2563eb" : "#d1d5db",
                color: "white",
                border: "none",
                borderRadius: 8,
                fontWeight: 600,
                cursor: weight.trim() ? "pointer" : "not-allowed",
                fontSize: "0.9rem",
              }}
            >
              Enviar peso
            </button>
          </form>
        )}

        {/* Nota */}
        {activeTab === "nota" && (
          <form
            onSubmit={handleSubmitNote}
            style={{
              background: "white",
              border: "1px solid #e5e7eb",
              borderRadius: 12,
              padding: "1.25rem",
              marginBottom: "1.5rem",
            }}
          >
            <h3 style={{ margin: "0 0 1rem", fontSize: "1rem", color: "#111827" }}>
              Enviar nota o pregunta
            </h3>

            <div style={{ marginBottom: "0.9rem" }}>
              <label style={{ display: "block", fontSize: "0.85rem", fontWeight: 600, marginBottom: "0.4rem", color: "#374151" }}>
                Tipo
              </label>
              <select
                value={noteType}
                onChange={(e) => setNoteType(e.target.value as any)}
                style={{
                  width: "100%",
                  padding: "0.5rem",
                  border: "1px solid #d1d5db",
                  borderRadius: 6,
                  fontSize: "0.9rem",
                  boxSizing: "border-box",
                }}
              >
                <option value="question">Pregunta</option>
                <option value="observation">Observación</option>
                <option value="concern">Preocupación</option>
              </select>
            </div>

            <div style={{ marginBottom: "0.9rem" }}>
              <label style={{ display: "block", fontSize: "0.85rem", fontWeight: 600, marginBottom: "0.4rem", color: "#374151" }}>
                Asunto
              </label>
              <input
                type="text"
                value={noteSubject}
                onChange={(e) => setNoteSubject(e.target.value)}
                placeholder="Ej: Dudas sobre el plan"
                style={{
                  width: "100%",
                  padding: "0.5rem",
                  border: "1px solid #d1d5db",
                  borderRadius: 6,
                  fontSize: "0.9rem",
                  boxSizing: "border-box",
                }}
              />
            </div>

            <div style={{ marginBottom: "1rem" }}>
              <label style={{ display: "block", fontSize: "0.85rem", fontWeight: 600, marginBottom: "0.4rem", color: "#374151" }}>
                Detalle
              </label>
              <textarea
                value={noteBody}
                onChange={(e) => setNoteBody(e.target.value)}
                placeholder="Cuéntanos más..."
                style={{
                  width: "100%",
                  padding: "0.5rem",
                  border: "1px solid #d1d5db",
                  borderRadius: 6,
                  fontSize: "0.9rem",
                  minHeight: "100px",
                  fontFamily: "inherit",
                  boxSizing: "border-box",
                  resize: "vertical",
                }}
              />
            </div>

            <div
              style={{
                background: "#eff6ff",
                border: "1px solid #dbeafe",
                borderRadius: 8,
                padding: "0.75rem",
                marginBottom: "1rem",
                fontSize: "0.8rem",
                color: "#1e3a8a",
              }}
            >
              ✓ Tu nota se enviará a tu profesional. Estado: pendiente.
            </div>

            <button
              type="submit"
              disabled={!noteSubject.trim() || !noteBody.trim()}
              style={{
                width: "100%",
                padding: "0.7rem",
                background:
                  noteSubject.trim() && noteBody.trim() ? "#2563eb" : "#d1d5db",
                color: "white",
                border: "none",
                borderRadius: 8,
                fontWeight: 600,
                cursor:
                  noteSubject.trim() && noteBody.trim()
                    ? "pointer"
                    : "not-allowed",
                fontSize: "0.9rem",
              }}
            >
              Enviar nota
            </button>
          </form>
        )}

        {/* Actividad */}
        {activeTab === "actividad" && DEMO_ACTIVITY_MODULE_ACTIVE && (
          <form
            onSubmit={handleSubmitActivity}
            style={{
              background: "white",
              border: "1px solid #e5e7eb",
              borderRadius: 12,
              padding: "1.25rem",
              marginBottom: "1.5rem",
            }}
          >
            <h3 style={{ margin: "0 0 0.25rem", fontSize: "1rem", color: "#111827" }}>
              Registrar actividad física
            </h3>
            <p style={{ margin: "0 0 1rem", fontSize: "0.8rem", color: "#6b7280" }}>
              Módulo opcional habilitado por tu profesional.
            </p>

            <div style={{ marginBottom: "0.9rem" }}>
              <label style={{ display: "block", fontSize: "0.85rem", fontWeight: 600, marginBottom: "0.4rem", color: "#374151" }}>
                Fecha
              </label>
              <input
                type="date"
                value={actDate}
                onChange={(e) => setActDate(e.target.value)}
                style={{ width: "100%", padding: "0.5rem", border: "1px solid #d1d5db", borderRadius: 6, fontSize: "0.9rem", boxSizing: "border-box" }}
              />
            </div>

            <div style={{ marginBottom: "0.9rem" }}>
              <label style={{ display: "block", fontSize: "0.85rem", fontWeight: 600, marginBottom: "0.4rem", color: "#374151" }}>
                Tipo de actividad
              </label>
              <select
                value={actType}
                onChange={(e) => setActType(e.target.value as ActivityType)}
                style={{ width: "100%", padding: "0.5rem", border: "1px solid #d1d5db", borderRadius: 6, fontSize: "0.9rem", boxSizing: "border-box" }}
              >
                <option value="walking">Caminata</option>
                <option value="gym">Gimnasio / fuerza</option>
                <option value="bike">Bicicleta</option>
                <option value="running">Trote / carrera</option>
                <option value="soccer">Fútbol / deporte de equipo</option>
                <option value="mobility">Movilidad / elongación</option>
                <option value="other">Otra</option>
              </select>
            </div>

            <div style={{ marginBottom: "0.9rem" }}>
              <label style={{ display: "block", fontSize: "0.85rem", fontWeight: 600, marginBottom: "0.4rem", color: "#374151" }}>
                Duración (minutos)
              </label>
              <input
                type="number"
                min="1"
                max="480"
                value={actDuration}
                onChange={(e) => setActDuration(e.target.value)}
                placeholder="Ej: 30"
                style={{ width: "100%", padding: "0.5rem", border: "1px solid #d1d5db", borderRadius: 6, fontSize: "0.9rem", boxSizing: "border-box" }}
              />
            </div>

            <div style={{ marginBottom: "0.9rem" }}>
              <label style={{ display: "block", fontSize: "0.85rem", fontWeight: 600, marginBottom: "0.4rem", color: "#374151" }}>
                Intensidad percibida
              </label>
              <select
                value={actIntensity}
                onChange={(e) => setActIntensity(e.target.value as ActivityIntensity)}
                style={{ width: "100%", padding: "0.5rem", border: "1px solid #d1d5db", borderRadius: 6, fontSize: "0.9rem", boxSizing: "border-box" }}
              >
                <option value="low">Baja — me costó poco</option>
                <option value="moderate">Moderada — me costó algo</option>
                <option value="high">Alta — me esforcé mucho</option>
              </select>
            </div>

            <div style={{ marginBottom: "1rem" }}>
              <label style={{ display: "block", fontSize: "0.85rem", fontWeight: 600, marginBottom: "0.4rem", color: "#374151" }}>
                Notas (opcional)
              </label>
              <input
                type="text"
                value={actNotes}
                onChange={(e) => setActNotes(e.target.value)}
                placeholder="Cómo te sentiste, dónde lo hiciste, etc."
                style={{ width: "100%", padding: "0.5rem", border: "1px solid #d1d5db", borderRadius: 6, fontSize: "0.9rem", boxSizing: "border-box" }}
              />
            </div>

            <div
              style={{
                background: "#eff6ff",
                border: "1px solid #dbeafe",
                borderRadius: 8,
                padding: "0.75rem",
                marginBottom: "1rem",
                fontSize: "0.8rem",
                color: "#1e3a8a",
              }}
            >
              ✓ Tu actividad se enviará a revisión de tu profesional. Estado: pendiente.
              Sin persistencia real — demo MC-10.
            </div>

            <button
              type="submit"
              disabled={!actDuration.trim() || Number(actDuration) <= 0}
              style={{
                width: "100%",
                padding: "0.7rem",
                background: actDuration.trim() && Number(actDuration) > 0 ? "#2563eb" : "#d1d5db",
                color: "white",
                border: "none",
                borderRadius: 8,
                fontWeight: 600,
                cursor: actDuration.trim() && Number(actDuration) > 0 ? "pointer" : "not-allowed",
                fontSize: "0.9rem",
              }}
            >
              Enviar actividad
            </button>
          </form>
        )}

        {/* Histórico de registros enviados (demo) */}
        {registrosEnviados.length > 0 && (
          <section style={{ marginTop: "2rem" }}>
            <h3
              style={{
                margin: "0 0 0.75rem",
                fontSize: "0.9rem",
                fontWeight: 700,
                color: "#374151",
                textTransform: "uppercase",
                letterSpacing: "0.05em",
              }}
            >
              Registros enviados (demo, no persistidos)
            </h3>
            <div
              style={{
                background: "white",
                border: "1px solid #e5e7eb",
                borderRadius: 12,
                overflow: "hidden",
              }}
            >
              <ul style={{ listStyle: "none", margin: 0, padding: 0 }}>
                {registrosEnviados.map((r, idx) => (
                  <li
                    key={idx}
                    style={{
                      padding: "0.85rem 1rem",
                      borderBottom:
                        idx < registrosEnviados.length - 1
                          ? "1px solid #f3f4f6"
                          : "none",
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                    }}
                  >
                    <div>
                      <strong style={{ fontSize: "0.9rem", color: "#111827" }}>
                        {r.tipo === "comida" && "🍽 Comida"}
                        {r.tipo === "peso" && "⚖️ Peso"}
                        {r.tipo === "nota" && "💬 Nota"}
                        {r.tipo === "actividad" && "🏃 Actividad"}
                      </strong>
                      <p style={{ margin: "0.1rem 0 0", fontSize: "0.75rem", color: "#6b7280" }}>
                        {new Date(r.timestamp).toLocaleTimeString()}
                      </p>
                    </div>
                    <span
                      style={{
                        fontSize: "0.75rem",
                        background: "#fef3c7",
                        color: "#92400e",
                        padding: "0.2rem 0.5rem",
                        borderRadius: 4,
                        fontWeight: 600,
                      }}
                    >
                      Pendiente
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          </section>
        )}
      </main>
    </div>
  );
}
