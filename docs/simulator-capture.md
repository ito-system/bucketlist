# Simulator調査・撮影記録

## 調査結果

- iOSアプリ: Expo SDK 55 / React Native 0.83 / TypeScript
- Bundle Identifier: `com.ito-dev.bucketlist`
- Xcode workspace: `ios/app.xcworkspace`、iPad対応設定あり
- Xcode 27.2、Simulator runtime: iOS 26.3 / 27.2
- GUI版Simulator.appはXcode bundle内にありません。`xcrun simctl`とXCUITestでビルド・操作・撮影しました。

## 撮影端末・ファイル

| 端末 | 解像度 | 撮影画面 |
| --- | --- | --- |
| iPhone 17 Pro Max / iOS 26.3 | 1320×2868 | 空のマイリスト、実データ入りマイリスト、空/実データ入りリスト詳細 |
| iPhone 11 Pro Max / iOS 26.3 | 1242×2688 | 空のマイリスト |
| iPad Pro 13-inch (M5) / iOS 26.3 | 2064×2752 | 空のマイリスト |

全画像は `assets/screenshots/raw/` に保存。ステータスバーは9:41、Wi-Fi/電波表示、充電中、100%に統一しました。実データ入り画面には「ふたりで叶えたいこと」リストと5件の項目を登録。画面内容は `assets/screenshots/raw/iphone_69_home_filled.png` と `iphone_69_list_detail_filled.png` で確認できます。

撮影したXCUITestはローカルのignored `ios/appTests/CaptureUITests.swift` にあります。リストと項目の作成、実画面の添付出力を確認しています。本番アプリコードには変更を加えていません。

## 撮影できなかった画面

タグ管理、プロフィール、プレミアム、共有画面は撮影できていません。詳細画面の後にタブナビゲーションを自動操作するUIテストがTabBar要素を見つけられず失敗しました。アプリ画面にAdMobのテスト広告と検証ポップアップが表示され、検証ポップアップの操作時にWebKitプロセスがクラッシュしたため、広告表示には触れずに中断しています。これらを撮影済みとは扱っていません。

## 使用したSimulator操作例

```sh
xcrun simctl list devices
xcrun simctl list runtimes
xcrun simctl status_bar <UDID> override --time '9:41' --dataNetwork wifi --wifiMode active --wifiBars 3 --cellularMode active --cellularBars 4 --batteryState charged --batteryLevel 100
xcrun simctl io <UDID> screenshot assets/screenshots/raw/<filename>.png
```
