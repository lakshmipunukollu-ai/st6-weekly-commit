import client from './client';
import type { Commit, CommitEntry, ReconciliationEntry, ReconciliationItem } from '../types';

export const createCommit = async (weekStart: string, rallyCryId?: string, definingObjectiveId?: string, outcomeId?: string): Promise<Commit> => {
  const { data } = await client.post<Commit>('/api/commits', { weekStart, rallyCryId, definingObjectiveId, outcomeId });
  return data;
};

export const getCommit = async (id: string): Promise<Commit> => {
  const { data } = await client.get<Commit>(`/api/commits/${id}`);
  return data;
};

export const updateCommit = async (id: string, updates: { rallyCryId?: string; definingObjectiveId?: string; outcomeId?: string }): Promise<Commit> => {
  const { data } = await client.put<Commit>(`/api/commits/${id}`, updates);
  return data;
};

export const getWeekCommits = async (weekStart: string): Promise<Commit[]> => {
  const { data } = await client.get<Commit[]>(`/api/commits/week/${weekStart}`);
  return data;
};

export const getTeamCommits = async (managerId: string, weekStart?: string): Promise<Commit[]> => {
  const params = weekStart ? `?weekStart=${weekStart}` : '';
  const { data } = await client.get<Commit[]>(`/api/commits/team/${managerId}${params}`);
  return data;
};

export const lockCommit = async (id: string): Promise<Commit> => {
  const { data } = await client.put<Commit>(`/api/commits/${id}/lock`);
  return data;
};

export const startReconciliation = async (id: string): Promise<Commit> => {
  const { data } = await client.post<Commit>(`/api/commits/${id}/reconcile`);
  return data;
};

export const completeReconciliation = async (id: string): Promise<Commit> => {
  const { data } = await client.put<Commit>(`/api/commits/${id}/reconciled`);
  return data;
};

export const carryForward = async (id: string): Promise<Commit> => {
  const { data } = await client.post<Commit>(`/api/commits/${id}/carry-forward`);
  return data;
};

// Entry operations
export const addEntry = async (commitId: string, title: string, description: string): Promise<CommitEntry> => {
  const { data } = await client.post<CommitEntry>(`/api/commits/${commitId}/entries`, { title, description });
  return data;
};

export const updateEntry = async (commitId: string, entryId: string, title: string, description: string): Promise<CommitEntry> => {
  const { data } = await client.put<CommitEntry>(`/api/commits/${commitId}/entries/${entryId}`, { title, description });
  return data;
};

export const deleteEntry = async (commitId: string, entryId: string): Promise<void> => {
  await client.delete(`/api/commits/${commitId}/entries/${entryId}`);
};

export const reorderEntries = async (commitId: string, entryIds: string[]): Promise<CommitEntry[]> => {
  const { data } = await client.put<CommitEntry[]>(`/api/commits/${commitId}/entries/reorder`, { entryIds });
  return data;
};

// Reconciliation
export const submitReconciliation = async (commitId: string, entries: ReconciliationItem[]): Promise<ReconciliationEntry[]> => {
  const { data } = await client.post<ReconciliationEntry[]>(`/api/commits/${commitId}/reconciliation`, { entries });
  return data;
};

export const getReconciliation = async (commitId: string): Promise<ReconciliationEntry[]> => {
  const { data } = await client.get<ReconciliationEntry[]>(`/api/commits/${commitId}/reconciliation`);
  return data;
};
