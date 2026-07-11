# Suitweave Phase 2：可玩垂直切片 Goal 模式执行指南

日期：2026-07-11  
状态：READY，供程序开发执行者使用  
轮次预算：10 轮（1-8 主实现，9 缓冲修复，10 最终验证）

## 0. 直接给执行者的 Goal Prompt

在 `D:\WebProjects\Suitweave` 中执行 Phase 2“可玩垂直切片”：在不改变 Phase 1 领域事实来源的前提下，新增 application 用例与 React UI，完成可从固定 seed 开始、三盘同时可知、每回合抽 6 用 3、数字牌正反面、落点预览、执行、结束回合、提交锁定、24 回合结算的一整局最小可玩体验。严格逐轮执行；每轮必须 Debug 自检、架构自检、验证、精确提交并 push，成功后才进入下一轮。使用 `$donextgoal`；不实现 Phase 3 奖励/功能牌系统。

## 1. 必读上下文

- `AGENTS.md`
- `docs/architecture.md`
- `docs/engineering-standards.md`
- `docs/product-and-ui-design.md`
- `docs/domain-contracts.md`
- `docs/phase-1-rules-core-validation-report.md`
- `docs/sanpan_liancai_gdd_v0.1.pdf` 第 3、4、6、7、8、11、13、15、17、19 节
- 本指南

已接受共识：正式产品名为“织花牌 / Suitweave”；标准局 7x7、24 回合、抽 6 用 3；预览与执行必须走同一领域转换；键鼠与触摸共享“选牌 -> 预览 -> 确认”状态机。

本阶段低优先级选择：初始局面采用可重放的约束生成器；奖励触发仅展示“后续阶段”占位，不发功能牌；当三盘全部提交或回合耗尽时进入结算。

## 2. 本阶段要完成什么

- `src/application/`：开始局、抽牌、选牌模式、预览、执行、结束回合、提交、结算用例。
- 可重放的标准局生成：三张 7x7 棋盘、每盘 12-16 初始数字、基础密度约束；本阶段不生成皇冠/小标记奖励流程。
- 基础牌池：数字牌、墨色牌、低概率万能墨色牌；每回合抽 6、最多行动 3，未使用基础牌弃置。
- 一张数字牌正面落数字+花色+墨色，背面仅落墨色；万能牌先选择基础墨色。
- 三盘 UI、盘状态摘要、手牌、回合/行动数、连通组与分数、警告、提交与结算。
- 落点前后差异预览：目标域、组规模、得分变化、落单/过载/爆点/破坏有效组警告。
- 桌面三盘横排；窄屏单盘分页；键盘、点击、触摸均可完成核心流程。
- Vitest 应用/UI 集成测试与 Playwright 一整局关键路径 smoke；固定 seed 回归。

## 3. 本阶段不做什么

- 不实现皇冠、灵感条、奖励选择、功能牌备区逻辑；UI 可保留禁用占位。
- 不实现存档、遥测、音频、高级动画、教程、每日挑战、排行榜或 Electron。
- 不调整 Phase 1 计分表与完成语义，除非发现真实缺陷并以回归测试和 ADR/规则追踪记录。
- UI 不复制连通、计分、完成或预览规则；application 不依赖 React；domain 不依赖 application/UI/platform。
- 不以拖拽作为唯一输入方式，不以颜色作为唯一状态表达。

## 4. 每轮固定工作流

每轮回复必须包含：本轮目标、完成内容、Debug 自检、架构自检、验证命令与结果、commit hash 与 push 结果、下一轮目标、是否消耗缓冲轮。

推进门禁：验证失败不得提交/推进；提交或 push 失败不得推进。只暂存本轮相关路径。每轮最低运行相关测试、`pnpm typecheck`、`pnpm arch:check`；公共契约或完整用户路径变化必须运行 `pnpm validate`。UI 变化必须有可重复截图或 Playwright smoke 证据。

## 5. Debug 与架构自检

### Debug 自检

- 最小固定 seed、单回合或单次“选牌 -> 预览 -> 执行”能否解释变化？
- 失败能否定位到 domain、application orchestration、generator、view-model、UI input state 或 E2E？
- 是否覆盖成功、非法、空手、无行动、过期预览、锁定盘、回合耗尽、三盘完成状态？
- 预览是否由当前状态与当前手牌实时计算，执行后旧预览是否失效？
- UI 变化是否由自动化 smoke 和键盘/触摸手工路径重复验证？

### 架构自检

- `GameState / Ruleset` 是否仍为规则事实来源，application 只编排？
- UI 是否只消费 view-model 并发送意图，没有复制规则或直接构造非法领域状态？
- RNG、生成、抽牌是否由可注入 seed 驱动且可重放？
- `ui -> application -> domain` 依赖方向、无循环约束是否保持？
- 是否避免拉入 Phase 3 奖励、Phase 4 教程和 Phase 6 平台范围？
- 无关文件、生成输出与用户改动是否保持不变？

