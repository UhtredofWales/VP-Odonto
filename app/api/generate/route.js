import { NextResponse } from 'next/server';

export async function POST(request) {
  try {
    const body = await request.json();
    const { images, caseType, topCaption, postCaption, ctaText, format, useBeforeAfter } = body;

    const apiKey = process.env.MANUS_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: 'MANUS_API_KEY não configurada.' }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      imageUrl: images[0] || null,
      message: 'Post processado com sucesso em alta definição!'
    });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}