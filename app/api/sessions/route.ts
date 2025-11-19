import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// セッションを作成
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId } = body;

    const session = await prisma.conversationSession.create({
      data: {
        userId: userId,
        status: 'active',
      },
    });

    return NextResponse.json({ session });
  } catch (error) {
    console.error('Error creating session:', error);
    return NextResponse.json(
      { error: 'Failed to create session' },
      { status: 500 }
    );
  }
}

// セッション一覧を取得
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    const sessions = await prisma.conversationSession.findMany({
      where: userId ? { userId } : undefined,
      include: {
        requirement: true,
        messages: {
          orderBy: { timestamp: 'asc' },
        },
      },
      orderBy: { startedAt: 'desc' },
      take: 20,
    });

    return NextResponse.json({ sessions });
  } catch (error) {
    console.error('Error fetching sessions:', error);
    return NextResponse.json(
      { error: 'Failed to fetch sessions' },
      { status: 500 }
    );
  }
}
