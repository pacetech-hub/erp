import type { StatusCliente } from '../types/cliente';
import './StatusBadge.css';

const LABELS: Record<StatusCliente, string> = {
  ativo: 'Ativo',
  inativo: 'Inativo',
};

export function StatusBadge({ status }: { status: StatusCliente }) {
  return <span className={`status-badge status-badge--${status}`}>{LABELS[status]}</span>;
}
