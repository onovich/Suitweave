# Suitweave 技术架构

## 决策摘要

采用 TypeScript + React + Vite 的离线优先 Web 应用。游戏规则是纯 TypeScript 领域核心，React 只负责展示；浏览器能力通过端口适配，未来 Electron 仅新增壳与适配器，不改领域代码。

## 分层与依赖方向

`ui -> application -> domain`，`platform -> application/domain`。domain 禁止依赖 React、DOM、网络、存储和 Electron；application 编排用例并定义端口；platform 实现随机数、时钟、存档、遥测、音频等端口；ui 维护视图和输入映射。

建议目录：

- `src/domain/`：实体、值对象、规则、计分器、连通算法、生成约束、可序列化事件。
- `src/application/`：开始局、执行行动、预览、提交、奖励选择、结算等用例与端口。
- `src/platform/web/`：IndexedDB、Web Audio、浏览器生命周期。
- `src/platform/electron/`：未来 IPC 适配；只通过预加载暴露窄接口。
- `src/ui/`：React 组件、输入状态机、可访问性、视觉 token。
- `src/test/`：测试构造器、固定种子、契约测试。

## 状态与确定性

- `GameState` 是唯一权威状态；动作以 `Command` 输入，领域层返回新状态与 `DomainEvent[]`。
- 随机性通过可注入、可记录 seed 的 RNG；存档保存 schemaVersion、seed、命令日志和快照。
- 预览通过同一 reducer 在临时状态上执行，禁止复制规则。
- 每次规则变更必须添加迁移或明确旧存档不兼容，并用 ADR 记录。

## 多平台边界

- 核心不读取 `window`、`document`、`process` 或 Electron API。
- 首版 Web 目标：Chromium、Firefox、Safari 当前稳定版和前一版；触摸/键盘并行。
- Electron 使用 sandbox + contextIsolation，renderer 禁止 Node 集成；IPC 采用显式 schema 校验。
- 所有持久化、文件、更新、窗口控制都经过 application ports；Web 和 Electron 使用同一契约测试。

## 质量策略

- 单元：计分表、A 的双值、连通域、过载、覆盖、奖励与评级。
- 属性测试：连通域分区完整性、命令重放确定性、预览与执行一致性。
- 集成：每个 application use case；Web/Electron adapter contract。
- UI：交互组件测试；关键教程与完整一局采用 Playwright E2E（Phase 2 引入）。
- 性能预算：普通动作到预览 <50ms；布局稳定；初始压缩 JS 目标 <250KB（不含音频）。

`dependency-cruiser` 已把分层方向与禁止循环设为失败门禁；TypeScript 开启严格及索引安全规则。
