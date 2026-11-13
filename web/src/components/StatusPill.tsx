import type { LeadStatus } from '@/lib/types';
import { CORES, statusLabel } from '@/lib/status';

export function StatusPill({ status }: { status: LeadStatus }) {
  const cor = CORES[status];
  return (
    <span
      className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium"
      style={{ color: cor.texto, background: cor.fundo }}
    >
      <span className="h-1.5 w-1.5 rounded-full" style={{ background: cor.barra }} />
      {statusLabel(status)}
    </span>
  );
}
