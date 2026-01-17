// Hospital and Ambulance Types
export interface Coordinates {
  lng: number;
  lat: number;
}

export interface Hospital {
  id: string;
  name: string;
  coordinates: Coordinates;
  address: string;
  capacity: number;
  specialties: string[];
  emergency: boolean;
}

export type AmbulanceStatus = 'available' | 'busy' | 'en_route';

export interface Ambulance {
  id: string;
  vehicleNumber: string;
  coordinates: Coordinates;
  status: AmbulanceStatus;
  speed: number;
  lastUpdate: string;
  latitude?: number;
  longitude?: number
}

export interface ProximityResult {
  ambulance: Ambulance;
  distance: number;
  duration: number;
}

export interface CacheEntry {
  result: ProximityResult;
  timestamp: number;
}

export interface Journey {
  ambulanceId: string;
  hospitalId: string;
  startCoordinates: Coordinates;
  endCoordinates: Coordinates;
  progress: number; // 0-100
  startTime: number;
  estimatedDuration: number; // in ms
  path: Coordinates[]; // interpolated points along the route
  currentBearing: number; // rotation angle in degrees
}

