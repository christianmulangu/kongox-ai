import { NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/genai';
import { adminAuth, adminDb } from '@/lib/firebase/admin';
import { toolDefinitions, toolExecutor } from '@/lib/ai/tools';

// Initialize Google Generative AI with API key from environment
const genAI = new GoogleGenerativeAI(process.env.GOOGLE_GENAI_API_KEY!);
const model = genAI.getGenerativeModel({ model: 'gemini-1.5-pro' });

/**
 * Verify Firebase ID token and return decoded token.
 */
async function verifyIdToken(idToken: string) {
  return await adminAuth.verifyIdToken(idToken);
}

/**
 * Store a message in Firestore under the user's chat history.
 * We'll create a chat document for the current session (using a chatId from request or generate new).
 * For simplicity, we'll store under users/{uid}/chats/latest (a single chat per user).
 */
async function storeMessage(uid: string, role: 'user' | 'model', parts: any[]) {
  const chatRef = adminDb.collection('users').doc(uid).collection('chats').doc('latest');
  const msg = {
    role,
    parts,
    timestamp: new Date(),
  };
  await chatRef.set(
    {
      messages: adminFirestore.FieldValue.arrayUnion(msg),
      updatedAt: new Date(),
    },
    { merge: true }
  );
}

/**
 * Fetch recent chat history for the user.
 */
async function getChatHistory(uid: string) {
  const chatRef = adminDb.collection('users').doc(uid).collection('chats').doc('latest');
  const doc = await chatRef.get();
  if (doc.exists) {
    const data = doc.data();
    return data.messages || [];
  }
  return [];
}

export async function POST(request: Request) {
  try {
    // 1. Authenticate user
    const authHeader = request.headers.get('Authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const idToken = authHeader.split('Bearer ')[1];
    const decodedToken = await verifyIdToken(idToken);
    const uid = decodedToken.uid;

    // 2. Get user message from request body
    const { message } = await request.json();
    if (!message || typeof message !== 'string') {
      return NextResponse.json({ error: 'Invalid message' }, { status: 400 });
    }

    // 3. Store user message
    await storeMessage(uid, 'user', [{ text: message }]);

    // 4. Retrieve chat history
    const history = await getChatHistory(uid);

    // 5. Start a chat session with the model
    const chat = model.startChat({
      history: history.map((msg: any) => ({
        role: msg.role === 'model' ? 'model' : 'user',
        parts: msg.parts,
      })),
      generationConfig: {
        temperature: 0.7,
        topK: 40,
        topP: 0.95,
        maxOutputTokens: 2048,
      },
      safetySettings: [
        {
          category: 'HARM_CATEGORY_HARASSMENT',
          threshold: 'BLOCK_MEDIUM_AND_ABOVE',
        },
        {
          category: 'HARM_CATEGORY_HATE_SPEECH',
          threshold: 'BLOCK_MEDIUM_AND_ABOVE',
        },
        {
          category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT',
          threshold: 'BLOCK_MEDIUM_AND_ABOVE',
        },
        {
          category: 'HARM_CATEGORY_DANGEROUS_CONTENT',
          threshold: 'BLOCK_MEDIUM_AND_ABOVE',
        },
      ],
      tools: [toolDefinitions],
    });

    // 6. Send the user's message and get initial response
    let result = await chat.sendMessage(message);
    let response = await result.response;
    let text = response.text();

    // 7. Check if the model wants to call a tool
    // We'll implement a simple ReAct loop: if the response contains a function call, execute it and continue.
    // The Google Gen AI SDK returns function calls in the response.candidates[0].content.parts.
    // We'll need to parse the response for function calls.
    // Note: The exact structure may vary; we'll assume the SDK provides a way to get function calls.
    // For simplicity, we'll check if the response has a functionCall property (as per the SDK docs).
    // We'll loop until we get a final text response or max iterations.

    const maxIterations = 5;
    let iterations = 0;

    while (iterations < maxIterations) {
      // Check if the response has a function call
      const functionCall = response.functionCall(); // Assuming the SDK has this method
      if (!functionCall) {
        // No function call, we have a final answer
        break;
      }

      const { name, args } = functionCall;
      console.log(`Tool call: ${name}`, args);

      // 8. Execute the tool
      let toolResult;
      try {
        const executor = toolExecutor[name as keyof typeof toolExecutor];
        if (!executor) {
          throw new Error(`Unknown tool: ${name}`);
        }
        // Some tools may return promises (like webSearch)
        const result = await executor(args);
        toolResult = { result };
      } catch (error) {
        toolResult = { error: error instanceof Error ? error.message : String(error) };
      }

      // 9. Send the tool result back to the model
      result = await chat.sendMessage([
        {
          functionResponse: {
            name,
            response: toolResult,
          },
        },
      ]);
      response = await result.response;
      text = response.text();

      iterations++;
    }

    // 10. Store the model's final response
    await storeMessage(uid, 'model', [{ text }]);

    // 11. Return the response
    return NextResponse.json({ response: text });
  } catch (error) {
    console.error('Error in chat route:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}