#!/usr/bin/env node
/**
 * Smoke test operativo para la WEB PROFESIONAL de Pulso Nutricional en Railway.
 *
 * MC-WEB-3: verificación repetible de la web profesional desplegada y de la
 * cadena de datos que consume (API Railway en modo lectura).
 *
 * Uso:
 *   node scripts/smoke-web-profesional-railway.mjs
 *   PULSO_WEB_BASE_URL=https://... PULSO_API_BASE_URL=https://... node scripts/smoke-web-profesional-railway.mjs
 *
 * - No toca Railway, Postgres, código, Mi Pulso ni datos reales.
 * - Credenciales: ficticias demo, ya documentadas en el repo.
 * - Sale con exit code 0 si todo pasa, 1 si algo falla.
 *
 * LÍMITE IMPORTANTE — CORS:
 *   El CORS lo aplica el NAVEGADOR, no `fetch` de Node. Este script NO puede
 *   verificar CORS de forma fiable; comprueba que la web sirve y que la API
 *   responde la misma cadena de llamadas que hace el navegador. La verificación
 *   real de CORS y del login en UI es manual y está en el playbook:
 *   docs/deploy/web-profesional-railway-playbook.md
 */

const WEB_BASE =
  process.env["PULSO_WEB_BASE_URL"] ??
  "https://pulso-nutricional-web-production.up.railway.app";

const API_BASE =
  process.env["PULSO_API_BASE_URL"] ??
  "https://api-production-42e99.up.railway.app";

const DEMO_EMAIL = "profesional-demo@pulsonutricional.demo";
const DEMO_PASSWORD = "demo-profesional-2026";

let passed = 0;
let failed = 0;

// ─── helpers ────────────────────────────────────────────────────────────────

function record(ok) {
  if (ok) passed++;
  else failed++;
}

function printRow(check, actual, ok) {
  const badge = ok ? "✅ OK  " : "❌ FAIL";
  console.log(`  ${badge} | ${String(actual).padEnd(12)} | ${check}`);
}

function report(check, actual, ok) {
  record(ok);
  printRow(check, actual, ok);
}

async function httpGet(base, path, token) {
  const headers = token ? { Authorization: `Bearer ${token}` } : {};
  return fetch(`${base}${path}`, { headers });
}

