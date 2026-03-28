import { ChannelInfo, VideoItem } from './youtube';

const API_KEY = import.meta.env.VITE_GROQ_API_KEY as string;
const BASE_URL = 'https://api.groq.com/openai/v1/chat/completions';
const MODEL = 'llama-3.1-8b-instant';

async function callAI(prompt: string, system: string = "You are a top-tier YouTube strategy AI. You output strict JSON.") {
  if (!API_KEY) {
    throw new Error('Groq API key missing. Set VITE_GROQ_API_KEY and restart the dev server.');
  }
  
  const res = await fetch(BASE_URL, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${API_KEY}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      model: MODEL,
      messages: [
        { role: 'system', content: system },
        { role: 'user', content: prompt }
      ],
      response_format: { type: 'json_object' },
      temperature: 0.7,
      max_tokens: 8192
    })
  });

  if (!res.ok) {
    let message = 'Failed to connect to Groq';
    try {
      const err = await res.json();
      message = err.error?.message || err.message || message;
    } catch {
      try {
        const text = await res.text();
        if (text) message = text;
      } catch {
        // ignore
      }
    }

    if (res.status === 401) {
      throw new Error(`Groq auth failed (401). Check VITE_GROQ_API_KEY and restart the dev server. Details: ${message}`);
    }
    throw new Error(message);
  }

  const data = await res.json();
  try {
    return JSON.parse(data.choices[0].message.content);
  } catch (e) {
    console.error("Failed to parse JSON from AI", data.choices[0].message.content);
    throw new Error("AI returned invalid JSON");
  }
}

// ─── Interfaces ─────────────────────────────────────────────────────────────

export interface InsightsData {
  pillars: { rank: string; title: string; views: string }[];
  retention: number[]; // exactly 16 numbers (0-100)
  indicators: { l: string; v: string; dir: 'up' | 'down' }[];
  opportunities: { tag: string; iconBase: 'TrendingUp' | 'Video'; title: string; desc: string }[];
  summaryQuote: string;
}

export interface CompetitorData {
  competitors: { rank: number; name: string; identifier: string; estViews: string; saturation: 'Low' | 'Med' | 'High'; velocity: string }[];
  avgVelocity: string;
  saturationRisk: string;
  contentGaps: string;
}

// ─── Generators ─────────────────────────────────────────────────────────────

export async function generateInsights(videos: VideoItem[]): Promise<InsightsData> {
  const context = videos.slice(0, 30).map(v => `Title: "${v.title}", Views: ${v.views}, Published: ${v.publishedAt}, Duration: ${v.durationFmt}`).join('\n');
  
  const prompt = `
  Analyze the following recent YouTube videos for a channel.
  ${context}

  Based on these titles and performance, identify the top 3 high-performing content "pillars" or clusters.
  Also generate an estimated 16-point retention graph (percentages from 40 to 100).
  Identify 3 numeric trending indicators.
  Identify 2 specific strategic growth opportunities.
  Provide a short, punchy 1-sentence quote summarizing their strategic standing.
  
  Return exactly this JSON structure:
  {
    "pillars": [ { "rank": "01", "title": "Example Pillar", "views": "250k" } ... exactly 3 ],
    "retention": [ 45, 55, ... exactly 16 integers ],
    "indicators": [ { "l": "Search Velocity", "v": "+12%", "dir": "up" } ... exactly 3 ],
    "opportunities": [ { "tag": "High Impact", "iconBase": "TrendingUp", "title": "Idea", "desc": "Description" } ... exactly 2 ],
    "summaryQuote": "Their velocity in..."
  }`;

  return callAI(prompt);
}

export async function generateCompetitors(channelInfo: ChannelInfo, videos: VideoItem[]): Promise<CompetitorData> {
  const context = videos.slice(0, 15).map(v => `"${v.title}"`).join(', ');

  const prompt = `
  The channel "${channelInfo.title}" has ${channelInfo.subscriberCount} subscribers.
  Recent videos: ${context}.
  
  Infer the niche of this channel. Then, hallucinate 4 realistic, highly-probable competitor channels operating in this exact niche along with their estimated metrics to simulate real market intelligence.
  
  Return exactly this JSON structure:
  {
    "avgVelocity": "+14.2%",
    "saturationRisk": "Low Sector",
    "contentGaps": "12 Found",
    "competitors": [
      {
        "rank": 1,
        "name": "Competitor Channel Name",
        "identifier": "@handle",
        "estViews": "425k",
        "saturation": "High",
        "velocity": "+12.4%"
      } // exactly 4 competitors
    ]
  }`;

  return callAI(prompt);
}

export async function generateReportContent(type: string, channelInfo: ChannelInfo, videos: VideoItem[]): Promise<string> {
  const context = videos.slice(0, 30).map(v => `Title: "${v.title}", Views: ${v.views}`).join('\n');
  
  const prompt = `
  Generate a professional, detailed markdown report of type "${type}" for the channel "${channelInfo.title}".
  Video Context:
  ${context}

  Return the report directly. Do NOT use JSON format, just output beautiful, structured markdown text. Include headings, bullet points, and actionable takeaways.
  `;

  if (!API_KEY) {
    throw new Error('Groq API key missing. Set VITE_GROQ_API_KEY and restart the dev server.');
  }
  
  const res = await fetch(BASE_URL, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${API_KEY}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      model: MODEL,
      messages: [
        { role: 'system', content: 'You are an elite YouTube analyst. Output markdown reports.' },
        { role: 'user', content: prompt }
      ],
      temperature: 0.7,
      max_tokens: 8192
    })
  });

  if (!res.ok) {
    let message = 'Failed to connect to Groq';
    try {
      const err = await res.json();
      message = err.error?.message || err.message || message;
    } catch {
      try {
        const text = await res.text();
        if (text) message = text;
      } catch {
        // ignore
      }
    }
    if (res.status === 401) {
      throw new Error(`Groq auth failed (401). Check VITE_GROQ_API_KEY and restart the dev server. Details: ${message}`);
    }
    throw new Error(message);
  }

  const data = await res.json();
  return data.choices?.[0]?.message?.content || '# Error generating report';
}
