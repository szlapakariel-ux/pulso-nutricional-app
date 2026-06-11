#!/usr/bin/env node
/**
 * Smoke test E2E MC-FOTOS-MVP-3: profesional lista y revisa fotos de comidas.
 *
 * Verifica que:
 *   1. El profesional puede autenticarse.
 *   2. GET /patients/:patientId/meal-photos devuelve la lista de fotos (metadata).
 *   3. POST /patients/:patientId/meal-photos/:photoId/review cambia el estado.
 *   4. La respuesta nunca incluye un campo `imageUrl` (entrega diferida — MC-FOTOS-MVP-4).
 *
 * Uso:
 *   node scripts/smoke-fotos-mvp3.mjs                       # local (localhost:3000)
 *   PULSO_API_BASE_URL=https://... node scripts/smoke-fotos-mvp3.mjs
 *
 * - Requiere la API corriendo con el código MC-FOTOS-MVP-3 (o anterior con fotos).
 * - Por defecto apunta a localhost:3000 — NO golpea Railway sin intención.
 *   Para apuntar a otra instancia, exportar PULSO_API_BASE_URL explícito.
 * - Usa credenciales demo ficticias (nunca datos reales).
 * - Sale con exit code 0 si todo pasa, 1 si algo falla.
 */

const BASE = process.env["PULSO_API_BASE_URL"] ?? "http://localhost:3000";

const PROF_EMAIL = "profesional-demo@pulsonutricional.demo";
const PROF_PASSWORD = "demo-profesional-2026";
const PATIENT_ID = "demo-1";

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
console.log("🔍  Pulso Nutricional — Smoke E2E MC-FOTOS-MVP-3");
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

// 2. Login como profesional
let profToken = null;
const loginProfRes = await httpPost("/auth/login", {
  email: PROF_EMAIL,
  password: PROF_PASSWORD,
});
record(
  "POST /auth/login (profesional)",
  loginProfRes.status,
  loginProfRes.status === 200,
);
printRow(
  "POST /auth/login (profesional)",
  loginProfRes.status,
  loginProfRes.status === 200,
);

if (loginProfRes.ok) {
  const body = await loginProfRes.json();
  profToken = body?.data?.token ?? null;
  const preview = profToken ? `${profToken.slice(0, 12)}…` : "(null)";
  console.log(`         → token profesional: ${preview}`);
} else {
  await loginProfRes.text();
}

// 3. GET /patients/:id/meal-photos — lista de fotos
let firstPhotoId = null;
if (profToken) {
  const photosRes = await httpGet(
    `/patients/${PATIENT_ID}/meal-photos`,
    profToken,
  );
  record(
    "GET /patients/:id/meal-photos (profesional)",
    photosRes.status,
    photosRes.status === 200,
  );
  printRow(
    "GET /patients/:id/meal-photos (profesional)",
    photosRes.status,
    photosRes.status === 200,
  );

  if (photosRes.ok) {
    const body = await photosRes.json();
    const photos = body?.data ?? body ?? [];
    console.log(`         → fotos: ${photos.length}`);

    const hasPhotos = photos.length > 0;
    record("Lista contiene al menos una foto", hasPhotos ? "sí" : "no", hasPhotos);
    printRow("Lista contiene al menos una foto", hasPhotos ? "sí" : "no", hasPhotos);

    if (hasPhotos) {
      firstPhotoId = photos[0].id;
      console.log(`         → primera foto: ${firstPhotoId} (${photos[0].mealType})`);

      // Verificar que no haya campo imageUrl (entrega diferida)
      const hasNoImageUrl = !("imageUrl" in photos[0]);
      record(
        "Respuesta no incluye imageUrl (entrega diferida — ADR 0032)",
        hasNoImageUrl ? "sin imageUrl" : "tiene imageUrl",
        hasNoImageUrl,
      );
      printRow(
        "Respuesta no incluye imageUrl (entrega diferida — ADR 0032)",
        hasNoImageUrl ? "sin imageUrl" : "tiene imageUrl",
        hasNoImageUrl,
      );

      // Verificar campos clave de metadata
      const firstPhoto = photos[0];
      const hasRequiredFields =
        firstPhoto.storageKey &&
        firstPhoto.mealType &&
        firstPhoto.origin === "patient_reported" &&
        typeof firstPhoto.reviewStatus === "string";
      record(
        "Metadata completa (storageKey, mealType, origin, reviewStatus)",
        hasRequiredFields ? "OK" : "incompleta",
        hasRequiredFields,
      );
      printRow(
        "Metadata completa (storageKey, mealType, origin, reviewStatus)",
        hasRequiredFields ? "OK" : "incompleta",
        hasRequiredFields,
      );
    }
  } else {
    await photosRes.text();
  }
}

// 4. POST /patients/:id/meal-photos/:photoId/review — revisar foto
if (profToken && firstPhotoId) {
  const reviewRes = await httpPost(
    `/patients/${PATIENT_ID}/meal-photos/${firstPhotoId}/review`,
    {
      reviewStatus: "reviewed",
      professionalComment: "Smoke test MC-FOTOS-MVP-3: revisado correctamente.",
    },
    profToken,
  );
  record(
    "POST /patients/:id/meal-photos/:photoId/review",
    reviewRes.status,
    reviewRes.status === 200,
  );
  printRow(
    "POST /patients/:id/meal-photos/:photoId/review",
    reviewRes.status,
    reviewRes.status === 200,
  );

  if (reviewRes.ok) {
    const body = await reviewRes.json();
    const photo = body?.data ?? body;
    const newStatus = photo?.reviewStatus ?? "?";
    const comment = photo?.professionalComment ?? "?";
    console.log(
      `         → reviewStatus: ${newStatus}, professionalComment: "${comment.slice(0, 40)}…"`,
    );

    const statusOk = newStatus === "reviewed";
    record("reviewStatus cambiado a 'reviewed'", newStatus, statusOk);
    printRow("reviewStatus cambiado a 'reviewed'", newStatus, statusOk);

    const originStable = photo?.origin === "patient_reported";
    record(
      "origin permanece 'patient_reported' tras revisión",
      photo?.origin ?? "?",
      originStable,
    );
    printRow(
      "origin permanece 'patient_reported' tras revisión",
      photo?.origin ?? "?",
      originStable,
    );
  } else {
    await reviewRes.text();
  }
} else if (!firstPhotoId) {
  console.log("  ⚠  Sin fotos disponibles — revisión omitida.");
}

// ─── resumen ─────────────────────────────────────────────────────────────────

console.log();
console.log(`  Resultado: ${passed} OK · ${failed} FAIL`);
console.log();

if (failed === 0) {
  console.log("  ✅ MC-FOTOS-MVP-3: flujo profesional lista-y-revisa fotos verificado.");
} else {
  console.log("  ❌ Algunos pasos fallaron.");
  console.log();
  results
    .filter((r) => !r.ok)
    .forEach((r) => console.log(`     ❌ ${r.label} → ${r.actual}`));
}

console.log();
process.exit(failed === 0 ? 0 : 1);
