/* eslint-disable complexity, max-lines-per-function */
import { useMemo, useState } from "react";
import {
  adjustRewardRank,
  cancelPreview,
  chooseWildcardInk,
  discardFeature,
  endTurn,
  executeFeaturePreview,
  executePreview,
  openReward,
  previewFeatureCard,
  previewPlacement,
  redrawHandCard,
  reviewSession,
  selectCard,
  selectRerollCandidate,
  selectRewardOption,
  sessionViewModel,
  skipTutorial,
  setNumberMode,
  startSession,
  startTutorialSession,
  submitBoard,
  TUTORIAL_STEPS,
  type AudioPort,
  type GameSession,
} from "../application";
import type { FeatureTarget, Suit } from "../domain";

const inks = ["red", "blue", "green", "purple"] as const;

export function App({ audio = null }: Readonly<{ audio?: AudioPort | null }>) {
  const [session, setSession] = useState<GameSession>(() =>
    startSession(20260711),
  );
  const [activeBoard, setActiveBoard] = useState(0);
  const [feature, setFeature] = useState<Readonly<{
    cardId: string;
    targetCount: number;
    targets: readonly FeatureTarget[];
  }> | null>(null);
  const [rankReward, setRankReward] = useState<-1 | 1 | null>(null);
  const [redrawing, setRedrawing] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [muted, setMuted] = useState(false);
  const boards = useMemo(() => sessionViewModel(session), [session]);
  const tutorialStep =
    session.tutorial === null
      ? undefined
      : TUTORIAL_STEPS.find(
          (step) => step.id === session.tutorial?.currentStep,
        );
  const apply = (result: ReturnType<typeof endTurn>) => {
    setSession(result.session);
    setFeedback(result.ok ? null : result.reason);
    if (result.ok) audio?.play("place");
  };
  const select = (cardId: string) => {
    apply(selectCard(session, cardId));
  };
  const targetCell = (boardIndex: number, cellIndex: number) => {
    const board = boards[boardIndex];
    const cell = board?.cells[cellIndex];
    if (board === undefined || cell === undefined) return;
    if (rankReward !== null) {
      apply(adjustRewardRank(session, board.id, cell.id, rankReward));
      setRankReward(null);
      return;
    }
    if (feature !== null) {
      const targets = [
        ...feature.targets,
        { boardId: board.id, cellId: cell.id },
      ];
      if (targets.length >= feature.targetCount) {
        apply(previewFeatureCard(session, feature.cardId, targets));
        setFeature(null);
      } else setFeature({ ...feature, targets });
      return;
    }
    apply(previewPlacement(session, board.id, cell.id));
  };
  if (session.status === "settled")
    return (
      <Settlement
        session={session}
        onNew={() => {
          setSession(startSession(session.state.seed + 1));
        }}
      />
    );
  return (
    <main>
      <header>
        <div>
          <small>织花牌 · SUITWEAVE</small>
          <h1>把牌织进颜色，把选择留给三盘。</h1>
        </div>
        <div className="round">
          回合 {session.turn.round} / {session.state.ruleset.roundLimit}
          <br />
          <b>行动 {session.turn.actionsRemaining}</b>
        </div>
      </header>
      <section className="tutorial-launch" aria-label="Tutorial controls">
        <button onClick={() => { setSession(startTutorialSession()); }}>
          Start guided tutorial
        </button>
        <span>Guidance is optional and never hides the three boards.</span>
      </section>
      <section className="audio-controls" aria-label="Audio controls">
        <button onClick={() => { const next = !muted; setMuted(next); audio?.setMuted(next); }}>
          {muted ? "Enable sound" : "Mute sound"}
        </button>
        <label>Volume <input aria-label="Volume" type="range" min="0" max="1" step="0.1" defaultValue="0.12" onChange={(event) => audio?.setVolume(Number(event.currentTarget.value))} /></label>
      </section>
      {session.tutorial !== null && tutorialStep !== undefined && (
        <section className="tutorial-panel" aria-live="polite">
          <b>{tutorialStep.title}</b>
          <p>{tutorialStep.goal}</p>
          <small>
            Step {TUTORIAL_STEPS.findIndex((step) => step.id === tutorialStep.id) + 1} / {TUTORIAL_STEPS.length} · round {session.turn.round}
          </small>
          {session.tutorial.status === "active" && (
            <button onClick={() => { apply(skipTutorial(session)); }}>Skip tutorial</button>
          )}
        <button onClick={() => { setSession(startTutorialSession()); }}>
            Restart tutorial
          </button>
        </section>
      )}
      {feedback !== null && (
        <section className="action-feedback" role="alert">
          <b>Action needs attention:</b> {feedback}
        </section>
      )}
      <nav aria-label="棋盘切换" className="board-tabs">
        {boards.map((board, index) => (
          <button
            aria-pressed={index === activeBoard}
            key={board.id}
            onClick={() => {
              setActiveBoard(index);
            }}
          >
            {board.title} · {board.score}
          </button>
        ))}
      </nav>
      <section className="boards">
        {boards.map((board, boardIndex) => (
          <article
            className={boardIndex === activeBoard ? "active-board" : ""}
            key={board.id}
          >
            <h2>
              {board.title}
              <span>
                {board.score} 分 · {board.invalidNumberCount} 个警告
              </span>
            </h2>
            <p className="board-state">
              {board.locked
                ? "已锁定"
                : board.canSubmit
                  ? "可提交"
                  : "继续织入有效组"}
            </p>
            <div className="grid">
              {board.cells.map((cell, cellIndex) => (
                <button
                  aria-label={`${board.title} 格子 ${String(cellIndex + 1)} ${cell.label} ${cell.marker ?? ""}`}
                  className={`cell ink-${cell.ink ?? "none"}`}
                  data-marker={cell.marker ?? undefined}
                  disabled={cell.locked}
                  key={cell.id}
                  onClick={() => {
                    targetCell(boardIndex, cellIndex);
                  }}
                  onFocus={() => {
                    targetCell(boardIndex, cellIndex);
                  }}
                >
                  {cell.label}
                  <span className="marker">
                    {cell.marker === "crown"
                      ? "♔"
                      : cell.marker === "inspiration"
                        ? "✦"
                        : ""}
                  </span>
                </button>
              ))}
            </div>
            {board.canSubmit && (
              <button
                className="submit"
                onClick={() => {
                  apply(submitBoard(session, board.id));
                }}
              >
                提交并锁定
              </button>
            )}
          </article>
        ))}
      </section>
      <footer>
        <section>
          <small>本回合手牌 · 选择一张，再选择落点</small>
          <div className="hand">
            {session.turn.hand.map((card) => (
              <button
                aria-pressed={session.selection?.cardId === card.id}
                className={`card ${card.kind}`}
                disabled={session.turn.usedCardIds.includes(card.id)}
                key={card.id}
                onClick={() => {
                  if (redrawing) {
                    apply(redrawHandCard(session, card.id));
                    setRedrawing(false);
                  } else select(card.id);
                }}
              >
                {card.kind === "number"
                  ? `${card.card.rank}${symbol(card.card.suit)}`
                  : card.kind === "ink"
                    ? "墨色"
                    : "万能"}
                <small>{card.kind === "wildcard" ? "选色" : card.ink}</small>
              </button>
            ))}
          </div>
        </section>
        <aside>
          <button
            onClick={() => {
              apply(endTurn(session));
            }}
          >
            结束回合
          </button>
          <p>奖励会阻止继续行动，直到完成选择。</p>
        </aside>
      </footer>
      <section className="reserve" aria-label="功能牌备区">
        <b>
          功能牌备区 {session.state.rewards.reserve.length} /{" "}
          {session.state.ruleset.functionReserveLimit}
        </b>
        {session.state.rewards.reserve.map((card) => (
          <span key={card.id}>
            <button
              onClick={() => {
                setFeature({
                  cardId: card.id,
                  targetCount: featureTargets(card.kind),
                  targets: [],
                });
              }}
            >
              使用 {card.kind}
            </button>
            <button
              onClick={() => {
                apply(discardFeature(session, card.id));
              }}
            >
              弃置
            </button>
          </span>
        ))}
      </section>
      {feature !== null && (
        <section className="feature-target" role="status">
          功能牌目标：还需 {feature.targetCount - feature.targets.length} 格
          <button
            onClick={() => {
              setFeature(null);
            }}
          >
            取消功能牌
          </button>
        </section>
      )}
      {rankReward !== null && (
        <section className="feature-target" role="status">
          点数调整：选择一个未锁定的数字格（{rankReward > 0 ? "+1" : "-1"}）
          <button
            onClick={() => {
              setRankReward(null);
            }}
          >
            取消
          </button>
        </section>
      )}
      {session.state.rewards.pendingRewards.length > 0 &&
        session.state.rewards.activeOffer === null && (
          <section className="reward-panel">
            <b>奖励待处理：{session.state.rewards.pendingRewards[0]}</b>
            <button
              onClick={() => {
                apply(openReward(session));
              }}
            >
              打开奖励候选
            </button>
          </section>
        )}
      {session.state.rewards.activeOffer !== null && (
        <section className="reward-panel" aria-label="奖励选择">
          <b>
            请选择 {session.state.rewards.activeOffer.choicesRemaining} 项奖励
          </b>
          {session.state.rewards.activeOffer.options.map((option) => (
            <button
              key={option.id}
              onClick={() => {
                apply(selectRewardOption(session, option.id));
              }}
            >
              {option.type === "feature"
                ? `${option.card.kind}（${option.card.rarity}）`
                : option.reward}
            </button>
          ))}
        </section>
      )}
      {session.featurePreview !== null && (
        <section className="preview" role="status">
          <b>功能牌预览</b>
          <span>
            {session.featurePreview.cardId} 将作用于{" "}
            {session.featurePreview.targets.length} 格
          </span>
          <button
            onClick={() => {
              apply(executeFeaturePreview(session));
            }}
          >
            确认使用功能牌
          </button>
          <button
            onClick={() => {
              setSession({ ...session, featurePreview: null });
            }}
          >
            取消
          </button>
        </section>
      )}
      {session.state.rewards.activeReroll !== null && (
        <section className="reward-panel" aria-label="重抽候选">
          <b>选择一张重抽候选</b>
          {session.state.rewards.activeReroll.candidates.map((card, index) => (
            <button
              key={`${card.rank}-${card.suit ?? ""}-${String(index)}`}
              onClick={() => {
                apply(selectRerollCandidate(session, index));
              }}
            >
              {card.rank}
              {symbol(card.suit)}
            </button>
          ))}
        </section>
      )}
      {(session.state.rewards.rankAdjustments > 0 ||
        session.state.rewards.redraws > 0) && (
        <section className="reward-panel" aria-label="小奖励使用">
          <b>可用小奖励</b>
          {session.state.rewards.rankAdjustments > 0 && (
            <>
              <button
                onClick={() => {
                  setRankReward(1);
                }}
              >
                点数 +1（{session.state.rewards.rankAdjustments}）
              </button>
              <button
                onClick={() => {
                  setRankReward(-1);
                }}
              >
                点数 -1
              </button>
            </>
          )}
          {session.state.rewards.redraws > 0 && (
            <button
              onClick={() => {
                setRedrawing(true);
              }}
            >
              重抽一张手牌（{session.state.rewards.redraws}）
            </button>
          )}
        </section>
      )}
      {session.selection?.cardId !== undefined && (
        <section className="controls">
          <button
            onClick={() => {
              apply(setNumberMode(session, "face"));
            }}
          >
            正面
          </button>
          <button
            onClick={() => {
              apply(setNumberMode(session, "back"));
            }}
          >
            背面
          </button>
          {inks.map((ink) => (
            <button
              key={ink}
              onClick={() => {
                apply(chooseWildcardInk(session, ink));
              }}
            >
              {ink}
            </button>
          ))}
        </section>
      )}
      {session.preview !== null && (
        <section className="preview" role="status">
          <b>落点预览</b>
          <span>
            分数 {session.preview.before.score} ⇒ {session.preview.after.score}
          </span>
          <span>
            {session.preview.risks.length === 0
              ? "无结构风险"
              : session.preview.risks.join(" · ")}
          </span>
          <button
            disabled={!session.preview.result.ok}
            onClick={() => {
              apply(executePreview(session));
            }}
          >
            确认落牌
          </button>
          <button
            onClick={() => {
              apply(cancelPreview(session));
            }}
          >
            取消
          </button>
        </section>
      )}
    </main>
  );
}

