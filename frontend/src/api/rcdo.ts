import client from './client';
import type { RallyCry, DefiningObjective, Outcome } from '../types';

export const getRallyCries = async (): Promise<RallyCry[]> => {
  const { data } = await client.get<RallyCry[]>('/api/rcdo/rally-cries');
  return data;
};

export const getObjectives = async (rallyCryId: string): Promise<DefiningObjective[]> => {
  const { data } = await client.get<DefiningObjective[]>(`/api/rcdo/rally-cries/${rallyCryId}/objectives`);
  return data;
};

export const getOutcomes = async (objectiveId: string): Promise<Outcome[]> => {
  const { data } = await client.get<Outcome[]>(`/api/rcdo/objectives/${objectiveId}/outcomes`);
  return data;
};
