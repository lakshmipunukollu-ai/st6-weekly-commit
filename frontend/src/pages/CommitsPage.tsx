import { useState, useEffect, useCallback } from 'react';
import type { Commit } from '../types';
import { getWeekCommits, createCommit, lockCommit, startReconciliation, carryForward } from '../api/commits';
import StateBadge from '../components/StateBadge';
import StateMachineViz from '../components/StateMachineViz';
import CommitEntryList from '../components/CommitEntryList';
import RCDOLinker from '../components/RCDOLinker';
import ReconciliationView from '../components/ReconciliationView';
import { updateCommit, getCommit } from '../api/commits';

function getMonday(d: Date): string {
  const date = new Date(d);
  const day = date.getDay();
  const diff = date.getDate() - day + (day === 0 ? -6 : 1);
  date.setDate(diff);
  return date.toISOString().split('T')[0];
}

export default function CommitsPage() {
  const [weekStart, setWeekStart] = useState(getMonday(new Date()));
  const [commits, setCommits] = useState<Commit[]>([]);
  const [selectedCommit, setSelectedCommit] = useState<Commit | null>(null);
  const [loading, setLoading] = useState(false);

  const loadCommits = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getWeekCommits(weekStart);
      setCommits(data);
      if (data.length > 0 && !selectedCommit) {
        setSelectedCommit(data[0]);
      } else if (selectedCommit) {
        const updated = data.find((c) => c.id === selectedCommit.id);
        if (updated) setSelectedCommit(updated);
      }
    } catch (err) {
      console.error('Failed to load commits:', err);
    }
    setLoading(false);
  }, [weekStart]);

  useEffect(() => {
    loadCommits();
    setSelectedCommit(null);
  }, [weekStart]);

  const handleCreate = async () => {
    const commit = await createCommit(weekStart);
    await loadCommits();
    setSelectedCommit(commit);
  };

  const handleLock = async () => {
    if (!selectedCommit) return;
    await lockCommit(selectedCommit.id);
    const updated = await getCommit(selectedCommit.id);
    setSelectedCommit(updated);
    loadCommits();
  };

  const handleStartReconcile = async () => {
    if (!selectedCommit) return;
    await startReconciliation(selectedCommit.id);
    const updated = await getCommit(selectedCommit.id);
    setSelectedCommit(updated);
    loadCommits();
  };

  const handleCarryForward = async () => {
    if (!selectedCommit) return;
    await carryForward(selectedCommit.id);
    const updated = await getCommit(selectedCommit.id);
    setSelectedCommit(updated);
    loadCommits();
  };

  const handleRCDOChange = async (rcId: string | null, doId: string | null, oId: string | null) => {
    if (!selectedCommit) return;
    await updateCommit(selectedCommit.id, {
      rallyCryId: rcId || undefined,
      definingObjectiveId: doId || undefined,
      outcomeId: oId || undefined,
    });
    const updated = await getCommit(selectedCommit.id);
    setSelectedCommit(updated);
    loadCommits();
  };

  const refreshSelected = async () => {
    if (!selectedCommit) return;
    const updated = await getCommit(selectedCommit.id);
    setSelectedCommit(updated);
    loadCommits();
  };

  const changeWeek = (offset: number) => {
    const d = new Date(weekStart);
    d.setDate(d.getDate() + 7 * offset);
    setWeekStart(getMonday(d));
  };

  return (
    <div style={styles.page}>
      <div style={styles.header}>
        <h2 style={styles.heading}>My Weekly Commits</h2>
        <div style={styles.weekNav}>
          <button onClick={() => changeWeek(-1)} style={styles.weekBtn}>&laquo; Prev</button>
          <span style={styles.weekLabel}>Week of {weekStart}</span>
          <button onClick={() => changeWeek(1)} style={styles.weekBtn}>Next &raquo;</button>
        </div>
      </div>

      <div style={styles.layout}>
        {/* Sidebar: commit list */}
        <div style={styles.sidebar}>
          <button onClick={handleCreate} style={styles.createBtn}>+ New Commit</button>
          {loading && <p style={styles.loading}>Loading...</p>}
          {commits.map((c) => (
            <div
              key={c.id}
              onClick={() => setSelectedCommit(c)}
              style={{
                ...styles.commitCard,
                border: selectedCommit?.id === c.id ? '2px solid #3498db' : '1px solid #e0e0e0',
              }}
            >
              <div style={styles.commitCardTop}>
                <StateBadge state={c.state} />
                <span style={styles.entryCount}>{c.entries.length} entries</span>
              </div>
              <div style={styles.commitDate}>{c.weekStart}</div>
            </div>
          ))}
          {!loading && commits.length === 0 && (
            <p style={styles.empty}>No commits for this week. Create one to get started.</p>
          )}
        </div>

        {/* Main: selected commit detail */}
        <div style={styles.main}>
          {selectedCommit ? (
            <>
              <div style={styles.detailHeader}>
                <StateBadge state={selectedCommit.state} />
                <div style={styles.detailActions}>
                  {selectedCommit.state === 'DRAFT' && (
                    <button onClick={handleLock} style={styles.actionBtn}>Lock Commit</button>
                  )}
                  {selectedCommit.state === 'LOCKED' && (
                    <button onClick={handleStartReconcile} style={styles.actionBtn}>Start Reconciliation</button>
                  )}
                  {selectedCommit.state === 'RECONCILED' && (
                    <button onClick={handleCarryForward} style={styles.actionBtnAlt}>Carry Forward</button>
                  )}
                </div>
              </div>

              <StateMachineViz currentState={selectedCommit.state} />

              <RCDOLinker
                rallyCryId={selectedCommit.rallyCryId}
                definingObjectiveId={selectedCommit.definingObjectiveId}
                outcomeId={selectedCommit.outcomeId}
                onChange={handleRCDOChange}
                disabled={selectedCommit.state !== 'DRAFT'}
              />

              <CommitEntryList
                commitId={selectedCommit.id}
                entries={selectedCommit.entries}
                isDraft={selectedCommit.state === 'DRAFT'}
                onUpdate={refreshSelected}
              />

              <ReconciliationView
                commitId={selectedCommit.id}
                entries={selectedCommit.entries}
                state={selectedCommit.state}
                onUpdate={refreshSelected}
              />
            </>
          ) : (
            <div style={styles.placeholder}>
              <p>Select a commit from the left or create a new one</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  page: { padding: '24px', maxWidth: '1200px', margin: '0 auto' },
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '12px' },
  heading: { margin: 0 },
  weekNav: { display: 'flex', alignItems: 'center', gap: '12px' },
  weekBtn: { padding: '4px 12px', border: '1px solid #ddd', borderRadius: '4px', cursor: 'pointer', backgroundColor: '#fff', fontSize: '13px' },
  weekLabel: { fontWeight: 600, fontSize: '15px' },
  layout: { display: 'flex', gap: '20px' },
  sidebar: { width: '260px', flexShrink: 0 },
  createBtn: { width: '100%', padding: '10px', backgroundColor: '#3498db', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '14px', marginBottom: '12px' },
  commitCard: { padding: '12px', borderRadius: '6px', backgroundColor: '#fff', marginBottom: '8px', cursor: 'pointer' },
  commitCardTop: { display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
  entryCount: { fontSize: '12px', color: '#888' },
  commitDate: { fontSize: '13px', color: '#666', marginTop: '4px' },
  main: { flex: 1, backgroundColor: '#fff', padding: '20px', borderRadius: '8px', border: '1px solid #e0e0e0', minHeight: '400px' },
  detailHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' },
  detailActions: { display: 'flex', gap: '8px' },
  actionBtn: { padding: '6px 16px', backgroundColor: '#27ae60', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '13px' },
  actionBtnAlt: { padding: '6px 16px', backgroundColor: '#f39c12', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '13px' },
  placeholder: { display: 'flex', justifyContent: 'center', alignItems: 'center', height: '300px', color: '#aaa' },
  loading: { color: '#888', fontSize: '13px' },
  empty: { color: '#999', fontSize: '13px', textAlign: 'center', marginTop: '20px' },
};
