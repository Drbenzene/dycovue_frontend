'use client';

import { Card, CardContent } from '@/components/ui/Card';
import { Building2, Ambulance, CheckCircle2, RefreshCw } from 'lucide-react';

interface StatsPanelProps {
  totalHospitals: number;
  totalAmbulances: number;
  availableAmbulances: number;
}

export default function StatsPanel({
  totalHospitals,
  totalAmbulances,
  availableAmbulances,
}: StatsPanelProps) {
  const stats = [
    {
      label: 'Total Hospitals',
      value: totalHospitals,
      icon: Building2,
      color: 'text-red-600',
      bg: 'bg-red-50',
    },
    {
      label: 'Total Ambulances',
      value: totalAmbulances,
      icon: Ambulance,
      color: 'text-blue-600',
      bg: 'bg-blue-50',
    },
    {
      label: 'Available Now',
      value: availableAmbulances,
      icon: CheckCircle2,
      color: 'text-green-600',
      bg: 'bg-green-50',
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {stats.map((stat, index) => {
        const Icon = stat.icon;
        return (
          <Card key={index} className="border-0 shadow-sm hover:shadow-md transition-shadow duration-200">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-gray-600 mb-1">{stat.label}</p>
                  <p className={`text-2xl font-semibold ${stat.color}`}>
                    {stat.value}
                  </p>
                </div>
                <div className={`w-10 h-10 rounded-lg ${stat.bg} flex items-center justify-center`}>
                  <Icon className={`w-5 h-5 ${stat.color}`} />
                </div>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
