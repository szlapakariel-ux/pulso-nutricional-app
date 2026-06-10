import PDFDocument from "pdfkit";
import type { PatientPlanPdfData, PdfPreviewMetadata } from "@pulso/shared";
import { MOCK_PLAN_ASSIGNMENTS, MOCK_DAILY_AGENDAS } from "../mock-data/meal-plans.mock.js";
import { MOCK_PATIENTS } from "../mock-data/patients.mock.js";

/**
 * Servicio de generación de PDF — MC-9.
 *
 * REGLA CRÍTICA:
 *   - Solo usa datos profesionales/validados (plan, agenda, nombre paciente).
 *   - NUNCA incluye professionalNote.
 *   - NUNCA incluye ReviewableData (meal_logs, weight_logs, patient_notes).
 *   - NUNCA incluye registros pending.
 *
 * Dependencia: pdfkit (única, documentada en ADR 0010).
 */

/**
 * Proyecta los datos para el PDF, excluyendo explícitamente campos internos.
 *
 * @returns null si el paciente no existe o no tiene plan asignado
 */
export function buildPatientPlanPdfData(
  patientId: string,
): PatientPlanPdfData | null {
  const patient = MOCK_PATIENTS.find((p) => p.id === patientId);
  if (!patient) return null;

  const assignment = MOCK_PLAN_ASSIGNMENTS[patientId] ?? null;
  if (!assignment) return null;

  const agenda = MOCK_DAILY_AGENDAS[patientId] ?? null;

  const plan = assignment.mealPlan;

  return {
    patientName: patient.fullName,
    planName: plan.name,
    // generalIndications sí se incluye — es visible al paciente por diseño
    // professionalNote NUNCA se incluye — se omite explícitamente aquí
    generalIndications: plan.generalIndications,
    meals: plan.meals.map((m) => ({
      name: m.name,
      timeHint: m.timeHint,
      description: m.description,
      moment: m.moment,
      portionHint: m.portionHint,
    })),
    agendaItems: agenda
      ? agenda.items.map((item) => ({
          title: item.title,
          timeHint: item.timeHint,
          description: item.description,
          type: item.type,
          moment: item.moment,
          // professionalNote de la agenda NUNCA se incluye
        }))
      : [],
    assignedDate: assignment.startDate,
    generatedAt: new Date().toISOString(),
    isDemoData: true,
  };
}

export function getPdfPreviewMetadata(patientId: string): PdfPreviewMetadata {
  return {
    documentType: "plan",
    patientId,
    generatedAt: new Date().toISOString(),
    includes: [
      "patient_name",
      "plan_name",
      "general_indications",
      "meals",
      "agenda_items",
    ],
    excludes: [
      "professionalNote",
      "reviewableData",
      "pending_records",
      "meal_logs",
      "weight_logs",
      "patient_notes",
    ],
    isDemoData: true,
  };
}

const MOMENT_LABEL: Record<string, string> = {
  morning: "Mañana",
  breakfast: "Desayuno",
  mid_morning: "Media mañana",
  lunch: "Almuerzo",
  afternoon: "Tarde",
  snack: "Merienda",
  dinner: "Cena",
  night: "Noche",
};

const AGENDA_TYPE_ICON: Record<string, string> = {
  meal: "Comida",
  hydration: "Hidratacion",
  medication: "Medicacion",
  activity: "Actividad",
  reminder: "Recordatorio",
};

/**
 * Genera el PDF del plan alimentario como Buffer.
 *
 * Usa únicamente datos profesionales/validados.
 * Excluye explícitamente: professionalNote, ReviewableData, pending.
 */
