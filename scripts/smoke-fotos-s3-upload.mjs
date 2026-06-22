#!/usr/bin/env node
/**
 * Smoke test E2E MC-FOTOS-PROD-1: upload de foto de comida a bucket S3.
 *
 * Verifica la cadena completa:
 *   1. Login como paciente demo.
 *   2. GET /auth/me → obtiene patientId real (Prisma mode).
 *   3. POST /patients/:patientId/meal-photos (multipart) → 201.
 *   4. Respuesta incluye storageKey con patrón correcto.
 *   5. meta.storageConfigured: true → confirma que S3 está activo (no fallback local).
 *   6. origin: "patient_reported" y reviewStatus: "pending" — invariantes de dominio.
 *   7. Login como profesional → GET /patients/:patientId/meal-photos → la foto aparece.
 *   8. POST review → 200 (profesional puede revisar).
 *
 * Uso:
 *   node scripts/smoke-fotos-s3-upload.mjs
 *   PULSO_API_BASE_URL=https://... node scripts/smoke-fotos-s3-upload.mjs
 *
 * - Usa credenciales demo ficticias (nunca datos reales).
 * - La imagen de prueba es un PNG mínimo de 1×1 px generado en memoria.
 * - No requiere archivos externos ni dependencias extra.
 * - Sale con exit code 0 si todo pasa, 1 si algo falla.
 */

const BASE =
  process.env["PULSO_API_BASE_URL"] ??
  "https://api-production-42e99.up.railway.app";

const PATIENT_EMAIL = "paciente-demo-uno@pulsonutricional.demo";
const PATIENT_PASSWORD = "demo-paciente-2026";
const PROF_EMAIL = "profesional-demo@pulsonutricional.demo";
const PROF_PASSWORD = "demo-profesional-2026";

// PNG mínimo 1×1 px (rojo) generado offline — sin dependencias externas.
const MINIMAL_PNG_BASE64 =
  "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAIAAACQd1PeAAAADklEQVQI12P4z8BQDwAEgAF/QualIQAAAABJRU5ErkJggg==";

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
  console.log(`  ${badge} | ${String(actual).padEnd(5)} | ${label}`);
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

