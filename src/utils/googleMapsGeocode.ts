/**
 * Полный адрес через Google Geocoding / Place Details (REST).
 * В Google Cloud должны быть включены Geocoding API и (для зданий по POI) Places API.
 * Ключ — тот же, что для Maps SDK (ограничения по приложению в консоли).
 */
export async function fetchGoogleFormattedAddress(
  apiKey: string,
  latitude: number,
  longitude: number,
  placeId?: string,
): Promise<string | null> {
  if (!apiKey.trim()) return null;

  try {
    if (placeId) {
      const detailsUrl =
        `https://maps.googleapis.com/maps/api/place/details/json` +
        `?place_id=${encodeURIComponent(placeId)}` +
        `&fields=formatted_address` +
        `&key=${encodeURIComponent(apiKey)}` +
        `&language=ru`;
      const res = await fetch(detailsUrl);
      const data = (await res.json()) as {
        status?: string;
        result?: { formatted_address?: string };
      };
      if (data.status === "OK" && data.result?.formatted_address) {
        return data.result.formatted_address;
      }
    }

    const geoUrl =
      `https://maps.googleapis.com/maps/api/geocode/json` +
      `?latlng=${latitude},${longitude}` +
      `&key=${encodeURIComponent(apiKey)}` +
      `&language=ru`;
    const res = await fetch(geoUrl);
    const data = (await res.json()) as {
      status?: string;
      results?: { formatted_address?: string }[];
    };
    if (data.status === "OK" && data.results?.[0]?.formatted_address) {
      return data.results[0].formatted_address;
    }
  } catch {
    return null;
  }
  return null;
}
