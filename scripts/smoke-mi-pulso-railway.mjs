#!/usr/bin/env node
/**
 * Smoke test de la cadena API de Mi Pulso (paciente demo) contra Railway.
 *
 * MC-MIPULSO-2: verificación repetible de la cadena API que usa Mi Pulso
 * en modo api: login paciente → /auth/me con patientId → /patients/:id/today.
 *
 * Uso:
 *   node scripts/smoke-mi-pulso-railway.mjs
 *   PULSO_API_BASE_URL=https://... node scripts/smoke-mi-pulso-railway.mjs
 *
 * - No toca Railway, Postgres, código, Mi Pulso (no desplegado) ni datos reales.
 * - Credenciales: ficticias demo, ya documentadas en el repo.
 * - Sale con exit code 0 si todo pasa, 1 si algo falla.
 *
 * LÍMITE IMPORTANTE — CORS:
 *   El CORS lo aplica el NAVEGADOR, no `fetch` de Node. Este script NO puede
 *   verificar CORS de forma fiable; comprueba que la API responde la cadena
 *   de llamadas que hace Mi Pulso. La verificación real de CORS y del flujo
 *   en UI es manual y está en el playbook:
 *   docs/deploy/mi-pulso-api-readonly-playbook.md
 *
 * LÍMITE IMPORTANTE — Mi Pulso no está desplegado:
 *   Este script solo verifica la cadena de API (el backend Railway).
 *   Mi Pulso corre en local; la verificación del frontend es manual.
 */

const API_BASE =
  process.env["PULSO_API_BASE_URL"] ??
  "https://api-production-42e99.up.railway.app";

const DEMO_EMAIL = "paciente-demo-uno@pulsonutricional.demo";
const DEMO_PASSWORD = "demo-paciente-2026";

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

async function httpGet(path, token) {
  const headers = token ? { Authorization: `Bearer ${token}` } : {};
  return fetch(`${API_BASE}${path}`, { headers });
}

