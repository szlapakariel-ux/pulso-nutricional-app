import type { ReactNode } from "react";

export const metadata = {
  title: "Pulso Nutricional",
  description: "Panel profesional — módulo de pacientes (MC-3, datos de demostración).",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="es">
      <body style={{ margin: 0, fontFamily: "system-ui, sans-serif", color: "#1a1a1a" }}>
        {children}
      </body>
    </html>
  );
}
