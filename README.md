# BucketList

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
- リストの作成・削除
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
- 表示名・プロフィール画像の編集
- パスワードの変更（現在のパスワード確認あり）
- タグ管理画面へのアクセス

### プラン
| 項目 | フリー | プレミアム |
|---|---|---|
| 作成できるリスト数 | 3 | 無制限 |
| リストあたりのメンバー数 | 2 | 10 |
| 作成できるタグ数 | 5 | 無制限 |

---

## 技術スタック

| カテゴリ | 技術 |
|---|---|
| フレームワーク | [Expo](https://expo.dev/) SDK 55 (Managed Workflow) |
| UI | [React Native](https://reactnative.dev/) 0.83.2 |
| スタイリング | [NativeWind](https://www.nativewind.dev/) v4（Tailwind CSS） |
| アイコン | [Lucide React Native](https://lucide.dev/) |
| 状態管理 | [Zustand](https://zustand-demo.pmnd.rs/) v5 |
| ナビゲーション | [React Navigation](https://reactnavigation.org/)（Stack + Bottom Tabs） |
| バックエンド | [Firebase](https://firebase.google.com/)（Auth / Firestore / Storage） |
| 認証 | Firebase Authentication（Email/Password・Google） |
| DB | Cloud Firestore |
| ストレージ | Firebase Storage（アイテム画像） |
| 永続化 | [@react-native-async-storage/async-storage](https://github.com/react-native-async-storage/async-storage) |
| ドラッグ操作 | [react-native-draggable-flatlist](https://github.com/computerjazz/react-native-draggable-flatlist) |
| 言語 | TypeScript 5.9 |

---

## ディレクトリ構成

```
src/
├── components/          # 共通コンポーネント（TextInput など）
├── features/
│   ├── auth/            # 認証（ログイン・新規登録）
│   ├── list/            # リスト・アイテム管理
│   ├── profile/         # プロフィール・パスワード変更
│   ├── tag/             # タグ管理
│   └── invite/          # 招待コード
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
  - displayName, email, photoURL, planType, createdAt, updatedAt

/users/{uid}/tags/{tagId}
  - name, color, createdAt, updatedAt

/lists/{listId}
  - title, ownerId, memberIds[], createdAt, updatedAt

/lists/{listId}/items/{itemId}
  - title, description, url, imageURL, status, tagIds[]
  - order, createdBy, completedAt, createdAt, updatedAt

/invites/{code}
  - listId, createdBy, expiresAt, usedBy[], createdAt
```

---

## 注意事項

- `.env` ファイルには機密情報が含まれるため、`.gitignore` に追加し、リポジトリにコミットしないでください。
- タグはリストオーナーのものが全メンバーに共有されます。メンバーはオーナーのタグをアイテムに付与できますが、タグの作成・削除はオーナー本人のみ行えます。
- RevenueCat の API Key が未設定（`XXXX` のまま）の場合、購入・復元機能はスキップされます。開発中はエラーなしで動作します。

---

## 本番リリース前の対応チェックリスト

### 1. RevenueCat（課金）

- [ ] [app.revenuecat.com](https://app.revenuecat.com) でアカウント・プロジェクトを作成
- [ ] App Store Connect / Google Play にアプリを登録し、以下の商品を作成
  - 月額サブスクリプション（例: `com.ito-dev.bucketlist.premium.monthly`）
  - 買い切りプラン（例: `com.ito-dev.bucketlist.premium.lifetime`）
- [ ] RevenueCat でエンタイトルメント `premium`、オファリング `default` を作成し商品を紐付け
- [ ] `src/features/upgrade/services/purchaseService.ts` の API Key を差し替え

```ts
// Before（開発用プレースホルダー）
ios: 'appl_XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX',
android: 'goog_XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX',

// After（RevenueCat ダッシュボード → Project Settings → API Keys）
ios: 'appl_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx',
android: 'goog_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx',
```

---

### 2. AdMob（広告）

- [ ] [admob.google.com](https://admob.google.com) でアプリを登録し、バナー広告ユニットを作成
- [ ] `app.json` の AdMob App ID を差し替え

```json
// Before（Google テスト用 App ID）
"androidAppId": "ca-app-pub-3940256099942544~3347511713",
"iosAppId": "ca-app-pub-3940256099942544~1458002511"

// After（AdMob コンソール → アプリ → アプリの設定）
"androidAppId": "ca-app-pub-XXXXXXXXXXXXXXXX~XXXXXXXXXX",
"iosAppId": "ca-app-pub-XXXXXXXXXXXXXXXX~XXXXXXXXXX"
```

- [ ] `ios/bucketlist/Info.plist` の `GADApplicationIdentifier` を同じ iOS 本番 App ID に差し替え
- [ ] `.env` にバナー広告ユニット ID を追加（App ID とは別。AdMob コンソール → 広告ユニット）

```env
EXPO_PUBLIC_ADMOB_IOS_BANNER_ID=ca-app-pub-XXXXXXXXXXXXXXXX/XXXXXXXXXX
EXPO_PUBLIC_ADMOB_ANDROID_BANNER_ID=ca-app-pub-XXXXXXXXXXXXXXXX/XXXXXXXXXX
```

> **App ID と広告ユニット ID の違い**
> - App ID: `~` 区切り（`ca-app-pub-XXXX~XXXX`）→ `app.json` と `Info.plist` に設定
> - 広告ユニット ID: `/` 区切り（`ca-app-pub-XXXX/XXXX`）→ `.env` に設定

---

### 3. Firebase

- [ ] Firestore セキュリティルールを再デプロイ（`planType` の更新ルールを追加済み）

```bash
firebase deploy --only firestore:rules --project <your_project_id>
```

---

### 4. ストア申請

- [ ] App Store Connect でアプリ情報・スクリーンショット・プライバシーポリシー URL を登録
- [ ] iOS 14+ 向けに ATT（App Tracking Transparency）の対応が必要な場合は `Info.plist` に追加

```xml
<key>NSUserTrackingUsageDescription</key>
<string>より関連性の高い広告を表示するために使用します</string>
```

- [ ] AdMob が要求する `SKAdNetworkItems` を `Info.plist` に追加（AdMob コンソールから取得）
- [ ] サンドボックスアカウントで購入フローの動作確認
