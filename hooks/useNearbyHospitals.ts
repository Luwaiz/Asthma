import { useState, useEffect } from 'react';
import * as Location from 'expo-location';

export interface Hospital {
  id: string;
  name: string;
  address: string;
  distance?: number;
}

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

      // Get location
      const location = await Location.getCurrentPositionAsync({});
      const { latitude, longitude } = location.coords;

      // Query Overpass API
      // searching for hospitals within 5km
      const query = `
        [out:json];
        (
          node["amenity"="hospital"](around:5000,${latitude},${longitude});
          way["amenity"="hospital"](around:5000,${latitude},${longitude});
        );
        out center;
      `;
      
      const response = await fetch(`https://overpass-api.de/api/interpreter?data=${encodeURIComponent(query)}`);
      const data = await response.json();

      if (data.elements) {
        const results: Hospital[] = data.elements.map((el: any) => ({
          id: el.id.toString(),
          name: el.tags.name || 'Unnamed Hospital',
          address: el.tags['addr:street'] 
            ? `${el.tags['addr:street']}${el.tags['addr:housenumber'] ? ' ' + el.tags['addr:housenumber'] : ''}`
            : 'Address unknown',
          // Distance calculation could be added here if needed, 
          // but Overpass "around" already filters by radius.
        }));
        
        // Remove duplicates (sometimes way and node appear)
        const uniqueHospitals = results.filter((h, index, self) =>
          index === self.findIndex((t) => t.name === h.name)
        );

        setHospitals(uniqueHospitals);
      }
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
