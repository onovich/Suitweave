import { useMemo, useState } from 'react';
import { chooseWildcardInk, endTurn, executePreview, previewPlacement, selectCard, sessionViewModel, setNumberMode, startSession, submitBoard, type GameSession } from '../application';

const inks = ['red', 'blue', 'green', 'purple'] as const;

export function App() {
  const [session, setSession] = useState<GameSession>(() => startSession(20260711));
  const [activeBoard, setActiveBoard] = useState(0);
  const boards = useMemo(() => sessionViewModel(session), [session]);
  const apply = (result: ReturnType<typeof endTurn>) => { setSession(result.session); };
  const select = (cardId: string) => { apply(selectCard(session, cardId)); };
  const preview = (boardIndex: number, cellIndex: number) => {
    const board = boards[boardIndex];
    const cell = board?.cells[cellIndex];
    if (board === undefined || cell === undefined) return;
    apply(previewPlacement(session, board.id, cell.id));
  };
  if (session.status === 'settled') return <Settlement session={session} onNew={() => { setSession(startSession(session.state.seed + 1)); }} />;
  return <main>
    <header><div><small>织花牌 · SUITWEAVE</small><h1>把牌织进颜色，把选择留给三盘。</h1></div><div className="round">回合 {session.turn.round} / {session.state.ruleset.roundLimit}<br/><b>行动 {session.turn.actionsRemaining}</b></div></header>
    <nav aria-label="棋盘切换" className="board-tabs">{boards.map((board, index) => <button aria-pressed={index === activeBoard} key={board.id} onClick={() => { setActiveBoard(index); }}>{board.title} · {board.score}</button>)}</nav>
    <section className="boards">{boards.map((board, boardIndex) => <article className={boardIndex === activeBoard ? 'active-board' : ''} key={board.id}><h2>{board.title}<span>{board.score} 分 · {board.invalidNumberCount} 个警告</span></h2><p className="board-state">{board.locked ? '已锁定' : board.canSubmit ? '可提交' : '继续织入有效组'}</p><div className="grid">{board.cells.map((cell, cellIndex) => <button aria-label={`${board.title} 格子 ${String(cellIndex + 1)} ${cell.label}`} className={`cell ink-${cell.ink ?? 'none'}`} disabled={cell.locked} key={cell.id} onClick={() => { preview(boardIndex, cellIndex); }} onFocus={() => { preview(boardIndex, cellIndex); }}>{cell.label}</button>)}</div>{board.canSubmit && <button className="submit" onClick={() => { apply(submitBoard(session, board.id)); }}>提交并锁定</button>}</article>)}</section>
    <footer><section><small>本回合手牌 · 选择一张，再选择落点</small><div className="hand">{session.turn.hand.map((card) => <button aria-pressed={session.selection?.cardId === card.id} className={`card ${card.kind}`} disabled={session.turn.usedCardIds.includes(card.id)} key={card.id} onClick={() => { select(card.id); }}>{card.kind === 'number' ? `${card.card.rank}${card.card.suit === 'spades' ? '♠' : card.card.suit === 'hearts' ? '♥' : card.card.suit === 'diamonds' ? '♦' : '♣'}` : card.kind === 'ink' ? '墨色' : '万能'}<small>{card.kind === 'wildcard' ? '选色' : card.ink}</small></button>)}</div></section><aside><button onClick={() => { apply(endTurn(session)); }}>结束回合</button><p>功能牌与奖励将于后续阶段开放。</p></aside></footer>
    {session.selection?.cardId !== undefined && <section className="controls"><button onClick={() => { apply(setNumberMode(session, 'face')); }}>正面</button><button onClick={() => { apply(setNumberMode(session, 'back')); }}>背面</button>{inks.map((ink) => <button key={ink} onClick={() => { apply(chooseWildcardInk(session, ink)); }}>{ink}</button>)}</section>}
    {session.preview !== null && <section className="preview" role="status"><b>落点预览</b><span>分数 {session.preview.before.score} → {session.preview.after.score}</span><span>{session.preview.risks.length === 0 ? '无结构风险' : session.preview.risks.join(' · ')}</span><button disabled={!session.preview.result.ok} onClick={() => { apply(executePreview(session)); }}>确认落牌</button><button onClick={() => { setSession({ ...session, preview: null }); }}>取消</button></section>}
  </main>;
}

function Settlement({ session, onNew }: Readonly<{ session: GameSession; onNew: () => void }>) {
  const settlement = session.settlement;
  return <main className="settlement"><small>织花牌 · 本局结算</small><h1>{settlement?.rating ?? 'D'} 评级</h1><p>总分 {settlement?.total ?? 0} · 组分 {settlement?.groupScore ?? 0} · 惩罚 {settlement?.penalty ?? 0}</p><p>Seed：{session.state.seed}</p><button onClick={onNew}>开始下一局</button></main>;
}
