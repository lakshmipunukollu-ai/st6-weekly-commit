import { useState, useEffect } from 'react';
import type { CommitEntry, ReconciliationEntry, ReconciliationItem } from '../types';
import { submitReconciliation, getReconciliation, completeReconciliation } from '../api/commits';

interface Props {
  commitId: string;
  entries: CommitEntry[];
  state: string;
  onUpdate: () => void;
}

export default function ReconciliationView({ commitId, entries, state, onUpdate }: Props) {
  const [reconEntries, setReconEntries] = useState<ReconciliationEntry[]>([]);
  const [items, setItems] = useState<ReconciliationItem[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (state === 'RECONCILING' || state === 'RECONCILED' || state === 'CARRIED_FORWARD') {
      getReconciliation(commitId).then(setReconEntries).catch(() => {});
    }
  }, [commitId, state]);

  useEffect(() => {
    if (state === 'RECONCILING' && reconEntries.length === 0) {
      setItems(
        entries.map((e) => ({
          commitEntryId: e.id,
          planned: e.title + (e.description ? ': ' + e.description : ''),
          actual: '',
          completionStatus: 'COMPLETED',
          carryForward: false,
          notes: '',
        }))
      );
    }
  }, [entries, state, reconEntries.length]);

  const updateItem = (idx: number, field: keyof ReconciliationItem, value: string | boolean) => {
    setItems((prev) => prev.map((it, i) => (i === idx ? { ...it, [field]: value } : it)));
  };

  const handleSubmit = async () => {
    setLoading(true);
    try {
      await submitReconciliation(commitId, items);
      await completeReconciliation(commitId);
      onUpdate();
    } catch (err) {
      console.error('Failed to submit reconciliation:', err);
    }
    setLoading(false);
  };

  if (state === 'RECONCILED' || state === 'CARRIED_FORWARD') {
    return (
      <div style={styles.container}>
        <h4 style={styles.title}>Reconciliation Results</h4>
        {reconEntries.map((re) => {
          return (
            <div key={re.id} style={styles.resultCard}>
              <div style={styles.resultRow}>
                <span style={styles.resultLabel}>Planned:</span>
                <span>{re.planned}</span>
              </div>
              <div style={styles.resultRow}>
                <span style={styles.resultLabel}>Actual:</span>
                <span>{re.actual || '(none)'}</span>
              </div>
              <div style={styles.resultRow}>
                <span style={styles.resultLabel}>Status:</span>
                <span style={{ ...styles.statusBadge, backgroundColor: statusColor(re.completionStatus) }}>
                  {re.completionStatus}
                </span>
              </div>
              {re.carryForward && (
                <div style={styles.resultRow}>
                  <span style={{ color: '#f39c12', fontWeight: 'bold', fontSize: '12px' }}>Carried Forward</span>
                </div>
              )}
              {re.notes && (
                <div style={styles.resultRow}>
                  <span style={styles.resultLabel}>Notes:</span>
                  <span style={{ fontSize: '13px', color: '#666' }}>{re.notes}</span>
                </div>
              )}
            </div>
          );
        })}
      </div>
    );
  }

  if (state !== 'RECONCILING') return null;

  return (
    <div style={styles.container}>
      <h4 style={styles.title}>Reconciliation</h4>
      <p style={styles.hint}>Compare planned vs actual for each entry:</p>
      {items.map((item, idx) => (
        <div key={item.commitEntryId} style={styles.itemCard}>
          <div style={styles.planned}>
            <strong>Planned:</strong> {item.planned}
          </div>
          <textarea
            placeholder="What actually happened?"
            value={item.actual}
            onChange={(e) => updateItem(idx, 'actual', e.target.value)}
            style={styles.textarea}
          />
          <div style={styles.row}>
            <select
              value={item.completionStatus}
              onChange={(e) => updateItem(idx, 'completionStatus', e.target.value)}
              style={styles.select}
            >
              <option value="COMPLETED">Completed</option>
              <option value="PARTIAL">Partial</option>
              <option value="NOT_STARTED">Not Started</option>
              <option value="DEPRIORITIZED">Deprioritized</option>
            </select>
            <label style={styles.checkLabel}>
              <input
                type="checkbox"
                checked={item.carryForward}
                onChange={(e) => updateItem(idx, 'carryForward', e.target.checked)}
              />
              Carry Forward
            </label>
          </div>
          <input
            placeholder="Notes (optional)"
            value={item.notes}
            onChange={(e) => updateItem(idx, 'notes', e.target.value)}
            style={styles.notesInput}
          />
        </div>
      ))}
      <button onClick={handleSubmit} disabled={loading} style={styles.submitBtn}>
        {loading ? 'Submitting...' : 'Complete Reconciliation'}
      </button>
    </div>
  );
}

function statusColor(status: string): string {
  switch (status) {
    case 'COMPLETED': return '#27ae60';
    case 'PARTIAL': return '#f39c12';
    case 'NOT_STARTED': return '#e74c3c';
    case 'DEPRIORITIZED': return '#95a5a6';
    default: return '#333';
  }
}

const styles: Record<string, React.CSSProperties> = {
  container: { marginTop: '16px', padding: '16px', backgroundColor: '#f8f9fa', borderRadius: '8px' },
  title: { margin: '0 0 8px 0', fontSize: '14px' },
  hint: { fontSize: '13px', color: '#666', margin: '0 0 12px 0' },
  itemCard: { padding: '12px', marginBottom: '12px', backgroundColor: '#fff', border: '1px solid #e0e0e0', borderRadius: '6px' },
  planned: { fontSize: '13px', marginBottom: '8px', color: '#333' },
  textarea: { width: '100%', padding: '6px', border: '1px solid #ddd', borderRadius: '4px', fontSize: '13px', minHeight: '60px', resize: 'vertical', boxSizing: 'border-box' },
  row: { display: 'flex', gap: '12px', alignItems: 'center', marginTop: '8px' },
  select: { padding: '4px 8px', border: '1px solid #ddd', borderRadius: '4px', fontSize: '13px' },
  checkLabel: { display: 'flex', alignItems: 'center', gap: '4px', fontSize: '13px' },
  notesInput: { width: '100%', padding: '6px', border: '1px solid #ddd', borderRadius: '4px', fontSize: '13px', marginTop: '8px', boxSizing: 'border-box' },
  submitBtn: { marginTop: '12px', padding: '8px 24px', backgroundColor: '#27ae60', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '14px' },
  resultCard: { padding: '10px', marginBottom: '8px', backgroundColor: '#fff', border: '1px solid #e0e0e0', borderRadius: '6px' },
  resultRow: { display: 'flex', gap: '8px', alignItems: 'center', marginBottom: '4px', fontSize: '13px' },
  resultLabel: { color: '#888', fontWeight: 600, fontSize: '12px', minWidth: '60px' },
  statusBadge: { color: '#fff', padding: '1px 8px', borderRadius: '10px', fontSize: '11px', fontWeight: 600 },
};
