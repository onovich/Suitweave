# Suitweave Phase 4：教学与体验打磨 Goal 模式执行指南

日期：2026-07-11  
状态：READY，供程序开发执行者使用  
轮次预算：8 轮（1-6 主实现，7 缓冲修复，8 最终验证）

## 0. 直接给执行者的 Goal Prompt

在 `D:\WebProjects\Suitweave` 执行 Phase 4“教学与体验打磨”：保持既有规则与奖励系统不变，完成可跳过/可重开的渐进教学、信息层级与预览解释、色盲/键盘/触摸无障碍、克制动效、可关闭音频、结算复盘统计和跨视口体验打磨，使新玩家目标上能在 10 分钟内理解墨色连接、三盘差异、提交与奖励。每轮必须 Debug 自检、架构自检、验证、精确提交并 push，成功后才推进。使用 `$donextgoal`；不进入 Phase 5 平衡改值或 Phase 6 Electron。

## 1. 必读上下文

- `AGENTS.md`
- `docs/architecture.md`
- `docs/engineering-standards.md`
- `docs/product-and-ui-design.md`
- `docs/phase-3-rewards-and-building-validation-report.md`
- GDD 第 1.1、1.2、3、11、12.1、16、17.3、19 节
- 本指南

共识：正式局三盘从开始同时存在；教学只降低提示频率与聚焦目标，不隐藏核心结构；预览比动画优先；颜色不可作为唯一语义；触控目标至少 44px。

低优先级选择：教学采用独立的固定 seed 教学模式，可随时退出/重开；音频由 `platform/web` 适配器实现且默认保守音量；复盘指标仅保存在当前 session，不发送外部遥测、不建立持久化。

## 2. 本阶段要完成什么

- 教学状态机：前 3 回合聚焦 21 点、4-6 回合引导德扑、7-9 回合引导三消、10 回合后开放皇冠/标记/功能牌提示。
- 教学目标、上下文提示、术语解释、错误恢复与“为什么不可执行”反馈；支持跳过、重开与已完成状态。
- 信息层级：三盘摘要、组详情、预览前后差异、风险与奖励解释、提交确认、备牌目标提示。
- 色盲模式：四墨色纹理/形状；高对比焦点；图标+文字+边框表达危险、稀有度和锁定。
- 键盘完整核心路径、合理 tab/roving focus、焦点恢复、弹窗 focus trap/ESC；触摸目标与窄屏分页打磨。
- 120-180ms 的落牌/连通/奖励/锁定动效，尊重 `prefers-reduced-motion`，不得阻塞规则执行。
- 音频端口与 Web 适配器：落牌、警告、奖励、提交；静音/音量控制，处理浏览器自动播放限制。
- 当前 session 复盘：完成盘数、分数/评级、皇冠/标记、功能牌使用、过载/爆点与修复、回合剩余、seed。
- 教学、无障碍、动效降级、音频开关和复盘的组件/E2E/跨视口验证。

## 3. 本阶段不做什么

- 不改变计分表、牌池概率、初始数字密度、回合数、奖励经济或功能牌效果。
- 不声称没有真实玩家测试就已证明“10 分钟理解”；本阶段只建立可测试教学路径与后续测试记录模板。
- 不实现账户、云端/外部遥测、持久化设置、存档、排行榜、每日挑战或 Electron。
- 不引入大型动画/音频引擎；不让音频/动效进入 domain 或 application 规则判断。
- 不实现新牌、新奖励、角色、遗物或 GDD 延后内容。

## 4. 每轮固定工作流

每轮回复必须包含：目标、完成内容、Debug 自检、架构自检、验证命令/结果、截图或 smoke 证据、commit hash/push、下一轮、缓冲轮使用情况。

验证、提交或 push 失败不得推进。只暂存本轮路径。最低运行相关测试、`pnpm typecheck`、`pnpm arch:check`；UI/输入/音频变化运行 `pnpm validate` 与相关 Playwright；视觉变化保存宽/窄屏重复截图。

## 5. Debug 与架构自检

### Debug 自检

- 最小教学步骤或用户路径能否复现问题，失败能否定位到 tutorial、view-model、focus/input、animation、audio adapter 或 metrics？
- 是否覆盖首次、跳过、重开、过期提示、非法行动、空状态、锁盘、弹窗嵌套和结算状态？
- UI 状态变化后焦点是否仍在合理位置，键盘/触摸是否共享同一意图？
- reduced-motion、静音、音频未授权和窄屏是否有稳定降级？
- 若状态导出/统计变化，是否保持 seed/命令重放与旧 E2E 兼容？

### 架构自检

