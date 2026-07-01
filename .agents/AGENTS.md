# BGA Agricola Compact Extension 開發與發布規範

## 自動化一次到位發布流程
當使用者確認修改成功，並發出「發布」、「更新」、「打包」或「發 Release」等類似指令時，請主動且一氣呵成執行以下完整的發布流程，不要讓使用者分步指示：

1. **升級版本號**：主動將 `manifest.json` 與 `content/00_bootstrap.js` 中的版本號同步遞增（例如自 `1.0.3` 升至 `1.0.4`）。
2. **語法與測試驗證**：在本地執行 `Get-ChildItem content -Recurse -Filter *.js | ForEach-Object { node --check $_.FullName }` 與 `node --test tests\*.test.mjs`，確認所有單元測試皆順利通過。
3. **Git 本地提交**：執行 `git add` 將變更檔案暫存，並提交 commit，訊息格式如 `chore: bump version to 1.0.x`。
4. **打 Git Tag**：在本地打上對應版本的 Git tag（例如 `git tag v1.0.x`）。
5. **推送到遠端**：將本地 Commit 與 Tag 一併推送至 GitHub（`git push` 與 `git push origin v1.0.x`），以觸發 GitHub Actions 的 Auto Release 流程。
6. **本地建置備份**：在本地執行 `.\scripts\build-release.ps1` 產出最新版的 zip 壓縮檔至 `dist\` 目錄。
7. **清理暫存區**：自動刪除任何在過程中暫時安裝的 `node_modules/`、`package-lock.json` 等臨時檔案，保持工作區乾淨。
