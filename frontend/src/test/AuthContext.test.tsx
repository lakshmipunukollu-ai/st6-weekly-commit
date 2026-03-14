import { render, screen, act } from '@testing-library/react';
import { describe, it, expect, beforeEach } from 'vitest';
import { AuthProvider, useAuth } from '../contexts/AuthContext';

function TestComponent() {
  const { user, isAuthenticated, login, logout } = useAuth();
  return (
    <div>
      <span data-testid="auth">{isAuthenticated ? 'yes' : 'no'}</span>
      <span data-testid="name">{user?.fullName || 'none'}</span>
      <button onClick={() => login('test-token', { id: '1', email: 'test@test.com', fullName: 'Test User', role: 'MEMBER' })}>
        Login
      </button>
      <button onClick={logout}>Logout</button>
    </div>
  );
}

describe('AuthContext', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('starts unauthenticated', () => {
    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );
    expect(screen.getByTestId('auth').textContent).toBe('no');
    expect(screen.getByTestId('name').textContent).toBe('none');
  });

  it('login sets user and token', async () => {
    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    await act(async () => {
      screen.getByText('Login').click();
    });

    expect(screen.getByTestId('auth').textContent).toBe('yes');
    expect(screen.getByTestId('name').textContent).toBe('Test User');
    expect(localStorage.getItem('token')).toBe('test-token');
  });

  it('logout clears user and token', async () => {
    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    await act(async () => {
      screen.getByText('Login').click();
    });
    expect(screen.getByTestId('auth').textContent).toBe('yes');

    await act(async () => {
      screen.getByText('Logout').click();
    });
    expect(screen.getByTestId('auth').textContent).toBe('no');
    expect(localStorage.getItem('token')).toBeNull();
  });
});
