import type { ReactNode } from "react";

export const metadata = {
  title: "Pulso Nutricional — MC-1",
  description: "Panel profesional (placeholder de estructura técnica inicial).",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="es">
      <body>{children}</body>
    </html>
  );
}
