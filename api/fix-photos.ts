// api/fix-photos.ts
// One-time utility endpoint to fetch Google Places photos and patch Firestore
// Call: POST /api/fix-photos
// Secured by a secret token so only you can trigger it

import type { VercelRequest, VercelResponse } from '@vercel/node'

const MAPS_KEY    = process.env.VITE_GOOGLE_MAPS_KEY || ''
const PROJECT_ID  = process.env.VITE_FIREBASE_PROJECT_ID || 'wisconsin-asian-hub'
const FSBASE      = `https://firestore.googleapis.com/v1/projects/${PROJECT_ID}/databases/(default)/documents`
const SECRET      = process.env.FIX_PHOTOS_SECRET || 'wccc2026'

// All 59 restaurant placeIds
const PLACE_IDS = [
  "ChIJC9X0WQBTBogR74amuGj6Yoc","ChIJsd02CwBTBogRj9wXntfQOcM","ChIJyU-l6ZpTBogRwNcE_2_bxjs",
  "ChIJG4k3mEBVBogR2lR8Gs7IKL8","ChIJa5I2_ndTBogR2cLtZ6xmrRA","ChIJA67ZPnJTBogRqmXncFURJxE",
  "ChIJnbmTn35XBogR6TAwPYBKcM8","ChIJs-eo2zxTBogRQm20NR2qIig","ChIJc5k2eABTBogRr-q9mnbRkPY",
  "ChIJM8EfCD9TBogRFwbfIR1yzAE","ChIJQcpWNA8BB4gR9ylsinr46bg","ChIJMQctdZ0ZBYgRfRqrNMFm-As",
  "ChIJo2cBKAAZBYgRhJLPigzu6F4","ChIJsYRoKQAZBYgR7Ljri6Mo6dI","ChIJ3Xmb7YEZBYgRXB0IyuGGzjs",
  "ChIJ19coUKUZBYgRnufLFKke9rg","ChIJueYsh6QZBYgRBWts3vWsgNA","ChIJEVx2b-EYBYgR7BI0oatVmuE",
  "ChIJwwk9p2wbBYgRL24uekDir3M","ChIJYX7Q_5sRBYgRnlGe_IPPtTc","ChIJ6bPrQBgFBYgRJ58hQTqvFeU",
  "ChIJtYj_wdOpBYgRswA8dkp2rAU","ChIJ08CDsrupBYgRYWBhmfreVeg","ChIJWXXeaMSvBYgRQPWdAEM_mx4",
  "ChIJ33KDO_avBYgRmqqmpxDDOFw","ChIJa5PIEy2mBYgRfrvdh8e7VGU","ChIJ1Tq_EePjBIgRs9t5LJyX6Qg",
  "ChIJb_tpsYJDBYgRVTHPbhWapSQ","ChIJJf9o7S1hBYgRI2M-OtEIpF4","ChIJRUa3u2BeBYgR05rznn7c1zE",
  "ChIJNV-aY2hhBYgR5Tfcsodq3UI","ChIJK-B-ZQD7AogRL5gwUuJDxJA","ChIJJbj6XQD7AogRPFd5GKLcPdo",
  "ChIJb7qiEir7AogRVy6pTmYa14c","ChIJ2XNcemD7AogRpLcmggzigqg","ChIJBxS-UwDlAogRH_3Ttq_sHSc",
  "ChIJEaBYq9i2A4gRatTMTHEUBu8","ChIJ1RwAAQm3A4gRZaiCWXG8r8s","ChIJ5bHF9bqzA4gRj96Gb0KudnE",
  "ChIJ876UxDO3A4gR9lo49HXKSUQ","ChIJbShLNVa3A4gRQ3BfObbz0CM","ChIJvaD7OhKxA4gRh2HzKHd8H8k",
  "ChIJdQp5Hxu5A4gRQ0RrVVfFL5I","ChIJC2wDBgC3A4gRXlx1UqLywug","ChIJQ-PMnKKfBogRjTVCCs6qb4E",
  "ChIJMUUSi6ALAYgRC_Ckwj_acuo","ChIJz3EoTBIjAIgR2ubhMBRqsOc","ChIJbYxVf8NaAIgRnWM5xdInynI",
  "ChIJIzbrpwElAIgRNKiFwAWVtWk","ChIJu4qISCohAIgRm3G18-Nx-A8","ChIJ94QxYwVV-YcRU2Nf_XLIShg",
  "ChIJEWFxlEhT-YcRAWijRlIJDco","ChIJcdRvdABV-YcRCUBx9cyeCw0","ChIJqYTgh4m9-IcR96bb7CX7rNI",
  "ChIJq6GJKfenBIgRXdLoAVe0dWE","ChIJTcTohKKnBIgRC1MLVkfzyZU","ChIJDbSEyKM3A4gRgzJa0TCQ_GQ",
  "ChIJoQO4cAA5A4gR3PoSXnIAikE","ChIJ6at40frrA4gRK3YArNkExjA",
]

async function fetchPhotoRef(placeId: string): Promise<string | null> {
  const url = `https://maps.googleapis.com/maps/api/place/details/json?place_id=${placeId}&fields=photos&key=${MAPS_KEY}`
  const res  = await fetch(url)
  const data = await res.json() as any
  return data.result?.photos?.[0]?.photo_reference ?? null
}

async function patchFirestore(placeId: string, photoUrl: string): Promise<boolean> {
  const url = `${FSBASE}/restaurants/${placeId}?updateMask.fieldPaths=photoUrl&updateMask.fieldPaths=placeId&key=${MAPS_KEY}`
  const res  = await fetch(url, {
    method:  'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body:    JSON.stringify({
      fields: {
        photoUrl: { stringValue: photoUrl },
        placeId:  { stringValue: placeId },
      }
    }),
  })
  return res.ok
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Simple secret check
  if (req.query.secret !== SECRET) {
    return res.status(401).json({ error: 'Unauthorized' })
  }

  if (!MAPS_KEY) {
    return res.status(500).json({ error: 'VITE_GOOGLE_MAPS_KEY not set' })
  }

  const results: { placeId: string; status: string; photoUrl?: string }[] = []

  for (const placeId of PLACE_IDS) {
    try {
      const ref = await fetchPhotoRef(placeId)
      if (!ref) {
        results.push({ placeId, status: 'no_photo' })
        continue
      }

      const photoUrl = `https://maps.googleapis.com/maps/api/place/photo?maxwidth=800&photo_reference=${ref}&key=${MAPS_KEY}`
      const ok       = await patchFirestore(placeId, photoUrl)

      results.push({ placeId, status: ok ? 'fixed' : 'patch_failed', photoUrl: ok ? photoUrl : undefined })

      // small delay to respect rate limits
      await new Promise(r => setTimeout(r, 150))
    } catch (e: any) {
      results.push({ placeId, status: `error: ${e.message}` })
    }
  }

  const fixed   = results.filter(r => r.status === 'fixed').length
  const noPhoto = results.filter(r => r.status === 'no_photo').length
  const errors  = results.filter(r => r.status.startsWith('error')).length

  return res.status(200).json({
    summary: { fixed, noPhoto, errors, total: PLACE_IDS.length },
    results,
  })
}
