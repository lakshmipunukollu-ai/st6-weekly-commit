import client from './client';
import type { AuthResponse } from '../types';

export const login = async (email: string, password: string): Promise<AuthResponse> => {
  const { data } = await client.post<AuthResponse>('/api/auth/login', { email, password });
  return data;
};

export const register = async (
  email: string,
  password: string,
  fullName: string,
  role?: string,
  managerId?: string
): Promise<AuthResponse> => {
  const { data } = await client.post<AuthResponse>('/api/auth/register', {
    email,
    password,
    fullName,
    role,
    managerId,
  });
  return data;
};
