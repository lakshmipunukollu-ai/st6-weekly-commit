import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import StateMachineViz from '../components/StateMachineViz';

describe('StateMachineViz', () => {
  it('renders all states', () => {
    render(<StateMachineViz currentState="DRAFT" />);
    expect(screen.getByText('Draft')).toBeInTheDocument();
    expect(screen.getByText('Locked')).toBeInTheDocument();
    expect(screen.getByText('Reconciling')).toBeInTheDocument();
    expect(screen.getByText('Reconciled')).toBeInTheDocument();
    expect(screen.getByText('Carried Forward')).toBeInTheDocument();
  });

  it('renders transition labels', () => {
    render(<StateMachineViz currentState="LOCKED" />);
    expect(screen.getByText('Lock')).toBeInTheDocument();
    expect(screen.getByText('Start Reconciliation')).toBeInTheDocument();
    expect(screen.getByText('Complete')).toBeInTheDocument();
    expect(screen.getByText('Carry Forward')).toBeInTheDocument();
  });

  it('displays the title', () => {
    render(<StateMachineViz currentState="DRAFT" />);
    expect(screen.getByText('State Machine')).toBeInTheDocument();
  });
});
