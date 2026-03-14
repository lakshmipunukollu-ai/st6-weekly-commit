import { useState } from 'react';
import type { CommitEntry } from '../types';
import { addEntry, updateEntry, deleteEntry } from '../api/commits';

interface Props {
  commitId: string;
  entries: CommitEntry[];
  isDraft: boolean;
  onUpdate: () => void;
}

export default function CommitEntryList({ commitId, entries, isDraft, onUpdate }: Props) {
  const [newTitle, setNewTitle] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [editDesc, setEditDesc] = useState('');

  const handleAdd = async () => {
    if (!newTitle.trim()) return;
    await addEntry(commitId, newTitle.trim(), newDesc.trim());
    setNewTitle('');
    setNewDesc('');
    onUpdate();
  };

  const handleUpdate = async (entryId: string) => {
    await updateEntry(commitId, entryId, editTitle, editDesc);
    setEditingId(null);
    onUpdate();
  };

  const handleDelete = async (entryId: string) => {
    await deleteEntry(commitId, entryId);
    onUpdate();
  };

  const startEdit = (entry: CommitEntry) => {
    setEditingId(entry.id);
    setEditTitle(entry.title);
    setEditDesc(entry.description || '');
  };

  return (
    <div style={styles.container}>
      <h4 style={styles.title}>Commit Entries ({entries.length})</h4>

      {entries.map((entry, idx) => (
        <div key={entry.id} style={styles.entry}>
          {editingId === entry.id ? (
            <div style={styles.editForm}>
              <input
                value={editTitle}
                onChange={(e) => setEditTitle(e.target.value)}
                style={styles.input}
                placeholder="Title"
              />
              <input
                value={editDesc}
                onChange={(e) => setEditDesc(e.target.value)}
                style={styles.input}
                placeholder="Description"
              />
              <div style={styles.editActions}>
                <button onClick={() => handleUpdate(entry.id)} style={styles.saveBtn}>Save</button>
                <button onClick={() => setEditingId(null)} style={styles.cancelBtn}>Cancel</button>
              </div>
            </div>
          ) : (
            <div style={styles.entryContent}>
              <span style={styles.priority}>#{idx + 1}</span>
              <div style={styles.entryText}>
                <strong>{entry.title}</strong>
                {entry.description && <p style={styles.desc}>{entry.description}</p>}
              </div>
              {isDraft && (
                <div style={styles.actions}>
                  <button onClick={() => startEdit(entry)} style={styles.editBtn}>Edit</button>
                  <button onClick={() => handleDelete(entry.id)} style={styles.deleteBtn}>Delete</button>
                </div>
              )}
            </div>
          )}
        </div>
      ))}

      {isDraft && (
        <div style={styles.addForm}>
          <input
            value={newTitle}
            onChange={(e) => setNewTitle(e.target.value)}
            placeholder="New entry title"
            style={styles.input}
          />
          <input
            value={newDesc}
            onChange={(e) => setNewDesc(e.target.value)}
            placeholder="Description (optional)"
            style={styles.input}
          />
          <button onClick={handleAdd} style={styles.addBtn} disabled={!newTitle.trim()}>
            Add Entry
          </button>
        </div>
      )}
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  container: { marginTop: '16px' },
  title: { margin: '0 0 8px 0', fontSize: '14px' },
  entry: {
    padding: '10px',
    marginBottom: '8px',
    backgroundColor: '#fff',
    border: '1px solid #e0e0e0',
    borderRadius: '6px',
  },
  entryContent: { display: 'flex', alignItems: 'flex-start', gap: '8px' },
  priority: { color: '#999', fontSize: '12px', fontWeight: 'bold', minWidth: '24px' },
  entryText: { flex: 1 },
  desc: { margin: '4px 0 0 0', fontSize: '13px', color: '#666' },
  actions: { display: 'flex', gap: '4px' },
  editBtn: { fontSize: '11px', padding: '2px 8px', cursor: 'pointer', border: '1px solid #ddd', borderRadius: '4px', background: '#f8f9fa' },
  deleteBtn: { fontSize: '11px', padding: '2px 8px', cursor: 'pointer', border: '1px solid #ffcccc', borderRadius: '4px', background: '#fff5f5', color: '#c0392b' },
  editForm: { display: 'flex', flexDirection: 'column', gap: '6px' },
  editActions: { display: 'flex', gap: '4px' },
  saveBtn: { fontSize: '12px', padding: '4px 12px', cursor: 'pointer', backgroundColor: '#27ae60', color: '#fff', border: 'none', borderRadius: '4px' },
  cancelBtn: { fontSize: '12px', padding: '4px 12px', cursor: 'pointer', backgroundColor: '#95a5a6', color: '#fff', border: 'none', borderRadius: '4px' },
  addForm: { display: 'flex', gap: '8px', marginTop: '12px', flexWrap: 'wrap' },
  input: { padding: '6px 10px', border: '1px solid #ddd', borderRadius: '4px', fontSize: '13px', flex: 1, minWidth: '150px' },
  addBtn: { padding: '6px 16px', backgroundColor: '#3498db', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '13px' },
};
