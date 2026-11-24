# 公式LP

## 実装

- 静的HTML/CSSを `web/public/` に配置。Cloudflare PagesへGit連携で配信する想定。
- `/` はLP、既存の `/privacy/`・`/terms/`・`/tokushoho/` は維持。
- ヒーロー画像はSimulatorで撮影したiPhone 17 Pro Maxのマイリスト画面。広告が始まる手前を切り抜き、CSSで端末縦横比に合わせています。制作元の切り抜きPNGは `assets/website/images/iphone-home-crop.png`、配信用JPEGは `web/public/images/iphone-home.jpg`。
- OGP画像は `assets/website/images/og-image.svg` が編集元。faviconは既存アプリアイコン。
- `visuals.css` にヒーロー画面の端末フレームと装飾を定義。

## ローカル確認

```bash
python3 -m http.server 4173 --directory web/public
```

`http://localhost:4173/` を開く。デスクトップでページ構成・ヒーロー画像・FAQを確認し、スマートフォン幅で折り返しと横はみ出しがないことを確認する。

## 公開

Cloudflare Pagesがこのリポジトリの `web/public/` を出力ディレクトリにしている場合、対象ブランチへのpushでデプロイされます。Pagesのビルド設定が不明な場合はCloudflare DashboardでプロジェクトのGit連携と出力先を確認します。デプロイ後は `/`、`/privacy/`、`/terms/`、`/tokushoho/`、`/og-image.svg`、`/images/iphone-home.jpg` を開いて確認してください。

## SEO・アクセシビリティ

title / description、canonical、OGP、Twitterカード、JSON-LD `MobileApplication`、sitemap、robots、見出し構造、alt、キーボードで開けるFAQ、skip link、reduced-motion対応を設定。

## 表示内容

App Store掲載内容とアプリ実装を確認して反映。フリーの上限はリスト3件・共有メンバー2人・タグ5個、プレミアムはリスト/タグ無制限・メンバー最大10人・広告非表示。プレミアム価格は月額300円、年額2,400円、買い切り4,800円。価格が変わった場合はアプリ内およびApp Storeの表記を確認し、LPも更新します。
