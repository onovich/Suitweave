import { describe, expect, it } from 'vitest';
import { createBoardId, createCellId } from '../domain';
import { chooseWildcardInk, executePreview, previewPlacement, selectCard, setNumberMode, startSession } from './index';
import type { GameSession } from './types';

describe('selection, preview, and execution', () => {
  it('uses the previewed domain result when executing a selected card', () => {
    const selected = selectedSession(20260711);
    const previewed = previewPlacement(selected, createBoardId('poker'), createCellId('poker:0:0'));

    expect(previewed.ok).toBe(true);
    if (!previewed.ok) return;
    const expected = previewed.session.preview?.result.state;
    const executed = executePreview(previewed.session);
    expect(executed.ok).toBe(true);
    if (!executed.ok) return;
    expect(executed.session.state).toEqual(expected);
    expect(executed.session.turn).toMatchObject({ actionsRemaining: 2, usedCardIds: [previewed.session.preview?.cardId] });
  });

  it('requires wildcard ink and prevents stale previews from executing', () => {
    const wildcard = withCard({ id: 'wild', kind: 'wildcard' });
    const selected = selectCard(wildcard, 'wild');
    expect(selected.ok).toBe(true);
    if (!selected.ok) return;
    expect(previewPlacement(selected.session, createBoardId('poker'), createCellId('poker:0:0'))).toMatchObject({ ok: false, session: selected.session });
    const colored = chooseWildcardInk(selected.session, 'purple');
    expect(colored.ok).toBe(true);
    if (!colored.ok) return;
    const previewed = previewPlacement(colored.session, createBoardId('poker'), createCellId('poker:0:0'));
    if (!previewed.ok) throw new Error('Expected a wildcard preview.');
    expect(executePreview({ ...previewed.session, selection: null })).toMatchObject({ ok: false, reason: 'Preview is stale.' });
  });

  it('maps a number card back to a pure ink domain command', () => {
    const session = withCard({ id: 'number', kind: 'number', card: { rank: '7', suit: 'spades' }, ink: 'red' });
    const selected = selectCard(session, 'number');
    if (!selected.ok) throw new Error('Expected selection.');
    const flipped = setNumberMode(selected.session, 'back');
    if (!flipped.ok) throw new Error('Expected flip.');
    const previewed = previewPlacement(flipped.session, createBoardId('poker'), createCellId('poker:0:0'));

    expect(previewed.session.preview?.command).toMatchObject({ type: 'place-card', mode: 'number-back', ink: 'red' });
  });
});

function selectedSession(seed: number): GameSession {
  const session = startSession(seed);
  const card = session.turn.hand[0];
  if (card === undefined) throw new Error('Expected hand card.');
  const selected = selectCard(session, card.id);
  if (!selected.ok) throw new Error('Expected selection.');
  if (card.kind !== 'wildcard') return selected.session;
  const colored = chooseWildcardInk(selected.session, 'red');
  if (!colored.ok) throw new Error('Expected wildcard color.');
  return colored.session;
}

function withCard(card: GameSession['turn']['hand'][number]): GameSession {
  const session = startSession(1);
  return { ...session, turn: { ...session.turn, hand: [card] } };
}
