// 要件定義の型
export interface Requirement {
  id: string;
  userId?: string;
  taskTitle: string;
  taskDescription: string;
  skillsRequired: string[];
  experience: string;
  budget?: {
    min: number;
    max: number;
    currency: string;
  };
  duration?: {
    value: number;
    unit: 'hours' | 'days' | 'weeks' | 'months';
  };
  preferredPersonProfile?: {
    characteristics: string[];
    mustHave: string[];
    niceToHave: string[];
  };
  createdAt: Date;
  updatedAt: Date;
}

// 会話セッションの型
export interface ConversationSession {
  id: string;
  userId?: string;
  requirementId?: string;
  startedAt: Date;
  endedAt?: Date;
  status: 'active' | 'completed' | 'abandoned';
  messages: ConversationMessage[];
}

// 会話メッセージの型
export interface ConversationMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: Date;
  audioTranscript?: string;
}

// OpenAI Realtime API イベントの型
export interface RealtimeEvent {
  type: string;
  event_id?: string;
  [key: string]: unknown;
}

// エフェメラルキーのレスポンス型
export interface EphemeralKeyResponse {
  client_secret: {
    value: string;
    expires_at: number;
  };
}
