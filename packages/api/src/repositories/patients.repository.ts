/**
 * Repositorio de pacientes — MC-10.5B.
 *
 * Solo se llama cuando PULSO_DATA_SOURCE=prisma.
 * En modo mock estas funciones nunca se invocan.
 *
 * REGLA: professionalNote NUNCA se filtra aquí; el servicio/controlador
 * que llame a getPatientByIdFromDB es responsable de saber si expone
 * ese campo o no (igual que con los mocks).
 */

import type { PatientDetail, PatientSummary } from "@pulso/shared";
import { getPrismaClient } from "../lib/prisma.js";

type PatientStatus = "active" | "inactive" | "pending";

function mapStatus(s: string): PatientStatus {
  if (s === "active" || s === "inactive" || s === "pending") return s;
  return "active";
}

export async function listPatientsFromDB(): Promise<PatientSummary[]> {
  const prisma = getPrismaClient();
  const rows = await prisma.patient.findMany({
    orderBy: { createdAt: "asc" },
  });

  return rows.map((p) => ({
    id: p.id,
    fullName: p.fullName,
    age: p.age ?? 0,
    goal: p.goal ?? "",
    lastControl: p.lastControl,
    status: mapStatus(p.status),
  }));
}

export async function getPatientByIdFromDB(
  id: string,
): Promise<PatientDetail | null> {
  const prisma = getPrismaClient();
  const patient = await prisma.patient.findUnique({
    where: { id },
    include: {
      professionals: {
        take: 1,
        orderBy: { linkedAt: "desc" },
      },
    },
  });

  if (!patient) return null;

  return {
    id: patient.id,
    fullName: patient.fullName,
    age: patient.age ?? 0,
    goal: patient.goal ?? "",
    lastControl: patient.lastControl,
    status: mapStatus(patient.status),
    professionalNote: patient.professionalNote ?? "",
    professionalId: patient.professionals[0]?.professionalId ?? "",
    isDemoData: patient.isDemoData,
  };
}
