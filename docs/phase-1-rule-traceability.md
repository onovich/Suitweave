# Suitweave Phase 1 规则追踪

历史 GDD《三盘连彩》是规则来源；当前产品名称为“织花牌 / Suitweave”。下表覆盖 Phase 1 已纳入的规则，不包含奖励流程、功能牌、完整回合或 UI。

| GDD | 规则 | 实现 | 证明 |
| --- | --- | --- | --- |
| 附录 | 7x7、24 回合、抽 6 用 3、四墨色、2-5 数字组、备牌/奖励默认值 | `ruleset.ts` | `game-state.test.ts` |
| 4.3-4.4 | 三盘与数字/墨色/标记/锁定层 | `types.ts`、`game-state.ts` | `game-state.test.ts` |
| 5.1 | 四向同墨连通、空墨桥、0/1/2-5/6+ 分类 | `connectivity.ts` | `connectivity.test.ts` |
| 6.1-6.2、15 | 数字正反面、纯墨、万能色选择、覆盖、锁定拒绝 | `transitions.ts` | `transitions.test.ts` |
| 8.1 | 2-5 张德扑牌型、A 低位与 10-J-Q-K-A | `scoring.ts` | `scoring.test.ts` |
| 8.2 | 21 点、A 1/11、黑杰克、五龙、爆点 | `scoring.ts` | `scoring.test.ts` |
| 8.3 | 三消同点、连号、集合最高模式 | `scoring.ts` | `scoring.test.ts` |
| 5.2、5.3、8、8.4 | 提交资格、锁定、未完成惩罚、完成奖励输入、D-SS | `analysis.ts`、`settlement.ts` | `analysis.test.ts`、`submission.test.ts` |
| 架构文档 | 可重放 seed、预览与执行同源 | `rng.ts`、`api.ts` | `rng.test.ts`、`api.test.ts` |

待后续阶段实现：抽 6 用 3 的完整用例、皇冠/小标记奖励流程、功能牌、存档和 UI。它们不得复制 Phase 1 的规则转换或计分逻辑。
