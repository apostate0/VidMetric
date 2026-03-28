import type { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const apiKey = process.env.OPENROUTER_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: 'OpenRouter API key not configured' });
  }

  const { prompt, system, model, response_format } = req.body;

  try {
    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'HTTP-Referer': req.headers.origin || 'https://vidmetrics.vercel.app',
        'X-Title': 'VidMetrics',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: model || 'google/gemini-2.5-flash:free',
        messages: [
          { role: 'system', content: system || 'You are a top-tier YouTube strategy AI. You output strict JSON.' },
          { role: 'user', content: prompt },
        ],
        response_format: response_format || { type: 'json_object' },
      }),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      return res.status(response.status).json({ error: error.error?.message || 'OpenRouter request failed' });
    }

    const data = await response.json();
    res.status(200).json(data);
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Internal server error' });
  }
}
