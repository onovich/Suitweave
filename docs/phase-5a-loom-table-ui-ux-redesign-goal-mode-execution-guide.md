# Phase 5A 三盘织局 UI/UX 重构 Goal 模式执行指南

日期：2026-07-13  
状态：供执行者使用的独立 UI/UX 重构阶段；Phase 5 真实玩家数据检查点继续保持阻塞  
轮次预算：10 轮（1–7 主实现，8–9 缓冲修复，10 最终验证）

## 0. 直接给执行者的 Goal Prompt

在 `D:\WebProjects\Suitweave` 执行 Phase 5A。完整阅读本指南与 `docs/suitweave-ui-ux-redesign-contract.md`，以固定 seed `20260711` 重构现有可玩界面的视觉层次和“选牌 → 试织 → 确认”交互。不得改变领域规则、奖励语义、计分、seed 或 preview/execution 同源路径，不得伪造玩家数据，不得进入 Phase 6。每轮必须完成 Debug 自检、架构自检、相关验证、聚焦提交并推送；验证或推送失败不得进入下一轮。最终必须提交五档同状态 after 截图、交互证据和量化审美评分。

## 1. 必读上下文

- `AGENTS.md`
- `docs/suitweave-ui-ux-redesign-contract.md`
- `docs/product-and-ui-design.md`
- `docs/architecture.md`
- `docs/engineering-standards.md`
- `docs/phase-4-onboarding-and-experience-validation-report.md`
- `docs/phase-5-balance-and-content-validation-report.md`
- `src/ui/App.tsx`、`src/ui/styles.css`、`src/ui/accessibility.css`、`src/ui/motion.css`
- `C:\Users\Administrator\.codex\skills\design-by-gpt\references\review-rubric.md`

基线：`docs/visual-evidence/designbygpt-baseline/`。必须从相同 seed、回合和交互状态复现，不得用不同内容掩盖布局问题。

## 2. 本阶段要完成什么

- 建立 Loom Table 语义 tokens、页面织机框架与明确的主盘/摘要盘层级。
- 把教程与声音降为辅助工具，不与主任务争夺首屏焦点。
- 将手牌、牌面/墨色选择、试织结果、确认/取消整合为一个连贯行动坞。
- 建立格子的墨色、连通、牌面、标记/状态四层视觉模型；连接丝线只渲染 application/domain 已给出的状态，不推导规则。
- 把内部风险词转换为玩家可读文案与非颜色线索。
- 修复 `onFocus` 改变预览状态的问题；添加 Esc 取消与键盘路径回归。
- 通过 1440/1024/768/390/320 响应式与同状态截图审查。
- 补齐 UI 组件/交互测试与 E2E；输出 `docs/phase-5a-loom-table-ui-ux-redesign-validation-report.md`。

## 3. 本阶段不做什么

- 不调整 GameState、计分、牌池、奖励概率、回合数或 Phase 5 平衡参数。
- 不生成、导入或声称拥有真实玩家数据；Phase 5 checkpoint 仍为 `BLOCKED_FOR_PLAYER_DATA`。
- 不引入网络字体、付费设计 AI、第三方图片/纹理或来源不明资产。
- 不开始存档、遥测、联网、Electron 或 Phase 6。
- 不用截图专属 CSS、装饰遮罩或删除信息来隐藏失败状态。
- 不把 App 拆成跨层万能状态库；业务逻辑继续留在 application/domain。

## 4. 实现契约

优先改动 `src/ui/` 与 UI 测试/E2E。允许提取小型呈现组件，例如 `GameHeader`、`BoardStage`、`BoardSummaryRail`、`BoardGrid`、`ActionDock`、`RiskSummary`，但单组件保持聚焦；不得更改公共领域契约。

必须引入：

- 集中的 CSS semantic tokens；禁止散落新的任意 hex。
- 可复用控制/状态样式；禁止 emoji 图标、不可访问的 div-button、与特异性对抗的覆盖链。
- 玩家风险词映射应位于 UI/application view-model 边界；不得在组件复制规则判断。
- 稳定的测试选择器只在语义定位不足时使用。

## 5. 每轮固定工作流

每轮回复必须包含：本轮目标、完成内容、Debug 自检、架构自检、验证命令和结果、commit hash、push 结果、下一轮目标、是否消耗缓冲轮。

推进规则：验证失败不得提交/推进；提交失败或推送失败不得推进；只暂存本轮相关文件，不得带入用户或其他线程的无关改动。

Debug 自检：

