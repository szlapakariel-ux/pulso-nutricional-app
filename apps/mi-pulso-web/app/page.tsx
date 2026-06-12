"use client";

import { useState } from "react";
import { HoyView } from "./hoy-view";
import { RegistrarView } from "./registrar-view";
import { colors, fonts, radius, shadow } from "../lib/design-tokens";

export default function Page() {
  const [tab, setTab] = useState<"hoy" | "registrar">("hoy");

  const tabBar = (
    <div
      style={{
        position: "fixed",
        bottom: 0,
        left: 0,
        right: 0,
        maxWidth: 430,
        margin: "0 auto",
        background: colors.bgSurface,
        borderTop: `1px solid ${colors.borderDefault}`,
        padding: "0.55rem 0.75rem calc(0.55rem + env(safe-area-inset-bottom, 0px))",
        display: "flex",
        gap: "0.5rem",
        boxShadow: "0 -2px 8px rgba(0,0,0,0.06)",
      }}
    >
      <button
        onClick={() => setTab("hoy")}
        style={{
          flex: 1,
          padding: "0.6rem 0.75rem",
          background: tab === "hoy" ? "#EBF5EF" : "transparent",
          border: tab === "hoy" ? `1px solid ${colors.greenPrimary}` : `1px solid ${colors.borderDefault}`,
          borderRadius: radius.md,
          color: tab === "hoy" ? colors.greenDark : colors.textSecondary,
          fontWeight: tab === "hoy" ? 700 : 500,
          fontSize: "0.85rem",
          cursor: "pointer",
          fontFamily: fonts.body,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: "0.3rem",
        }}
      >
        📅 Hoy
      </button>
      <button
        onClick={() => setTab("registrar")}
        style={{
          flex: 1,
          padding: "0.6rem 0.75rem",
          background: tab === "registrar" ? colors.warningBg : "transparent",
          border: tab === "registrar" ? `1px solid ${colors.warningBorder}` : `1px solid ${colors.borderDefault}`,
          borderRadius: radius.md,
          color: tab === "registrar" ? colors.warningText : colors.textSecondary,
          fontWeight: tab === "registrar" ? 700 : 500,
          fontSize: "0.85rem",
          cursor: "pointer",
          fontFamily: fonts.body,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: "0.3rem",
        }}
      >
        ✏️ Registrar
      </button>
    </div>
  );

  return (
    <>
      {tab === "hoy" && <HoyView />}
      {tab === "registrar" && <RegistrarView />}
      {tabBar}
    </>
  );
}
