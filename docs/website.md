# 公式LP

## 実装

- 静的HTML/CSSを `web/public/` に配置。既存のCloudflare Pages Git連携を継続利用します。
- `/` はLP、既存の `/privacy/`・`/terms/`・`/tokushoho/` は維持。
- ヒーロー画像はSimulatorで撮影した実データ入りのリスト詳細画面です。広告と検証ポップアップはCSSの表示範囲外にしています。元画像は `assets/website/images/iphone-home-crop.png`、配信用JPEGは `web/public/images/iphone-home.jpg`。
- 上部右側のApp StoreボタンをApple風バッジに変更し、ヒーロー内のボタンと「無料で始められます · iPhone / iPad」、端末撮影説明のキャプションを削除しました。
- OGP画像は `assets/website/images/og-image.svg` が編集元。faviconは既存アプリアイコン。
- SEO/OGP、canonical、JSON-LD、sitemap、robots、見出し構造、alt、FAQ、skip link、reduced-motion対応を設定。

## ローカル起動と確認

```bash
python3 -m http.server 4173 --directory web/public
```

`http://localhost:4173/` を開く。今回の変更後、スマートフォン幅でナビゲーション、実データ入りヒーロー画像、CTAとコンテンツの表示を確認しました。デスクトップ幅は未確認です。

## 公開

Cloudflare PagesのGit連携により、`main`へのpushで本番デプロイします。対象プロジェクトは `app-bucketlist.pages.dev`。デプロイ後は `/`、`/privacy/`、`/terms/`、`/tokushoho/`、`/og-image.svg`、`/images/iphone-home.jpg` を確認してください。

## 表示内容

フリーの上限はリスト3件・共有メンバー2人・タグ5個、プレミアムはリスト/タグ無制限・メンバー最大10人・広告非表示。価格は月額300円、年額2,400円、買い切り4,800円です。変更前にアプリとApp Storeの現行表示を確認してください。
