# AI要件相談アシスタント

業務委託の要件定義を音声で相談できるAIアシスタントアプリケーション

## 🎯 機能

- **音声対話**: OpenAI Realtime APIを使用した日本語リアルタイム音声対話
- **要件整理**: 業務内容、必要スキル、予算、期間などを会話から自動整理
- **人材提案**: 適切な人材像を一緒に考えるサポート
- **要件保存**: 会話内容を構造化して保存
- **💰 コスト削減機能**:
  - VAD（音声検出）による無音時の課金防止
  - プッシュトゥトーク方式（最大40-60%コスト削減）
  - 会話コンテキストの自動制限
  - プロンプトキャッシュの活用

## 🛠️ 技術スタック

- **フロントエンド**: Next.js 16, React 19, TypeScript, Tailwind CSS
- **バックエンド**: Next.js API Routes
- **AI**: OpenAI Realtime API (gpt-4o-realtime-preview)
- **データベース**: PostgreSQL + Prisma
- **通信**: WebRTC

## 📋 必要要件

- Node.js 20.9.0以上
- PostgreSQL
- OpenAI APIキー

## 🚀 セットアップ

1. リポジトリをクローン

\`\`\`bash
git clone git@github.com:hibik1725/speaking_AI_operator.git
cd speaking_AI_operator
\`\`\`

2. 依存パッケージをインストール

\`\`\`bash
npm install
\`\`\`

3. 環境変数を設定

\`\`\`.env.local
OPENAI_API_KEY=your_openai_api_key_here
DATABASE_URL="postgresql://user:password@localhost:5432/ai_requirement_assistant"
NEXT_PUBLIC_APP_URL=http://localhost:3000
\`\`\`

4. データベースをセットアップ

\`\`\`bash
npx prisma migrate dev --name init
npx prisma generate
\`\`\`

5. 開発サーバーを起動

\`\`\`bash
npm run dev
\`\`\`

6. ブラウザで開く

\`\`\`
http://localhost:3000
\`\`\`

## 📖 使い方

### 基本的な使い方

1. 「会話を開始」ボタンをクリック
2. マイクの使用を許可
3. AIアシスタントと音声で会話
4. 業務内容や要件を話す
5. AIが要件を整理し、構造化して保存

### コスト設定の変更

1. 設定アイコン（⚙️）をクリック
2. 3つのプリセットから選択：
   - **💰 コスト重視**: 自動VAD + コンテキスト制限（デフォルト）
   - **⚖️ バランス**: 高品質 + 広いコンテキスト
   - **🎙️ プッシュトゥトーク**: ボタン押下時のみ送信（最もコスト削減）

### プッシュトゥトークモード

1. コスト設定で「プッシュトゥトーク」を選択
2. 会話を開始
3. 「長押しして話す」ボタンを押しながら話す
4. ボタンを離すとAIが応答

詳細は [コスト最適化ガイド](./docs/COST_OPTIMIZATION.md) を参照してください。

## 🏗️ アーキテクチャ

\`\`\`
フロントエンド (Next.js + React)
  └─ WebRTC接続 ←→ OpenAI Realtime API
           ↓
   バックエンド (Next.js API Routes)
     ├─ エフェメラルキー発行
     ├─ セッション管理
     ├─ 会話履歴保存
     └─ 要件データ管理
           ↓
    データベース (PostgreSQL)
\`\`\`

## 📁 プロジェクト構造

\`\`\`
ai-requirement-assistant/
├── app/
│   ├── api/
│   │   ├── realtime/
│   │   │   └── session/      # OpenAI Realtime API接続
│   │   ├── requirements/      # 要件管理API
│   │   └── sessions/          # セッション管理API
│   ├── globals.css
│   ├── layout.tsx
│   └── page.tsx
├── components/
│   └── VoiceAssistant.tsx     # 音声対話UIコンポーネント
├── lib/
│   ├── openai.ts              # OpenAI設定
│   ├── prisma.ts              # Prisma設定
│   └── cost-config.ts         # コスト削減設定
├── docs/
│   └── COST_OPTIMIZATION.md   # コスト最適化ガイド
├── prisma/
│   └── schema.prisma          # データベーススキーマ
├── types/
│   └── index.ts               # TypeScript型定義
└── README.md
\`\`\`

## 🔑 主要コンポーネント

### VoiceAssistant
- WebRTCを使用したリアルタイム音声対話
- マイク入力とスピーカー出力の管理
- 会話の文字起こし表示

### OpenAI Realtime API統合
- Function Callingによる要件の構造化
- 日本語対応のシステムプロンプト
- 自然な対話フロー

### データベース
- 要件の永続化
- 会話セッションの管理
- メッセージ履歴の保存

## 🎨 カスタマイズ

### システムプロンプトの変更
\`lib/openai.ts\`の\`SYSTEM_INSTRUCTIONS\`を編集

### Function Callingの追加
\`lib/openai.ts\`の\`tools\`配列に新しい関数を追加

### UIのカスタマイズ
\`components/VoiceAssistant.tsx\`のスタイルを編集

## 📝 ライセンス

MIT

## 👥 作者

hibik1725