async function httpPost(path, body) {
  return fetch(`${API_BASE}${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

// ─── main ────────────────────────────────────────────────────────────────────

console.log();
console.log("🔍  Mi Pulso — API Chain Smoke Test (paciente demo)");
console.log(`    API URL  : ${API_BASE}`);
console.log(`    Fecha    : ${new Date().toISOString()}`);
console.log();
console.log("  Status | Resultado    | Verificación");
console.log("  " + "─".repeat(68));

// ─── 1. API /health ──────────────────────────────────────────────────────────

try {
  const res = await httpGet("/health");
  report("API GET /health responde 200", res.status, res.status === 200);
  await res.text();
} catch (e) {
  report("API GET /health responde 200", "ERROR", false);
  console.log(`         → ${e.message}`);
}

// ─── 2. Login demo paciente ──────────────────────────────────────────────────

let token = null;
try {
  const res = await httpPost("/auth/login", {
    email: DEMO_EMAIL,
    password: DEMO_PASSWORD,
  });
  report(
    "API POST /auth/login (paciente demo) responde 200",
    res.status,
    res.status === 200,
  );
  if (res.ok) {
    const body = await res.json();
    token = body?.data?.token ?? null;
    const preview = token ? `${token.slice(0, 12)}…` : "(null)";
    console.log(`         → token obtenido: ${preview} (no impreso completo)`);
  } else {
    await res.text();
  }
} catch (e) {
  report("API POST /auth/login (paciente demo) responde 200", "ERROR", false);
  console.log(`         → ${e.message}`);
}

// ─── 3. GET /auth/me → patientId presente (MC-PATIENT-ID-1) ─────────────────

let patientId = null;
if (token) {
  try {
    const res = await httpGet("/auth/me", token);
    report(
      "API GET /auth/me (con token) responde 200",
      res.status,
      res.status === 200,
    );
    if (res.ok) {
      const body = await res.json();
      const user = body?.data ?? body;
      patientId = user?.patientId ?? null;
      const hasPatientId = patientId !== null && patientId !== undefined;
      report(
        "GET /auth/me devuelve patientId (MC-PATIENT-ID-1)",
        hasPatientId ? patientId : "ausente",
        hasPatientId,
      );
      if (hasPatientId) {
        console.log(`         → patientId: ${patientId}`);
      }
    } else {
      await res.text();
      failed++; // patientId check skipped = fail
      printRow("GET /auth/me devuelve patientId (MC-PATIENT-ID-1)", "skipped", false);
    }
  } catch (e) {
    report("API GET /auth/me (con token) responde 200", "ERROR", false);
    console.log(`         → ${e.message}`);
    failed++; // patientId check skipped = fail
    printRow("GET /auth/me devuelve patientId (MC-PATIENT-ID-1)", "skipped", false);
  }
} else {
  failed += 2;
  printRow("API GET /auth/me (con token) responde 200", "skipped", false);
  printRow("GET /auth/me devuelve patientId (MC-PATIENT-ID-1)", "skipped", false);
}

// ─── 4–6. GET /patients/:patientId/today ────────────────────────────────────

if (token && patientId) {
  try {
    const res = await httpGet(`/patients/${patientId}/today`, token);
    report(
      `API GET /patients/${patientId}/today responde 200`,
      res.status,
      res.status === 200,
    );
    if (res.ok) {
      const body = await res.json();
      const view = body?.data ?? body;

      const hasDate = typeof view?.date === "string" && view.date.length > 0;
      report(
        "Vista Hoy contiene campo date",
        hasDate ? view.date : "ausente",
        hasDate,
      );

      const hasPlanOrAgenda =
        view?.plan !== undefined || Array.isArray(view?.agendaItems);
      report(
        "Vista Hoy contiene plan y/o agendaItems",
        hasPlanOrAgenda ? "presente" : "ausente",
        hasPlanOrAgenda,
      );

      if (hasPlanOrAgenda) {
        const planName = view?.plan?.name ?? "(sin plan)";
        const agendaCount = Array.isArray(view?.agendaItems)
          ? view.agendaItems.length
          : 0;
        console.log(`         → plan: ${planName}`);
        console.log(`         → agendaItems: ${agendaCount}`);
      }
    } else {
      await res.text();
      failed += 2; // date y plan/agenda skipped
      printRow("Vista Hoy contiene campo date", "skipped", false);
      printRow("Vista Hoy contiene plan y/o agendaItems", "skipped", false);
    }
  } catch (e) {
    report(
      `API GET /patients/${patientId}/today responde 200`,
      "ERROR",
      false,
    );
    console.log(`         → ${e.message}`);
    failed += 2;
    printRow("Vista Hoy contiene campo date", "skipped", false);
    printRow("Vista Hoy contiene plan y/o agendaItems", "skipped", false);
  }
} else if (token) {
  console.log("  ⚠  Sin patientId: los endpoints /patients/:id/today no se verifican.");
  failed += 3;
} else {
  failed += 3;
}

// ─── resumen ─────────────────────────────────────────────────────────────────

console.log();
console.log("  " + "─".repeat(68));
console.log(`  Resultado: ${passed} OK, ${failed} FAIL`);
console.log();
console.log("  Nota: este smoke test NO verifica CORS (lo aplica el navegador).");
console.log("  La verificación de CORS y del flujo en UI es manual — ver playbook:");
console.log("  docs/deploy/mi-pulso-api-readonly-playbook.md");
console.log();
console.log("  Nota: Mi Pulso no está desplegado. Este script verifica la cadena");
console.log("  de API (backend Railway). La verificación del frontend es local.");
console.log();

if (failed === 0) {
  console.log(
    "  ✅ Smoke test PASÓ — cadena API de Mi Pulso (paciente demo) OK.",
  );
  console.log();
  process.exit(0);
} else {
  console.log("  ❌ Smoke test FALLÓ — revisar errores arriba.");
  console.log();
  process.exit(1);
}
