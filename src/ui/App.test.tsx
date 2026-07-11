// @vitest-environment jsdom
import '@testing-library/jest-dom/vitest';
import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { App } from './App';

describe('App', () => {
  it('shows all three boards under the current product name', () => {
    render(<App />);
    expect(screen.getByText(/织花牌/)).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: /德扑盘/ })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: /21 点盘/ })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: /三消盘/ })).toBeInTheDocument();
  });
});
