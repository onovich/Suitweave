import type {
  GameSession,
  SessionResult,
  TutorialState,
  TutorialStep,
} from "./types";

export const TUTORIAL_SEED = 20260712;

export const TUTORIAL_STEPS: readonly TutorialStep[] = [
  {
    id: "blackjack",
    roundStart: 1,
    title: "Start with the 21 board",
    goal: "Make an ink-connected valid number group, then confirm its preview.",
  },
  {
    id: "poker",
    roundStart: 4,
    title: "Compare the poker board",
    goal: "Compare one number card's opportunity across the boards.",
  },
  {
    id: "match",
    roundStart: 7,
    title: "Use the match board",
    goal: "Use the preview to check groups, risks, and score changes.",
  },
  {
    id: "rewards",
    roundStart: 10,
    title: "Submit and choose rewards",
    goal: "After submitting a valid board, resolve its reward before acting again.",
  },
];

export const createTutorialState = (): TutorialState => ({
  status: "active",
  currentStep: "blackjack",
  completedSteps: [],
});

export const tutorialStepForRound = (round: number): TutorialStep => {
  const step = [...TUTORIAL_STEPS]
    .reverse()
    .find((candidate) => round >= candidate.roundStart);
  if (step === undefined)
    throw new RangeError("Tutorial round is before its first step.");
  return step;
};

export const advanceTutorial = (session: GameSession): GameSession => {
  const tutorial = session.tutorial;
  if (tutorial?.status !== "active") return session;
  const next = tutorialStepForRound(session.turn.round);
  if (next.id === tutorial.currentStep) return session;
  return {
    ...session,
    tutorial: {
      ...tutorial,
      currentStep: next.id,
      completedSteps: [...tutorial.completedSteps, tutorial.currentStep],
    },
  };
};

export const skipTutorial = (session: GameSession): SessionResult => {
  const tutorial = session.tutorial;
  if (tutorial?.status !== "active")
    return { ok: false, session, reason: "Tutorial is not active." };
  return {
    ok: true,
    session: {
      ...session,
      tutorial: { ...tutorial, status: "skipped" },
    },
  };
};

export const completeTutorial = (session: GameSession): SessionResult => {
  const tutorial = session.tutorial;
  if (tutorial?.status !== "active")
    return { ok: false, session, reason: "Tutorial is not active." };
  const completedSteps =
    tutorial.currentStep === "rewards"
      ? [...tutorial.completedSteps, "rewards" as const]
      : tutorial.completedSteps;
  return {
    ok: true,
    session: {
      ...session,
      tutorial: { ...tutorial, status: "completed", completedSteps },
    },
  };
};
