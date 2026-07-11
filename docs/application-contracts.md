# Suitweave Phase 2 应用层契约

`src/application` 编排领域 API，不拥有或复制规则。`GameSession` 包含权威 `GameState`、回合状态、手牌、选择、预览和结算引用；唯一规则变更仍由 `src/domain` 的公共入口产生。

- `HandCard` 仅描述本回合可用的基础牌，不是领域棋盘状态。
- `Selection` 记录 UI 意图：数字牌正反面与万能牌选定墨色。
- `Preview` 持有同源领域转换的结果及结构化风险，不让 UI 解析业务字符串。
- `SessionResult` 为 application 用例提供可辨识失败且零修改的边界。

Round 2 将添加初始局生成，Round 3 添加抽牌与回合编排；它们必须只更新 application 状态或调用 domain API。
