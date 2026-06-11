#!/usr/bin/env node
/**
 * Smoke test E2E MC-INTEGRACION-1: flujo paciente → profesional.
 *
 * Verifica que:
 *   1. El paciente puede registrar comida, peso y nota via la API.
 *   2. Los registros aparecen en la bandeja de revisión del profesional.
 *   3. El profesional puede ejecutar una acción de revisión.
 *
 * Uso:
 *   node scripts/smoke-integracion-1.mjs                       # local (localhost:3000)
 *   PULSO_API_BASE_URL=https://... node scripts/smoke-integracion-1.mjs
 *
 * - Requiere la API corriendo con código MC-INTEGRACION-1.
 * - Por defecto apunta a localhost:3000 — NO golpea Railway sin intención.
 *   Para apuntar a otra instancia, exportar PULSO_API_BASE_URL explícito.
 * - Usa credenciales demo ficticias (nunca datos reales).
 * - Sale con exit code 0 si todo pasa, 1 si algo falla.
 */

const BASE = process.env["PULSO_API_BASE_URL"] ?? "http://localhost:3000";

const PATIENT_EMAIL = "paciente-demo-uno@pulsonutricional.demo";
const PATIENT_PASSWORD = "demo-paciente-2026";
const PATIENT_ID = "demo-1";

const PROF_EMAIL = "profesional-demo@pulsonutricional.demo";
const PROF_PASSWORD = "demo-profesional-2026";

let passed = 0;
let failed = 0;
const results = [];

function record(label, actual, ok) {
  results.push({ label, actual, ok });
  if (ok) passed++;
  else failed++;
}

function printRow(label, actual, ok) {
  const badge = ok ? "✅ OK  " : "❌ FAIL";
  console.log(`  ${badge} | ${String(actual).padEnd(3)} | ${label}`);
}

async function httpPost(path, body, token) {
  const headers = { "Content-Type": "application/json" };
  if (token) headers["Authorization"] = `Bearer ${token}`;
  return fetch(`${BASE}${path}`, {
    method: "POST",
    headers,
    body: JSON.stringify(body),
  });
}

async function httpGet(path, token) {
  const headers = token ? { Authorization: `Bearer ${token}` } : {};
  return fetch(`${BASE}${path}`, { headers });
}

// ─── main ────────────────────────────────────────────────────────────────────

console.log();
console.log("🔍  Pulso Nutricional — Smoke E2E MC-INTEGRACION-1");
console.log(`    Base URL : ${BASE}`);
console.log(`    Fecha    : ${new Date().toISOString()}`);
console.log();
console.log("  Status | Código | Endpoint / Verificación");
console.log("  " + "─".repeat(68));

// 1. GET /health
const healthRes = await httpGet("/health");
record("GET /health", healthRes.status, healthRes.status === 200);
printRow("GET /health", healthRes.status, healthRes.status === 200);
await healthRes.text();

// 2. Login como paciente demo-1
let patientToken = null;
const loginPatientRes = await httpPost("/auth/login", {
  email: PATIENT_EMAIL,
  password: PATIENT_PASSWORD,
});
record("POST /auth/login (paciente)", loginPatientRes.status, loginPatientRes.status === 200);
printRow("POST /auth/login (paciente)", loginPatientRes.status, loginPatientRes.status === 200);

if (loginPatientRes.ok) {
  const body = await loginPatientRes.json();
  patientToken = body?.data?.token ?? null;
  const preview = patientToken ? `${patientToken.slice(0, 12)}…` : "(null)";
  console.log(`         → token paciente: ${preview}`);
} else {
  await loginPatientRes.text();
}

// 3. Registrar comida
let mealInboxId = null;
if (patientToken) {
  const today = new Date().toISOString().split("T")[0];
  const mealRes = await httpPost(
    `/patients/${PATIENT_ID}/meal-logs`,
    {
      date: today,
      timeOfDay: "lunch",
      foodDescription: "Smoke test: pollo con ensalada verde y agua",
      portion: "200g pollo, ensalada grande",
      notes: "Smoke test MC-INTEGRACION-1",
    },
    patientToken,
  );
  record("POST /patients/:id/meal-logs (paciente)", mealRes.status, mealRes.status === 201);
  printRow("POST /patients/:id/meal-logs (paciente)", mealRes.status, mealRes.status === 201);
  if (mealRes.ok) {
    const body = await mealRes.json();
    const mealLogId = body?.data?.data?.id ?? null;
    mealInboxId = mealLogId ? `inbox-${mealLogId}` : null;
    console.log(`         → mealLogId: ${mealLogId ?? "?"}`);
    console.log(`         → inboxId esperado: ${mealInboxId ?? "?"}`);
  } else {
    await mealRes.text();
  }
}

