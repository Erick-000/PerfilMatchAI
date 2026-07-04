import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';

export async function POST(request: NextRequest) {
  try {
    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json(
        { error: 'Falta configurar la clave de OpenAI.' },
        { status: 500 }
      );
    }

    const openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });

    const { cv, jobDescription } = await request.json();

    if (!cv || !jobDescription) {
      return NextResponse.json(
        { error: 'Por favor ingresa tanto el CV como la descripción de la vacante.' },
        { status: 400 }
      );
    }

    const prompt = `
Analiza la siguiente hoja de vida y descripción de vacante. Devuelve UNICAMENTE un JSON con la siguiente estructura, sin texto adicional:
{
  "matchScore": número entre 0 y 100 (calcula basado en la coincidencia de habilidades y experiencia requerida vs la del CV),
  "matchingSkills": ["habilidad 1", "habilidad 2", ...],
  "missingSkills": ["habilidad 1", "habilidad 2", ...],
  "recommendations": ["recomendación 1", "recomendación 2", ...],
  "optimizedSummary": "resumen profesional optimizado para la vacante"
}

Hoja de vida:
${cv}

Descripción de vacante:
${jobDescription}
`;

    const completion = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.2,
      seed: 42,
    });

    const content = completion.choices[0]?.message?.content;
    if (!content) {
      throw new Error('No se recibió respuesta de OpenAI');
    }

    const result = JSON.parse(content.trim());

    return NextResponse.json(result);
  } catch (error: any) {
    console.error('Error en la API:', error);
    
    if (error.code === 'insufficient_quota' || error.status === 429) {
      return NextResponse.json(
        { error: 'Tu API key de OpenAI excedió el límite de créditos o cuota. Por favor revisa tu plan en https://platform.openai.com/usage.' },
        { status: 402 }
      );
    }

    if (error.code === 'invalid_api_key' || error.status === 401) {
      return NextResponse.json(
        { error: 'La API key de OpenAI es incorrecta o inválida. Por favor revisa tu clave en https://platform.openai.com/account/api-keys.' },
        { status: 401 }
      );
    }
    
    return NextResponse.json(
      { error: 'Ocurrió un error al analizar el CV. Por favor intenta nuevamente.' },
      { status: 500 }
    );
  }
}
