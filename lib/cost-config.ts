// コスト削減のための設定

export interface CostConfig {
  mode: 'auto-vad' | 'push-to-talk';
  vad: {
    enabled: boolean;
    threshold: number; // 0.0-1.0: 高いほど検出感度が低い（無音判定しやすい）
    prefixPaddingMs: number; // 発話開始前の音声バッファ
    silenceDurationMs: number; // この時間無音が続いたら発話終了と判定
  };
  context: {
    maxConversationItems: number; // 保持する会話アイテムの最大数
    maxTokens: number; // 1回の応答の最大トークン数
  };
  cache: {
    enabled: boolean; // プロンプトキャッシュを有効化
  };
}

// デフォルト設定（コスト重視）
export const DEFAULT_COST_CONFIG: CostConfig = {
  mode: 'auto-vad',
  vad: {
    enabled: true,
    threshold: 0.6, // デフォルト0.5より高め = 無音判定しやすい
    prefixPaddingMs: 300,
    silenceDurationMs: 700, // デフォルト500msより長め = より確実に発話終了を検出
  },
  context: {
    maxConversationItems: 20, // 過去20件まで保持
    maxTokens: 2048, // 応答を2048トークンに制限
  },
  cache: {
    enabled: true,
  },
};

// 高品質設定（コストより品質重視）
export const HIGH_QUALITY_CONFIG: CostConfig = {
  mode: 'auto-vad',
  vad: {
    enabled: true,
    threshold: 0.4, // 低め = 音声検出しやすい
    prefixPaddingMs: 500,
    silenceDurationMs: 400, // 短め = 素早く応答
  },
  context: {
    maxConversationItems: 50,
    maxTokens: 4096,
  },
  cache: {
    enabled: true,
  },
};

// プッシュトゥトーク設定（最もコスト削減）
export const PUSH_TO_TALK_CONFIG: CostConfig = {
  mode: 'push-to-talk',
  vad: {
    enabled: false, // PTT時はVAD不要
    threshold: 0.5,
    prefixPaddingMs: 300,
    silenceDurationMs: 500,
  },
  context: {
    maxConversationItems: 15,
    maxTokens: 1024,
  },
  cache: {
    enabled: true,
  },
};

export const COST_PRESETS = {
  'cost-optimized': DEFAULT_COST_CONFIG,
  'balanced': HIGH_QUALITY_CONFIG,
  'push-to-talk': PUSH_TO_TALK_CONFIG,
} as const;

export type CostPreset = keyof typeof COST_PRESETS;
