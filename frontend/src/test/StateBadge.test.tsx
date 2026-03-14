import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import StateBadge from '../components/StateBadge';

describe('StateBadge', () => {
  it('renders DRAFT state', () => {
    render(<StateBadge state="DRAFT" />);
    expect(screen.getByText('Draft')).toBeInTheDocument();
  });

  it('renders LOCKED state', () => {
    render(<StateBadge state="LOCKED" />);
    expect(screen.getByText('Locked')).toBeInTheDocument();
  });

  it('renders RECONCILING state', () => {
    render(<StateBadge state="RECONCILING" />);
    expect(screen.getByText('Reconciling')).toBeInTheDocument();
  });

  it('renders RECONCILED state', () => {
    render(<StateBadge state="RECONCILED" />);
    expect(screen.getByText('Reconciled')).toBeInTheDocument();
  });

  it('renders CARRIED_FORWARD state', () => {
    render(<StateBadge state="CARRIED_FORWARD" />);
    expect(screen.getByText('Carried Forward')).toBeInTheDocument();
  });
});
