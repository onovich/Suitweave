# Balance profile v1

`src/balance/contracts.ts` is the versioned, analysis-only record of the values currently used by `Ruleset v1`. It does not inject alternate values into the runtime and therefore preserves existing seed replay.

Every future balance run must record the profile id, commit, policy, frozen seed catalog, step limit, and raw results. A profile change requires real-player evidence, before/after reports, replay coverage, and an explicit balance record.
