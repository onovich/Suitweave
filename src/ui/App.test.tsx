// @vitest-environment jsdom
import '@testing-library/jest-dom/vitest';
import { fireEvent, render, screen } from '@testing-library/react';
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

  it('supports the selected-card preview and confirmation path', () => {
    const { container } = render(<App />);
    const card = container.querySelector<HTMLButtonElement>('.card:not(.wildcard)');
    if (card === null) throw new Error('Expected a hand card.');

    fireEvent.click(card);
    const cell = container.querySelector<HTMLButtonElement>('.grid .cell');
    if (cell === null) throw new Error('Expected a board cell.');
    fireEvent.click(cell);
    expect(screen.getByRole('status')).toHaveTextContent('落点预览');
    fireEvent.click(screen.getByRole('button', { name: '确认落牌' }));
    expect(screen.getByText(/行动 2/)).toBeInTheDocument();
  });
});
