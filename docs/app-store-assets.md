# App Store素材

## 完成したiPhone素材

- 6.9インチ相当: `assets/app-store/iphone/iphone_69_01_home.png` 〜 `iphone_69_06_premium.png`（1320×2868）
- 6.5インチ相当: `assets/app-store/iphone/iphone_65_01_home.png` 〜 `iphone_65_06_premium.png`（1242×2688）
- 編集元SVGと再生成スクリプト: `assets/app-store/source/`。`node assets/app-store/source/generate.js` でPNGを書き出します。

全画像はアイボリー/オレンジ系の統一レイアウトで、Simulatorで撮影した実画面を使用しています。端末内のUIは縮尺を保っています。画面下部のSimulator用広告と検証ポップアップはレイアウト上で表示範囲から外し、元画像はそのまま `assets/screenshots/raw/` に保管しています。

## 撮影した実画面と撮影環境

- `iphone_69_home_filled.png`: iPhone 17 Pro Max / iOS 26.3、マイリストに「ふたりで叶えたいこと」
- `iphone_69_list_detail_filled.png`: 同じ端末、5件の実データを表示。未着手3件、チャレンジ中1件、達成1件
- `iphone_69_list_detail_empty.png`: 同じ端末、リスト詳細の空状態
- `iphone_69_home_empty.png`: iPhone 17 Pro Maxの空のマイリスト
- `iphone_65_home_empty.png`: iPhone 11 Pro Max / iOS 26.3の空のマイリスト
- `ipad_home_empty.png`: iPad Pro 13-inch (M5) / iOS 26.3の空のマイリスト

App Storeの受付サイズは[Apple公式仕様](https://developer.apple.com/help/app-store-connect/reference/app-information/screenshot-specifications/)を参照。

## 未完了

iPad向け販促レイアウトは未作成です。iPadの実画面で実データを表示した撮影はできていません。6枚のiPhone販促素材は実データ画面を使っていますが、タグ管理・共有・プロフィール・プレミアム画面の撮影は行えておらず、機能別の見出しと画面内容が一致しない画像があります。最終的なApp Store掲載前に、これらの実画面を撮影して該当画像を差し替えてください。
