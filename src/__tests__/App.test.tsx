import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import React from 'react';
import { BrowserRouter } from 'react-router-dom';
import { StatusBadge } from '../components/common/StatusBadge';
import { PriorityBadge } from '../components/common/PriorityBadge';
import { MetricCard } from '../components/common/MetricCard';

describe('CloudGuard AI Component Tests', () => {
  it('renders StatusBadge with healthy status correctly', () => {
    render(<StatusBadge status="healthy" />);
    expect(screen.getByText(/healthy/i)).toBeInTheDocument();
  });

  it('renders PriorityBadge P1 badge correctly', () => {
    render(<PriorityBadge priority="P1" />);
    expect(screen.getByText('P1')).toBeInTheDocument();
  });

  it('renders MetricCard with title and value', () => {
    render(<MetricCard title="Active Incidents" value={12} subtitle="Open alerts" />);
    expect(screen.getByText('Active Incidents')).toBeInTheDocument();
    expect(screen.getByText('12')).toBeInTheDocument();
  });
});
