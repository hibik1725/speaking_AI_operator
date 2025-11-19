import { NextRequest, NextResponse } from 'next/server';
import { openai, SYSTEM_INSTRUCTIONS, tools } from '@/lib/openai';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { voice = 'alloy' } = body;

    // OpenAI Realtime API用のエフェメラルキーを生成
    const response = await openai.sessions.create({
      model: 'gpt-4o-realtime-preview',
      voice: voice,
      instructions: SYSTEM_INSTRUCTIONS,
      tools: tools,
      modalities: ['text', 'audio'],
      temperature: 0.8,
      max_response_output_tokens: 4096,
      input_audio_format: 'pcm16',
      output_audio_format: 'pcm16',
      turn_detection: {
        type: 'server_vad',
        threshold: 0.5,
        prefix_padding_ms: 300,
        silence_duration_ms: 500,
      },
    });

    return NextResponse.json({
      client_secret: response.client_secret,
    });
  } catch (error) {
    console.error('Error creating session:', error);
    return NextResponse.json(
      { error: 'Failed to create session' },
      { status: 500 }
    );
  }
}
