import OpenAI from 'openai';

if (!process.env.OPENAI_API_KEY) {
  throw new Error('OPENAI_API_KEY is not set in environment variables');
}

export const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// システムプロンプト
export const SYSTEM_INSTRUCTIONS = `あなたは業務委託の要件定義をサポートする親切なAIアシスタントです。

## 役割
ユーザーが外部に業務を委託する際に、以下をサポートします：
1. 業務内容の詳細なヒアリング
2. 必要なスキルセットの整理
3. 適切な人材像の定義
4. 予算や期間の設定
5. 要件定義書の作成

## 対話の進め方
1. まず、どのような業務を委託したいのか、概要を聞いてください
2. 具体的な作業内容や成果物について深掘りします
3. 必要なスキルや経験レベルを一緒に考えます
4. 予算感や期間について確認します
5. どのような人物が適しているか、性格や特性も含めて検討します
6. 最後に要件を整理してまとめます

## 対話のスタイル
- 日本語で自然に会話してください
- 専門用語は分かりやすく説明してください
- ユーザーの言葉を引き出すように質問してください
- 曖昧な部分は確認しながら進めてください
- 相手の立場に立った提案を心がけてください

## 要件の構造化
会話を通じて以下の情報を収集し、構造化してください：
- タスク名（task_title）
- タスク詳細（task_description）
- 必要スキル（skills_required）
- 経験レベル（experience）
- 予算（budget）
- 期間（duration）
- 望ましい人物像（preferred_person_profile）

必要な情報が集まったら、save_requirement関数を使って保存してください。`;

// Function Calling用のツール定義
export const tools = [
  {
    type: 'function' as const,
    name: 'save_requirement',
    description: '会話を通じて収集した要件情報を保存します。すべての必須情報が揃ったときに呼び出してください。',
    parameters: {
      type: 'object',
      properties: {
        task_title: {
          type: 'string',
          description: '委託したい業務のタイトル（例：「ECサイトのフロントエンド開発」）',
        },
        task_description: {
          type: 'string',
          description: '業務の詳細な説明。具体的な作業内容や成果物を含む',
        },
        skills_required: {
          type: 'array',
          items: { type: 'string' },
          description: '必要なスキルのリスト（例：["React", "TypeScript", "Tailwind CSS"]）',
        },
        experience: {
          type: 'string',
          description: '必要な経験レベル（例：「3年以上の実務経験」）',
        },
        budget_min: {
          type: 'number',
          description: '予算の下限（円）',
        },
        budget_max: {
          type: 'number',
          description: '予算の上限（円）',
        },
        duration_value: {
          type: 'number',
          description: '期間の数値',
        },
        duration_unit: {
          type: 'string',
          enum: ['hours', 'days', 'weeks', 'months'],
          description: '期間の単位',
        },
        preferred_characteristics: {
          type: 'array',
          items: { type: 'string' },
          description: '望ましい人物の特性（例：["コミュニケーション能力が高い", "自己管理ができる"]）',
        },
        must_have_skills: {
          type: 'array',
          items: { type: 'string' },
          description: '必須のスキル',
        },
        nice_to_have_skills: {
          type: 'array',
          items: { type: 'string' },
          description: 'あると望ましいスキル',
        },
      },
      required: ['task_title', 'task_description', 'skills_required', 'experience'],
    },
  },
];