async function httpPost(base, path, body) {
  return fetch(`${base}${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

// ─── main ────────────────────────────────────────────────────────────────────

console.log();
console.log("🔍  Pulso Nutricional — Web Profesional Smoke Test");
console.log(`    Web URL  : ${WEB_BASE}`);
console.log(`    API URL  : ${API_BASE}`);
console.log(`    Fecha    : ${new Date().toISOString()}`);
console.log();
console.log("  Status | Resultado    | Verificación");
console.log("  " + "─".repeat(68));

// ─── Bloque 1: la web profesional está servida ──────────────────────────────

// 1. GET / de la web → 200
let webHtml = "";
try {
  const webRes = await httpGet(WEB_BASE, "/");
  const ok = webRes.status === 200;
  report("WEB GET / responde 200", webRes.status, ok);
  if (webRes.ok) {
    webHtml = await webRes.text();
  } else {
    await webRes.text();
  }
} catch (e) {
  report("WEB GET / responde 200", "ERROR", false);
  console.log(`         → ${e.message}`);
}

// 2. El HTML servido contiene el marcador del panel profesional
const hasTitle = webHtml.includes("Pulso Nutricional");
const hasPanel = webHtml.includes("Panel profesional");
report("WEB HTML contiene 'Pulso Nutricional'", hasTitle ? "presente" : "ausente", hasTitle);
report("WEB HTML contiene 'Panel profesional'", hasPanel ? "presente" : "ausente", hasPanel);

// ─── Bloque 2: la cadena de datos que consume la web (API) ───────────────────
// Replicamos las llamadas que el navegador hace en modo API. No verifica CORS
// (eso es del navegador), pero confirma que el backend responde la cadena.

// 3. API /health → 200
try {
  const healthRes = await httpGet(API_BASE, "/health");
  report("API GET /health responde 200", healthRes.status, healthRes.status === 200);
  await healthRes.text();
} catch (e) {
  report("API GET /health responde 200", "ERROR", false);
  console.log(`         → ${e.message}`);
}

// 4. API login demo profesional → 200 + token
let token = null;
try {
  const loginRes = await httpPost(API_BASE, "/auth/login", {
    email: DEMO_EMAIL,
    password: DEMO_PASSWORD,
  });
  report("API POST /auth/login (demo) responde 200", loginRes.status, loginRes.status === 200);
  if (loginRes.ok) {
    const body = await loginRes.json();
    token = body?.data?.token ?? null;
    const preview = token ? `${token.slice(0, 12)}…` : "(null)";
    console.log(`         → token obtenido: ${preview} (no impreso completo)`);
  } else {
    await loginRes.text();
  }
} catch (e) {
  report("API POST /auth/login (demo) responde 200", "ERROR", false);
  console.log(`         → ${e.message}`);
}

// 5. API /patients con token → 200 + lista
let patientId = null;
if (token) {
  try {
    const pRes = await httpGet(API_BASE, "/patients", token);
    report("API GET /patients (con token) responde 200", pRes.status, pRes.status === 200);
    if (pRes.ok) {
      const body = await pRes.json();
      const patients = Array.isArray(body?.data) ? body.data : [];
      console.log(`         → pacientes: ${patients.length}`);
      patientId = patients[0]?.id ?? null;
    } else {
      await pRes.text();
    }
  } catch (e) {
    report("API GET /patients (con token) responde 200", "ERROR", false);
    console.log(`         → ${e.message}`);
  }
}

// 6–8. Ficha, plan y agenda del primer paciente
if (token && patientId) {
  try {
    const detailRes = await httpGet(API_BASE, `/patients/${patientId}`, token);
    report("API GET /patients/:id responde 200", detailRes.status, detailRes.status === 200);
    await detailRes.text();
  } catch (e) {
    report("API GET /patients/:id responde 200", "ERROR", false);
    console.log(`         → ${e.message}`);
  }

  try {
    const planRes = await httpGet(API_BASE, `/patients/${patientId}/meal-plan`, token);
    const ok = planRes.status === 200 || planRes.status === 404;
    report("API GET /patients/:id/meal-plan responde 200|404", planRes.status, ok);
    await planRes.text();
  } catch (e) {
    report("API GET /patients/:id/meal-plan responde 200|404", "ERROR", false);
    console.log(`         → ${e.message}`);
  }

  try {
    const agendaRes = await httpGet(API_BASE, `/patients/${patientId}/agenda`, token);
    report("API GET /patients/:id/agenda responde 200", agendaRes.status, agendaRes.status === 200);
    await agendaRes.text();
  } catch (e) {
    report("API GET /patients/:id/agenda responde 200", "ERROR", false);
    console.log(`         → ${e.message}`);
  }
} else if (token) {
  console.log("  ⚠  Sin patientId: los endpoints /patients/:id no se verifican.");
  failed += 3;
}

// ─── resumen ─────────────────────────────────────────────────────────────────

console.log();
console.log("  " + "─".repeat(68));
console.log(`  Resultado: ${passed} OK, ${failed} FAIL`);
console.log();
console.log("  Nota: este smoke test NO verifica CORS (lo aplica el navegador).");
console.log("  La verificación de CORS y del login en UI es manual — ver playbook:");
console.log("  docs/deploy/web-profesional-railway-playbook.md");
console.log();

if (failed === 0) {
  console.log("  ✅ Smoke test PASÓ — web profesional servida y cadena de API OK.");
  console.log();
  process.exit(0);
} else {
  console.log("  ❌ Smoke test FALLÓ — revisar errores arriba.");
  console.log();
  process.exit(1);
}
