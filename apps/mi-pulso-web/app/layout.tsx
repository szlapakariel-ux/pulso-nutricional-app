import type { ReactNode } from "react";

export const metadata = {
  title: "Mi Pulso — MC-1",
  description: "PWA del paciente (placeholder de estructura técnica inicial).",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="es">
      <body>{children}</body>
    </html>
  );
}