// 4. Registrar peso
if (patientToken) {
  const today = new Date().toISOString().split("T")[0];
  const weightRes = await httpPost(
    `/patients/${PATIENT_ID}/weight-logs`,
    {
      date: today,
      weight: 73.2,
      notes: "Smoke test MC-INTEGRACION-1",
    },
    patientToken,
  );
  record("POST /patients/:id/weight-logs (paciente)", weightRes.status, weightRes.status === 201);
  printRow("POST /patients/:id/weight-logs (paciente)", weightRes.status, weightRes.status === 201);
  await weightRes.text();
}

// 5. Registrar nota
if (patientToken) {
  const noteRes = await httpPost(
    `/patients/${PATIENT_ID}/notes`,
    {
      type: "question",
      subject: "Smoke test MC-INTEGRACION-1",
      body: "Pregunta de prueba automática del smoke test de integración.",
    },
    patientToken,
  );
  record("POST /patients/:id/notes (paciente)", noteRes.status, noteRes.status === 201);
  printRow("POST /patients/:id/notes (paciente)", noteRes.status, noteRes.status === 201);
  await noteRes.text();
}

// 6. Login como profesional
let profToken = null;
const loginProfRes = await httpPost("/auth/login", {
  email: PROF_EMAIL,
  password: PROF_PASSWORD,
});
record("POST /auth/login (profesional)", loginProfRes.status, loginProfRes.status === 200);
printRow("POST /auth/login (profesional)", loginProfRes.status, loginProfRes.status === 200);

if (loginProfRes.ok) {
  const body = await loginProfRes.json();
  profToken = body?.data?.token ?? null;
  const preview = profToken ? `${profToken.slice(0, 12)}…` : "(null)";
  console.log(`         → token profesional: ${preview}`);
} else {
  await loginProfRes.text();
}

// 7. GET /patients/demo-1/review-inbox → debe contener los registros del paciente
let inboxOk = false;
if (profToken) {
  const inboxRes = await httpGet(`/patients/${PATIENT_ID}/review-inbox`, profToken);
  record("GET /patients/:id/review-inbox (profesional)", inboxRes.status, inboxRes.status === 200);
  printRow("GET /patients/:id/review-inbox (profesional)", inboxRes.status, inboxRes.status === 200);

  if (inboxRes.ok) {
    const body = await inboxRes.json();
    const items = body?.data?.items ?? [];
    const totalCount = body?.data?.totalCount ?? 0;
    console.log(`         → items: ${items.length}, totalCount: ${totalCount}`);

    // Verificar que el registro de comida del paciente está en la bandeja
    const mealFound = mealInboxId
      ? items.some((item) => item.id === mealInboxId)
      : items.some((item) => item.entryType === "meal_log" &&
          item.entry?.data?.notes === "Smoke test MC-INTEGRACION-1");
    inboxOk = mealFound;
    record("Registro de comida visible en bandeja profesional", mealFound ? "sí" : "no", mealFound);
    printRow("Registro de comida visible en bandeja profesional", mealFound ? "sí" : "no", mealFound);

    if (!mealFound) {
      console.log(`         ⚠  mealInboxId buscado: ${mealInboxId}`);
      console.log(`         ⚠  IDs en bandeja: ${items.map((i) => i.id).join(", ")}`);
    }
  } else {
    await inboxRes.text();
  }
}

// 8. POST /review-inbox/:entryId/action/preview — acción de revisión
if (profToken && mealInboxId && inboxOk) {
  const actionRes = await httpPost(
    `/review-inbox/${mealInboxId}/action/preview`,
    { actionType: "mark_reviewed", comment: "Revisado por smoke test" },
    profToken,
  );
  record("POST /review-inbox/:id/action/preview", actionRes.status, actionRes.status === 200);
  printRow("POST /review-inbox/:id/action/preview", actionRes.status, actionRes.status === 200);

  if (actionRes.ok) {
    const body = await actionRes.json();
    const newStatus = body?.data?.newStatus ?? "?";
    const previousStatus = body?.data?.previousStatus ?? "?";
    console.log(`         → estado: ${previousStatus} → ${newStatus}`);
    const statusOk = newStatus === "reviewed";
    record("Estado cambiado a reviewed", newStatus, statusOk);
    printRow("Estado cambiado a reviewed", newStatus, statusOk);
  } else {
    await actionRes.text();
  }
} else if (!mealInboxId) {
  console.log("  ⚠  Sin mealInboxId — acción de revisión omitida.");
}

// ─── resumen ─────────────────────────────────────────────────────────────────

console.log();
console.log(`  Resultado: ${passed} OK · ${failed} FAIL`);
console.log();

if (failed === 0) {
  console.log("  ✅ MC-INTEGRACION-1: flujo paciente→profesional verificado.");
} else {
  console.log("  ❌ Algunos pasos fallaron.");
  console.log();
  results
    .filter((r) => !r.ok)
    .forEach((r) =>
      console.log(`     ❌ ${r.label} → ${r.actual}`),
    );
}

console.log();
process.exit(failed === 0 ? 0 : 1);
