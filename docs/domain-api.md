# Suitweave 领域 API

`src/domain/index.ts` 是 Phase 1 对外唯一入口。它只接受领域数据并返回领域数据；不依赖 React、DOM、Node、Electron、存储或网络。

| API | 用途 |
| --- | --- |
| `createGameState(seed, ruleset?)` | 创建含三张标准棋盘的确定性初态。 |
| `runCommand(state, command)` | 执行一次领域命令，返回新状态与事件；非法命令保留原状态引用。 |
| `previewCommand(state, command)` | 与执行使用同一转换函数，供 Phase 2 临时预览调用。 |
| `replayCommands(initial, commands)` | 从初态按顺序重放命令，收集每步结果和事件。 |
| `analyzeBoard` / `analyzeGame` | 读取连通、有效性、组分及提交资格。 |
| `calculateSettlement` / `calculateRating` | 以分析结果和显式奖励输入计算结算与评级。 |

命令不直接接收 UI 事件。`place-card` 区分正面数字与背面纯墨，`place-ink` 表示普通或万能墨色落点，`submit-board` 只在可提交时锁定棋盘。
