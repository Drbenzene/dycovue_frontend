'use client';

import { useState, useCallback, useEffect, useRef } from 'react';
import MapView from '@/components/Map/MapView';
import HospitalInfo from '@/components/HospitalInfo';
import AmbulanceList from '@/components/AmbulanceList';
import StatsPanel from '@/components/StatsPanel';
import type { Hospital, Ambulance, ProximityResult, Journey } from '@/types';
import {
  useHospitals,
  useAmbulances,
  useNearestAmbulance,
  useBatchUpdateAmbulances,
  useUpdateAmbulanceStatus,
  useUpdateAmbulancePosition
} from '@/lib/api/hooks';

export default function Home() {
  // Fetch data using React Query hooks
  const { data: hospitals = [] } = useHospitals();
  const { data: ambulances = [], refetch: refetchAmbulances } = useAmbulances();
  const batchMovement = useBatchUpdateAmbulances();
  const updateStatus = useUpdateAmbulanceStatus();
  const updatePosition = useUpdateAmbulancePosition();

  // Local state for UI
  const [selectedHospital, setSelectedHospital] = useState<Hospital | null>(null);
  const [activeJourney, setActiveJourney] = useState<Journey | null>(null);

  // Fetch nearest ambulance when hospital is selected
  const {
    data: proximityResult,
    isLoading: proximityLoading,
  } = useNearestAmbulance(selectedHospital?.id || null);

  const journeyIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Simulate random ambulance movement for all available ambulances
  const simulateMovement = useCallback(() => {
    const availableAmbulances = ambulances.filter(a => a.status === 'available');
    if (availableAmbulances.length === 0) return;

    const updates = availableAmbulances.map((ambulance) => {
      // Small random movement (-0.005 to 0.005 degrees)
      const deltaLng = (Math.random() - 0.5) * 0.01;
      const deltaLat = (Math.random() - 0.5) * 0.01;

      return {
        id: ambulance.id,
        coordinates: {
          lng: ambulance.coordinates.lng + deltaLng,
          lat: ambulance.coordinates.lat + deltaLat,
        },
      };
    });

    batchMovement.mutate(updates);
  }, [ambulances, batchMovement]);


  const handleHospitalClick = useCallback((hospital: Hospital) => {
    setSelectedHospital(hospital);
    // Don't clear journey if one is active, unless we want to allow only one journey at a time
  }, []);

  const handleStartJourney = useCallback((hospital: Hospital, ambulance: Ambulance) => {
    if (activeJourney) return;

    const steps = 100;
    const path: { lng: number; lat: number }[] = [];


    ambulance = {
      ...ambulance,
      coordinates: {
        lat: ambulance.latitude as number,
        lng: ambulance.longitude as number
      }
    }

    for (let i = 0; i <= steps; i++) {
      const t = i / steps;
      path.push({
        lng: ambulance.coordinates.lng + (hospital.coordinates.lng - ambulance.coordinates.lng) * t,
        lat: ambulance.coordinates.lat + (hospital.coordinates.lat - ambulance.coordinates.lat) * t,
      });
    }

    // Helper for bearing calculation
    const calculateBearing = (start: { lng: number, lat: number }, end: { lng: number, lat: number }) => {
      const startLat = start.lat * Math.PI / 180;
      const startLng = start.lng * Math.PI / 180;
      const endLat = end.lat * Math.PI / 180;
      const endLng = end.lng * Math.PI / 180;

      const y = Math.sin(endLng - startLng) * Math.cos(endLat);
      const x = Math.cos(startLat) * Math.sin(endLat) -
        Math.sin(startLat) * Math.cos(endLat) * Math.cos(endLng - startLng);

      const bearing = Math.atan2(y, x) * 180 / Math.PI;
      return (bearing + 360) % 360;
    };

    const estimatedDuration = proximityResult?.duration ? proximityResult.duration * 60 * 1000 : 30000;

    const journey: Journey = {
      ambulanceId: ambulance.id,
      hospitalId: hospital.id,
      startCoordinates: { ...ambulance.coordinates },
      endCoordinates: { ...hospital.coordinates },
      progress: 0,
      startTime: Date.now(),
      estimatedDuration,
      path,
      currentBearing: calculateBearing(ambulance.coordinates, hospital.coordinates),
    };

    setActiveJourney(journey);

    updateStatus.mutate({ id: ambulance.id, status: 'busy' });

    const interval = setInterval(() => {
      setActiveJourney((current) => {
        if (!current) {
          clearInterval(interval);
          return null;
        }

        const elapsed = Date.now() - current.startTime;
        const newProgress = Math.min((elapsed / current.estimatedDuration) * 100, 100);

        if (newProgress >= 100) {
          clearInterval(interval);

          updatePosition.mutate({
            id: current.ambulanceId,
            coordinates: current.endCoordinates
          }, {
            onSuccess: () => {
              updateStatus.mutate({ id: current.ambulanceId, status: 'available' });
            }
          });

          return null;
        }

        const pathIndex = Math.floor((newProgress / 100) * (current.path.length - 1));
        const currentPos = current.path[pathIndex];
        const nextIndex = Math.min(pathIndex + 1, current.path.length - 1);
        const nextPos = current.path[nextIndex];

        return {
          ...current,
          progress: newProgress,
          currentBearing: calculateBearing(currentPos, nextPos)
        };
      });
    }, 100);

    journeyIntervalRef.current = interval;
  }, [activeJourney, proximityResult, updateStatus, updatePosition]);

  // Clean up journey interval on unmount
  useEffect(() => {
    return () => {
      if (journeyIntervalRef.current) {
        clearInterval(journeyIntervalRef.current);
      }
    };
  }, []);

  const availableCount = ambulances.filter((a) => a.status === 'available').length;

  const displayAmbulances = ambulances.map(amb => {
    if (activeJourney && amb.id === activeJourney.ambulanceId) {
      const pathIndex = Math.floor((activeJourney.progress / 100) * (activeJourney.path.length - 1));
      return {
        ...amb,
        coordinates: activeJourney.path[pathIndex] || amb.coordinates
      };
    }
    return amb;
  });

  return (
    <div className="min-h-screen p-4 sm:p-6 lg:p-8">
      <div className="max-w-[1920px] mx-auto space-y-6">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <h1 className="text-3xl sm:text-4xl font-semibold text-gray-900">
              Hospital Ambulance Tracker
            </h1>
            <div className="flex items-center gap-3 mt-1">
              <p className="text-gray-600 text-sm sm:text-base">
                Real-time proximity tracking
              </p>
            </div>
          </div>
        </div>

        <StatsPanel
          totalHospitals={hospitals.length}
          totalAmbulances={ambulances.length}
          availableAmbulances={availableCount}
          enRouteAmbulances={ambulances.filter((a) => a.status === 'en_route').length}
          busyAmbulances={ambulances.filter((a) => a.status === 'busy').length}
        />

        <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
          <div className="xl:col-span-8 h-[500px] sm:h-[600px] lg:h-[700px]">
            <MapView
              hospitals={hospitals}
              ambulances={displayAmbulances}
              selectedHospital={selectedHospital}
              nearestAmbulance={proximityResult?.ambulance || null}
              onHospitalClick={handleHospitalClick}
              activeJourney={activeJourney}
            />
          </div>

          <div className="xl:col-span-4 space-y-6">
            <div className="h-auto min-h-[400px] max-h-[500px] overflow-auto">
              <HospitalInfo
                hospital={selectedHospital}
                proximityResult={proximityResult || null}
                isCached={false} // React Query handles caching internally
                isLoading={proximityLoading && !proximityResult}
                onStartJourney={handleStartJourney}
                isJourneyActive={activeJourney !== null}
                journeyProgress={activeJourney?.progress || 0}
                currentAmbulance={activeJourney ? displayAmbulances.find(a => a.id === activeJourney.ambulanceId) : undefined}
              />
            </div>

            <div className="h-auto sm:h-[290px]">
              <AmbulanceList
                ambulances={displayAmbulances}
                highlightedId={proximityResult?.ambulance?.id}
              />
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center text-sm text-gray-500 py-6">
          <p>
            Developed by Boyinbode Ebenezer Ayomide
          </p>
        </div>
      </div>
    </div>
  );
}
