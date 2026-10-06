export const SERVICE_STATUS = Object.freeze({
  PENDENTE: 'PENDENTE',
  ACEITO: 'ACEITO',
  CONCLUIDO: 'CONCLUIDO',
  CANCELADO: 'CANCELADO',
});

const ALLOWED_TRANSITIONS = Object.freeze({
  PENDENTE: new Set(['ACEITO', 'CANCELADO']),
  ACEITO: new Set(['CONCLUIDO', 'CANCELADO']),
  CONCLUIDO: new Set(),
  CANCELADO: new Set(),
});

export function canTransitionServiceStatus(currentStatus, nextStatus) {
  return Boolean(ALLOWED_TRANSITIONS[currentStatus]?.has(nextStatus));
}
