import type { ReactNode } from "react";

export const metadata = {
  title: "Mi Pulso — Hoy",
  description: "Mi Pulso · Tu seguimiento nutricional",
  viewport: "width=device-width, initial-scale=1, maximum-scale=1",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="es">
      <body style={{ margin: 0, padding: 0, background: "#f9fafb" }}>
        {children}
      </body>
    </html>
  );
}
