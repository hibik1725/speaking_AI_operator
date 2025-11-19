import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// 要件を保存
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      task_title,
      task_description,
      skills_required,
      experience,
      budget_min,
      budget_max,
      duration_value,
      duration_unit,
      preferred_characteristics,
      must_have_skills,
      nice_to_have_skills,
      session_id,
    } = body;

    const requirement = await prisma.requirement.create({
      data: {
        taskTitle: task_title,
        taskDescription: task_description,
        skillsRequired: skills_required || [],
        experience: experience,
        budgetMin: budget_min,
        budgetMax: budget_max,
        budgetCurrency: 'JPY',
        durationValue: duration_value,
        durationUnit: duration_unit,
        preferredCharacteristics: preferred_characteristics || [],
        mustHaveSkills: must_have_skills || [],
        niceToHaveSkills: nice_to_have_skills || [],
      },
    });

    // セッションIDがある場合は紐付け
    if (session_id) {
      await prisma.conversationSession.update({
        where: { id: session_id },
        data: { requirementId: requirement.id },
      });
    }

    return NextResponse.json({ requirement });
  } catch (error) {
    console.error('Error saving requirement:', error);
    return NextResponse.json(
      { error: 'Failed to save requirement' },
      { status: 500 }
    );
  }
}

// 要件一覧を取得
export async function GET() {
  try {
    const requirements = await prisma.requirement.findMany({
      orderBy: { createdAt: 'desc' },
      take: 20,
    });

    return NextResponse.json({ requirements });
  } catch (error) {
    console.error('Error fetching requirements:', error);
    return NextResponse.json(
      { error: 'Failed to fetch requirements' },
      { status: 500 }
    );
  }
}
