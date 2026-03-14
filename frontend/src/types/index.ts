export interface User {
  id: string;
  email: string;
  fullName: string;
  role: 'MEMBER' | 'MANAGER' | 'ADMIN';
}

export interface AuthResponse {
  token: string;
  user: User;
}

export interface CommitEntry {
  id: string;
  title: string;
  description: string;
  priority: number;
  createdAt: string;
  updatedAt: string;
}

export interface Commit {
  id: string;
  userId: string;
  weekStart: string;
  state: CommitState;
  rallyCryId: string | null;
  definingObjectiveId: string | null;
  outcomeId: string | null;
  originalCommitId: string | null;
  entries: CommitEntry[];
  createdAt: string;
  updatedAt: string;
}

export type CommitState = 'DRAFT' | 'LOCKED' | 'RECONCILING' | 'RECONCILED' | 'CARRIED_FORWARD';

export interface RallyCry {
  id: string;
  title: string;
  description: string;
  active: boolean;
}

export interface DefiningObjective {
  id: string;
  rallyCryId: string;
  title: string;
  description: string;
}

export interface Outcome {
  id: string;
  definingObjectiveId: string;
  title: string;
  description: string;
}

export interface ReconciliationEntry {
  id: string;
  commitEntryId: string;
  planned: string;
  actual: string;
  completionStatus: 'COMPLETED' | 'PARTIAL' | 'NOT_STARTED' | 'DEPRIORITIZED';
  carryForward: boolean;
  notes: string;
}

export interface ReconciliationItem {
  commitEntryId: string;
  planned: string;
  actual: string;
  completionStatus: string;
  carryForward: boolean;
  notes: string;
}
