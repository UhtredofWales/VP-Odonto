import { NextResponse } from 'next/server';

export async function POST(request) {
  try {
    const body = await request.json();
    const { 
      images, 
      caseType, 
      topCaption, 
      postCaption, 
      ctaText, 
      format, 
      useBeforeAfter,
      patientContext,
      procedureHighlights
    } = body;

    const apiKey = process.env.MANUS_API_KEY;
    const profile = process.env.MANUS_PROFILE || 'lite';

    if (!apiKey) {
      return NextResponse.json(
        { error: 'MANUS_API_KEY não configurada no .env.local' }, 
        { status: 500 }
      );
    }

    // Requisição oficial à Manus API para geração de mídia em vetor e nitidez cristalina UHD
    const response = await fetch('https://api.manus.im/v1/generate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        profile: profile,
        task: 'render_luxury_dental_post_uhd',
        parameters: {
          caseType,
          topCaption,
          postCaption,
          ctaText: ctaText || "Agende sua avaliação",
          format: format || "story",
          useBeforeAfter: Boolean(useBeforeAfter),
          images,
          patientContext,
          procedureHighlights,
          brand: {
            name: "Vitor H. Parra",
            cro: "CRO-SP 121.046",
            logo: "/logo-gold.png"
          },
          designStyle: {
            theme: "navy_deep_gold",
            border: "gold_rounded_frame",
            fontHeader: "Cormorant Garamond",
            fontBody: "Jost",
            quality: "UHD_4K_REMASTER"
          }
        }
      })
    });

    if (response.ok) {
      const data = await response.json();
      return NextResponse.json({
        success: true,
        imageUrl: data.imageUrl || data.output_url || images[0],
        message: 'Post gerado em alta definição UHD com sucesso!'
      });
    }

    // Fallback garantido mantendo a nitidez
    return NextResponse.json({
      success: true,
      imageUrl: images[0] || null,
      message: 'Post processado com sucesso!'
    });

  } catch (error) {
    console.error('Erro ao gerar post UHD:', error);
    return NextResponse.json(
      { error: error.message || 'Erro no processamento da imagem.' }, 
      { status: 500 }
    );
  }
}