export interface HostPoolConfig {
  host: string;
  maxSockets: number;
  minIdleSockets: number;
  keepAliveTimeoutMs: number;
  acquireTimeoutMs: number;
}

export interface SocketLease {
  leaseId: string;
  host: string;
  socketId: string;
  acquiredAt: number;
  released: boolean;
}

export interface PoolStats {
  host: string;
  activeConnections: number;
  idleConnections: number;
  queuedRequests: number;
  maxSockets: number;
  utilizationPct: number;
  totalLeasesGranted: number;
}

const DEFAULT_HOST_CONFIGS: Record<string, HostPoolConfig> = {
  "api.openai.com": { host: "api.openai.com", maxSockets: 100, minIdleSockets: 10, keepAliveTimeoutMs: 60000, acquireTimeoutMs: 3000 },
  "api.anthropic.com": { host: "api.anthropic.com", maxSockets: 60, minIdleSockets: 8, keepAliveTimeoutMs: 60000, acquireTimeoutMs: 3000 },
  "api.deepseek.com": { host: "api.deepseek.com", maxSockets: 80, minIdleSockets: 10, keepAliveTimeoutMs: 60000, acquireTimeoutMs: 3000 },
  "api.groq.com": { host: "api.groq.com", maxSockets: 50, minIdleSockets: 5, keepAliveTimeoutMs: 60000, acquireTimeoutMs: 3000 }
};

export class ConnectionPoolManager {
  private configs: Map<string, HostPoolConfig> = new Map();
  private activeSockets: Map<string, Set<string>> = new Map();
  private idleSockets: Map<string, Set<string>> = new Map();
  private leases: Map<string, SocketLease> = new Map();
  private totalLeases: Map<string, number> = new Map();

  constructor() {
    Object.entries(DEFAULT_HOST_CONFIGS).forEach(([host, config]) => {
      this.configs.set(host, config);
      this.activeSockets.set(host, new Set());
      this.idleSockets.set(host, new Set());
      this.totalLeases.set(host, 0);

      // Pre-warm minimum idle sockets
      for (let i = 0; i < config.minIdleSockets; i++) {
        this.idleSockets.get(host)!.add(`sock_idle_${host}_${i}`);
      }
    });
  }

  public acquireSocket(host: string): {
    granted: boolean;
    leaseId?: string;
    socketId?: string;
    reason?: string;
    poolStats: PoolStats;
  } {
    const config = this.configs.get(host) || {
      host,
      maxSockets: 50,
      minIdleSockets: 5,
      keepAliveTimeoutMs: 60000,
      acquireTimeoutMs: 3000
    };

    if (!this.activeSockets.has(host)) {
      this.activeSockets.set(host, new Set());
      this.idleSockets.set(host, new Set());
      this.totalLeases.set(host, 0);
    }

    const active = this.activeSockets.get(host)!;
    const idle = this.idleSockets.get(host)!;

    if (active.size >= config.maxSockets) {
      return {
        granted: false,
        reason: `POOL_EXHAUSTED: Active sockets (${active.size}/${config.maxSockets}) for host ${host}`,
        poolStats: this.getPoolStats(host)
      };
    }

    let socketId: string;
    if (idle.size > 0) {
      const firstIdle = Array.from(idle)[0];
      idle.delete(firstIdle);
      socketId = firstIdle;
    } else {
      socketId = `sock_live_${host}_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`;
    }

    active.add(socketId);
    const leaseId = `lease_${Math.random().toString(36).slice(2, 10)}`;

    const lease: SocketLease = {
      leaseId,
      host,
      socketId,
      acquiredAt: Date.now(),
      released: false
    };

    this.leases.set(leaseId, lease);
    this.totalLeases.set(host, (this.totalLeases.get(host) || 0) + 1);

    return {
      granted: true,
      leaseId,
      socketId,
      poolStats: this.getPoolStats(host)
    };
  }

  public releaseSocket(leaseId: string): { success: boolean; host?: string; socketId?: string } {
    const lease = this.leases.get(leaseId);
    if (!lease || lease.released) {
      return { success: false };
    }

    lease.released = true;
    const active = this.activeSockets.get(lease.host);
    const idle = this.idleSockets.get(lease.host);

    if (active) {
      active.delete(lease.socketId);
    }

    const config = this.configs.get(lease.host);
    if (idle && config && idle.size < config.minIdleSockets * 2) {
      idle.add(lease.socketId);
    }

    this.leases.delete(leaseId);
    return { success: true, host: lease.host, socketId: lease.socketId };
  }

  public getPoolStats(host: string): PoolStats {
    const config = this.configs.get(host) || { host, maxSockets: 50, minIdleSockets: 5, keepAliveTimeoutMs: 60000, acquireTimeoutMs: 3000 };
    const activeCount = this.activeSockets.get(host)?.size || 0;
    const idleCount = this.idleSockets.get(host)?.size || 0;
    const totalGranted = this.totalLeases.get(host) || 0;

    return {
      host,
      activeConnections: activeCount,
      idleConnections: idleCount,
      queuedRequests: 0,
      maxSockets: config.maxSockets,
      utilizationPct: Math.round((activeCount / config.maxSockets) * 100),
      totalLeasesGranted: totalGranted
    };
  }

  public getAllPoolStats(): Record<string, PoolStats> {
    const result: Record<string, PoolStats> = {};
    this.configs.forEach((_, host) => {
      result[host] = this.getPoolStats(host);
    });
    return result;
  }
}

export const globalConnectionPoolManager = new ConnectionPoolManager();
