# BGA Agricola Compact Panel v0.4.1

這版修正 v0.4.0 的兩個主要問題：

- 預設高度從 82vh 降到 50vh，避免一開始就遮住整個主遊戲區。
- 點擊其他玩家的 mini 卡時，zoom modal 會暫時移除 `mini` class，嘗試以完整卡片尺寸顯示文字效果。

仍然是 CSS mode：

- 不搬移玩家板塊。
- 不 clone 整包玩家板塊。
- 固定 BGA 原本的 `#player-boards` 與 `#alternative-hand-wrapper`。
