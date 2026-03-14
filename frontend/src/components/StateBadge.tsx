import type { CommitState } from '../types';

const STATE_COLORS: Record<CommitState, string> = {
  DRAFT: '#3498db',
  LOCKED: '#f39c12',
  RECONCILING: '#9b59b6',
  RECONCILED: '#27ae60',
  CARRIED_FORWARD: '#95a5a6',
};

const STATE_LABELS: Record<CommitState, string> = {
  DRAFT: 'Draft',
  LOCKED: 'Locked',
  RECONCILING: 'Reconciling',
  RECONCILED: 'Reconciled',
  CARRIED_FORWARD: 'Carried Forward',
};

export default function StateBadge({ state }: { state: CommitState }) {
  return (
    <span
      style={{
        display: 'inline-block',
        padding: '2px 10px',
        borderRadius: '12px',
        fontSize: '12px',
        fontWeight: 600,
        color: '#fff',
        backgroundColor: STATE_COLORS[state],
      }}
    >
      {STATE_LABELS[state]}
    </span>
  );
}
