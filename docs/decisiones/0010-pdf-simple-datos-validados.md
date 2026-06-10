# ADR 0010 — PDF simple con datos profesionales/validados (MC-9)

**Estado:** Aceptado  
**Microciclo:** MC-9  
**Fecha:** 2026-06-10

## Contexto

Se necesita generar un documento PDF del plan alimentario para que la profesional pueda entregarlo al paciente. El PDF debe contener exclusivamente datos profesionales/validados — nunca datos revisables ni notas internas.

## Decisión

Generar el PDF en el backend (`@pulso/api`) usando **pdfkit** como única dependencia de generación de documentos.

### Reglas de inclusión del PDF

| Campo | Incluido | Motivo |
|---|---|---|
| `patientName` | ✅ | Visible al paciente por diseño |
| `planName` | ✅ | Dato profesional validado |
| `generalIndications` | ✅ | Visible al paciente por diseño de dominio |
| `meals` (nombre, hora, descripción, porción) | ✅ | Datos profesionales validados |
| `agendaItems` (título, hora, descripción, tipo) | ✅ | Datos profesionales validados |
| `professionalNote` del plan | ❌ NUNCA | Nota interna, nunca al paciente |
| `professionalNote` de la agenda | ❌ NUNCA | Nota interna, nunca al paciente |
| `meal_logs` | ❌ NUNCA | ReviewableData, no validado |
| `weight_logs` | ❌ NUNCA | ReviewableData, no validado |
| `patient_notes` | ❌ NUNCA | ReviewableData, no validado |
| registros `pending` | ❌ NUNCA | Sin revisión profesional |

### Endpoints

- `GET /patients/:patientId/pdf/plan/preview` — Metadatos del PDF (JSON), documenta includes/excludes
- `GET /patients/:patientId/pdf/plan/download` — Descarga del PDF (application/pdf)

### Flujo

```
buildPatientPlanPdfData(patientId)   → proyecta solo campos permitidos
generatePlanPdf(data)                → pdfkit → Buffer
reply.type('application/pdf').send() → descarga
```

## Consecuencias

- **Positivo:** pdfkit es una dependencia estable, sin transpiladores ni binarios nativos.
- **Positivo:** La separación de dominio (ValidatedData vs ReviewableData) se refuerza en la capa de generación.
- **Positivo:** El PDF lleva footer de advertencia de datos demo.
- **Negativo:** pdfkit no soporta layouts CSS; el diseño es programático.
- **Neutral:** En MC-9 el PDF usa datos mock ficticios. En un futuro MC se conectará a datos reales.

## Alternativas descartadas

- **Puppeteer/Playwright (HTML→PDF):** Requiere Chromium, aumenta significativamente el tamaño del deployment. Innecesario para MC-9.
- **react-pdf:** Dependencia de React en el backend, acoplamiento innecesario.
- **PDFMake:** Similar a pdfkit pero menos mantenido en ESM.
