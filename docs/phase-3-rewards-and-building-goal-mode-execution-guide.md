# Suitweave Phase 3：奖励与构筑 Goal 模式执行指南

日期：2026-07-11  
状态：READY，供程序开发执行者使用  
轮次预算：7 轮（1-5 主实现，6 缓冲修复，7 最终验证）

## 0. 直接给执行者的 Goal Prompt

在 `D:\WebProjects\Suitweave` 执行 Phase 3“奖励与构筑”：基于已验收的规则内核与可玩垂直切片，实现皇冠连接、首次小标记、灵感条、完成/皇冠 6 选 3、灵感 3 选 1、最多 9 张功能牌备区，以及首版六张功能牌（换墨、换数、点数 +1、点数 -1、单格重抽、隔断），让奖励真实改变后续决策并保持 fixed-seed 可重放。每轮必须 Debug 自检、架构自检、验证、精确提交和 push，成功后才推进。使用 `$donextgoal`；不进入 Phase 4 教程与表现打磨。

## 1. 必读上下文

- `AGENTS.md`
- `docs/architecture.md`
- `docs/engineering-standards.md`
- `docs/product-and-ui-design.md`
- `docs/domain-contracts.md`
- `docs/phase-2-playable-vertical-slice-validation-report.md`
- GDD 第 6.3、9、10、11、12、15、17、19 节
- 本指南

已接受规则：每局仅一盘两个皇冠，连入同一同墨连通域时一次性触发；每盘 3-5 个小标记，首次着墨收集；每 3 个标记灵感条满；完成/皇冠为 6 选 3，灵感为 3 选 1；功能牌备区上限 9；功能牌消耗本回合一次行动。

低优先级选择：Phase 3 实现 GDD 首版六张功能牌；小奖励先实现补色、微调、换手、小分四种，预见/保留延后；奖励候选与重抽全部由 session seed 派生，进入命令日志。

## 2. 本阶段要完成什么

- 版本化扩展状态与命令：皇冠/标记状态、灵感计数、奖励待选队列、备牌区、功能牌命令与事件。
- 标准局生成器确定性放置一对皇冠和每盘 3-5 个小标记，满足距离与分散约束。
- 皇冠连接、标记首次着墨、灵感阈值与溢出、一次性触发和锁盘边界。
- 完成/皇冠高奖励池与灵感小奖励池；候选、稀有度和选择结果可重放。
- 备牌区最多 9 张，6 选 3的逐项选择/确认以及超限时明确弃牌流程。
- 六张功能牌的目标校验、执行、消耗与预览：换墨、换数、+1、-1、单格重抽、隔断。
- 四种小奖励：补色、微调、换手、小分；明确即时与延迟生效边界。
- UI：皇冠/标记视觉层、灵感条、奖励选择、备牌区、功能牌目标流程与结算贡献。
- 固定 seed 领域/应用/UI 回归与 Chromium E2E 奖励路径。

## 3. 本阶段不做什么

- 不实现双色刷、双格重抽、邻摹、三调律、三格重抽、万能落点、临时复制等后续功能牌。
- 不实现预见/保留小奖励、角色、遗物、长期成长、商店或局外构筑。
- 不实现教程、完整动效/音效、遥测、存档、每日挑战或 Electron。
- 不修改既有计分表、抽 6 用 3和完成语义；奖励不能在 UI 层自行判定。
- 不允许奖励弹窗绕过 application 命令或直接修改 `GameState`。

## 4. 每轮固定工作流

每轮回复必须包含：目标、完成内容、Debug 自检、架构自检、验证命令和结果、commit hash/push、下一轮、缓冲轮消耗情况。

门禁：验证失败、提交失败或 push 失败均不得推进。只暂存本轮路径。最低运行相关测试、`pnpm typecheck`、`pnpm arch:check`；公共契约/完整路径变化运行 `pnpm validate`；UI 变化运行 Playwright smoke 并保存可重复证据。

## 5. Debug 与架构自检

### Debug 自检

- 最小 fixed-seed 皇冠路径、单标记或单张功能牌能否解释状态变化？
- 失败能否定位到生成、触发检测、奖励队列、目标校验、domain transition、application orchestration 或 UI？
- 是否覆盖未触发、重复触发、溢出、锁盘、备区满、候选过期、目标无效和奖励待处理状态？
- 奖励选择/重抽能否由 seed 与命令日志重放？非法命令是否零修改？
- UI 变化是否有组件测试和 Chromium smoke？