async function uploadPhoto(patientId, token) {
  const pngBytes = Buffer.from(MINIMAL_PNG_BASE64, "base64");
  const form = new FormData();
  form.append(
    "file",
    new Blob([pngBytes], { type: "image/png" }),
    "smoke-test.png",
  );
  form.append("mealType", "lunch");
  form.append("patientComment", "Smoke test MC-FOTOS-PROD-1 — imagen ficticia");

  return fetch(`${BASE}/patients/${patientId}/meal-photos`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}` },
    body: form,
  });
}

// ─── main ────────────────────────────────────────────────────────────────────

console.log();
console.log("🔍  Pulso Nutricional — Smoke S3 Upload (MC-FOTOS-PROD-1)");
console.log(`    Base URL : ${BASE}`);
console.log(`    Fecha    : ${new Date().toISOString()}`);
console.log();
console.log("  Status | Código | Verificación");
console.log("  " + "─".repeat(70));

// 1. GET /health
const healthRes = await httpGet("/health");
record("GET /health", healthRes.status, healthRes.status === 200);
printRow("GET /health", healthRes.status, healthRes.status === 200);
await healthRes.text();

// 2. Login como paciente
let patientToken = null;
const loginPatRes = await httpPost("/auth/login", {
  email: PATIENT_EMAIL,
  password: PATIENT_PASSWORD,
});
record("POST /auth/login (paciente)", loginPatRes.status, loginPatRes.status === 200);
printRow("POST /auth/login (paciente)", loginPatRes.status, loginPatRes.status === 200);

if (loginPatRes.ok) {
  const body = await loginPatRes.json();
  patientToken = body?.data?.token ?? null;
  const preview = patientToken ? `${patientToken.slice(0, 12)}…` : "(null)";
  console.log(`         → token paciente: ${preview}`);
} else {
  const err = await loginPatRes.text();
  console.log(`         → error: ${err.slice(0, 80)}`);
}

// 3. GET /auth/me → obtener patientId real (Prisma mode)
let patientId = null;
if (patientToken) {
  const meRes = await httpGet("/auth/me", patientToken);
  record("GET /auth/me (paciente)", meRes.status, meRes.status === 200);
  printRow("GET /auth/me (paciente)", meRes.status, meRes.status === 200);

  if (meRes.ok) {
    const body = await meRes.json();
    patientId = body?.data?.patientId ?? null;
    const role = body?.data?.role ?? "?";
    console.log(`         → role: ${role}, patientId: ${patientId ?? "(no expuesto)"}`);

    if (!patientId) {
      console.log("  ⚠  patientId no disponible en /auth/me — usando 'demo-1' como fallback");
      patientId = "demo-1";
    }
  } else {
    await meRes.text();
    patientId = "demo-1";
    console.log("  ⚠  /auth/me falló — usando 'demo-1' como fallback");
  }
}

// 4. POST /patients/:patientId/meal-photos — upload multipart
let photoId = null;
let storageKey = null;
if (patientToken && patientId) {
  console.log(`\n  → Subiendo imagen de prueba (PNG 1×1 px) para paciente ${patientId}…`);
  const uploadRes = await uploadPhoto(patientId, patientToken);

  record("POST /patients/:id/meal-photos (upload)", uploadRes.status, uploadRes.status === 201);
  printRow("POST /patients/:id/meal-photos (upload)", uploadRes.status, uploadRes.status === 201);

  if (uploadRes.ok) {
    const body = await uploadRes.json();
    const photo = body?.data ?? body;
    const meta = body?.meta ?? {};
    photoId = photo?.id ?? null;
    storageKey = photo?.storageKey ?? null;

    console.log(`         → id: ${photoId}`);
    console.log(`         → storageKey: ${storageKey}`);
    console.log(`         → origin: ${photo?.origin}`);
    console.log(`         → reviewStatus: ${photo?.reviewStatus}`);
    console.log(`         → storageConfigured: ${meta?.storageConfigured}`);

    // 5. storageKey tiene el patrón correcto
    const keyPattern = /^patients\/.+\/meal-photos\/\d{4}\/\d{2}\/.+\.(jpg|png|webp)$/;
    const keyOk = storageKey && keyPattern.test(storageKey);
    record(
      "storageKey tiene patrón patients/{id}/meal-photos/{año}/{mes}/{uuid}.ext",
      keyOk ? storageKey : String(storageKey),
      Boolean(keyOk),
    );
    printRow(
      "storageKey con patrón correcto",
      keyOk ? "✓" : "✗",
      Boolean(keyOk),
    );

    // 6. storageConfigured: true → S3 real (no fallback local)
    const s3Active = meta?.storageConfigured === true;
    record(
      "meta.storageConfigured: true (S3 real, no fallback local)",
      String(meta?.storageConfigured),
      s3Active,
    );
    printRow(
      "meta.storageConfigured: true (bucket S3 activo)",
      String(meta?.storageConfigured),
      s3Active,
    );

    if (!s3Active) {
      console.log(
        "  ⚠  storageConfigured es false → S3_* variables no activas en el API.",
      );
      console.log(
        "     El binario fue descartado (LocalFallbackStorage). Verificar Railway vars.",
      );
    }

    // 7. Invariantes de dominio
    const originOk = photo?.origin === "patient_reported";
    record("origin: 'patient_reported'", photo?.origin ?? "?", originOk);
    printRow("origin: 'patient_reported'", photo?.origin ?? "?", originOk);

    const statusOk = photo?.reviewStatus === "pending";
    record("reviewStatus: 'pending'", photo?.reviewStatus ?? "?", statusOk);
    printRow("reviewStatus: 'pending'", photo?.reviewStatus ?? "?", statusOk);

    // 8. Sin imageUrl pública (invariante de seguridad)
    const noImageUrl = !("imageUrl" in photo);
    record(
      "Sin campo imageUrl en respuesta (sin URL pública permanente)",
      noImageUrl ? "sin imageUrl" : "tiene imageUrl ⚠",
      noImageUrl,
    );
    printRow(
      "Sin imageUrl en respuesta (ADR 0032)",
      noImageUrl ? "✓" : "✗",
      noImageUrl,
    );
  } else {
    const err = await uploadRes.text();
    console.log(`         → error body: ${err.slice(0, 120)}`);
  }
} else {
  console.log("  ⚠  Sin token o patientId — upload omitido.");
  failed += 4;
}

// 9. Login como profesional y verificar que la foto aparece en la lista
let profToken = null;
if (patientId) {
  console.log();
  const loginProfRes = await httpPost("/auth/login", {
    email: PROF_EMAIL,
    password: PROF_PASSWORD,
  });
  record("POST /auth/login (profesional)", loginProfRes.status, loginProfRes.status === 200);
  printRow("POST /auth/login (profesional)", loginProfRes.status, loginProfRes.status === 200);

  if (loginProfRes.ok) {
    const body = await loginProfRes.json();
    profToken = body?.data?.token ?? null;
  } else {
    await loginProfRes.text();
  }

  if (profToken) {
    const photosRes = await httpGet(`/patients/${patientId}/meal-photos`, profToken);
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
      const photos = body?.data ?? [];
      console.log(`         → fotos en lista: ${photos.length}`);

      // La foto que acabamos de subir debería aparecer (si no es mock in-memory)
      const ourPhoto = photoId
        ? photos.find((p) => p.id === photoId)
        : undefined;

      if (photoId) {
        record(
          "Foto recién subida aparece en lista profesional",
          ourPhoto ? "encontrada" : "no encontrada",
          Boolean(ourPhoto),
        );
        printRow(
          "Foto recién subida en lista profesional",
          ourPhoto ? "✓" : "✗",
          Boolean(ourPhoto),
        );
      }

      // 10. POST review sobre la primera foto disponible
      const reviewTargetId = ourPhoto?.id ?? photos[0]?.id ?? null;
      if (reviewTargetId) {
        const reviewRes = await httpPost(
          `/patients/${patientId}/meal-photos/${reviewTargetId}/review`,
          {
            reviewStatus: "reviewed",
            professionalComment: "Smoke test PROD-1 — revisión automática.",
          },
          profToken,
        );
        record(
          "POST /patients/:id/meal-photos/:photoId/review",
          reviewRes.status,
          reviewRes.status === 200,
        );
        printRow(
          "POST review (profesional marca como revisada)",
          reviewRes.status,
          reviewRes.status === 200,
        );

        if (reviewRes.ok) {
          const rb = await reviewRes.json();
          const reviewed = rb?.data ?? rb;
          const newStatus = reviewed?.reviewStatus;
          const originAfter = reviewed?.origin;
          console.log(`         → reviewStatus post-review: ${newStatus}`);
          console.log(`         → origin post-review: ${originAfter} (no debe cambiar)`);

          record(
            "reviewStatus cambiado a 'reviewed'",
            newStatus ?? "?",
            newStatus === "reviewed",
          );
          printRow("reviewStatus → 'reviewed'", newStatus ?? "?", newStatus === "reviewed");

          record(
            "origin permanece 'patient_reported' tras revisión",
            originAfter ?? "?",
            originAfter === "patient_reported",
          );
          printRow(
            "origin estable 'patient_reported'",
            originAfter ?? "?",
            originAfter === "patient_reported",
          );
        } else {
          await reviewRes.text();
        }
      } else {
        console.log("  ⚠  Sin fotos disponibles para review — omitido.");
      }
    } else {
      await photosRes.text();
    }
  }
}

// ─── resumen ─────────────────────────────────────────────────────────────────

console.log();
console.log("  " + "─".repeat(70));
console.log(`  Resultado: ${passed} OK · ${failed} FAIL`);
console.log();

if (failed === 0) {
  console.log("  ✅ MC-FOTOS-PROD-1: upload S3 end-to-end verificado.");
  console.log("     Bucket activo · metadata en DB · flujo profesional OK.");
} else {
  console.log("  ❌ Algunos pasos fallaron:");
  results
    .filter((r) => !r.ok)
    .forEach((r) => console.log(`     ❌ ${r.label} → ${r.actual}`));

  const s3Fail = results.find(
    (r) => r.label.includes("storageConfigured") && !r.ok,
  );
  if (s3Fail) {
    console.log();
    console.log("  → El fallo de storageConfigured indica que las S3_* variables");
    console.log("    no están activas en el API de Railway. Verificar:");
    console.log("    S3_ENDPOINT, S3_REGION, S3_ACCESS_KEY_ID, S3_SECRET_ACCESS_KEY, S3_BUCKET");
    console.log("    en el servicio 'api' del proyecto Railway.");
  }
}

console.log();
process.exit(failed === 0 ? 0 : 1);
