// Design tokens — SZ "Profesional Cálido" system
// Actualizado desde DESIGN_TOKENS_EXPORT.md (23 Jun 2026)

export const colors = {
  // Backgrounds
  bgBase: "#FBFAF6",       // paper
  bgSurface: "#FFFFFF",
  bgMuted: "#F4F1E8",      // paperWarm
  bgSubtle: "#EFECE3",     // borderSoft

  // Brand green
  greenPrimary: "#0F7A4F",  // primary
  greenDark: "#0A5537",     // primaryDeep (hover/pressed)
  primaryLive: "#14A06B",   // dot indicators, live badges
  primarySoft: "#E8F3EC",   // badge bg, tints
  primaryTint: "#F3F9F5",   // lightest tint

  // Text
  textPrimary: "#0E1413",   // ink
  textSecondary: "#6B6B66", // muted
  inkSoft: "#2A2F2D",       // secondary headings
  mutedSoft: "#9C9C94",     // disabled

  // Accents
  accentOrange: "#B34C2C",  // terracotta (warm badges)
  accentBrown: "#C89B2A",   // ochre (golden badges)

  // Borders
  borderDefault: "#E6E3DA", // border
  borderSoft: "#EFECE3",

  // Status — revisión de datos del paciente
  pendingBg: "#FEF3C7",
  pendingText: "#92400E",
  reviewedBg: "#DBEAFE",
  reviewedText: "#1E40AF",
  acceptedBg: "#D1FAE5",
  acceptedText: "#065F46",
  flaggedBg: "#FEE2E2",
  flaggedText: "#991B1B",

  // Semantic
  errorBg: "#FEF2F2",
  errorBorder: "#FECACA",
  errorText: "#B91C1C",
  infoBg: "#EFF6FF",
  infoBorder: "#BFDBFE",
  infoText: "#1E40AF",
  successBg: "#F0FDF4",
  successBorder: "#BBF7D0",
  successText: "#166534",
  warningBg: "#FFFBEB",
  warningBorder: "#FDE68A",
  warningText: "#92400E",
};

export const fonts = {
  heading: "'Instrument Serif', Georgia, serif",
  body: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
  mono: "'JetBrains Mono', ui-monospace, 'SF Mono', monospace",
};

export const radius = {
  sm: 6,
  md: 10,
  lg: 16,
  xl: 24,
  pill: 999,
};

export const shadow = {
  card: "0 1px 2px rgba(14,20,19,0.04), 0 1px 3px rgba(14,20,19,0.06)",
  elevated: "0 4px 16px rgba(14,20,19,0.06), 0 1px 3px rgba(14,20,19,0.04)",
  lg: "0 24px 60px -20px rgba(14,20,19,0.25), 0 8px 24px -8px rgba(14,20,19,0.1)",
};

export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  "2xl": 32,
  "3xl": 36,
  "4xl": 44,
  "5xl": 48,
  "6xl": 56,
  "7xl": 60,
  "8xl": 80,
  "9xl": 100,
} as const;
