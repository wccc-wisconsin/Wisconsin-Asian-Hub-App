import type { VercelRequest, VercelResponse } from '@vercel/node'

const SYSTEM_PROMPT = `You are the Wisconsin Asian Hub Assistant, a helpful AI for the Wisconsin Chinese Chamber of Commerce (WCCC) community app at hub.wcccbusinessnetwork.org.

You help community members with:
1. Finding member businesses by city or category in Wisconsin
2. Learning about upcoming events and workshops
3. Navigating the app (Members tab, Videos tab, Board tab, Chat tab)
4. Answering questions about WCCC and the Wisconsin Asian community
5. General questions in a friendly, professional tone

App navigation guide:
- Members tab: Browse 252+ WCCC member businesses, filter by city (Appleton, Brookfield, Madison, Milwaukee etc.) and category
- Videos tab: Watch WCCC community videos and event recordings
- Board tab: Community posts, announcements, and event RSVPs
- Chat tab: This AI assistant

Keep responses concise and helpful. Be warm and welcoming. If you don't know specific member details, suggest they use the Members tab to search. Always respond in English unless the user writes in another language.`

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Only allow POST
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  // Basic origin check
  const origin = req.headers.origin ?? ''
  const allowed = [
    'https://hub.wcccbusinessnetwork.org',
    'https://wisconsinasianhubapp.vercel.app',
  ]
  if (origin && !allowed.some(o => origin.startsWith(o)) && !origin.includes('vercel.app')) {
    return res.status(403).json({ error: 'Forbidden' })
  }

  const { messages } = req.body

  if (!messages || !Array.isArray(messages)) {
    return res.status(400).json({ error: 'Invalid request body' })
  }

  const apiKey = process.env.ANTHROPIC_API_KEY
  if (!apiKey) {
    return res.status(500).json({ error: 'API key not configured' })
  }

  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 1000,
        system: SYSTEM_PROMPT,
        messages,
      }),
    })

    const data = await response.json()

    if (!response.ok) {
      return res.status(response.status).json({ error: data?.error?.message ?? 'API error' })
    }

    const reply = data.content?.[0]?.text ?? 'Sorry, I could not get a response.'
    return res.status(200).json({ reply })

  } catch (err) {
    console.error('Chat API error:', err)
    return res.status(500).json({ error: 'Internal server error' })
  }
}
