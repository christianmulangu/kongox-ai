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

    // Récupération de la clé depuis l'une ou l'autre des variables d'environnement
    const apiKey = process.env.GOOGLE_GENAI_API_KEY || process.env.GEMINI_API_KEY;

    if (!apiKey) {
      console.error("Clé API manquante dans process.env");
      return NextResponse.json(
        { error: "La clé d'API GOOGLE_GENAI_API_KEY ou GEMINI_API_KEY est introuvable sur le serveur." },
        { status: 500 }
      );
    }

    // Initialisation du SDK avec la clé transmise explicitement
    const ai = new GoogleGenAI({ apiKey: apiKey });

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
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