function Settlement({
  session,
  onNew,
}: Readonly<{ session: GameSession; onNew: () => void }>) {
  const settlement = session.settlement;
  const review = reviewSession(session);
  return (
    <main className="settlement">
      <small>织花牌 · 本局结算</small>
      <h1>{settlement?.rating ?? "D"} 评级</h1>
      <p>
        总分 {settlement?.total ?? 0} · 组分 {settlement?.groupScore ?? 0} ·
        惩罚 {settlement?.penalty ?? 0}
      </p>
      <p>Seed：{session.state.seed}</p>
      <section aria-label="Session review">
        <h2>Session review</h2>
        <p>Boards completed: {review.completedBoards} · Crown: {review.crownConnected ? "connected" : "not connected"}</p>
        <p>Markers: {review.markersCollected} · Reserve cards: {review.reserveCards} · Actions left: {review.actionsRemaining}</p>
        <p>Feature cards used: {review.featureCardsUsed} · Overload previews: {review.overloadedPreviews} · Bust previews: {review.bustPreviews} · Risky previews canceled: {review.riskyPreviewsCanceled}</p>
      </section>
      <button onClick={onNew}>开始下一局</button>
    </main>
  );
}

function featureTargets(
  kind: GameSession["state"]["rewards"]["reserve"][number]["kind"],
): number {
  return kind === "swap-ink" || kind === "swap-number" || kind === "sever-ink"
    ? 2
    : 1;
}
function symbol(suit: Suit | undefined): string {
  return suit === "spades"
    ? "♠"
    : suit === "hearts"
      ? "♥"
      : suit === "diamonds"
        ? "♦"
        : "♣";
}
