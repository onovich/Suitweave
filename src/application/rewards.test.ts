import { describe, expect, it } from 'vitest';
import { createGameState } from '../domain';
import { openReward, selectRewardOption, startSession } from './index';

describe('application reward orchestration', () => {
  it('blocks normal play until an opened pending reward is selected', () => {
    const state = createGameState(9);
    const session = startSession(9, { ...state, rewards: { ...state.rewards, pendingRewards: ['inspiration' as const] } });
    const opened = openReward(session);
    if (!opened.ok) throw new Error('Expected reward offer.');
    const option = opened.session.state.rewards.activeOffer?.options[0];
    if (option === undefined) throw new Error('Expected reward option.');
    const selected = selectRewardOption(opened.session, option.id);

    expect(selected).toMatchObject({ ok: true, session: { state: { rewards: { activeOffer: null, pendingRewards: [] } } } });
  });
});
