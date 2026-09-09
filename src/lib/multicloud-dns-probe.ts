export interface DnsProviderConfig {
  id: string;
  name: string;
  nameserver: string;
  baseWeightPct: number;
  currentWeightPct: number;
  healthy: boolean;
  latencyMs: number;
  dnssecValid: boolean;
  lastCheckedAt: number;
}

export const DEFAULT_DNS_PROVIDERS: DnsProviderConfig[] = [
  { id: "aws_route53", name: "AWS Route 53 Global", nameserver: "ns-1024.awsdns-00.org", baseWeightPct: 40, currentWeightPct: 40, healthy: true, latencyMs: 14, dnssecValid: true, lastCheckedAt: Date.now() },
  { id: "cloudflare_dns", name: "Cloudflare Anycast DNS", nameserver: "ns1.cloudflare.com", baseWeightPct: 35, currentWeightPct: 35, healthy: true, latencyMs: 9, dnssecValid: true, lastCheckedAt: Date.now() },
  { id: "gcp_clouddns", name: "Google Cloud DNS", nameserver: "ns-cloud-a1.googledomains.com", baseWeightPct: 25, currentWeightPct: 25, healthy: true, latencyMs: 12, dnssecValid: true, lastCheckedAt: Date.now() }
];

export class MultiCloudDnsEngine {
  private providers: Map<string, DnsProviderConfig> = new Map();

  constructor() {
    DEFAULT_DNS_PROVIDERS.forEach(p => this.providers.set(p.id, { ...p }));
  }

  private rebalanceWeights(): void {
    const activeProviders: DnsProviderConfig[] = [];
    this.providers.forEach(p => {
      if (p.healthy) activeProviders.push(p);
      else p.currentWeightPct = 0;
    });

    if (activeProviders.length === 0) {
      return;
    }

    const totalBaseWeight = activeProviders.reduce((acc, p) => acc + p.baseWeightPct, 0);
    activeProviders.forEach(p => {
      p.currentWeightPct = Math.round((p.baseWeightPct / totalBaseWeight) * 100);
    });

    // Ensure sum equals 100%
    const sum = activeProviders.reduce((acc, p) => acc + p.currentWeightPct, 0);
    if (sum !== 100 && activeProviders.length > 0) {
      activeProviders[0].currentWeightPct += (100 - sum);
    }
  }

  public probeProvider(providerId: string): DnsProviderConfig | null {
    const provider = this.providers.get(providerId);
    if (!provider) return null;

    // Simulate DNS probe latency and DNSSEC verification
    const jitter = Math.floor(Math.random() * 6) - 3;
    provider.latencyMs = Math.max(5, provider.latencyMs + jitter);
    provider.lastCheckedAt = Date.now();
    provider.dnssecValid = true;

    return { ...provider };
  }

  public probeAll(): {
    timestamp: string;
    totalProviders: number;
    healthyCount: number;
    activeProviders: DnsProviderConfig[];
    failoverActive: boolean;
  } {
    this.providers.forEach(p => this.probeProvider(p.id));
    this.rebalanceWeights();

    const providerList = Array.from(this.providers.values());
    const healthyCount = providerList.filter(p => p.healthy).length;
    const failoverActive = healthyCount < providerList.length;

    return {
      timestamp: new Date().toISOString(),
      totalProviders: providerList.length,
      healthyCount,
      activeProviders: providerList,
      failoverActive
    };
  }

  public setProviderHealth(providerId: string, healthy: boolean): boolean {
    const provider = this.providers.get(providerId);
    if (!provider) return false;
    provider.healthy = healthy;
    this.rebalanceWeights();
    return true;
  }

  public getStatus() {
    return Array.from(this.providers.values());
  }
}

export const globalMultiCloudDnsEngine = new MultiCloudDnsEngine();
