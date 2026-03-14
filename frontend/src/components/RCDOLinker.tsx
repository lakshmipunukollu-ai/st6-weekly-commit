import { useState, useEffect } from 'react';
import { getRallyCries, getObjectives, getOutcomes } from '../api/rcdo';
import type { RallyCry, DefiningObjective, Outcome } from '../types';

interface Props {
  rallyCryId: string | null;
  definingObjectiveId: string | null;
  outcomeId: string | null;
  onChange: (rallyCryId: string | null, definingObjectiveId: string | null, outcomeId: string | null) => void;
  disabled?: boolean;
}

export default function RCDOLinker({ rallyCryId, definingObjectiveId, outcomeId, onChange, disabled }: Props) {
  const [rallyCries, setRallyCries] = useState<RallyCry[]>([]);
  const [objectives, setObjectives] = useState<DefiningObjective[]>([]);
  const [outcomes, setOutcomes] = useState<Outcome[]>([]);

  useEffect(() => {
    getRallyCries().then(setRallyCries).catch(() => {});
  }, []);

  useEffect(() => {
    if (rallyCryId) {
      getObjectives(rallyCryId).then(setObjectives).catch(() => {});
    } else {
      setObjectives([]);
    }
  }, [rallyCryId]);

  useEffect(() => {
    if (definingObjectiveId) {
      getOutcomes(definingObjectiveId).then(setOutcomes).catch(() => {});
    } else {
      setOutcomes([]);
    }
  }, [definingObjectiveId]);

  return (
    <div style={styles.container}>
      <h4 style={styles.title}>RCDO Hierarchy</h4>
      <div style={styles.selects}>
        <label style={styles.label}>
          Rally Cry
          <select
            value={rallyCryId || ''}
            onChange={(e) => onChange(e.target.value || null, null, null)}
            disabled={disabled}
            style={styles.select}
          >
            <option value="">-- Select --</option>
            {rallyCries.map((rc) => (
              <option key={rc.id} value={rc.id}>{rc.title}</option>
            ))}
          </select>
        </label>
        <label style={styles.label}>
          Defining Objective
          <select
            value={definingObjectiveId || ''}
            onChange={(e) => onChange(rallyCryId, e.target.value || null, null)}
            disabled={disabled || !rallyCryId}
            style={styles.select}
          >
            <option value="">-- Select --</option>
            {objectives.map((obj) => (
              <option key={obj.id} value={obj.id}>{obj.title}</option>
            ))}
          </select>
        </label>
        <label style={styles.label}>
          Outcome
          <select
            value={outcomeId || ''}
            onChange={(e) => onChange(rallyCryId, definingObjectiveId, e.target.value || null)}
            disabled={disabled || !definingObjectiveId}
            style={styles.select}
          >
            <option value="">-- Select --</option>
            {outcomes.map((o) => (
              <option key={o.id} value={o.id}>{o.title}</option>
            ))}
          </select>
        </label>
      </div>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  container: { padding: '12px', backgroundColor: '#f8f9fa', borderRadius: '8px', marginBottom: '16px' },
  title: { margin: '0 0 8px 0', fontSize: '14px', color: '#333' },
  selects: { display: 'flex', gap: '12px', flexWrap: 'wrap' },
  label: { display: 'flex', flexDirection: 'column', gap: '4px', fontSize: '12px', color: '#666', flex: 1, minWidth: '180px' },
  select: { padding: '6px 8px', borderRadius: '4px', border: '1px solid #ddd', fontSize: '13px' },
};
