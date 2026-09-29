# スペレマスロット

パチスロ風の演出重視ギャグWebゲーム（HTML5 / CSS3 / JavaScript ES Modules / Web Audio API / Vite）。
ゲーム内通貨は「すぇいしコイン」。演出は言葉遊びと抽象的な球・コインのパーティクル中心です。

## 必要なソフトウェア
Node.js 18 以上（20 推奨）と最新のブラウザ。外部CDN・サーバー・有料APIは不要です。

## 起動方法
```
npm install
npm run dev      # 開発サーバー（表示されたURLを開く）
npm run build    # dist/ に本番ビルド
npm run preview  # ビルド結果の確認
```

## 操作方法
- PC：Space=START、Z/X/C=左/中/右リール停止、A=オートプレイ切替。BET額は画面下のボタン。
- スマホ：STARTで回転開始、各リール下のSTOPで停止。AUTOで自動プレイ。縦画面推奨。
- 「設定」で音量（BGM/効果音/ボイス）、ボイスON/OFF、ボイス選択、軽量化モード、コイン演出量、BET額、統計表示を変更できます（localStorageに保存）。

## GitHubへのアップロードと公開（GitHub Pages）

### 1. GitHubにリポジトリを作る
1. GitHubで「New repository」を押し、リポジトリ名を決めて作成します。
2. ZIPを展開し、`sperema-slot` フォルダの中身（`index.html`、`package.json`、`src`、`.github` など）をリポジトリの直下にアップロードします。フォルダごと二重に入れないでください。
3. `main` ブランチにコミットします。

### 2. Pagesを設定する
1. リポジトリの Settings → Pages を開きます。
2. Build and deployment の Source を「GitHub Actions」にします。
3. Actionsタブで「Deploy to GitHub Pages」が実行されるのを待ちます。成功すると公開URLが表示されます。

`.github/workflows/deploy.yml` が `main` へのpush時にViteでビルドし、`dist` をGitHub Pagesへ自動デプロイします。Actionsタブから手動実行もできます。

### 3. 更新する
ゲームのファイルを変更して `main` にコミット・pushすると、自動で再ビルド・再公開されます。公開URLはリポジトリの Settings → Pages または成功したActionsの実行結果から確認できます。

Viteの `base: './'` と相対パスのエントリーポイントを使っているため、ユーザー名やリポジトリ名が異なるGitHub PagesのプロジェクトURLでも動作する構成です。

## ボイス素材の追加・変更
`public/voice/` に以下の名前のmp3を置くと、音声合成より優先して再生されます（無ければブラウザの音声合成で代替。ゲームは音声なしでも動作します）。
`question.mp3`(疑問形！) / `past.mp3`(過去形！) / `now.mp3`(現在進行形いいいいい！) / `jackpot.mp3`(大当たり！) / `gekiatsu.mp3`(激アツ！) / `lose.mp3`(ハズレ！) / `kakutei.mp3`(大当たり確定！) / `premium.mp3`(プレミアム！)
音声合成の声は端末により異なり、男性の声が無い場合があります。設定画面の「ボイス選択」で選べます。低い声を使いたい場合は素材の追加を推奨します。

## 当たり確率・払い出し倍率
すべて `src/config.js` にあります。
- 確率：`odds`（1ゲームあたり。初期値は合計約13%）
- 倍率：`payout`（BET額×倍率。初期値 2/5/10/20）
- 演出ウェイト：`effects`、図柄：`symbols`

比較対象機種の公表確率は確認できていないため、「通常時の約2倍」は実在機種の数値に基づいておらず、独自の初期値です。

## 演出の追加
1. `src/main.js` の `EFFECTS` に `async 名前(r){...}` を追加します（`r.tier`が当たり種別、nullならハズレ）。
2. `src/config.js` の `effects` の該当する抽選結果にウェイトを追加します。抽選ロジックの変更は不要です。

## 設計メモ・既知の制限
- 抽選（`src/systems/lottery.js`）で結果・停止図柄・演出を先に確定し、演出は結果に合わせて再生します。払い出しは1ゲーム1回のみです。
- 確定演出（kakutei / premium / 3段階の最終当たり）は当たり時にだけ選ばれ、3段階の当たりは大当たり以上です。
- 保存は待機中とゲームオーバー時のみ。回転中にリロードすると、そのゲーム開始前の所持金に戻ります。
- 精子キャラの図柄は絵文字（🐟）の代用です。`config.js`の`symbols`で差し替えできます。
- ファイル構成は簡略化しており、ゲーム進行・演出・UIは `src/main.js` にまとめています。
