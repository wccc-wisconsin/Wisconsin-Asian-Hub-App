import type { VercelRequest, VercelResponse } from '@vercel/node'

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' })

  const { name, city } = req.query
  if (!name || !city) return res.status(400).json({ error: 'name and city required' })

  const apiKey = process.env.VITE_GOOGLE_MAPS_KEY
  if (!apiKey) return res.status(500).json({ error: 'Google Maps key not configured' })

  try {
    // Step 1: Text search using Places API (New)
    const searchRes = await fetch(
      'https://places.googleapis.com/v1/places:searchText',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Goog-Api-Key': apiKey,
          'X-Goog-FieldMask': 'places.id,places.displayName,places.rating,places.photos',
        },
        body: JSON.stringify({
          textQuery: `${name} ${city} Wisconsin`,
          maxResultCount: 1,
        }),
      }
    )

    const searchData = await searchRes.json() as {
      places?: Array<{
        id?: string
        displayName?: { text: string }
        rating?: number
        photos?: Array<{ name: string }>
      }>
    }

    const place = searchData.places?.[0]
    if (!place) return res.status(404).json({ error: 'Place not found' })

    const rating = place.rating ?? null
    const photoName = place.photos?.[0]?.name ?? null

    // Step 2: Fetch photo URI if available
    let photoUrl: string | null = null
    if (photoName) {
      // Places API (New) photo URL format
      photoUrl = `https://places.googleapis.com/v1/${photoName}/media?maxWidthPx=800&key=${apiKey}`
    }

    return res.status(200).json({ rating, photoUrl, placeId: place.id })
  } catch (err) {
    console.error('Places API error:', err)
    return res.status(500).json({ error: 'Failed to fetch from Google Places' })
  }
}
