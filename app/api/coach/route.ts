import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

const SYSTEM_PROMPT = `You are Coach, an AI sports and prediction market analyst for XPredict.
You provide contextual insights about prediction markets: head-to-head stats, recent form, historical trends, and relevant context.
You NEVER tell users what to predict or which side to pick. You only provide information.
Keep responses concise (under 150 words). Be factual and specific.`;

export async function POST(req: NextRequest) {
  try {
    const { question, marketQuestion, messages } = await req.json();

    const history = (messages ?? []).slice(-6).map((m: { role: string; content: string }) => ({
      role: m.role as 'user' | 'assistant',
      content: m.content
    }));

    const res = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: `${SYSTEM_PROMPT}\n\nCurrent market: "${marketQuestion}"` },
        ...history,
        { role: 'user', content: question }
      ],
      temperature: 0.5,
      max_tokens: 200
    });

    return NextResponse.json({ reply: res.choices[0].message.content });
  } catch (err) {
    console.error('coach error:', err);
    return NextResponse.json({ error: 'Coach unavailable' }, { status: 500 });
  }
}
