import type {
  ReviewInboxItem,
  ReviewActionDraft,
  ReviewActionPreview,
  ReviewInboxResponse,
} from "@pulso/shared";
import {
  getReviewInboxForPatient,
  getFullReviewInbox,
  applyReviewAction,
} from "../mock-data/review-inbox.mock.js";

/**
 * Servicio de bandeja de revisión profesional — MC-8.
 *
 * REGLA CRÍTICA: todos los registros en la bandeja permanecen como
 * ReviewableData. Las acciones de revisión cambian reviewStatus pero
 * NUNCA crean ValidatedData.
 *
 * No hay persistencia en MC-8 — solo simulación/preview.
 */

// Mantener estado en memoria para esta sesión (demo)
// En MC-8 todos los cambios son solo simulación
const inboxState = new Map<string, ReviewInboxItem>();

function initializeInboxState(): void {
  if (inboxState.size === 0) {
    const items = getFullReviewInbox();
    items.forEach((item) => inboxState.set(item.id, item));
  }
}

export function getReviewInbox(patientId?: string): ReviewInboxResponse {
  initializeInboxState();

  let items: ReviewInboxItem[];

  if (patientId) {
    items = getReviewInboxForPatient(patientId);
  } else {
    items = Array.from(inboxState.values());
  }

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
