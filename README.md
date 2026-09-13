# Violet的中文樂園

國小 1～6 年級的中文遊戲網站。小朋友選年級闖關，老師／家長可以自己出題，產生四碼房間碼給孩子玩。

## 兩個網址，請不要搞混

| 用途 | 網址 | 打開後會看到什麼 |
| --- | --- | --- |
| **給小朋友玩** | https://rui9232.github.io/violet-chinese-park/ | 遊戲網站 |
| 看／下載原始碼 | https://github.com/rui9232/violet-chinese-park | 檔案清單，不能直接玩 |

`github.com` 是程式倉庫。`github.io` 才是上線後的網站。第一次部署的人，請照下面「第一次部署」做完，才會有自己的 `.github.io` 網址。

這個倉庫的 `main` 分支永遠放原始碼。線上版會另外自動打包到 `gh-pages` 分支，不會蓋掉這裡的檔案。

## 可以做什麼

- 六座年級島：注音、識字、詞語、句子、成語、閱讀
- 動腦筋：猜猜我是誰、找好朋友、記憶魔法卡、小耳朵挑戰、補洞洞、排字小火車、誰是小壞蛋
- 學部首：部首猜猜樂、部首一家人、字找部首、部首獵人
- 動一動：打地鼠學中文、小墨衝刺、氣球爆破
- 老師魔法工坊：一題一題填，產生房間碼；孩子在首頁輸入就能玩

關卡存在各人自己的瀏覽器裡（`localStorage`），沒有後端伺服器。所以：線上版和本機版的自訂關卡不相通；換瀏覽器或清資料，房間碼也會不見。

## 老師怎麼出題

1. 打開**遊戲網站**（`.github.io` 那個），點「去蓋關卡」
2. 選年級、選遊戲，帶入範例或自己填
3. 按「產生房間碼」
4. 把四碼給孩子，在首頁輸入就能玩

---

## 第一次部署（讓別人不用裝程式就能玩）

下面假設你已經有 GitHub 帳號。本專案是純前端，用 **GitHub Pages** 免費公開。

### 0. 你需要先有的東西

- [Node.js](https://nodejs.org/)（建議 LTS）
- [Git](https://git-scm.com/)
- GitHub 帳號，倉庫設成 **Public**（免費帳號的 Pages 需要公開倉庫）

### 1. 把程式放到你的 GitHub

若你是直接用本倉庫、倉庫名稱仍是 `violet-chinese-park`：

```powershell
git clone https://github.com/rui9232/violet-chinese-park.git
cd violet-chinese-park
```

在 GitHub 新建一個空倉庫（不要勾 README），然後把 `origin` 改成你的倉庫並推上去：

```powershell
git remote set-url origin https://github.com/你的帳號/violet-chinese-park.git
git push -u origin main
```

**若倉庫名稱不是 `violet-chinese-park`：**  
請先改 `vite.config.js` 裡的 `base`，必須和倉庫名稱一致，例如倉庫叫 `my-park` 就改成 `'/my-park/'`。改完再推到 `main`。

### 2. 等 GitHub 自動打包

推上 `main` 後，GitHub Actions 會：

1. 安裝套件、執行 `npm run build`
2. 把編好的網站推到 `gh-pages` 分支

請打開你的倉庫 → **Actions**，等到最新一筆 **Deploy GitHub Pages** 變成綠色勾勾。  
這一步還沒成功時，設定裡選不到 `gh-pages`，網站也不會開。

若 Actions 是灰色／被停用：進 **Settings → Actions → General**，允許執行 workflows。  
Fork 來的倉庫有時預設不跑 Actions，要進 Actions 頁按一次 Enable。

### 3. 打開 GitHub Pages（只需做一次）

1. 打開倉庫的 **Settings → Pages**  
   （網址長相：`https://github.com/你的帳號/倉庫名/settings/pages`）
2. **Build and deployment → Source** 選 **Deploy from a branch**
3. **Branch** 選 **`gh-pages`**，資料夾選 **`/ (root)`**
4. 按 **Save**
5. 等 1～2 分鐘（有時要更久）

完成後，遊戲網址是：

```text
https://你的帳號.github.io/倉庫名稱/
```

本倉庫範例：https://rui9232.github.io/violet-chinese-park/

請用瀏覽器網址列貼上這串，**不要**以為打開 `github.com/...` 的檔案列表就能玩。

### 4. 之後要更新網站

改程式 → `git push origin main` → 等 Actions 綠勾。  
不必再進 Pages 設定。`main` 仍是原始碼，`gh-pages` 會自動被覆蓋成新的網站檔。

---

## 在自己電腦上改程式

```powershell
npm install
npm run dev
```

瀏覽器開啟 http://localhost:5173/

本機預覽不用 GitHub Pages。確認沒問題後，再推到 `main`，線上版才會更新。

想檢查打包結果（接近上線後的樣子）：

```powershell
npm run build
npm run preview
```

請不要把 `node_modules/`、`dist/` 提交進 `main`，它們已寫在 `.gitignore`。

---

## 打不開網站時請依序檢查

1. **你開的是哪一個網址？**  
   `github.com` 只能看程式。要玩必須是 `https://你的帳號.github.io/倉庫名稱/`。
2. **Actions 是不是綠勾？**  
   紅叉表示還沒打包成功，網站不會更新。點進失敗的那一筆看錯誤。
3. **Pages 有沒有選對分支？**  
   必須是 `gh-pages` + `/ (root)`。若選 `main`，打開會是空白或壞掉（`main` 裡的 `index.html` 不能直接當網站用）。
4. **剛按 Save？**  
   第一次啟用可能要等幾分鐘。可換無痕視窗再試，避免舊的 404 被快取。
5. **網址列是 404，但 Actions 是綠的？**  
   確認倉庫名稱和 `vite.config.js` 的 `base` 一致，例如必須是 `/violet-chinese-park/`。
6. **連線失敗、一直轉圈？**  
   有些網路會擋 `github.io`。GitHub 程式頁能開，不代表遊戲網址也能開。可換手機熱點，或使用能連 GitHub Pages 的網路。

---

## 專案裡重要的檔

| 檔案／資料夾 | 做什麼 |
| --- | --- |
| `src/` | 遊戲、頁面、題庫（原始碼） |
| `vite.config.js` | 打包設定；上線路徑 `base` 在這裡 |
| `.github/workflows/pages.yml` | 推到 `main` 後自動編譯並發布 |
| `gh-pages` 分支 | 自動產生，給瀏覽器玩；不要手動改 |
| `package.json` | 依賴與 `npm run dev` / `build` 指令 |
