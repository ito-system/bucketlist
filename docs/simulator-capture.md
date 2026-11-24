# Simulator調査・撮影記録

## 調査結果

- iOSアプリ: Expo SDK 55 / React Native 0.83 / TypeScript
- Bundle Identifier: `com.ito-dev.bucketlist`
- iPad対応: `supportsTablet: true`
- Xcode: 27.2、Simulator runtime: iOS 26.3 / 27.2
- XcodeアプリバンドルにGUI版Simulator.appがありません。`xcrun simctl`で起動・撮影しました。
- iPhone 6.5インチ相当は既定端末にありませんでしたが、iOS 26.3上にiPhone 11 Pro Maxの一時Simulatorを追加して撮影。

## 撮影環境・画像

ReleaseビルドをXcode CLIで作成し、3端末にインストールしました。ステータスバーは時刻9:41、Wi-Fi/電波表示、バッテリー100%です。

| ファイル | 端末 | 解像度 | 撮影画面 |
| --- | --- | --- | --- |
| `assets/screenshots/raw/iphone_69_home_empty.png` | iPhone 17 Pro Max / iOS 26.3 | 1320×2868 | 空のマイリスト |
| `assets/screenshots/raw/iphone_65_home_empty.png` | iPhone 11 Pro Max / iOS 26.3 | 1242×2688 | 空のマイリスト |
| `assets/screenshots/raw/ipad_home_empty.png` | iPad Pro 13-inch (M5) / iOS 26.3 | 2064×2752 | 空のマイリスト |

各端末にはSimulator用のテスト広告が表示されます。LP向けの画像では、広告が始まる手前までアプリ画面の範囲を切り出しています。オリジナルの撮影画像は加工せず `raw/` に保管。

## 未撮影の候補

リスト詳細、作成画面、アイテム一覧/作成、タグ、達成、共有、プロフィール、プレミアム。これらはログインとデータが必要です。撮影用アカウントがないため、登録や規約同意を伴う新規作成は行っていません。GUI版Simulatorもこの環境にはないため、simctlではタップ操作ができません。

## ビルド修正

Xcode 27で低いCocoaPods deployment targetと旧RevenueCat iOS SDKのSwiftコンパイルエラーが発生しました。RevenueCat React Native SDKをiOS SDK 5.103.1同梱の11.0.4に更新し、ローカルExpo config pluginで低いPod deployment targetをアプリ設定に合わせました。iOS Releaseビルドは成功しています。生成された`ios/`は既存のignore設定のためGit対象外です。

## 撮影コマンドの基本

```sh
xcrun simctl status_bar <UDID> override --time '9:41' --dataNetwork wifi --wifiMode active --wifiBars 3 --cellularMode active --cellularBars 4 --batteryState charged --batteryLevel 100
xcrun simctl io <UDID> screenshot assets/screenshots/raw/<filename>.png
```
