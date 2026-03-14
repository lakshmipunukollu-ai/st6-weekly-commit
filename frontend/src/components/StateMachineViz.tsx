import type { CommitState } from '../types';

const STATES: { key: CommitState; label: string }[] = [
  { key: 'DRAFT', label: 'Draft' },
  { key: 'LOCKED', label: 'Locked' },
  { key: 'RECONCILING', label: 'Reconciling' },
  { key: 'RECONCILED', label: 'Reconciled' },
  { key: 'CARRIED_FORWARD', label: 'Carried Forward' },
];

const TRANSITIONS = [
  { from: 'DRAFT', to: 'LOCKED', label: 'Lock' },
  { from: 'LOCKED', to: 'RECONCILING', label: 'Start Reconciliation' },
  { from: 'RECONCILING', to: 'RECONCILED', label: 'Complete' },
  { from: 'RECONCILED', to: 'CARRIED_FORWARD', label: 'Carry Forward' },
];

export default function StateMachineViz({ currentState }: { currentState: CommitState }) {
  return (
    <div style={styles.container}>
      <h4 style={styles.title}>State Machine</h4>
      <div style={styles.flow}>
        {STATES.map((s, i) => (
          <div key={s.key} style={styles.stateGroup}>
            <div
              style={{
                ...styles.stateBox,
                backgroundColor: s.key === currentState ? '#3498db' : '#2c3e50',
                border: s.key === currentState ? '2px solid #2980b9' : '1px solid #444',
              }}
            >
              {s.label}
            </div>
            {i < STATES.length - 1 && (
              <div style={styles.arrow}>
                <span style={styles.arrowLabel}>{TRANSITIONS[i]?.label}</span>
                <span style={styles.arrowIcon}>&#8594;</span>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  container: { padding: '12px', backgroundColor: '#1a1a2e', borderRadius: '8px', marginBottom: '16px' },
  title: { color: '#aaa', margin: '0 0 8px 0', fontSize: '13px' },
  flow: { display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: '4px' },
  stateGroup: { display: 'flex', alignItems: 'center', gap: '4px' },
  stateBox: {
    padding: '6px 12px',
    borderRadius: '6px',
    color: '#fff',
    fontSize: '12px',
    fontWeight: 600,
    whiteSpace: 'nowrap',
  },
  arrow: { display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0px' },
  arrowLabel: { fontSize: '9px', color: '#888' },
  arrowIcon: { color: '#666', fontSize: '16px' },
};
