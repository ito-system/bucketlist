# 夢ノート

やりたいことをリストにまとめて管理できる、共有対応のバケットリストアプリ。
リストを複数メンバーと共有し、アイテムごとにステータス・タグ・画像・URLを管理できます。

---

## 機能一覧

### 認証

- メールアドレス＋パスワードによる新規登録 / ログイン
- Google アカウントによるソーシャルログイン
- ログアウト
- パスワード要件のリアルタイムバリデーション（8文字以上・大小英字・数字・特殊文字）
- ログイン状態の永続化（AsyncStorage）

### リスト管理

- リストの作成・削除（絵文字アイコン付き）
- リストへの招待コード発行（有効期限 7 日間）
- 招待コードによるリスト参加
- 招待コードのコピー・シェア

### アイテム管理

- アイテムの作成・編集・削除
- タイトル・詳細メモ・参考 URL・写真の設定
- ステータス管理：やりたい / チャレンジ中 / 達成！
- ドラッグ＆ドロップによる手動並び替え
- ソート：手動 / 名前順 / 状態別 / 新着順 / タグ別

### タグ機能

- タグの作成（名称 ＋ 10 色のプリセットカラー）
- タグはユーザーごとに管理し、全リスト共通で使用可能
- 複数ユーザーのリストではオーナーのタグを共有
- アイテムへのタグ付与・解除
- アイテムカードへのタグバッジ表示

### プロフィール

- 表示名の編集
- パスワードの変更（現在のパスワード確認あり）
- タグ管理画面へのアクセス

### プレミアムプラン（課金）

- RevenueCat による月額・年間・買い切りプランの購入
- 購入・復元フロー

### 法的情報

- 利用規約・プライバシーポリシーの表示

### プラン

| 項目                     | フリー | プレミアム |
| ------------------------ | ------ | ---------- |
| 作成できるリスト数       | 3      | 無制限     |
| リストあたりのメンバー数 | 2      | 10         |
| 作成できるタグ数         | 5      | 無制限     |

---

## 技術スタック

