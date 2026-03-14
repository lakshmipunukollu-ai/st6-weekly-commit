import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import type { Commit } from '../types';
import { getTeamCommits, getCommit } from '../api/commits';
import StateBadge from '../components/StateBadge';
import StateMachineViz from '../components/StateMachineViz';
import CommitEntryList from '../components/CommitEntryList';
import ReconciliationView from '../components/ReconciliationView';

function getMonday(d: Date): string {
  const date = new Date(d);
  const day = date.getDay();
  const diff = date.getDate() - day + (day === 0 ? -6 : 1);
  date.setDate(diff);
  return date.toISOString().split('T')[0];
}

export default function ManagerDashboard() {
  const { user } = useAuth();
  const [weekStart, setWeekStart] = useState(getMonday(new Date()));
  const [commits, setCommits] = useState<Commit[]>([]);
  const [selectedCommit, setSelectedCommit] = useState<Commit | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!user) return;
    setLoading(true);
    getTeamCommits(user.id, weekStart)
      .then((data) => {
        setCommits(data);
        setSelectedCommit(null);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [user, weekStart]);

  const changeWeek = (offset: number) => {
    const d = new Date(weekStart);
    d.setDate(d.getDate() + 7 * offset);
    setWeekStart(getMonday(d));
  };

  const selectCommit = async (c: Commit) => {
    const full = await getCommit(c.id);
    setSelectedCommit(full);
  };

  // Group commits by userId
  const grouped = commits.reduce<Record<string, Commit[]>>((acc, c) => {
    if (!acc[c.userId]) acc[c.userId] = [];
    acc[c.userId].push(c);
    return acc;
  }, {});

  const stateSummary = {
    DRAFT: commits.filter((c) => c.state === 'DRAFT').length,
    LOCKED: commits.filter((c) => c.state === 'LOCKED').length,
    RECONCILING: commits.filter((c) => c.state === 'RECONCILING').length,
    RECONCILED: commits.filter((c) => c.state === 'RECONCILED').length,
    CARRIED_FORWARD: commits.filter((c) => c.state === 'CARRIED_FORWARD').length,
  };

  return (
    <div style={styles.page}>
      <div style={styles.header}>
        <h2 style={styles.heading}>Team Dashboard</h2>
        <div style={styles.weekNav}>
          <button onClick={() => changeWeek(-1)} style={styles.weekBtn}>&laquo; Prev</button>
          <span style={styles.weekLabel}>Week of {weekStart}</span>
          <button onClick={() => changeWeek(1)} style={styles.weekBtn}>Next &raquo;</button>
        </div>
      </div>

      {/* Summary */}
      <div style={styles.summary}>
        <div style={styles.statCard}><strong>{commits.length}</strong><span>Total</span></div>
        <div style={styles.statCard}><strong>{stateSummary.DRAFT}</strong><span>Draft</span></div>
        <div style={styles.statCard}><strong>{stateSummary.LOCKED}</strong><span>Locked</span></div>
        <div style={styles.statCard}><strong>{stateSummary.RECONCILING}</strong><span>Reconciling</span></div>
        <div style={styles.statCard}><strong>{stateSummary.RECONCILED}</strong><span>Reconciled</span></div>
      </div>

      <div style={styles.layout}>
        {/* Left: team commits list */}
        <div style={styles.sidebar}>
          {loading && <p style={styles.loading}>Loading team commits...</p>}
          {Object.entries(grouped).map(([userId, userCommits]) => (
            <div key={userId} style={styles.userGroup}>
              <div style={styles.userLabel}>User: {userId.substring(0, 8)}...</div>
              {userCommits.map((c) => (
                <div
                  key={c.id}
                  onClick={() => selectCommit(c)}
                  style={{
                    ...styles.commitCard,
                    border: selectedCommit?.id === c.id ? '2px solid #3498db' : '1px solid #e0e0e0',
                  }}
                >
                  <StateBadge state={c.state} />
                  <span style={styles.entryCount}>{c.entries.length} entries</span>
                </div>
              ))}
            </div>
          ))}
          {!loading && commits.length === 0 && (
            <p style={styles.empty}>No team commits for this week.</p>
          )}
        </div>

        {/* Right: detail */}
        <div style={styles.main}>
          {selectedCommit ? (
            <>
              <StateMachineViz currentState={selectedCommit.state} />
              <CommitEntryList
                commitId={selectedCommit.id}
                entries={selectedCommit.entries}
                isDraft={false}
                onUpdate={() => {}}
              />
              <ReconciliationView
                commitId={selectedCommit.id}
                entries={selectedCommit.entries}
                state={selectedCommit.state}
                onUpdate={() => {}}
              />
            </>
          ) : (
            <div style={styles.placeholder}>
              <p>Select a team member's commit to view details</p>
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
  summary: { display: 'flex', gap: '12px', marginBottom: '20px', flexWrap: 'wrap' },
  statCard: { display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '12px 24px', backgroundColor: '#fff', border: '1px solid #e0e0e0', borderRadius: '8px', fontSize: '13px' },
  layout: { display: 'flex', gap: '20px' },
  sidebar: { width: '280px', flexShrink: 0 },
  userGroup: { marginBottom: '16px' },
  userLabel: { fontSize: '12px', color: '#888', fontWeight: 600, marginBottom: '4px' },
  commitCard: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px', borderRadius: '6px', backgroundColor: '#fff', marginBottom: '6px', cursor: 'pointer' },
  entryCount: { fontSize: '12px', color: '#888' },
  main: { flex: 1, backgroundColor: '#fff', padding: '20px', borderRadius: '8px', border: '1px solid #e0e0e0', minHeight: '400px' },
  placeholder: { display: 'flex', justifyContent: 'center', alignItems: 'center', height: '300px', color: '#aaa' },
  loading: { color: '#888', fontSize: '13px' },
  empty: { color: '#999', fontSize: '13px', textAlign: 'center', marginTop: '20px' },
};
