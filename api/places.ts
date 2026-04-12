import type { VercelRequest, VercelResponse } from '@vercel/node'

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' })

  const { name, city } = req.query
  if (!name || !city) return res.status(400).json({ error: 'name and city required' })

  const apiKey = process.env.VITE_GOOGLE_MAPS_KEY
  if (!apiKey) return res.status(500).json({ error: 'Google Maps key not configured' })

  try {
    // Step 1: Find Place ID by name + city
    const searchUrl = `https://maps.googleapis.com/maps/api/place/findplacefromtext/json?input=${encodeURIComponent(`${name} ${city} Wisconsin`)}&inputtype=textquery&fields=place_id,name,rating,photos&key=${apiKey}`

    const searchRes = await fetch(searchUrl)
    const searchData = await searchRes.json() as {
      candidates: Array<{
        place_id?: string
        name?: string
        rating?: number
        photos?: Array<{ photo_reference: string }>
      }>
    }

    const candidate = searchData.candidates?.[0]
    if (!candidate) return res.status(404).json({ error: 'Place not found' })

    const rating = candidate.rating ?? null
    const photoReference = candidate.photos?.[0]?.photo_reference ?? null

    // Step 2: Build photo URL if photo reference exists
    let photoUrl: string | null = null
    if (photoReference) {
      photoUrl = `https://maps.googleapis.com/maps/api/place/photo?maxwidth=800&photo_reference=${photoReference}&key=${apiKey}`
    }

    return res.status(200).json({ rating, photoUrl, placeId: candidate.place_id })
  } catch (err) {
    console.error('Places API error:', err)
    return res.status(500).json({ error: 'Failed to fetch from Google Places' })
  }
}
