import { useState, useEffect } from 'react';
import * as Location from 'expo-location';

export interface Hospital {
  id: string;
  name: string;
  address: string;
  distance?: number;
}

const GOOGLE_API_KEY = process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY;

export const useNearbyHospitals = () => {
  const [hospitals, setHospitals] = useState<Hospital[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchHospitals = async () => {
    try {
      setLoading(true);
      setError(null);

      // Request permissions
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        setError('Permission to access location was denied');
        setLoading(false);
        return;
      }

      // Get location with better accuracy
      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });
      const { latitude, longitude } = location.coords;
      console.log(`[NearbyHospitals] Current Location: ${latitude}, ${longitude}`);

      // Try Google Places API first if Key is present
      if (GOOGLE_API_KEY && GOOGLE_API_KEY !== 'YOUR_GOOGLE_MAPS_API_KEY_HERE') {
        // 1. Try Google Places API (New)
        try {
          console.log(`[NearbyHospitals] Attempting Google Places API (New)...`);
          const response = await fetch('https://places.googleapis.com/v1/places:searchNearby', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'X-Goog-Api-Key': GOOGLE_API_KEY,
              'X-Goog-FieldMask': 'places.id,places.displayName,places.formattedAddress',
            },
            body: JSON.stringify({
              includedTypes: ["hospital", "medical_clinic", "pharmacy", "doctor"],
              maxResultCount: 15,
              locationRestriction: {
                circle: {
                  center: { latitude, longitude },
                  radius: 15000.0, // 15km
                }
              }
            }),
          });

          if (response.ok) {
            const data = await response.json();
            if (data.places && data.places.length > 0) {
              const googleResults: Hospital[] = data.places.map((p: any) => ({
                id: p.id,
                name: p.displayName?.text || 'Unnamed Facility',
                address: p.formattedAddress || 'Address unknown',
              }));
              console.log(`[NearbyHospitals] Google (New) returned ${googleResults.length} hospitals.`);
              setHospitals(googleResults);
              setLoading(false);
              return; // Success!
            }
          } else {
            const errBody = await response.text();
            console.warn(`[NearbyHospitals] Google API (New) error: ${response.status}`, errBody);
          }
        } catch (gErr) {
          console.error(`[NearbyHospitals] Google API (New) call failed:`, gErr);
        }

        // 2. Try Google Places API (Old) - Fallback
        try {
          console.log(`[NearbyHospitals] Attempting Google Places API (Old) fallback...`);
          const oldApiUrl = `https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=${latitude},${longitude}&radius=15000&type=hospital&key=${GOOGLE_API_KEY}`;
          const response = await fetch(oldApiUrl);

          if (response.ok) {
            const data = await response.json();
            if (data.results && data.results.length > 0) {
              const oldResults: Hospital[] = data.results.map((p: any) => ({
                id: p.place_id,
                name: p.name || 'Unnamed Facility',
                address: p.vicinity || 'Address unknown',
              }));
              console.log(`[NearbyHospitals] Google (Old) returned ${oldResults.length} hospitals.`);
              setHospitals(oldResults);
              setLoading(false);
              return; // Success!
            } else if (data.status === 'ZERO_RESULTS') {
              console.warn(`[NearbyHospitals] Google (Old) returned zero results.`);
            } else if (data.status === 'REQUEST_DENIED') {
              console.warn(`[NearbyHospitals] Google (Old) access denied. Status: ${data.status}, Message: ${data.error_message || 'No msg'}`);
            }
          } else {
            console.warn(`[NearbyHospitals] Google API (Old) HTTP error: ${response.status}`);
          }
        } catch (oldErr) {
          console.error(`[NearbyHospitals] Google API (Old) call failed:`, oldErr);
        }
      }

      // 3. Fallback: Use Overpass API (Last resort)
      console.log('[NearbyHospitals] Falling back to Overpass API...');
      const query = `
        [out:json][timeout:50];
        (
          nwr["amenity"~"hospital|clinic|doctors|pharmacy","i"](around:20000,${latitude},${longitude});
          nwr["healthcare"~"hospital|clinic|doctor|centre","i"](around:20000,${latitude},${longitude});
        );
        out center;
      `;
      
      const servers = [
        'https://overpass-api.de/api/interpreter',
        'https://lz4.overpass-api.de/api/interpreter'
      ];

      for (const server of servers) {
        try {
          const response = await fetch(server, {
            method: 'POST',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            body: `data=${encodeURIComponent(query)}`,
          });
          
          if (!response.ok) continue;

          const data = await response.json();
          if (data.elements && data.elements.length > 0) {
            const results: Hospital[] = data.elements.map((el: any) => {
              const tags = el.tags || {};
              const street = tags['addr:street'] || '';
              const city = tags['addr:city'] || '';
              let address = [street, city].filter(Boolean).join(', ');
              if (!address) address = tags['addr:full'] || 'Address unknown';

              return {
                id: el.id.toString(),
                name: tags.name || tags['name:en'] || 'Unnamed Medical Facility',
                address: address,
              };
            });

            // Filter duplicates
            const unique = results.filter((h, i, s) => 
              s.findIndex(t => t.name === h.name) === i
            );
            
            console.log(`[NearbyHospitals] Overpass returned ${unique.length} hospitals.`);
            setHospitals(unique);
            setLoading(false);
            return;
          }
        } catch (overpassErr) {
          console.error(`[NearbyHospitals] Overpass failed on ${server}:`, overpassErr);
        }
      }

      // If we reach here, nothing was found
      setHospitals([]);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch hospitals');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHospitals();
  }, []);

  return { hospitals, loading, error, refetch: fetchHospitals };
};
