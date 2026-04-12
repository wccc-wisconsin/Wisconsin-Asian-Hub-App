const MAPS_KEY = import.meta.env.VITE_GOOGLE_MAPS_KEY ?? ''

export interface PlaceDetails {
  photoUrl?: string
  rating?: number
  totalRatings?: number
  hours?: string[]
  phone?: string
  website?: string
  googleMapsUrl?: string
}

// Search for a place and get its details including photo
export async function fetchPlaceDetails(
  restaurantName: string,
  city: string
): Promise<PlaceDetails> {
  if (!MAPS_KEY) return {}

  try {
    // Step 1: Text search to find the place
    const searchRes = await fetch(
      `https://places.googleapis.com/v1/places:searchText`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Goog-Api-Key': MAPS_KEY,
          'X-Goog-FieldMask': 'places.id,places.displayName,places.photos,places.rating,places.userRatingCount,places.regularOpeningHours,places.nationalPhoneNumber,places.websiteUri,places.googleMapsUri',
        },
        body: JSON.stringify({
          textQuery: `${restaurantName} ${city} Wisconsin restaurant`,
          maxResultCount: 1,
          locationBias: {
            circle: {
              center: { latitude: 43.0731, longitude: -89.4012 },
              radius: 150000.0
            }
          }
        })
      }
    )

    if (!searchRes.ok) return {}
    const searchData = await searchRes.json() as {
      places?: {
        id: string
        photos?: { name: string }[]
        rating?: number
        userRatingCount?: number
        regularOpeningHours?: { weekdayDescriptions?: string[] }
        nationalPhoneNumber?: string
        websiteUri?: string
        googleMapsUri?: string
      }[]
    }

    const place = searchData.places?.[0]
    if (!place) return {}

    // Step 2: Get photo URL if available
    let photoUrl: string | undefined
    if (place.photos?.[0]?.name) {
      photoUrl = `https://places.googleapis.com/v1/${place.photos[0].name}/media?maxHeightPx=400&maxWidthPx=800&key=${MAPS_KEY}`
    }

    return {
      photoUrl,
      rating: place.rating,
      totalRatings: place.userRatingCount,
      hours: place.regularOpeningHours?.weekdayDescriptions,
      phone: place.nationalPhoneNumber,
      website: place.websiteUri,
      googleMapsUrl: place.googleMapsUri,
    }
  } catch {
    return {}
  }
}