## 6. 分轮安排

### Round 1：应用状态与用例契约

冻结 `GameSession / TurnState / HandCard / Selection / Preview` 应用类型，定义开始局、执行行动、结束回合、提交、结算用例。application 只调用 domain 公共 API。

PASS：契约测试覆盖合法/非法状态；dependency-cruiser 明确 application 不依赖 UI/platform；`pnpm validate` 通过。

### Round 2：标准局约束生成器

实现固定 seed 三盘初始数字生成，满足数量、象限、2x2 密度和基本分散约束；生成结果可序列化重放。

PASS：多 seed 不变量测试通过；相同 seed 完全一致；失败可定位并有有界重试，不出现无限循环。

### Round 3：基础牌池与回合状态机

实现数字/墨色/万能墨色基础牌池、抽 6、最多行动 3、牌使用一次、结束回合弃置、24 回合结束和三盘全锁提前结束。

PASS：概率与牌面采用 seed RNG；回合边界、无行动、第三次行动、重复用牌与结束状态均有测试。

### Round 4：选择、正反面、万能墨色与同源预览

实现应用输入状态机，将正面/背面/万能颜色选择映射为 Phase 1 Command；预览含前后分析差异和结构化风险，不用字符串承载业务语义。

PASS：过期预览不可执行；预览/执行结果同源；锁定盘和非法目标零修改；完整 `pnpm validate` 通过。

### Round 5：三盘与状态摘要 UI

把现有静态原型改为真实 session view-model：三盘格子、数字/花色/墨色、当前分、落单/过载/爆点、可提交/锁定、回合与行动数。组件不读取领域内部实现。

PASS：三盘状态同时可知；基本键盘焦点与 44px 触控目标；组件测试覆盖空/有效/危险/锁定状态。

### Round 6：手牌与完整行动交互

实现选牌、数字牌翻面、万能颜色选择、格子悬停/聚焦预览、确认落牌和取消；桌面点击与键盘为基线，拖拽可选但不能替代基线。

PASS：每种基础牌可完成行动；风险同时有图标/文案/边框；预览与实际结果的 UI 集成测试一致。

### Round 7：提交、回合推进与结算 UI

实现提交确认、锁定展示、结束回合、回合耗尽/三盘完成结算，展示逐盘分、惩罚、总分、评级和 seed；新局可用新 seed 或复用 seed。

PASS：提交不可逆提示清晰；锁定盘不响应；完整一局无死路；不发 Phase 3 奖励。

### Round 8：响应式、E2E 与体验闭环

引入 Playwright；宽屏验证三盘横排，窄屏验证单盘分页与状态摘要。建立固定 seed 的“开始 -> 正反面行动 -> 预览 -> 结束回合 -> 提交/结算”关键路径 smoke，并记录截图。

PASS：Chromium E2E 稳定；键盘核心路径通过；无横向不可控溢出；初始压缩 JS <250KB（不含测试/音频）。

### Round 9：缓冲修复轮

只修复前八轮暴露的状态不同步、规则复制、响应式、无障碍、E2E 不稳定或性能问题；无需修复则不制造功能。

PASS：每个缺陷有回归证据；未引入 Phase 3 内容。

### Round 10：最终验证与交接

运行 `pnpm validate`、Playwright smoke、固定 seed 重放、架构/平台 API 扫描、`git diff --check`、生产包体检查和工作区/远端同步检查；写 Phase 2 验证报告并更新 roadmap。

PASS：可独立完整玩一局；所有门禁全绿；最终提交推送 `origin/main`；向 planner 回报并请求 `$checkandgoal`，不得自行进入 Phase 3。

## 7. 总体 PASS 标准

- 标准局可从 seed 开始并完成到结算，抽 6 用 3、正反面、预览、覆盖、提交锁定有效。
- 预览与执行同源；三盘规则均来自 Phase 1 domain；application/UI 无规则复制。
- 桌面与窄屏核心路径可用；键盘与触摸基线成立；危险信息不只依赖颜色。
- 应用/UI 测试、81 项既有领域回归、Playwright smoke、架构检查、构建和固定 seed 重放全部通过。
- Phase 3 奖励/功能牌未实现；工作区干净；每轮 commit/push 可追溯。

## 8. 最终报告模板

```text
Phase: 2 可玩垂直切片
Status: PASS | BLOCKED
Rounds used: n/10（buffer consumed: yes/no）
Delivered:
- ...
Debug self-check:
- ...
Architecture self-check:
- ...
Validation:
- pnpm validate: ...
- Playwright smoke: ...
- fixed-seed replay: ...
- architecture/platform scans: ...
Known UX/rule limitations:
- ...
Commits pushed:
- hash: summary
Final branch state:
- ...
Return:
- 请 planner 使用 $checkandgoal 验收 Phase 2；未通过前不要进入 Phase 3。
```

