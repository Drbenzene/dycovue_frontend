import type { Ambulance } from '@/types';
import { initialAmbulances } from '@/data/ambulances';

/**
 * In-memory ambulance store
 * In a real application, this would be a database
 */
class AmbulancesStore {
    private ambulances: Map<string, Ambulance>;

    constructor(initialData: Ambulance[]) {
        this.ambulances = new Map(initialData.map((amb) => [amb.id, amb]));
    }

    getAll(): Ambulance[] {
        return Array.from(this.ambulances.values());
    }

    getById(id: string): Ambulance | undefined {
        return this.ambulances.get(id);
    }

    getByStatus(status: string): Ambulance[] {
        return this.getAll().filter((amb) => amb.status === status);
    }

    update(id: string, updates: Partial<Ambulance>): Ambulance | null {
        const ambulance = this.ambulances.get(id);
        if (!ambulance) return null;

        const updated = {
            ...ambulance,
            ...updates,
            lastUpdate: new Date().toISOString(),
        };

        this.ambulances.set(id, updated);
        return updated;
    }

    batchUpdate(updates: Array<{ id: string; updates: Partial<Ambulance> }>): Ambulance[] {
        const results: Ambulance[] = [];

        for (const { id, updates: data } of updates) {
            const updated = this.update(id, data);
            if (updated) {
                results.push(updated);
            }
        }

        return results;
    }

    reset(): void {
        this.ambulances = new Map(initialAmbulances.map((amb) => [amb.id, amb]));
    }
}

// Singleton instance
export const ambulancesStore = new AmbulancesStore(initialAmbulances);
