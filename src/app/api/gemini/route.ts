import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  const { metadata, content } = await req.json();

  // Call Gemini API
  const geminiRes = await fetch('https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=' + process.env.GEMINI_API_KEY, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [
        { parts: [{ text: `Suggest form fields for this document. Metadata: ${JSON.stringify(metadata)}. Content: ${content}` }] }
      ]
    })
  });

  const data = await geminiRes.json();
  return NextResponse.json(data);
}
