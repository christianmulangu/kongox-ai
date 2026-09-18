import { NextResponse } from 'next/server';
import { GoogleGenAI } from '@google/genai';

export async function POST(req: Request) {
  try {
    const { message } = await req.json();

    if (!message) {
      return NextResponse.json(
        { error: 'Le message est requis.' },
        { status: 400 }
      );
    }

    const apiKey = process.env.GOOGLE_GENAI_API_KEY;

    if (!apiKey) {
      return NextResponse.json(
        { error: "La clé d'API GOOGLE_GENAI_API_KEY est manquante sur le serveur." },
        { status: 500 }
      );
    }

    // Initialisation explicite de l'instance SDK avec la clé d'API
    const ai = new GoogleGenAI({ apiKey });

    // Appel au modèle Gemini
    const response = await ai.models.generateContent({
      model: 'gemini-1.5-flash',
      contents: message,
    });

    return NextResponse.json({ response: response.text });
  } catch (error: any) {
    console.error('Erreur API Chat:', error);
    return NextResponse.json(
      { error: error.message || 'Une erreur interne est survenue.' },
      { status: 500 }
    );
  }
}