- domain/application 是否仍是规则/编排事实来源，教程只观察状态并推荐意图？
- UI 是否未复制计分、触发、合法性或完成规则？
- audio/媒体查询是否封装在 platform/UI 边界，application 只发语义事件？
- session metrics 是否由既有事件派生，不改变游戏结果？
- 是否避免 Phase 5 调参和 Phase 6 持久化/Electron？
- 无关文件、生成输出和用户改动是否保留？

## 6. 分轮安排

### Round 1：教学契约与固定教学局

建立 tutorial 状态、步骤/目标/完成条件与固定 seed 教学局；教程只读 session/view-model，不新增平行规则引擎。

PASS：跳过/重开/步骤推进测试；三盘始终存在；规则判断仍来自 domain/application；`pnpm validate` 通过。

### Round 2：渐进教学 UI 与解释反馈

实现 1-10 回合聚焦、术语卡、目标提示、非法原因、错误恢复和提交/奖励解释；不遮挡必要状态。

PASS：组件测试覆盖每阶段、跳过与非法反馈；Chromium E2E 完成教学主路径；提示不阻止非推荐但合法行动。

### Round 3：信息层级与无障碍

完善三盘摘要、组详情/预览、ARIA 名称/状态、键盘 roving focus、弹窗焦点管理、色盲纹理与高对比焦点。

PASS：核心局面无需颜色可理解；键盘可走选牌/预览/执行/奖励/提交；窄屏 44px；自动化可访问性检查无高严重度问题。

### Round 4：动效与 reduced-motion

实现短促落牌、连通高亮、奖励、锁定和结算过渡；状态提交先于表现，动画可中断，不影响 fixed-seed。

PASS：`prefers-reduced-motion` 下无非必要运动；连续快速操作无陈旧动画/阻塞；视觉回归截图稳定。

### Round 5：音频端口与 Web 适配器

定义语义音频端口，Web Audio/HTMLAudio 适配落牌、警告、奖励、提交；实现静音/音量和自动播放失败降级。仅使用仓库内可合法分发的自制/明确许可素材；若无素材，使用程序化短音。

PASS：domain/application 无浏览器音频 API；静音/音量/未授权测试；无音频也可完整游戏；`pnpm validate` 通过。

### Round 6：复盘统计与跨视口体验闭环

由领域事件派生 session metrics，扩展结算复盘；完成宽/中/窄屏布局、长文案、缩放与触摸检查，建立玩家测试记录模板。

PASS：指标可由事件/seed 解释且不影响结果；E2E 覆盖教学到复盘；JS gzip <250KB；无不可控溢出。

### Round 7：缓冲修复轮

只修复教学卡点、焦点丢失、色盲/对比、动效竞态、音频降级、响应式或 E2E 不稳定；无问题则不新增功能。

PASS：每项修复有回归；无平衡改值或后续平台范围。

### Round 8：最终验证与交接

运行 `pnpm validate`、完整 `pnpm test:e2e`、键盘/窄屏/reduced-motion/静音 smoke、架构与平台扫描、截图、包体、`git diff --check` 和远端检查；写 Phase 4 报告、roadmap 与玩家测试模板。

PASS：所有自动门禁通过；形成可交给真实新玩家的教学测试版本；不把未进行的玩家测试写成 PASS；推送 `origin/main` 并回报 planner 请求 `$checkandgoal`。

## 7. 总体 PASS 标准

- 教学模式可跳过/重开，覆盖三盘、连接、预览、提交和奖励，正式三盘结构不被隐藏。
- 键盘/触摸/窄屏/色盲/reduced-motion/静音均有明确可用路径。
- 动效与音频不改变规则、不阻塞输入；统计从事件派生且不外传。
- 既有 115 项回归、教学/UI/E2E、架构、扫描、构建、截图和包体门禁全绿。
- Phase 5 平衡参数与 Phase 6 平台范围未进入；工作区干净、每轮已推送。

## 8. 最终报告模板

```text
Phase: 4 教学与体验打磨
Status: PASS | BLOCKED
Rounds used: n/8（buffer consumed: yes/no）
Delivered:
- ...
Debug self-check:
- ...
Architecture self-check:
- ...
Validation:
- pnpm validate / test:e2e: ...
- keyboard / narrow / colorblind / reduced-motion / mute smoke: ...
- screenshots / bundle / scans: ...
Player-test status:
- automated readiness only | real player evidence attached
Deferred:
- ...
Commits pushed:
- hash: summary
Return:
- 请 planner 使用 $checkandgoal 验收 Phase 4；未通过前不要进入 Phase 5。
```

