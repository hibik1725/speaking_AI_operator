import { NextRequest, NextResponse } from 'next/server';
import { openai, SYSTEM_INSTRUCTIONS, tools } from '@/lib/openai';
import { DEFAULT_COST_CONFIG, type CostConfig } from '@/lib/cost-config';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      voice = 'alloy',
      costConfig = DEFAULT_COST_CONFIG
    }: {
      voice?: string;
      costConfig?: CostConfig
    } = body;

    // VAD設定を構築
    const turnDetection = costConfig.mode === 'push-to-talk' || !costConfig.vad.enabled
      ? null // PTTモード or VAD無効の場合はnull
      : {
          type: 'server_vad' as const,
          threshold: costConfig.vad.threshold,
          prefix_padding_ms: costConfig.vad.prefixPaddingMs,
          silence_duration_ms: costConfig.vad.silenceDurationMs,
        };

    // OpenAI Realtime API用のエフェメラルキーを生成
    const response = await openai.sessions.create({
      model: 'gpt-4o-realtime-preview',
      voice: voice,
      instructions: SYSTEM_INSTRUCTIONS,
      tools: tools,
      modalities: ['text', 'audio'],
      temperature: 0.8,
      max_response_output_tokens: costConfig.context.maxTokens,
      input_audio_format: 'pcm16',
      output_audio_format: 'pcm16',
      turn_detection: turnDetection,
    });

    return NextResponse.json({
      client_secret: response.client_secret,
      costConfig: costConfig, // クライアントに設定を返す
    });
  } catch (error) {
    console.error('Error creating session:', error);
    return NextResponse.json(
      { error: 'Failed to create session' },
      { status: 500 }
    );
  }
}
