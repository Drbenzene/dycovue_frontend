'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';
import { Building2, MapPin, Users, Stethoscope, Ambulance, Clock, Navigation, Zap, RefreshCw, AlertCircle, Play } from 'lucide-react';
import type { Hospital, ProximityResult, Ambulance as AmbulanceType } from '@/types';

interface HospitalInfoProps {
  hospital: Hospital | null;
  proximityResult: ProximityResult | null;
  isCached?: boolean;
  isLoading?: boolean;
  onStartJourney?: (hospital: Hospital, ambulance: AmbulanceType) => void;
  isJourneyActive?: boolean;
  journeyProgress?: number;
  currentAmbulance?: AmbulanceType;
}

export default function HospitalInfo({
  hospital,
  proximityResult,
  isCached = false,
  isLoading = false,
  onStartJourney,
  isJourneyActive = false,
  journeyProgress = 0,
  currentAmbulance,
}: HospitalInfoProps) {

  if (!hospital) {
    return (
      <Card className="h-full flex items-center justify-center border-0 shadow-sm bg-white">
        <CardContent className="p-8">
          <div className="text-center text-gray-400">
            <Building2 className="w-12 h-12 md:w-16 md:h-16 mx-auto mb-3 md:mb-4 opacity-30" strokeWidth={1.5} />
            <p className="text-base md:text-lg font-medium text-gray-600">Select a hospital</p>
            <p className="text-xs md:text-sm mt-1 md:mt-2 text-gray-500">Tap a marker to find the nearest ambulance</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={hospital.id}
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -8 }}
        transition={{ duration: 0.2, ease: 'easeOut' }}
        className="h-full"
      >
        <Card className="h-full flex flex-col border-0 shadow-sm bg-white overflow-hidden">
          <CardHeader className="pb-3 px-4 md:px-6 flex-shrink-0">
            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2">
              <CardTitle className="text-base md:text-lg font-semibold text-gray-900 leading-tight pr-2">
                {hospital.name}
              </CardTitle>
              {hospital.emergency && (
                <Badge variant="emergency" className="self-start">
                  <AlertCircle className="w-3 h-3 mr-1" />
                  Emergency
                </Badge>
              )}
            </div>
          </CardHeader>

          <CardContent className="px-4 md:px-6 pb-4 md:pb-6 space-y-4 flex-1 overflow-y-auto">
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <MapPin className="w-4 h-4 text-gray-500 mt-0.5 flex-shrink-0" strokeWidth={2} />
                <p className="text-xs md:text-sm text-gray-700 leading-relaxed">{hospital.address}</p>
              </div>

              <div className="flex items-center gap-3">
                <Users className="w-4 h-4 text-gray-500 flex-shrink-0" strokeWidth={2} />
                <p className="text-xs md:text-sm text-gray-700">
                  <span className="font-medium text-gray-900">{hospital.capacity}</span> beds
                </p>
              </div>

              <div>
                <div className="flex items-center gap-2 mb-2">
                  <Stethoscope className="w-4 h-4 text-gray-500" strokeWidth={2} />
                  <p className="text-xs font-medium text-gray-600 uppercase tracking-wide">
                    Specialties
                  </p>
                </div>
                <div className="flex flex-wrap gap-1.5 ml-6">
                  {hospital.specialties.map((specialty) => (
                    <span
                      key={specialty}
                      className="inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium bg-gray-100 text-gray-700 border border-gray-200"
                    >
                      {specialty}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Divider */}
            <div className="border-t border-gray-200" />

            {/* Nearest Ambulance Section */}
            <div>
              <div className="flex items-center gap-2 mb-3">
                <Ambulance className="w-4 h-4 text-gray-700" strokeWidth={2} />
                <p className="text-xs font-medium text-gray-700 uppercase tracking-wide">
                  Nearest Ambulance
                </p>
              </div>

              {isLoading ? (
                <div className="flex items-center justify-center py-8">
                  <div className="animate-spin rounded-full h-7 w-7 md:h-8 md:w-8 border-3 border-gray-200 border-t-blue-600" />
                </div>
              ) : proximityResult ? (
                <motion.div
                  initial={{ scale: 0.98, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ duration: 0.15 }}
                  className="bg-blue-50 border border-blue-200 rounded-lg p-3 md:p-4"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-sm md:text-base text-gray-900 truncate">
                        {proximityResult.ambulance.vehicleNumber}
                      </p>
                      <Badge status={proximityResult.ambulance.status} className="mt-1.5">
                        {proximityResult.ambulance.status}
                      </Badge>
                    </div>
                    {isCached && (
                      <div className="flex items-center gap-1 text-xs text-blue-700 bg-blue-100 px-2 py-1 rounded border border-blue-200 ml-2">
                        <RefreshCw className="w-3 h-3" strokeWidth={2} />
                        <span className="hidden sm:inline">Cached</span>
                      </div>
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-2 md:gap-3 mb-3">
                    <div className="bg-white rounded-md p-2.5 md:p-3 border border-blue-100">
                      <div className="flex items-center gap-1.5 mb-1">
                        <Navigation className="w-3 h-3 text-gray-500" strokeWidth={2} />
                        <p className="text-xs text-gray-600 font-medium">Distance</p>
                      </div>
                      <p className="text-lg md:text-xl font-semibold text-gray-900">
                        {proximityResult.distance.toFixed(2)}
                        <span className="text-xs md:text-sm font-normal text-gray-600 ml-1">km</span>
                      </p>
                    </div>

                    {/* ETA Card */}
                    <div className="bg-white rounded-md p-2.5 md:p-3 border border-blue-100">
                      <div className="flex items-center gap-1.5 mb-1">
                        <Clock className="w-3 h-3 text-gray-500" strokeWidth={2} />
                        <p className="text-xs text-gray-600 font-medium">ETA</p>
                      </div>
                      <p className="text-lg md:text-xl font-semibold text-gray-900">
                        {proximityResult?.duration?.toFixed(1) || 10}
                        <span className="text-xs md:text-sm font-normal text-gray-600 ml-1">min</span>
                      </p>
                    </div>
                  </div>

                  {/* Speed Info */}
                  <div className="flex items-center gap-2 text-xs text-gray-600 pt-2 border-t border-blue-200">
                    <Zap className="w-3.5 h-3.5 text-amber-600" strokeWidth={2} />
                    <span className="font-medium">Speed:</span>
                    <span>{proximityResult.ambulance.speed} km/h</span>
                  </div>

                  {/* Journey Controls */}
                  <div className="mt-3 pt-3 border-t border-blue-200">
                    <button
                      onClick={() => onStartJourney?.(hospital, proximityResult.ambulance)}
                      disabled={isJourneyActive}
                      className={`w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-md font-medium text-sm transition-all ${isJourneyActive
                        ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                        : 'bg-blue-600 text-white hover:bg-blue-700 active:bg-blue-800'
                        }`}
                    >
                      <Play className="w-4 h-4" strokeWidth={2} fill={isJourneyActive ? 'none' : 'currentColor'} />
                      {isJourneyActive ? 'Journey in Progress' : 'Start Journey'}
                    </button>

                    {/* Journey Progress */}
                    {isJourneyActive && journeyProgress !== undefined && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        className="mt-3 space-y-3"
                      >
                        {/* Progress Bar */}
                        <div className="space-y-2">
                          <div className="flex justify-between text-xs text-gray-600">
                            <span>Progress</span>
                            <span className="font-medium">{Math.round(journeyProgress)}%</span>
                          </div>
                          <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                            <motion.div
                              className="h-full bg-blue-600 rounded-full"
                              initial={{ width: 0 }}
                              animate={{ width: `${journeyProgress}%` }}
                              transition={{ duration: 0.3 }}
                            />
                          </div>
                        </div>

                        <div className="grid grid-cols-1 gap-2 pt-2 border-t border-blue-200">
                          <div className="flex items-center justify-between text-xs">
                            <div className="flex items-center gap-1.5 text-gray-600">
                              <Navigation className="w-3.5 h-3.5" strokeWidth={2} />
                              <span>Current Location</span>
                              {isJourneyActive && (
                                <span className="flex h-2 w-2">
                                  <span className="animate-ping absolute inline-flex h-2 w-2 rounded-full bg-green-400 opacity-75"></span>
                                  <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                                </span>
                              )}
                            </div>
                            <span className="font-mono text-xs text-gray-700">
                              {(currentAmbulance || proximityResult?.ambulance)?.coordinates.lat.toFixed(4)}, {(currentAmbulance || proximityResult?.ambulance)?.coordinates.lng.toFixed(4)}
                            </span>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </div>
                </motion.div>
              ) : (
                <div className="text-center py-6 md:py-8 bg-gray-50 rounded-lg border border-gray-200">
                  <Ambulance className="w-10 h-10 md:w-12 md:h-12 mx-auto mb-2 text-gray-300" strokeWidth={1.5} />
                  <p className="text-xs md:text-sm text-gray-500">No available ambulances</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </AnimatePresence>
  );
}
