import { PanelView } from "./panel-view";
import { fonts, colors, radius } from "../lib/design-tokens";

export default function Page() {
  return (
    <main style={{ maxWidth: 1200, margin: "0 auto", padding: "2rem 1.5rem" }}>
      <header style={{ marginBottom: "1.75rem" }}>
        <h1
          style={{
            margin: 0,
            fontSize: "1.6rem",
            fontFamily: fonts.heading,
            fontWeight: 700,
            color: colors.greenDark,
            letterSpacing: "-0.3px",
          }}
        >
          Pulso Nutricional
        </h1>
        <p style={{ margin: "0.25rem 0 0", color: colors.textSecondary, fontSize: "0.9rem" }}>
          Panel profesional
        </p>
      </header>

      <div
        role="note"
        style={{
          background: colors.warningBg,
          border: `1px solid ${colors.warningBorder}`,
          borderRadius: radius.md,
          padding: "0.65rem 1rem",
          marginBottom: "1.75rem",
          fontSize: "0.82rem",
          color: colors.warningText,
        }}
      >
        Ambiente de demostración · Datos ficticios · Ningún dato de esta pantalla es real.
      </div>

      <PanelView />
    </main>
  );
}
