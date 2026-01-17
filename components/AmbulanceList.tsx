'use client';

import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';
import { Ambulance as AmbulanceIcon, CheckCircle2 } from 'lucide-react';
import type { Ambulance } from '@/types';

interface AmbulanceListProps {
  ambulances: Ambulance[];
  highlightedId?: string | null;
}

export default function AmbulanceList({
  ambulances,
  highlightedId,
}: AmbulanceListProps) {
  const availableCount = ambulances.filter((a) => a.status === 'available').length;
  const busyCount = ambulances.filter((a) => a.status === 'busy').length;
  const offlineCount = ambulances.filter((a) => a.status === 'en_route').length;


  return (
    <Card className="h-full flex flex-col overflow-hidden border-0 shadow-sm">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg">Fleet Overview</CardTitle>
        <div className="flex gap-3 mt-3">
          <div className="flex items-center gap-2 text-sm">
            <div className="w-3 h-3 rounded-full bg-green-600" />
            <span className="text-gray-600">Available: <strong>{availableCount}</strong></span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <div className="w-3 h-3 rounded-full bg-amber-500" />
            <span className="text-gray-600">Busy: <strong>{busyCount}</strong></span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <div className="w-3 h-3 rounded-full bg-gray-400" />
            <span className="text-gray-600">Offline: <strong>{offlineCount}</strong></span>
          </div>
        </div>
      </CardHeader>

      <CardContent className="flex-1 overflow-auto">
        <div className="space-y-2">
          {ambulances.map((ambulance) => (
            <div
              key={ambulance.id}
              className={`p-3 rounded-lg border transition-all duration-200 ${highlightedId === ambulance.id
                ? 'bg-blue-50 border-blue-300 shadow-sm'
                : 'bg-white border-gray-200 hover:border-gray-300'
                }`}
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <AmbulanceIcon
                    className={`w-4 h-4 ${ambulance.status === 'available'
                      ? 'text-green-600'
                      : ambulance.status === 'busy'
                        ? 'text-amber-500'
                        : 'text-gray-400'
                      }`}
                  />
                  <span className="font-semibold text-gray-900 text-sm">
                    {ambulance.vehicleNumber}
                  </span>
                </div>
                <Badge status={ambulance.status}>{ambulance.status}</Badge>
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs text-gray-600">
                <div>
                  <span className="text-gray-500">Speed:</span>{' '}
                  <strong>{ambulance.speed} km/h</strong>
                </div>
                <div>
                  <span className="text-gray-500">Location:</span>{' '}
                  <strong>
                    {ambulance.coordinates.lat.toFixed(2)}, {ambulance.coordinates.lng.toFixed(2)}
                  </strong>
                </div>
              </div>

              {highlightedId === ambulance.id && (
                <div className="mt-2 text-xs font-medium text-blue-600 flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3" />
                  Nearest to selected hospital
                </div>
              )}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
