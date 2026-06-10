"use client";

import { useState } from "react";
import { HoyView } from "./hoy-view";
import { RegistrarView } from "./registrar-view";

export default function Page() {
  const [tab, setTab] = useState<"hoy" | "registrar">("hoy");

  return (
    <>
      {tab === "hoy" && (
        <>
          <HoyView />
          <div
            style={{
              position: "fixed",
              bottom: 0,
              left: 0,
              right: 0,
              maxWidth: 430,
              margin: "0 auto",
              background: "white",
              borderTop: "1px solid #e5e7eb",
              padding: "0.65rem 0.5rem",
              display: "flex",
              gap: "0.5rem",
              justifyContent: "center",
            }}
          >
            <button
              onClick={() => setTab("hoy")}
              style={{
                flex: 1,
                padding: "0.6rem 0.75rem",
                background: "#eff6ff",
                border: "1px solid #dbeafe",
                borderRadius: 8,
                color: "#2563eb",
                fontWeight: 600,
                fontSize: "0.85rem",
                cursor: "pointer",
              }}
            >
              📅 Hoy
            </button>
            <button
              onClick={() => setTab("registrar")}
              style={{
                flex: 1,
                padding: "0.6rem 0.75rem",
                background: "transparent",
                border: "1px solid #d1d5db",
                borderRadius: 8,
                color: "#374151",
                fontWeight: 500,
                fontSize: "0.85rem",
                cursor: "pointer",
              }}
            >
              ✏️ Registrar
            </button>
          </div>
        </>
      )}
      {tab === "registrar" && (
        <>
          <RegistrarView />
          <div
            style={{
              position: "fixed",
              bottom: 0,
              left: 0,
              right: 0,
              maxWidth: 430,
              margin: "0 auto",
              background: "white",
              borderTop: "1px solid #e5e7eb",
              padding: "0.65rem 0.5rem",
              display: "flex",
              gap: "0.5rem",
              justifyContent: "center",
            }}
          >
            <button
              onClick={() => setTab("hoy")}
              style={{
                flex: 1,
                padding: "0.6rem 0.75rem",
                background: "transparent",
                border: "1px solid #d1d5db",
                borderRadius: 8,
                color: "#374151",
                fontWeight: 500,
                fontSize: "0.85rem",
                cursor: "pointer",
              }}
            >
              📅 Hoy
            </button>
            <button
              onClick={() => setTab("registrar")}
              style={{
                flex: 1,
                padding: "0.6rem 0.75rem",
                background: "#fef3c7",
                border: "1px solid #fcd34d",
                borderRadius: 8,
                color: "#92400e",
                fontWeight: 600,
                fontSize: "0.85rem",
                cursor: "pointer",
              }}
            >
              ✏️ Registrar
            </button>
          </div>
        </>
      )}
    </>
  );
}
