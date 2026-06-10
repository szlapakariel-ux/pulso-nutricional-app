/**
 * Selector de modo de enforcement de auth — MC-10.5D.
 *
 * PULSO_AUTH_ENFORCEMENT=off  (default) → guards no activos
 * PULSO_AUTH_ENFORCEMENT=demo           → guards activos solo si además
 *                                         PULSO_AUTH_MODE=demo
 *
 * Regla: el enforcement solo está activo cuando AMBAS variables están
 * en "demo". Si auth está off, el enforcement no puede activarse.
 */

import { isAuthEnabled } from "./auth.js";

export type AuthEnforcementMode = "off" | "demo";

export function getAuthEnforcementMode(): AuthEnforcementMode {
  const v = process.env["PULSO_AUTH_ENFORCEMENT"];
  if (v === "demo") return "demo";
  return "off";
}

export function isEnforcementActive(): boolean {
  return isAuthEnabled() && getAuthEnforcementMode() === "demo";
}
