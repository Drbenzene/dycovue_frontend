'use client';

import { useEffect, useRef, useState } from 'react';
import maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import type { Hospital, Ambulance, Journey } from '@/types';

interface MapViewProps {
  hospitals: Hospital[];
  ambulances: Ambulance[];
  selectedHospital: Hospital | null;
  nearestAmbulance: Ambulance | null;
  onHospitalClick: (hospital: Hospital) => void;
  activeJourney?: Journey | null;
}

export default function MapView({
  hospitals,
  ambulances,
  selectedHospital,
  nearestAmbulance,
  onHospitalClick,
  activeJourney,
}: MapViewProps) {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<maplibregl.Map | null>(null);
  const [mapLoaded, setMapLoaded] = useState(false);
  const markersRef = useRef<{ [key: string]: maplibregl.Marker }>({});

  // Initialize map
  useEffect(() => {
    if (!mapContainer.current || map.current) return;

    map.current = new maplibregl.Map({
      container: mapContainer.current,
      style: 'https://api.maptiler.com/maps/streets/style.json?key=get_your_own_OpIi9ZULNHzrESv6T2vL',
      center: [3.3792, 6.5244],
      zoom: 6,
      pitch: 45,
      bearing: 0,
    });

    map.current.addControl(
      new maplibregl.NavigationControl({
        visualizePitch: true,
        showZoom: true,
        showCompass: true,
      }),
      'top-right'
    );

    map.current.addControl(new maplibregl.FullscreenControl(), 'top-right');

    map.current.on('load', () => {
      setMapLoaded(true);
    });

    return () => {
      map.current?.remove();
      map.current = null;
    };
  }, []);

  useEffect(() => {
    if (!map.current || !mapLoaded) return;

    Object.keys(markersRef.current)
      .filter((key) => key.startsWith('hospital-'))
      .forEach((key) => {
        markersRef.current[key]?.remove();
        delete markersRef.current[key];
      });

    // Add hospital markers
    hospitals.forEach((hospital) => {
      const el = document.createElement('div');
      el.className = 'hospital-marker';
      el.innerHTML = `
        <div class="relative cursor-pointer group">
          <div class="w-9 h-9 bg-red-600 rounded-full flex items-center justify-center shadow-md transition-all group-hover:shadow-lg ${selectedHospital?.id === hospital.id
          ? 'ring-4 ring-blue-400 ring-opacity-50'
          : ''
        }">
            <svg class="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M12 4v16m8-8H4" />
            </svg>
          </div>
          ${hospital.emergency
          ? '<div class="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 bg-yellow-400 rounded-full border border-white"></div>'
          : ''
        }
        </div>
      `;

      const marker = new maplibregl.Marker({ element: el })
        .setLngLat([hospital.coordinates.lng, hospital.coordinates.lat])
        .setPopup(
          new maplibregl.Popup({ offset: 25 }).setHTML(`
            <div class="p-2">
              <h3 class="font-bold text-sm">${hospital.name}</h3>
              <p class="text-xs text-gray-600 mt-1">${hospital.address}</p>
              <p class="text-xs text-gray-500 mt-1">Capacity: ${hospital.capacity}</p>
            </div>
          `)
        )
        .addTo(map.current!);

      el.addEventListener('click', () => {
        onHospitalClick(hospital);
      });

      markersRef.current[`hospital-${hospital.id}`] = marker;
    });
  }, [hospitals, mapLoaded, selectedHospital, onHospitalClick]);

  useEffect(() => {
    if (!map.current || !mapLoaded) return;

    Object.keys(markersRef.current)
      .filter((key) => key.startsWith('ambulance-'))
      .forEach((key) => {
        markersRef.current[key]?.remove();
        delete markersRef.current[key];
      });

    ambulances.forEach((ambulance) => {
      const isNearest = nearestAmbulance?.id === ambulance.id;
      const isOnJourney = activeJourney?.ambulanceId === ambulance.id;
      const bearing = isOnJourney ? activeJourney.currentBearing : 0;

      const statusColors = {
        available: 'bg-green-600',
        busy: 'bg-amber-500',
        en_route: 'bg-gray-400',
      };

      const el = document.createElement('div');
      el.className = 'ambulance-marker';
      el.style.transition = 'transform 0.3s ease-out';

      const baseClasses = `w-${isOnJourney ? '10' : '7'} h-${isOnJourney ? '10' : '7'} ${statusColors[ambulance.status]} rounded-lg flex items-center justify-center shadow-${isOnJourney ? 'xl' : 'md'} transition-all`;
      const nearestClasses = isNearest && !isOnJourney ? 'ring-4 ring-blue-400 ring-opacity-50 scale-110' : '';
      const journeyClasses = isOnJourney ? 'ring-4 ring-blue-500' : '';

      el.innerHTML = `
        <div class="relative" style="transform: rotate(${bearing}deg); transition: transform 0.3s ease-out;">
          ${isOnJourney ? `
            <!-- Pulsing shadow for active journey -->
            <div class="absolute inset-0 w-12 h-12 -left-2.5 -top-2.5 bg-blue-400 rounded-full animate-ping opacity-20"></div>
          ` : ''}
          <div class="${baseClasses} ${nearestClasses} ${journeyClasses}" style="transition: all 0.3s ease-out;">
            <!-- Ambulance SVG Icon -->
            <svg class="w-${isOnJourney ? '6' : '4'} h-${isOnJourney ? '6' : '4'} text-white" viewBox="0 0 24 24" fill="currentColor">
              <path d="M18.92 5.01C18.72 4.42 18.16 4 17.5 4h-11c-.66 0-1.21.42-1.42 1.01L3 11v8c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-1h12v1c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-8l-2.08-5.99zM6.5 15c-.83 0-1.5-.67-1.5-1.5S5.67 12 6.5 12s1.5.67 1.5 1.5S7.33 15 6.5 15zm11 0c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5zM5 10l1.5-4.5h11L19 10H5z"/>
            </svg>
            ${isOnJourney ? `
              <!-- Direction arrow overlay -->
              <div class="absolute -top-1 left-1/2 transform -translate-x-1/2">
                <svg class="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M10 2l8 8-8 8V2z" />
                </svg>
              </div>
            ` : ''}
          </div>
        </div>
      `;

      const marker = new maplibregl.Marker({ element: el })
        .setLngLat([ambulance.coordinates.lng, ambulance.coordinates.lat])
        .setPopup(
          new maplibregl.Popup({ offset: 15 }).setHTML(`
            <div class="p-2">
              <h3 class="font-bold text-sm">${ambulance.vehicleNumber}</h3>
              <p class="text-xs mt-1">Status: <span class="font-semibold capitalize">${ambulance.status}</span></p>
              <p class="text-xs">Speed: ${ambulance.speed} km/h</p>
              ${isOnJourney ? '<p class="text-xs text-blue-600 font-semibold mt-1">🚨 En Route</p>' : ''}
            </div>
          `)
        )
        .addTo(map.current!);

      markersRef.current[`ambulance-${ambulance.id}`] = marker;
    });
  }, [ambulances, mapLoaded, nearestAmbulance, activeJourney]);

  useEffect(() => {
    if (!map.current || !mapLoaded) return;

    const sourceId = 'nearest-route';
    const layerId = 'nearest-route-layer';

    if (map.current.getLayer(layerId)) {
      map.current.removeLayer(layerId);
    }

    if (selectedHospital?.coordinates && nearestAmbulance?.coordinates) {
      if (map.current.getSource(sourceId)) {
        map.current.removeSource(sourceId);
      }
      map.current.addSource(sourceId, {
        type: 'geojson',
        data: {
          type: 'Feature',
          properties: {},
          geometry: {
            type: 'LineString',
            coordinates: [
              [selectedHospital.coordinates.lng, selectedHospital.coordinates.lat],
              [nearestAmbulance.coordinates.lng, nearestAmbulance.coordinates.lat],
            ],
          },
        },
      });

      map.current.addLayer({
        id: layerId,
        type: 'line',
        source: sourceId,
        layout: {
          'line-join': 'round',
          'line-cap': 'round',
        },
        paint: {
          'line-color': '#3b82f6',
          'line-width': 3,
          'line-opacity': 0.8,
          'line-dasharray': [2, 2],
        },
      });
      const bounds = new maplibregl.LngLatBounds();
      if (selectedHospital?.coordinates) {
        bounds.extend([selectedHospital.coordinates.lng, selectedHospital.coordinates.lat]);
      }
      if (nearestAmbulance?.coordinates) {
        bounds.extend([nearestAmbulance.coordinates.lng, nearestAmbulance.coordinates.lat]);
      }
      map.current.fitBounds(bounds, { padding: 100, duration: 1000 });
    }
  }, [selectedHospital, nearestAmbulance, mapLoaded]);

  useEffect(() => {
    if (!map.current || !mapLoaded) return;

    const journeySourceId = 'journey-path';
    const journeyLayerId = 'journey-path-layer';

    // Remove existing journey path
    if (map.current.getLayer(journeyLayerId)) {
      map.current.removeLayer(journeyLayerId);
    }
    if (map.current.getSource(journeySourceId)) {
      map.current.removeSource(journeySourceId);
    }

    // Add new journey path if active
    if (activeJourney) {
      map.current.addSource(journeySourceId, {
        type: 'geojson',
        data: {
          type: 'Feature',
          properties: {},
          geometry: {
            type: 'LineString',
            coordinates: activeJourney.path.map(p => [p.lng, p.lat]),
          },
        },
      });

      map.current.addLayer({
        id: journeyLayerId,
        type: 'line',
        source: journeySourceId,
        layout: {
          'line-join': 'round',
          'line-cap': 'round',
        },
        paint: {
          'line-color': '#10b981',
          'line-width': 4,
          'line-opacity': 0.7,
          'line-dasharray': [2, 2],
        },
      });

      const bounds = new maplibregl.LngLatBounds();
      bounds.extend([activeJourney.startCoordinates.lng, activeJourney.startCoordinates.lat]);
      bounds.extend([activeJourney.endCoordinates.lng, activeJourney.endCoordinates.lat]);
      map.current.fitBounds(bounds, { padding: 100, duration: 1000 });
    }
  }, [activeJourney, mapLoaded]);

  return (
    <div ref={mapContainer} className="w-full h-full rounded-xl overflow-hidden shadow-xl border border-gray-200" />
  );
}