- 用最小 fixed-seed 工作流解释变化，覆盖初始、选牌、试织、取消、确认、禁用与锁定。
- 失败能定位到 UI 呈现、application 编排或 domain；禁止用 CSS 掩盖状态错误。
- UI 变化必须有可重复 smoke/E2E 或组件测试。
- 检查控制台、水平溢出、触控尺寸、焦点副作用和窄屏浮层遮挡。

架构自检：

- `GameState` 与 application view model 仍是状态来源。
- UI 不复制计分、连通、风险或奖励规则；preview 与 execute 仍走同一领域路径。
- 不扩大 platform/Electron 边界，不增加 DOM/browser API 到 domain。
- 不拉入 Phase 5 调参、玩家数据或 Phase 6。
- 无关文件、生成输出和用户改动保持不动；架构/公共契约变化必须补 ADR。

## 6. 分轮安排

1. **基线锁定与组件边界**：复验五档基线/预览态，记录 DOM、溢出、触控和 console；提取无行为变化的呈现边界。
2. **tokens 与 Loom Table 框架**：实现全局 token、字体角色、桌面/织框材质、标题和局内状态层级。
3. **主盘与摘要盘**：宽屏主盘 56–60% 视觉权重，中屏/窄屏三盘状态轨道与单盘切换，保持三盘状态同时可知。
4. **格子四层与丝线语言**：墨色纹理、牌面、皇冠/灵感、选中/幽灵/风险/锁定层；不复制领域规则。
5. **行动坞**：整合手牌、牌面/墨色选择、预览、风险、确认/取消；把内部风险词替换为玩家语言。
6. **键盘/触控/动效**：移除 focus 副作用；Esc、焦点、44px、reduced-motion 与短动效。
7. **辅助流程统一**：教程、声音、奖励、功能牌、提交、结算使用同一材质与层级，验证边界状态。
8. **缓冲一**：根据 1440/1024/768/390/320 同状态截图做最高影响视觉修复。
9. **缓冲二**：根据关键流程、键盘、reduced-motion、E2E、架构检查修复回归。
10. **最终验证**：生成 after 截图与预览态，执行评分、完整验证、报告、最终提交推送并回报规划者。

若 1–7 无阻塞，8–9 仍用于审美迭代，不得跳过 rendered review。任何轮次使用额外修复即记录为缓冲消耗。

## 7. 验证矩阵与 PASS 标准

每个相关轮次运行最小测试；最终至少运行：

```powershell
C:\Users\Administrator\.codex\skills\project-ops-workflow\scripts\ops\Validate.cmd
C:\Users\Administrator\.codex\skills\project-ops-workflow\scripts\ops\Smoke.cmd
pnpm test:e2e
pnpm arch:check
git diff --check
```

最终 PASS 还要求：

- `docs/suitweave-ui-ux-redesign-contract.md` 第 5 节全部满足。
- 五档 before/after 同 seed、同回合、同交互态；另有 390 或 320 试织态。
- 320/390 无页面横向溢出，关键行动无固定层遮挡。
- Tab 不改变 GameSession/preview；Enter/Space 与 Esc 主路径有测试证据。
- reduced-motion 主路径可完成；正常模式动效不阻塞输入。
- console 无未捕获 error；`pnpm validate` 与 E2E 全 PASS。
- Rubric 每个关键维度 ≥2，平均 ≥2.2；身份、层级、交互清晰、独特性目标 ≥3。
- 工作区干净，所有阶段提交均推送 `origin/main`。

## 8. 每轮提交推送

优先使用项目 GitFlow wrapper：

```powershell
C:\Users\Administrator\.codex\skills\project-git-workflow\scripts\git\Status.cmd
C:\Users\Administrator\.codex\skills\project-git-workflow\scripts\git\CommitAndPush.cmd -Message "<focused message>" -Paths <phase files>
```

不得暂存无关未跟踪文件。每轮报告 commit hash、远端分支与 push PASS；push 失败立即停止。

## 9. 最终报告模板

创建 `docs/phase-5a-loom-table-ui-ux-redesign-validation-report.md`，包含：

- 最终 commit / push / clean worktree
- thesis 如何落到界面、改动区域与保留边界
- before/after 五档截图路径及同状态说明
- 初始、选牌、试织、取消、确认、盘切换、教程、奖励/功能牌、结算证据
- 320/390 overflow 与 44px 测量
- 键盘、焦点、reduced-motion、console 结果
- 完整验证命令与结果
- Rubric 十项评分、证据、阻塞/非阻塞修复
- 明确声明未修改领域规则、未伪造玩家数据、未进入 Phase 6
- 向规划者返回 `READY_FOR_CHECK`，请求使用 `$checkandgoal` 独立验收

