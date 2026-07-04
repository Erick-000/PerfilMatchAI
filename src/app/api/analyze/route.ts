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
Analiza la siguiente hoja de vida y descripción de vacante. Devuelve un JSON con la siguiente estructura (sin texto adicional, solo el JSON):
{
  "matchScore": número entre 0 y 100,
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
      temperature: 0.7,
    });

    const content = completion.choices[0]?.message?.content;
    if (!content) {
      throw new Error('No se recibió respuesta de OpenAI');
    }

    const result = JSON.parse(content.trim());

    return NextResponse.json(result);
  } catch (error) {
    console.error('Error en la API:', error);
    return NextResponse.json(
      { error: 'Ocurrió un error al analizar el CV. Por favor intenta nuevamente.' },
      { status: 500 }
    );
  }
}
