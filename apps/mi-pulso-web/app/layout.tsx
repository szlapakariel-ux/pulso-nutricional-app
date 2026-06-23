import type { ReactNode } from "react";
import type { Viewport } from "next";
import { fonts, colors } from "../lib/design-tokens";
import { PwaRegister } from "./pwa-register";

export const metadata = {
  title: "Mi Pulso — Hoy",
  description: "Mi Pulso · Tu seguimiento nutricional",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent" as const,
    title: "Mi Pulso",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  themeColor: "#0F7A4F",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="es">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Instrument+Serif:ital@0;1&family=Inter:wght@400;500;600&family=JetBrains+Mono:wght@400;500&display=swap"
          rel="stylesheet"
        />
        <link rel="apple-touch-icon" href="/icon-192x192.png" />
        {/* Safari iOS solo reconoce esta etiqueta (deprecada por Apple pero aún
            necesaria) para abrir en modo standalone desde "Agregar a inicio".
            El equivalente moderno `mobile-web-app-capable` lo emite el metadata
            API vía appleWebApp.capable, para Chrome/Android. */}
        <meta name="apple-mobile-web-app-capable" content="yes" />
      </head>
      <body
        style={{
          margin: 0,
          padding: 0,
          background: colors.bgBase,
          fontFamily: fonts.body,
          WebkitFontSmoothing: "antialiased",
        }}
      >
        <PwaRegister />
        {children}
      </body>
    </html>
  );
}