| カテゴリ       | 技術                                                                                                     |
| -------------- | -------------------------------------------------------------------------------------------------------- |
| フレームワーク | [Expo](https://expo.dev/) SDK 55 (Managed Workflow)                                                      |
| UI             | [React Native](https://reactnative.dev/) 0.83.2                                                          |
| スタイリング   | [NativeWind](https://www.nativewind.dev/) v4（Tailwind CSS）                                             |
| アイコン       | [Lucide React Native](https://lucide.dev/)                                                               |
| 状態管理       | [Zustand](https://zustand-demo.pmnd.rs/) v5                                                              |
| ナビゲーション | [React Navigation](https://reactnavigation.org/)（Stack + Bottom Tabs）                                  |
| バックエンド   | [Firebase](https://firebase.google.com/)（Auth / Firestore / Storage）                                   |
| 認証           | Firebase Authentication（Email/Password・Google）                                                        |
| DB             | Cloud Firestore                                                                                          |
| ストレージ     | Firebase Storage（アイテム画像）                                                                         |
| 永続化         | [@react-native-async-storage/async-storage](https://github.com/react-native-async-storage/async-storage) |
| ドラッグ操作   | [react-native-draggable-flatlist](https://github.com/computerjazz/react-native-draggable-flatlist)       |
| 言語           | TypeScript 5.9                                                                                           |

---

## ディレクトリ構成

```
src/
├── components/          # 共通コンポーネント（TextInput など）
├── features/
│   ├── auth/            # 認証（ログイン・新規登録）
│   ├── invite/          # 招待コード
│   ├── legal/           # 利用規約・プライバシーポリシー
│   ├── list/            # リスト・アイテム管理
│   ├── profile/         # プロフィール・パスワード変更
│   ├── tag/             # タグ管理
│   └── upgrade/         # プレミアムプラン・課金（RevenueCat）
├── lib/                 # Firebase 初期化・パスワードバリデーション
├── navigation/          # ナビゲーター定義
├── store/               # Zustand ストア
└── types/               # 型定義・プラン定数
```

---

## 環境構築

### 前提条件

- Node.js 18 以上
- npm または yarn
- [Expo Go](https://expo.dev/go) アプリ（実機確認用）または iOS / Android シミュレーター
- Firebase プロジェクト

### 1. リポジトリのクローン

```bash
git clone <repository-url>
cd bucketlist
```

### 2. パッケージのインストール

```bash
npm install
```

### 3. Firebase プロジェクトのセットアップ

1. [Firebase Console](https://console.firebase.google.com/) でプロジェクトを作成
2. **Authentication** を有効化（メール/パスワード・Google）
3. **Cloud Firestore** を作成（本番モードで開始）
4. **Storage** を有効化
5. iOS アプリを登録し、設定値を控える

### 4. 環境変数の設定

`.env` ファイルをプロジェクトルートに作成し、Firebase の設定値を記入します。

```env
EXPO_PUBLIC_FIREBASE_API_KEY=your_api_key
EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
EXPO_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project.firebasestorage.app
EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
EXPO_PUBLIC_FIREBASE_APP_ID=your_app_id

# Google サインイン用（Google Cloud Console で取得）
EXPO_PUBLIC_GOOGLE_CLIENT_ID_WEB=your_web_client_id
EXPO_PUBLIC_GOOGLE_CLIENT_ID_IOS=your_ios_client_id
EXPO_PUBLIC_GOOGLE_CLIENT_ID_ANDROID=your_android_client_id
```

### 5. Firestore セキュリティルールのデプロイ

```bash
firebase login
firebase deploy --only firestore:rules --project <your_project_id>
```

### 6. アプリの起動

```bash
npm start
```

起動後、ターミナルに表示される QR コードを Expo Go で読み取るか、シミュレーターで確認します。

```bash
# iOS シミュレーター
npm run ios

# Android エミュレーター
npm run android
```

---

## Firestore データ構造

```
/users/{uid}
  - uid, displayName, email, planType, isExempt?, createdAt, updatedAt

/users/{uid}/tags/{tagId}
  - tagId, name, color, createdAt, updatedAt

/lists/{listId}
  - listId, title, emoji?, ownerId, memberIds[], createdAt, updatedAt

/lists/{listId}/items/{itemId}
  - itemId, listId, title, description, url, imageURL
  - status, location?, tagIds[], order?
  - createdBy, completedAt, createdAt, updatedAt

/invites/{code}
  - listId, createdBy, expiresAt, usedBy[], createdAt
```

---

## 注意事項

- `.env` ファイルには機密情報が含まれるため、`.gitignore` に追加し、リポジトリにコミットしないでください。
- タグはリストオーナーのものが全メンバーに共有されます。メンバーはオーナーのタグをアイテムに付与できますが、タグの作成・削除はオーナー本人のみ行えます。
- RevenueCat の API Key が未設定（`XXXX` のまま）の場合、購入・復元機能はスキップされます。開発中はエラーなしで動作します。

---

## 料金免除の付与

特定のユーザーを課金なしでプレミアムプランとして扱う手順です。

### 1. 管理者権限の設定（初回のみ）

Firebase Admin SDK を使って、ご自身のアカウントに `admin: true` の Custom Claim を付与します。

```bash
# firebase-admin をインストール
npm install -g firebase-admin

# UID は Firebase Console → Authentication → ユーザー一覧 で確認
node -e "
const admin = require('firebase-admin');
const serviceAccount = require('./serviceAccountKey.json');
admin.initializeApp({ credential: admin.credential.cert(serviceAccount) });
admin.auth().setCustomUserClaims('YOUR_UID', { admin: true }).then(() => {
  console.log('管理者権限を設定しました');
  process.exit(0);
});
"
```

> `serviceAccountKey.json` は Firebase Console → プロジェクトの設定 → サービスアカウント → 「新しい秘密鍵の生成」で取得できます。機密情報のため `.gitignore` に追加してください。

### 2. 料金免除の付与

Cloud Functions をデプロイ済みの状態で以下を実行します。

```bash
firebase functions:shell
> grantPremiumExemption({email: "user@example.com"})
```

成功すると以下が返ります：

```json
{
  "uid": "...",
  "email": "user@example.com",
  "planType": "premium",
  "isExempt": true
}
```

### 仕組み

- `isExempt: true` のユーザーは RevenueCat Webhook による `planType` の自動更新がスキップされます
- サブスクが切れても `free` に戻りません
- 免除を解除する場合は Firebase Console から直接 `isExempt` を削除または `false` に更新してください

---

## 本番リリース前チェックリスト

> 上から順に対応することを推奨。依存関係があるため順番が重要。

---

### ステップ 1｜Firebase — Firestore Rules のデプロイ

- [ ] Firestore Rules をデプロイ

```bash
firebase deploy --only firestore:rules --project <PROJECT_ID>
```

- [ ] Firebase Console → Firestore → ルール タブで内容が最新版になっているか確認

---

### ステップ 2｜Cloud Functions のデプロイ

```bash
# functions ディレクトリで依存関係をインストール・ビルド
cd functions && npm install && npm run build && cd ..

# RevenueCat のシークレットキーと Webhook 認証ヘッダーを設定
firebase functions:config:set \
  revenuecat.api_key="YOUR_REVENUECAT_SECRET_API_KEY" \
  revenuecat.webhook_auth="YOUR_WEBHOOK_AUTHORIZATION_HEADER"

# デプロイ
firebase deploy --only functions
```

- [ ] Firebase Console → Functions で以下の 5 関数が表示されること
  - `syncPremiumStatus` — 購入後のクライアントから planType を更新
  - `revenuecatWebhook` — RevenueCat からの自動通知（サブスク更新・失効など）
  - `enforceListLimit` — フリープランのリスト数上限を Firestore トリガーで強制
  - `enforceTagLimit` — フリープランのタグ数上限を Firestore トリガーで強制
  - `grantPremiumExemption` — 特定ユーザーへの料金免除付与（管理者専用）

---

### ステップ 3｜RevenueCat（課金）

- [ ] [app.revenuecat.com](https://app.revenuecat.com) でアカウント・プロジェクトを作成
- [ ] iOS / Android アプリを RevenueCat に登録
- [ ] **Entitlement** を作成（ID は必ず `premium`）
- [ ] App Store Connect / Google Play で商品を先に作成し、RevenueCat に登録
  - 月額プラン ¥300（例: `com.ito_dev.bucketlist.premium.monthly`）
  - 年間プラン ¥2,400（例: `com.ito_dev.bucketlist.premium.annual`）
  - 買い切りプラン ¥4,800（例: `com.ito_dev.bucketlist.premium.forever`）
- [ ] **Offering** を作成し、3 つの商品をパッケージとして設定
  - `monthly` パッケージ → 月額商品
  - `annual` パッケージ → 年間商品
  - `forever` パッケージ → 買い切り商品
- [ ] **Public API キー**を取得して `src/features/upgrade/services/purchaseService.ts` を差し替え

```ts
// Before（開発用プレースホルダー）
ios: 'appl_XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX',
android: 'goog_XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX',

// After（RevenueCat ダッシュボード → Project Settings → API Keys）
ios: 'appl_実際のキー',
android: 'goog_実際のキー',
```

- [ ] **Webhook** を設定（RevenueCat → Integrations → Webhooks）
  - URL: `https://<REGION>-<PROJECT_ID>.cloudfunctions.net/revenuecatWebhook`
  - Authorization Header: Cloud Functions config の `revenuecat.webhook_auth` に設定した値と同じ

---

### ステップ 4｜Google AdMob（広告）

- [ ] [admob.google.com](https://admob.google.com) でアプリを登録し、バナー広告ユニットを作成
- [ ] `app.json` の AdMob App ID を本番用に差し替え

```json
// Before（Google テスト用 App ID）
"androidAppId": "ca-app-pub-3940256099942544~3347511713",
"iosAppId":     "ca-app-pub-3940256099942544~1458002511"

// After（AdMob コンソール → アプリ → アプリの設定）
"androidAppId": "ca-app-pub-XXXXXXXXXXXXXXXX~XXXXXXXXXX",
"iosAppId":     "ca-app-pub-XXXXXXXXXXXXXXXX~XXXXXXXXXX"
```

- [ ] `ios/bucketlist/Info.plist` の `GADApplicationIdentifier` を本番 App ID に差し替え
- [ ] `.env` にバナー広告ユニット ID を設定（App ID とは別）

```env
EXPO_PUBLIC_ADMOB_IOS_BANNER_ID=ca-app-pub-XXXXXXXXXXXXXXXX/XXXXXXXXXX
EXPO_PUBLIC_ADMOB_ANDROID_BANNER_ID=ca-app-pub-XXXXXXXXXXXXXXXX/XXXXXXXXXX
EXPO_PUBLIC_ADMOB_IOS_NATIVE_ID=ca-app-pub-XXXXXXXXXXXXXXXX/XXXXXXXXXX
EXPO_PUBLIC_ADMOB_ANDROID_NATIVE_ID=ca-app-pub-XXXXXXXXXXXXXXXX/XXXXXXXXXX
```

> **App ID と広告ユニット ID の違い**
>
> - App ID: `~` 区切り（`ca-app-pub-XXXX~XXXX`）→ `app.json` と `Info.plist`
> - 広告ユニット ID: `/` 区切り（`ca-app-pub-XXXX/XXXX`）→ `.env`

- [ ] AdMob の審査が通るまでアプリ公開を待つ（数日かかる場合あり）

---

### ステップ 5｜Google Sign-In

- [ ] [Google Cloud Console](https://console.cloud.google.com) → OAuth 同意画面を **公開済み** に変更
- [ ] iOS OAuth クライアント ID のバンドル ID が `com.ito-dev.bucketlist` になっているか確認
- [ ] Android OAuth クライアント ID にリリース用 SHA-1 フィンガープリントを追加

```bash
# リリース用 Keystore の SHA-1 を取得
keytool -list -v -keystore <your-release.keystore> -alias <alias>
```

- [ ] `ios/bucketlist/Info.plist` の `CFBundleURLSchemes` に iOS クライアントの逆順 ID があるか確認
  - 形式: `com.googleusercontent.apps.XXXXXXXXXX-XXXXXXXXXX`

---

### ステップ 6｜Firebase App Check（不正アクセス対策）

- [ ] Apple Developer Console → Certificates → **DeviceCheck** を有効化
- [ ] Firebase Console → App Check → iOS アプリを DeviceCheck で登録
- [ ] Google Play Console → **Play Integrity API** を有効化
- [ ] Firebase Console → App Check → Android アプリを Play Integrity で登録
- [ ] Firebase Console → App Check → **Firestore・Functions の「強制」をオン**
- [ ] `@react-native-firebase/app-check` をアプリに追加して初期化実装
  > 詳細は `src/lib/firebase.ts` のコメントを参照

---

### ステップ 7｜コード内の仮データを削除

- [ ] `src/features/auth/screens/PlanSelectScreen.tsx` のフォールバック価格を削除し、RevenueCat 未取得時はボタンを非表示にする

```ts
// 削除前（フォールバック価格）
{monthlyPkg ? monthlyPkg.product.priceString : '¥300'}

// 削除後（パッケージ未取得時はボタンごと非表示）
{monthlyPkg && <TouchableOpacity ...>}
```

---

### ステップ 8｜環境変数の最終確認

`.env` の全項目が本番値になっているか確認:

```env
EXPO_PUBLIC_FIREBASE_API_KEY=
EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN=
EXPO_PUBLIC_FIREBASE_PROJECT_ID=
EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET=
EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=
EXPO_PUBLIC_FIREBASE_APP_ID=

EXPO_PUBLIC_GOOGLE_CLIENT_ID_WEB=
EXPO_PUBLIC_GOOGLE_CLIENT_ID_IOS=
EXPO_PUBLIC_GOOGLE_CLIENT_ID_ANDROID=

EXPO_PUBLIC_ADMOB_IOS_BANNER_ID=
EXPO_PUBLIC_ADMOB_ANDROID_BANNER_ID=
EXPO_PUBLIC_ADMOB_IOS_NATIVE_ID=
EXPO_PUBLIC_ADMOB_ANDROID_NATIVE_ID=
```

---

### ステップ 9｜App Store Connect / Google Play Console

- [ ] App Store Connect でアプリを作成（バンドル ID: `com.ito-dev.bucketlist`）
- [ ] Google Play Console でアプリを作成
- [ ] 各ストアで月額・年間・買い切りの In-App Purchase / サブスクリプションを作成・審査提出
- [ ] プライバシーポリシーの URL を用意してストアに登録
- [ ] iOS: ATT（App Tracking Transparency）対応が必要な場合は `Info.plist` に追加

```xml
<key>NSUserTrackingUsageDescription</key>
<string>より関連性の高い広告を表示するために使用します</string>
```

- [ ] AdMob が要求する `SKAdNetworkItems` を `Info.plist` に追加（AdMob コンソールから取得）
- [ ] アプリのスクリーンショット・説明文を各ストアに登録

---

### ステップ 10｜EAS Build（本番ビルド）

```bash
# EAS CLI をインストール（未導入の場合）
npm install -g eas-cli && eas login

# eas.json を設定（初回のみ）
eas build:configure

# iOS 本番ビルド
eas build --platform ios --profile production

# Android 本番ビルド
eas build --platform android --profile production
```

- [ ] iOS: Distribution Certificate と Provisioning Profile が設定されているか
- [ ] Android: Keystore が設定されているか（**Keystore は絶対に紛失しないこと。紛失するとアプリの更新が不可能になる**）

---

### ステップ 11｜最終動作確認

- [ ] Firestore Rules が最新版でデプロイされているか（Firebase Console で確認）
- [ ] Cloud Functions が全て正常起動しているか（Firebase Console → Functions → ログ）
- [ ] RevenueCat サンドボックス購入で月額・年間・買い切りが正常に動作するか
- [ ] 購入後に planType が `premium` に更新され、広告が非表示になるか
- [ ] フリープランで 4 件目のリスト作成がブロックされるか（Cloud Functions による上限）
- [ ] フリープランで 6 個目のタグ作成がブロックされるか（Cloud Functions による上限）
- [ ] 招待コードでリストへの参加が正常に動作するか
- [ ] アカウント削除が正常に動作するか（全データが削除されるか）
- [ ] Google Sign-In が本番環境で動作するか
