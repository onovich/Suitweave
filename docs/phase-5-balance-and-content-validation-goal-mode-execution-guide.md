# Suitweave Phase 5：平衡与内容验证 Goal 模式执行指南

日期：2026-07-11  
状态：READY，供程序开发执行者使用  
轮次预算：7 轮（1-4 自动化与基线，5 真实玩家检查点，6 调参/缓冲，7 最终验证）

## 0. 直接给执行者的 Goal Prompt

在 `D:\WebProjects\Suitweave` 执行 Phase 5“平衡与内容验证”：建立可重放的批量模拟、版本化平衡参数、数据导出/汇总和真实玩家测试工作流，验证标准局 20-30 分钟、完成率、皇冠触发、过载/爆点修复、功能牌使用与回合余量，并只依据可追溯证据做窄调参。每轮必须 Debug/架构自检、验证、精确提交与 push。使用 `$donextgoal`。真实玩家证据不可由模型或模拟替代；没有样本时必须停在 `AUTOMATED_READY / BLOCKED_FOR_PLAYER_DATA`，不得宣称 Phase 5 最终 PASS，也不得进入 Phase 6。

## 1. 必读上下文

- `AGENTS.md`
- `docs/architecture.md`
- `docs/engineering-standards.md`
- `docs/phase-4-onboarding-and-experience-validation-report.md`
- `docs/phase-4-player-test-template.md`
- GDD 第 4.2、5、7.2、8、10、12、12.1、13、17.3、19、20 节
- 本指南

目标假设：新手平均完成 1.5-2.2 盘、熟练 2.6-3.0；皇冠触发 40%-65%；标准局 20-30 分钟；完成三盘后剩余超过 5 回合通常说明偏易。真实样本不足时不得把这些写成结论。

## 2. 本阶段要完成什么

- 可调参数集中到版本化 balance profile，保留 `Ruleset v1` 兼容与旧 seed 复现说明。
- headless 固定 seed 策略 harness：随机合法、完成优先、分数优先三类明确非人类策略。
- 批量结果：完成盘数、分数/评级、皇冠、标记、功能牌、过载/爆点/修复、回合数和失败原因。
- 基线报告、分布/置信区间、异常 seed 清单和可重放命令；禁止只报均值。
- 真实玩家测试包：匿名编号、任务、计时、问卷、观察表、数据录入和隐私边界。
- 玩家数据导入/校验；模拟与玩家数据严格分栏，不上传身份信息。
- 只在证据支持时窄调 1-3 个高影响参数，每项带前后报告与平衡记录。
- 冻结代表 seed：教学、标准、皇冠困难、过载恢复、爆点恢复、奖励构筑。

## 3. 本阶段不做什么

- 不把 bot/模型行为当作新手或熟练玩家结论。
- 不在无真实玩家证据时宣称局长、理解率或完成率目标已达成。
- 不做在线遥测、账户、云上传、排行榜、每日挑战、存档或 Electron。
- 不新增角色、遗物、牌型、功能牌或关卡内容；只验证/窄调现有标准局。
- 不让分析工具进入 runtime 规则路径，不用 UI 复制规则。

## 4. 每轮固定工作流

每轮必须报告：目标、交付、Debug/架构自检、样本/seed/策略、验证命令、前后数据、commit/push、下一轮、缓冲消耗。验证/提交/push 失败不得推进。调参前后分别保存可重放基线。

## 5. Debug 与架构自检

### Debug 自检

- 单 seed/单策略能否复现异常，失败能否定位到 simulator、policy、schema、aggregator、import validator 或 runtime？
- 是否覆盖无合法动作、奖励待处理、锁盘、回合耗尽、异常长局和无效/重复玩家记录？
- 批量结果是否记录 commit、profile、seed、策略和命令？
- 玩家导入是否拒绝缺失、重复、越界与个人信息字段？
- 调参是否有反例 seed 和回归测试？

### 架构自检

- simulator 是否调用 application/domain 公共接口而非另写规则？
- balance profile 是否版本化且单一入口注入，无散落魔法数字？
- runtime 是否不依赖分析/导入工具？
- 模拟、真实玩家和人工观察是否明确分离？
- 是否避免 Phase 6 Electron/发布与新玩法范围？
- 无关文件和用户数据是否不提交？

## 6. 分轮安排

### Round 1：平衡配置与结果契约

建立版本化 balance profile、run manifest、result schema 和冻结 seed catalog。

PASS：默认值与当前游戏一致；旧回归全绿；schema/兼容文档通过；`pnpm validate` PASS。

### Round 2：Headless 策略与批量模拟

实现三类非人类策略、批量 runner、超时/步数上限和单 seed 重放。

PASS：相同 manifest 结果一致；策略不读取私有状态作弊；异常可复现。

### Round 3：基线统计与异常审计

运行 deterministic seed 样本，输出分布、分位数、完成率、皇冠、风险修复、功能牌和余回合，审计异常 seed。

PASS：报告含样本数/策略/commit/profile；原始匿名结果可重算；不作玩家推断。

### Round 4：真实玩家测试与导入工具

完善协议和匿名模板，建立离线导入/校验/汇总，生成测试 build 与主持说明。

PASS：fixture 明确标记为虚构；隐私字段白名单；模拟/玩家不可混算；`pnpm validate`、E2E PASS。

### Round 5：真实玩家检查点

使用真实参与者执行测试并导入匿名结果。建议最低 5 名首次玩家；稳定平衡结论建议 12+ 并分开熟练度。执行者不得生成玩家数据。

PASS：有来源明确的匿名真实样本和观察；否则必须标记 `BLOCKED_FOR_PLAYER_DATA`，提交自动化就绪报告，回报 planner/user 并停止 Phase 6。

### Round 6：证据驱动调参或缓冲

只有 Round 5 有真实证据时，最多调整 1-3 个参数，运行相同模拟 seed 并安排必要复测；无证据不改参数。

PASS：每项变化有假设、玩家证据、模拟反例、前后比较和回归，无目标数字过拟合。

### Round 7：最终验证与交接

运行 `pnpm validate`、`pnpm test:e2e`、模拟重放、schema/隐私扫描、架构检查、`git diff --check`、包体和远端检查；写 Phase 5 报告与数据来源清单。

PASS：自动门禁全绿且真实玩家证据支持结论；否则明确 `BLOCKED_FOR_PLAYER_DATA`。只有 PASS 才请求 planner `$checkandgoal` 并允许规划 Phase 6。

## 7. 总体 PASS 标准

- profile、模拟器、schema、冻结 seed、玩家测试/导入工作流可复现。
- 模拟与真实玩家数据严格区分，能追溯 commit/profile/seed/样本。
- 有真实玩家证据支持核心理解与局长判断，结论不超出样本能力。
- 调参有限且证据驱动，既有 121 项回归和体验门禁无退化。
- Phase 6 与新玩法未进入；工作区干净、提交均已推送。

## 8. 最终报告模板

```text
Phase: 5 平衡与内容验证
Status: PASS | BLOCKED_FOR_PLAYER_DATA | FAIL
Rounds used: n/7
Automation baseline:
- commit/profile/seeds/policies/sample size/results
Real-player evidence:
- participant count/source/tasks/results/limitations
Balance changes:
- parameter/before/after/evidence/retest
Debug and architecture self-check:
- ...
Validation:
- validate/e2e/simulation/schema/privacy/scans
Commits pushed:
- ...
Return:
- PASS 时请求 planner 使用 $checkandgoal；BLOCKED 时请求用户安排真实玩家测试，不进入 Phase 6。
```

