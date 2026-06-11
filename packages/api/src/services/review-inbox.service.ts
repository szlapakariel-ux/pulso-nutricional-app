import type {
  ReviewInboxItem,
  ReviewActionDraft,
  ReviewActionPreview,
  ReviewInboxResponse,
} from "@pulso/shared";
import { getFullReviewInbox } from "../mock-data/review-inbox.mock.js";

/**
 * Servicio de bandeja de revisión profesional — MC-8 / MC-INTEGRACION-1.
 *
 * REGLA CRÍTICA: todos los registros en la bandeja permanecen como
 * ReviewableData. Las acciones de revisión cambian reviewStatus pero
 * NUNCA crean ValidatedData.
 *
 * PERSISTENCIA: inboxState es un store EN MEMORIA del proceso (demo). NO es
 * persistencia real en base de datos: el contenido se pierde al reiniciar el
 * proceso y no usa Prisma/Postgres. La persistencia real queda para un
 * microciclo posterior.
 *   - inicializado con mock seed al primer acceso
 *   - acepta entradas nuevas vía addEntryToReviewInbox (MC-INTEGRACION-1)
 */

const inboxState = new Map<string, ReviewInboxItem>();

function initializeInboxState(): void {
  if (inboxState.size === 0) {
    const items = getFullReviewInbox();
    items.forEach((item) => inboxState.set(item.id, item));
  }
}

/** Agrega un entrada al inbox en memoria (llamado desde patient-logs.service). */
export function addEntryToReviewInbox(entry: ReviewInboxItem): void {
  initializeInboxState();
  inboxState.set(entry.id, entry);
}

export function getReviewInbox(patientId?: string): ReviewInboxResponse {
  initializeInboxState();

  const all = Array.from(inboxState.values());
  const items = patientId
    ? all.filter((item) => item.patientId === patientId)
    : all;

  return {
    items,
    totalCount: items.length,
    filterBy: "pending",
  };
}

export function getAllReviewInbox(): ReviewInboxResponse {
  return getReviewInbox();
}

export function previewReviewAction(
  entryId: string,
  draft: ReviewActionDraft,
): ReviewActionPreview | null {
  initializeInboxState();

  const item = inboxState.get(entryId);
  if (!item) return null;

  // Determinar el nuevo status según la acción
  const newStatus = (() => {
    switch (draft.actionType) {
      case "mark_reviewed":
        return "reviewed" as const;
      case "accept":
        return "accepted" as const;
      case "flag":
        return "flagged" as const;
      case "comment":
        // Si es solo comentario, mantener el status anterior
        return item.reviewStatus;
      default:
        return item.reviewStatus;
    }
  })();

  // Crear el registro actualizado (pero sigue siendo ReviewableData)
  const updated: ReviewInboxItem = {
    ...item,
    reviewStatus: newStatus,
    lastActionBy: "prof-demo-1",
    lastActionAt: new Date().toISOString(),
    comment: draft.comment || item.comment,
    entry: {
      ...item.entry,
      reviewStatus: newStatus,
    },
  };

  // En MC-8 no se persiste realmente, pero actualizamos en memoria para esta sesión
  inboxState.set(entryId, updated);

  return {
    actionId: `action-${entryId}-${Date.now()}`,
    actionType: draft.actionType,
    entryId,
    executedBy: "prof-demo-1",
    executedAt: new Date().toISOString(),
    previousStatus: item.reviewStatus,
    newStatus,
    updatedEntry: updated.entry,
    comment: draft.comment,
    isDemoData: true,
  };
}
