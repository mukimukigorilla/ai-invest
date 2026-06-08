# 📊 AI投資アシスタント PWA

リアルタイム株価・ランキング・ニュースを管理する個人用AI投資アシスタントアプリです。

## 🚀 GitHub Pages でのデプロイ手順

### 1. このリポジトリをGitHubに作成
1. [github.com](https://github.com) にログイン
2. 右上「＋」→「New repository」
3. Repository name: `ai-invest`（なんでもOK）
4. **Public** を選択（GitHub Pages の無料利用に必要）
5. 「Create repository」をクリック

### 2. ファイルをアップロード
1. 作成したリポジトリページで「uploading an existing file」をクリック
2. このZIPの中身をすべてドラッグ＆ドロップ
   - `index.html`
   - `manifest.json`
   - `sw.js`
   - `icons/` フォルダごと
   - `.github/` フォルダごと
3. 「Commit changes」をクリック

### 3. GitHub Pages を有効化
1. リポジトリの「Settings」タブ
2. 左メニュー「Pages」
3. Source: **GitHub Actions** を選択
4. 数分待つと自動でデプロイ完了！

### 4. URLが発行される
```
https://【あなたのGitHubユーザー名】.github.io/ai-invest/
```

### 5. スマホのホーム画面に追加
**iPhone (Safari)**
1. 上記URLをSafariで開く
2. 下の共有ボタン（□↑）をタップ
3. 「ホーム画面に追加」→「追加」

**Android (Chrome)**
1. 上記URLをChromeで開く
2. 「ホーム画面に追加」バナーが表示される
3. またはメニュー（⋮）→「アプリをインストール」

## ✨ 機能
- 📊 ダッシュボード（評価額・損益グラフ）
- 🔍 銘柄検索（日本株・米国株 50銘柄対応）
- 💼 ポートフォリオ管理（リアルタイム株価）
- 🏆 ランキング（日本株TOP20・米国株TOP20・マイウォッチ）
- 📰 ニュース（3ボード表示）
- 🗂 データ履歴（毎日保存）
- 💾 データはすべてブラウザのlocalStorageに保存

## 📡 使用API
- **日本株**: Yahoo Finance API (allorigins.win プロキシ経由)
- **米国株**: Finnhub API
