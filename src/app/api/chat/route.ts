import { NextResponse } from 'next/server';
import { GoogleGenAI } from '@google/genai';
import { adminAuth, adminDb } from '@/lib/firebase/admin';

const genAI = new GoogleGenAI({ apiKey: process.env.GOOGLE_GENAI_API_KEY! });

export async function POST(req: Request) {
  try {
    const { message } = await req.json();

    const response = await genAI.models.generateContent({
      model: 'gemini-1.5-pro',
      contents: message,
    });

    return NextResponse.json({ result: response.text });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}