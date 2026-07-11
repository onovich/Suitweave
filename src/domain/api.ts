import type { Command, DomainEvent } from './commands';
import type { GameState } from './game-state';
import { executeCommand, type CommandResult } from './transitions';

export interface ReplayResult {
  readonly state: GameState;
  readonly events: readonly DomainEvent[];
  readonly results: readonly CommandResult[];
}

export const runCommand = (state: GameState, command: Command): CommandResult => executeCommand(state, command);

export const previewCommand = (state: GameState, command: Command): CommandResult => executeCommand(state, command);

export const replayCommands = (initial: GameState, commands: readonly Command[]): ReplayResult => {
  const results: CommandResult[] = [];
  let state = initial;
  for (const command of commands) {
    const result = runCommand(state, command);
    results.push(result);
    state = result.state;
  }
  return { state, results, events: results.flatMap((result) => result.events) };
};
