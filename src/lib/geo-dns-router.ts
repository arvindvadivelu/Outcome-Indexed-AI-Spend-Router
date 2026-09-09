export interface PointOfPresence {
  id: string;
  name: string;
  region: string;
  latitude: number;
  longitude: number;
  healthy: boolean;
  baseLatencyMs: number;
  currentLoadPct: number;
}

export const GLOBAL_POPS: PointOfPresence[] = [
  { id: "us-east-1", name: "US East (N. Virginia)", region: "NA", latitude: 38.03, longitude: -78.47, healthy: true, baseLatencyMs: 12, currentLoadPct: 42 },
  { id: "us-west-1", name: "US West (Oregon)", region: "NA", latitude: 45.52, longitude: -122.67, healthy: true, baseLatencyMs: 18, currentLoadPct: 35 },
  { id: "eu-west-1", name: "Europe (Frankfurt)", region: "EU", latitude: 50.11, longitude: 8.68, healthy: true, baseLatencyMs: 15, currentLoadPct: 58 },
  { id: "ap-southeast-1", name: "Asia Pacific (Singapore)", region: "APAC", latitude: 1.35, longitude: 103.81, healthy: true, baseLatencyMs: 22, currentLoadPct: 49 },
  { id: "sa-east-1", name: "South America (São Paulo)", region: "SA", latitude: -23.55, longitude: -46.63, healthy: true, baseLatencyMs: 35, currentLoadPct: 28 }
];

const COUNTRY_COORDINATES: Record<string, { lat: number; lon: number }> = {
  US: { lat: 37.09, lon: -95.71 },
  CA: { lat: 56.13, lon: -106.34 },
  GB: { lat: 55.37, lon: -3.43 },
  DE: { lat: 51.16, lon: 10.45 },
  FR: { lat: 46.22, lon: 2.21 },
  IN: { lat: 20.59, lon: 78.96 },
  SG: { lat: 1.35, lon: 103.81 },
  JP: { lat: 36.20, lon: 138.25 },
  AU: { lat: -25.27, lon: 133.77 },
  BR: { lat: -14.23, lon: -51.92 }
};

export class GeoDnsRouter {
  private pops: Map<string, PointOfPresence> = new Map();

  constructor() {
    GLOBAL_POPS.forEach(pop => this.pops.set(pop.id, { ...pop }));
  }

  private calculateDistanceKm(lat1: number, lon1: number, lat2: number, lon2: number): number {
    const R = 6371; // Earth's radius in km
    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLon = ((lon2 - lon1) * Math.PI) / 180;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos((lat1 * Math.PI) / 180) *
        Math.cos((lat2 * Math.PI) / 180) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return Math.round(R * c);
  }

  public resolveBestPop(clientIp: string, countryCode?: string): {
    bestPop: PointOfPresence;
    distanceKm: number;
    estimatedLatencyMs: number;
    failoverApplied: boolean;
    candidateRankings: Array<{ popId: string; distanceKm: number; estimatedLatencyMs: number; healthy: boolean }>;
  } {
    const country = countryCode?.toUpperCase() || "US";
    const coords = COUNTRY_COORDINATES[country] || COUNTRY_COORDINATES.US;

    const rankings: Array<{ pop: PointOfPresence; distanceKm: number; estimatedLatencyMs: number }> = [];

    this.pops.forEach(pop => {
      const distanceKm = this.calculateDistanceKm(coords.lat, coords.lon, pop.latitude, pop.longitude);
      // Rough latency heuristic: base latency + ~0.015ms per km
      const estimatedLatencyMs = Math.round(pop.baseLatencyMs + distanceKm * 0.012);
      rankings.push({ pop, distanceKm, estimatedLatencyMs });
    });

    // Sort by estimated latency
    rankings.sort((a, b) => a.estimatedLatencyMs - b.estimatedLatencyMs);

    const primaryChoice = rankings[0];
    let selectedChoice = primaryChoice;
    let failoverApplied = false;

    if (!primaryChoice.pop.healthy) {
      const healthyFallback = rankings.find(r => r.pop.healthy);
      if (healthyFallback) {
        selectedChoice = healthyFallback;
        failoverApplied = true;
      }
    }

    return {
      bestPop: selectedChoice.pop,
      distanceKm: selectedChoice.distanceKm,
      estimatedLatencyMs: selectedChoice.estimatedLatencyMs,
      failoverApplied,
      candidateRankings: rankings.map(r => ({
        popId: r.pop.id,
        distanceKm: r.distanceKm,
        estimatedLatencyMs: r.estimatedLatencyMs,
        healthy: r.pop.healthy
      }))
    };
  }

  public setPopHealth(popId: string, healthy: boolean): boolean {
    const pop = this.pops.get(popId);
    if (!pop) return false;
    pop.healthy = healthy;
    return true;
  }

  public getPops(): PointOfPresence[] {
    return Array.from(this.pops.values());
  }
}

export const globalGeoDnsRouter = new GeoDnsRouter();
