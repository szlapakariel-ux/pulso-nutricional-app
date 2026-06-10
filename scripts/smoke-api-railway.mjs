#!/usr/bin/env node
/**
 * Smoke test operativo para la API Railway de Pulso Nutricional.
 *
 * Uso:
 *   node scripts/smoke-api-railway.mjs
 *   PULSO_API_BASE_URL=https://... node scripts/smoke-api-railway.mjs
 *
 * - No toca Railway, Postgres, web apps ni datos reales.
 * - Credenciales: ficticias demo, documentadas en el repo.
 * - Sale con exit code 0 si todo pasa, 1 si algo falla.
 */

const BASE =
  process.env["PULSO_API_BASE_URL"] ??
  "https://api-production-42e99.up.railway.app";

const DEMO_EMAIL = "profesional-demo@pulsonutricional.demo";
const DEMO_PASSWORD = "demo-profesional-2026";

let passed = 0;
let failed = 0;
const results = [];

// ─── helpers ────────────────────────────────────────────────────────────────

function record(endpoint, expectedLabel, actual, ok) {
  results.push({ endpoint, expectedLabel, actual, ok });
  if (ok) passed++;
  else failed++;
}

async function httpGet(path, token) {
  const headers = token ? { Authorization: `Bearer ${token}` } : {};
  return fetch(`${BASE}${path}`, { headers });
}

async function httpPost(path, body) {
  return fetch(`${BASE}${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

function printRow(endpoint, expectedLabel, actual, ok) {
  const badge = ok ? "✅ OK  " : "❌ FAIL";
  console.log(`  ${badge} | ${String(actual).padEnd(3)} (exp ${expectedLabel.padEnd(7)}) | ${endpoint}`);
}

// ─── main ────────────────────────────────────────────────────────────────────

console.log();
console.log("🔍  Pulso Nutricional — API Smoke Test");
console.log(`    Base URL : ${BASE}`);
console.log(`    Fecha    : ${new Date().toISOString()}`);
console.log();
console.log("  Status | Código      | Endpoint");
console.log("  " + "─".repeat(68));

// 1. GET /health — público, no requiere token
const healthRes = await httpGet("/health");
record("/health", "200", healthRes.status, healthRes.status === 200);
printRow("/health", "200", healthRes.status, healthRes.status === 200);
await healthRes.text(); // consume body

// 2. GET /patients sin token → 401 (guard activo)
const pNoAuthRes = await httpGet("/patients");
record("GET /patients (sin token)", "401", pNoAuthRes.status, pNoAuthRes.status === 401);
printRow("GET /patients (sin token)", "401", pNoAuthRes.status, pNoAuthRes.status === 401);
await pNoAuthRes.text();

// 3. POST /auth/login con credencial demo profesional
const loginRes = await httpPost("/auth/login", {
  email: DEMO_EMAIL,
  password: DEMO_PASSWORD,
});
record("POST /auth/login", "200", loginRes.status, loginRes.status === 200);
printRow("POST /auth/login", "200", loginRes.status, loginRes.status === 200);

let token = null;
if (loginRes.ok) {
  const loginBody = await loginRes.json();
  token = loginBody?.data?.token ?? null;
  // Imprimimos solo los primeros 12 caracteres del token, nunca el token completo.
  const preview = token ? `${token.slice(0, 12)}…` : "(null)";
  console.log(`         → token obtenido: ${preview} (no imprimido completo)`);
} else {
  await loginRes.text();
}

// 4. GET /auth/me con token
if (token) {
  const meRes = await httpGet("/auth/me", token);
  record("GET /auth/me (con token)", "200", meRes.status, meRes.status === 200);
  printRow("GET /auth/me (con token)", "200", meRes.status, meRes.status === 200);
  if (meRes.ok) {
    const meBody = await meRes.json();
    console.log(`         → role: ${meBody?.data?.role ?? "?"}`);
  } else {
    await meRes.text();
  }
}

// 5. GET /patients con token → lista no vacía
let patientId = null;
if (token) {
  const pRes = await httpGet("/patients", token);
  record("GET /patients (con token)", "200", pRes.status, pRes.status === 200);
  printRow("GET /patients (con token)", "200", pRes.status, pRes.status === 200);
  if (pRes.ok) {
    const pBody = await pRes.json();
    const patients = Array.isArray(pBody?.data) ? pBody.data : [];
    console.log(`         → pacientes: ${patients.length}`);
    patientId = patients[0]?.id ?? null;
    if (patientId) {
      console.log(`         → patientId: ${patientId}`);
    } else {
      console.log("         ⚠  no se obtuvo patientId — sin datos demo?");
    }
  } else {
    await pRes.text();
  }
}

// 6–8. Endpoints por patientId
if (token && patientId) {
  // 6. GET /patients/:id
  const pDetailRes = await httpGet(`/patients/${patientId}`, token);
  record(`GET /patients/:id`, "200", pDetailRes.status, pDetailRes.status === 200);
  printRow(`GET /patients/:id`, "200", pDetailRes.status, pDetailRes.status === 200);
  await pDetailRes.text();

  // 7. GET /patients/:id/meal-plan — 200 o 404 son ambos aceptables
  const mealPlanRes = await httpGet(`/patients/${patientId}/meal-plan`, token);
  const mpOk = mealPlanRes.status === 200 || mealPlanRes.status === 404;
  record(`GET /patients/:id/meal-plan`, "200|404", mealPlanRes.status, mpOk);
  printRow(`GET /patients/:id/meal-plan`, "200|404", mealPlanRes.status, mpOk);
  await mealPlanRes.text();

  // 8. GET /patients/:id/agenda
  const agendaRes = await httpGet(`/patients/${patientId}/agenda`, token);
  record(`GET /patients/:id/agenda`, "200", agendaRes.status, agendaRes.status === 200);
  printRow(`GET /patients/:id/agenda`, "200", agendaRes.status, agendaRes.status === 200);
  await agendaRes.text();
} else if (token) {
  // patientId no disponible — registramos como falla explicada
  console.log("  ⚠  Sin patientId: los endpoints /patients/:id no se verifican.");
  failed += 3;
  results.push({ endpoint: "GET /patients/:id (no ejecutado)", expectedLabel: "200", actual: "–", ok: false });
  results.push({ endpoint: "GET /patients/:id/meal-plan (no ejecutado)", expectedLabel: "200|404", actual: "–", ok: false });
  results.push({ endpoint: "GET /patients/:id/agenda (no ejecutado)", expectedLabel: "200", actual: "–", ok: false });
}

// 9. Token inválido → 401
const invalidRes = await httpGet("/auth/me", "invalid.token.example");
record("GET /auth/me (token inválido)", "401", invalidRes.status, invalidRes.status === 401);
printRow("GET /auth/me (token inválido)", "401", invalidRes.status, invalidRes.status === 401);
await invalidRes.text();

// ─── resumen ─────────────────────────────────────────────────────────────────

console.log();
console.log("  " + "─".repeat(68));
console.log(`  Resultado: ${passed} OK, ${failed} FAIL`);
console.log();

if (failed === 0) {
  console.log("  ✅ Smoke test PASÓ — API lista.");
  console.log();
  process.exit(0);
} else {
  console.log("  ❌ Smoke test FALLÓ — revisar errores arriba.");
  console.log();
  process.exit(1);
}