export function generatePlanPdf(data: PatientPlanPdfData): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({
      size: "A4",
      margin: 50,
      info: {
        Title: `Plan Alimentario — ${data.patientName}`,
        Author: "Pulso Nutricional (Demo MC-9)",
        Subject: data.planName,
      },
    });

    const chunks: Buffer[] = [];
    doc.on("data", (chunk: Buffer) => chunks.push(chunk));
    doc.on("end", () => resolve(Buffer.concat(chunks)));
    doc.on("error", reject);

    const primaryColor = "#2563eb";
    const sectionTitleColor = "#1e3a8a";
    const mutedColor = "#6b7280";
    const warningColor = "#92400e";

    // ────────────────────────────────────────────
    // HEADER
    // ────────────────────────────────────────────
    doc
      .fontSize(20)
      .fillColor(primaryColor)
      .text("Pulso Nutricional", { align: "left" });

    doc.fontSize(11).fillColor(mutedColor).text("Plan Alimentario", {
      align: "left",
    });

    doc.moveDown(0.5);

    // Línea separadora
    doc
      .moveTo(50, doc.y)
      .lineTo(545, doc.y)
      .strokeColor("#e5e7eb")
      .stroke();

    doc.moveDown(0.75);

    // ────────────────────────────────────────────
    // PACIENTE + PLAN
    // ────────────────────────────────────────────
    doc
      .fontSize(15)
      .fillColor("#111827")
      .text(`Paciente: ${data.patientName}`);

    doc.fontSize(12).fillColor("#374151").text(`Plan: ${data.planName}`);

    doc
      .fontSize(10)
      .fillColor(mutedColor)
      .text(
        `Asignado: ${data.assignedDate}   ·   Generado: ${new Date(data.generatedAt).toLocaleDateString("es-AR")}`,
      );

    doc.moveDown(1);

    // ────────────────────────────────────────────
    // INDICACIONES GENERALES (visible al paciente)
    // ────────────────────────────────────────────
    doc
      .fontSize(13)
      .fillColor(sectionTitleColor)
      .text("Indicaciones generales");

    doc.moveDown(0.3);

    doc
      .fontSize(10)
      .fillColor("#374151")
      .text(data.generalIndications, {
        width: 495,
        align: "left",
        lineGap: 3,
      });

    doc.moveDown(1);

    // ────────────────────────────────────────────
    // COMIDAS DEL PLAN
    // ────────────────────────────────────────────
    doc
      .fontSize(13)
      .fillColor(sectionTitleColor)
      .text("Comidas del plan");

    doc.moveDown(0.4);

    const sortedMeals = [...data.meals].sort((a, b) =>
      a.timeHint.localeCompare(b.timeHint),
    );

    for (const meal of sortedMeals) {
      doc
        .fontSize(11)
        .fillColor("#111827")
        .text(`${meal.name}`, { continued: true })
        .fillColor(mutedColor)
        .text(`   ${meal.timeHint} — ${MOMENT_LABEL[meal.moment] ?? meal.moment}`);

      doc.fontSize(9).fillColor("#4b5563").text(meal.description, {
        width: 480,
        indent: 12,
        lineGap: 2,
      });

      if (meal.portionHint) {
        doc
          .fontSize(8.5)
          .fillColor(mutedColor)
          .text(meal.portionHint, { indent: 12 });
      }

      doc.moveDown(0.4);
    }

    // ────────────────────────────────────────────
    // AGENDA DEL DÍA (si existe)
    // ────────────────────────────────────────────
    if (data.agendaItems.length > 0) {
      doc.moveDown(0.5);

      doc
        .fontSize(13)
        .fillColor(sectionTitleColor)
        .text("Agenda del día");

      doc.moveDown(0.4);

      const sortedAgenda = [...data.agendaItems].sort((a, b) =>
        a.timeHint.localeCompare(b.timeHint),
      );

      for (const item of sortedAgenda) {
        const typeLabel = AGENDA_TYPE_ICON[item.type] ?? item.type;

        doc
          .fontSize(11)
          .fillColor("#111827")
          .text(`${item.title}`, { continued: true })
          .fillColor(mutedColor)
          .text(
            `   ${item.timeHint} (${typeLabel})`,
          );

        if (item.description) {
          doc
            .fontSize(9)
            .fillColor("#4b5563")
            .text(item.description, { indent: 12, width: 480, lineGap: 2 });
        }

        doc.moveDown(0.35);
      }
    }

    // ────────────────────────────────────────────
    // FOOTER
    // ────────────────────────────────────────────
    doc.moveDown(1.5);

    doc
      .moveTo(50, doc.y)
      .lineTo(545, doc.y)
      .strokeColor("#e5e7eb")
      .stroke();

    doc.moveDown(0.5);

    doc
      .fontSize(8.5)
      .fillColor(warningColor)
      .text(
        "⚠  Datos ficticios de demostración — Pulso Nutricional MC-9. " +
          "No representan recomendaciones clínicas reales.",
        { align: "center", width: 495 },
      );

    doc
      .fontSize(7.5)
      .fillColor(mutedColor)
      .text(
        "Este PDF incluye exclusivamente datos profesionales/validados. " +
          "No contiene registros del paciente ni datos revisables pendientes.",
        { align: "center", width: 495 },
      );

    doc.end();
  });
}