### 架构自检

- `GameState/Ruleset` 是否仍是规则事实来源，触发事件是否由 domain 产生？
- application 是否只编排奖励待选状态，UI 是否只发送意图？
- 基础行动牌与功能牌是否共用行动预算但保持牌源/生命周期分离？
- 奖励候选 RNG 是否可注入/重放，无 `Math.random()`？
- 是否保持 `ui -> application -> domain` 且未拉入 Phase 4-6？
- 是否保留无关文件与用户改动？

## 6. 分轮安排

### Round 1：奖励领域契约与生成标记

扩展版本化契约、命令/事件和 ruleset 参数；生成一盘两皇冠、每盘 3-5 标记，满足曼哈顿距离与分散约束。若改变公共规则语义，新增 ADR/追踪。

PASS：多 seed 约束不变量、序列化/重放和既有 99 项回归全绿；`pnpm validate` 通过。

### Round 2：触发检测与奖励队列

实现皇冠同域一次触发、标记首次着墨、灵感阈值/溢出、完成奖励入队和“奖励待处理时阻止继续行动”的清晰状态机。

PASS：覆盖重复、覆盖后不重触发、提交边界、一次行动多触发的稳定排序；非法/过期选择零修改。

### Round 3：奖励池、选择与备牌区

实现高奖励 6 选 3、灵感 3 选 1、稀有度权重、备区上限 9与超限弃牌；实现补色、微调、换手、小分。

PASS：同 seed 候选一致；选择/弃牌命令可重放；候选唯一且符合池约束；完整 `pnpm validate` 通过。

### Round 4：首版六张功能牌

实现换墨、换数、+1、-1、单格重抽、隔断的结构化目标选择、预览、执行、消耗和事件。A/K 环回、锁盘、0-2 目标、墨色与数字层分离均需测试。

PASS：每牌成功/失败/边界测试；功能牌消耗一次行动且只在成功后移出备区；重抽 deterministic；预览/执行同源。

### Round 5：奖励与构筑 UI/E2E

实现皇冠/标记视觉层、灵感条、奖励选择、备牌区、超限弃牌、功能牌目标流程和结算剩余功能牌分；危险/稀有度不能只靠颜色表达。

PASS：键盘与点击可走完整奖励路径；44px 触控目标；Chromium E2E 覆盖皇冠或灵感触发、选奖励、用功能牌、回合推进；JS gzip 仍 <250KB。

### Round 6：缓冲修复轮

只修复重复触发、奖励顺序、备区溢出、目标状态机、重放、UI 无障碍或 E2E 稳定性问题；无问题则不制造功能。

PASS：所有修复有回归；无 Phase 4 内容或延后卡牌混入。

### Round 7：最终验证与交接

运行 `pnpm validate`、`pnpm test:e2e`、fixed-seed 奖励重放、架构/平台 API 扫描、`git diff --check`、包体与工作区/远端检查；写 Phase 3 报告并更新 roadmap。

PASS：奖励构筑闭环可玩；所有门禁通过；最终提交推送 `origin/main`；回报 planner 请求 `$checkandgoal`，不得进入 Phase 4。

## 7. 总体 PASS 标准

- 皇冠、标记、灵感、三类奖励队列、备牌区与六张功能牌在完整局中可用。
- 所有触发一次性、可重放、可预览；奖励与功能牌遵守行动和锁盘边界。
- UI 不复制规则，奖励待处理/超限/目标状态清楚；键盘与触摸基线成立。
- 既有 99 项测试无回归，新测试、E2E、架构、构建、扫描和包体门禁全绿。
- Phase 4+ 范围未进入；每轮 commit/push 可追溯且最终工作区干净。

## 8. 最终报告模板

```text
Phase: 3 奖励与构筑
Status: PASS | BLOCKED
Rounds used: n/7（buffer consumed: yes/no）
Delivered:
- ...
Debug self-check:
- ...
Architecture self-check:
- ...
Validation:
- pnpm validate: ...
- pnpm test:e2e: ...
- fixed-seed reward replay: ...
- architecture/platform scans: ...
Deferred cards/rewards:
- ...
Commits pushed:
- hash: summary
Final branch state:
- ...
Return:
- 请 planner 使用 $checkandgoal 验收 Phase 3；未通过前不要进入 Phase 4。
```

