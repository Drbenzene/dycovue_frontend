import type {
    Hospital,
    Ambulance,
    Coordinates,
} from '@/types';


export interface HospitalApiResponse {
    id: string;
    name: string;
    address: string;
    numberOfBeds: number;
    specialties: string[];
    createdAt: string;
    updatedAt: string;
    latitude: number;
    longitude: number
}

export interface AmbulanceApiResponse {
    id: string;
    vehicleNumber: string;
    status: 'available' | 'busy' | 'en_route';
    createdAt: string;
    updatedAt: string;
    latitude: number;
    longitude: number
}


export function transformHospitalFromApi(apiHospital: HospitalApiResponse): Hospital {
    return {
        id: apiHospital.id,
        name: apiHospital.name,
        address: apiHospital.address,
        capacity: apiHospital.numberOfBeds,
        specialties: apiHospital.specialties,
        emergency: true,
        coordinates: {
            lat: apiHospital.latitude,
            lng: apiHospital.longitude
        },
    };
}


export function transformAmbulanceFromApi(apiAmbulance: AmbulanceApiResponse): Ambulance {
    return {
        id: apiAmbulance.id,
        vehicleNumber: apiAmbulance.vehicleNumber,
        status: apiAmbulance.status,
        speed: 45,
        lastUpdate: apiAmbulance.updatedAt,
        coordinates: {
            lat: apiAmbulance.latitude,
            lng: apiAmbulance.longitude
        }
    };
}


export function toCoordinates(latitude: number, longitude: number): Coordinates {
    return {
        lat: latitude,
        lng: longitude,
    };
}

export function getHospitalCoordinates(hospital: Hospital): Coordinates {
    return hospital.coordinates;
}

export function getAmbulanceCoordinates(ambulance: Ambulance): Coordinates {
    return ambulance.coordinates;
}


export function transformHospitalsFromApi(apiHospitals: HospitalApiResponse[]): Hospital[] {
    return apiHospitals.map(transformHospitalFromApi);
}


export function transformAmbulancesFromApi(apiAmbulances: AmbulanceApiResponse[]): Ambulance[] {
    return apiAmbulances.map(transformAmbulanceFromApi);
}
