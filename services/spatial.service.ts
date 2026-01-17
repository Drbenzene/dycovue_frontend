import { point } from '@turf/helpers';
import nearestPoint from '@turf/nearest-point';
import { distance } from '@turf/turf';
import type { Ambulance, Coordinates, ProximityResult, Hospital } from '@/types';

export class SpatialService {

    static findNearestAmbulance(
        hospitalCoords: Coordinates,
        ambulances: Ambulance[]
    ): ProximityResult | null {
        const availableAmbulances = ambulances.filter(
            (amb) => amb.status === 'available'
        );

        if (availableAmbulances.length === 0) {
            return null;
        }

        const targetPoint = point([hospitalCoords.lng, hospitalCoords.lat]);
        const ambulancePoints = availableAmbulances.map((amb) =>
            point([amb.coordinates.lng, amb.coordinates.lat], { ambulance: amb })
        );

        const nearest = nearestPoint(targetPoint, {
            type: 'FeatureCollection',
            features: ambulancePoints,
        });

        const nearestAmbulance = nearest.properties.ambulance as Ambulance;
        const distanceKm = this.calculateDistance(
            hospitalCoords,
            nearestAmbulance.coordinates
        );

        // Estimate duration based on ambulance speed and distance
        const durationMinutes = (distanceKm / nearestAmbulance.speed) * 60;

        return {
            ambulance: nearestAmbulance,
            distance: distanceKm,
            duration: Math.round(durationMinutes * 10) / 10, // Round to 1 decimal
        };
    }


    static calculateDistance(point1: Coordinates, point2: Coordinates): number {
        const from = point([point1.lng, point1.lat]);
        const to = point([point2.lng, point2.lat]);
        return distance(from, to, { units: 'kilometers' });
    }

    static getAvailableAmbulances(ambulances: Ambulance[]): Ambulance[] {
        return ambulances.filter((amb) => amb.status === 'available');
    }

    static hospitalToGeoJSON(hospital: Hospital) {
        return point([hospital.coordinates.lng, hospital.coordinates.lat], {
            id: hospital.id,
            name: hospital.name,
        });
    }


    static ambulanceToGeoJSON(ambulance: Ambulance) {
        return point([ambulance.coordinates.lng, ambulance.coordinates.lat], {
            id: ambulance.id,
            vehicleNumber: ambulance.vehicleNumber,
            status: ambulance.status,
        });
    }
}
