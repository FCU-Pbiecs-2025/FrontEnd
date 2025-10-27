// Small wrapper for Google Places HTTP endpoints used by the PlaceRating component.
// Uses the same v1 endpoints as your test script but designed to run in the browser.

// Exports:
// - searchPlaceByText(placeName, apiKey) -> returns the first place object from searchText
// - getPlaceDetails(placeId, apiKey) -> returns place details JSON

async function assertOk(res) {
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`HTTP ${res.status} ${res.statusText} — ${text}`);
  }
}

export async function searchPlaceByText(placeName, apiKey) {
  const key = apiKey || import.meta.env.VITE_GOOGLE_MAPS_API_KEY;
  const useProxy = import.meta.env?.VITE_USE_PLACES_PROXY === 'true';
  const proxyBase = import.meta.env?.VITE_PLACES_PROXY_BASE_URL || 'http://localhost:3000';

  if (!placeName) throw new Error('placeName is required');
  if (!key && !useProxy) throw new Error('apiKey is required; set VITE_GOOGLE_MAPS_API_KEY in .env or pass apiKey');

  const body = { textQuery: placeName };
  const searchFieldMask = 'places.id,places.displayName,places.formattedAddress';

  let res;
  if (useProxy) {
    const url = `${proxyBase.replace(/\/$/, '')}/api/places/searchText`;
    res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    });
  } else {
    const url = `https://places.googleapis.com/v1/places:searchText`;
    res = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Goog-Api-Key': key,
        'X-Goog-FieldMask': searchFieldMask
      },
      body: JSON.stringify(body)
    });
  }

  await assertOk(res);
  const data = await res.json();

  if (!data.places || !data.places.length) {
    throw new Error('找不到這個地點，請確認名稱或金鑰限制設置');
  }

  return data.places[0];
}

export async function getPlaceDetails(placeId, apiKey, fields) {
  const key = apiKey || import.meta.env.VITE_GOOGLE_MAPS_API_KEY;
  const useProxy = import.meta.env?.VITE_USE_PLACES_PROXY === 'true';
  const proxyBase = import.meta.env?.VITE_PLACES_PROXY_BASE_URL || 'http://localhost:3000';

  if (!placeId) throw new Error('placeId is required');
  if (!key && !useProxy) throw new Error('apiKey is required; set VITE_GOOGLE_MAPS_API_KEY in .env or pass apiKey');

  // For details, mask has no 'places.' prefix
  const defaultFieldsMask = 'rating,userRatingCount,displayName,googleMapsUri,formattedAddress,id';
  const fieldMask = fields || defaultFieldsMask;

  let res;
  if (useProxy) {
    const url = `${proxyBase.replace(/\/$/, '')}/api/places/${encodeURIComponent(placeId)}?fields=${encodeURIComponent(fieldMask)}`;
    res = await fetch(url, { headers: { 'Content-Type': 'application/json' } });
  } else {
    const url = `https://places.googleapis.com/v1/places/${encodeURIComponent(placeId)}`;
    res = await fetch(url, {
      headers: {
        'Content-Type': 'application/json',
        'X-Goog-Api-Key': key,
        'X-Goog-FieldMask': fieldMask
      }
    });
  }

  await assertOk(res);
  return await res.json();
}
