const boards = ['德扑盘', '21 点盘', '三消盘'] as const;

export function App() {
  return <main><header><div><small>织花牌 · SUITWEAVE</small><h1>把牌织进颜色，把选择留给三盘。</h1></div><div className="round">回合 1 / 24<br/><b>行动 3</b></div></header><section className="boards">{boards.map((name, board) => <article key={name}><h2>{name}<span>0 分 · 14 个落单</span></h2><div className="grid">{Array.from({length:49},(_,cell)=><button aria-label={`${name}格子${String(cell + 1)}`} className={(cell+board*3)%11===0?'number':''} key={cell}>{(cell+board*3)%11===0?['A','7','K'][board]:''}</button>)}</div></article>)}</section><footer><div><small>本回合手牌 · 选择一张，再选择落点</small><div className="hand">{['7♠','蓝墨','Q♥','紫墨','万能','3♣'].map(card=><button key={card}>{card}</button>)}</div></div><aside><small>功能牌备区 0 / 9</small><p>悬停格子以预览连通、组分与风险。</p></aside></footer></main>;
}
