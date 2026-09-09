export type MeshCircuitState = "CLOSED" | "OPEN" | "HALF_OPEN";

export interface ProviderMeshTelemetry {
  provider: string;
  state: MeshCircuitState;
  failureCount: number;
  trippedAt: number | null;
  originNodeId: string;
  gossipVersion: number;
  lastUpdated: number;
}

export interface PeerNode {
  nodeId: string;
  region: string;
  endpoint: string;
  healthy: boolean;
  lastSyncAt: number;
  circuitStates: Record<string, ProviderMeshTelemetry>;
}

export class CircuitMeshSyncEngine {
  private localNodeId: string;
  private localRegion: string;
  private localCircuits: Map<string, ProviderMeshTelemetry> = new Map();
  private peers: Map<string, PeerNode> = new Map();
  private gossipVersion: number = 0;

  constructor(localNodeId: string = "node-edge-primary", localRegion: string = "us-east") {
    this.localNodeId = localNodeId;
    this.localRegion = localRegion;

    const providers = ["openai", "anthropic", "deepseek", "groq"];
    providers.forEach(p => {
      this.localCircuits.set(p, {
        provider: p,
        state: "CLOSED",
        failureCount: 0,
        trippedAt: null,
        originNodeId: this.localNodeId,
        gossipVersion: 1,
        lastUpdated: Date.now()
      });
    });

    // Seed sample cluster peers
    this.peers.set("node-eu-west", {
      nodeId: "node-eu-west",
      region: "eu-west",
      endpoint: "https://eu.spendrouter.ai/api/system/circuit-mesh",
      healthy: true,
      lastSyncAt: Date.now(),
      circuitStates: {}
    });

    this.peers.set("node-ap-southeast", {
      nodeId: "node-ap-southeast",
      region: "ap-southeast",
      endpoint: "https://ap.spendrouter.ai/api/system/circuit-mesh",
      healthy: true,
      lastSyncAt: Date.now(),
      circuitStates: {}
    });
  }

  public getLocalCircuits(): Record<string, ProviderMeshTelemetry> {
    const result: Record<string, ProviderMeshTelemetry> = {};
    this.localCircuits.forEach((telemetry, provider) => {
      result[provider] = { ...telemetry };
    });
    return result;
  }

  public tripLocalCircuit(provider: string, reason?: string): ProviderMeshTelemetry {
    this.gossipVersion += 1;
    let telemetry = this.localCircuits.get(provider);
    if (!telemetry) {
      telemetry = {
        provider,
        state: "OPEN",
        failureCount: 5,
        trippedAt: Date.now(),
        originNodeId: this.localNodeId,
        gossipVersion: this.gossipVersion,
        lastUpdated: Date.now()
      };
      this.localCircuits.set(provider, telemetry);
    } else {
      telemetry.state = "OPEN";
      telemetry.failureCount = Math.max(5, telemetry.failureCount + 1);
      telemetry.trippedAt = Date.now();
      telemetry.gossipVersion = this.gossipVersion;
      telemetry.lastUpdated = Date.now();
    }
    return { ...telemetry };
  }

  public resetLocalCircuit(provider: string): ProviderMeshTelemetry {
    this.gossipVersion += 1;
    let telemetry = this.localCircuits.get(provider);
    if (!telemetry) {
      telemetry = {
        provider,
        state: "CLOSED",
        failureCount: 0,
        trippedAt: null,
        originNodeId: this.localNodeId,
        gossipVersion: this.gossipVersion,
        lastUpdated: Date.now()
      };
      this.localCircuits.set(provider, telemetry);
    } else {
      telemetry.state = "CLOSED";
      telemetry.failureCount = 0;
      telemetry.trippedAt = null;
      telemetry.gossipVersion = this.gossipVersion;
      telemetry.lastUpdated = Date.now();
    }
    return { ...telemetry };
  }

  public receivePeerGossip(peerId: string, peerCircuits: Record<string, ProviderMeshTelemetry>): {
    updatedProviders: string[];
    localState: Record<string, ProviderMeshTelemetry>;
  } {
    const peer = this.peers.get(peerId);
    if (peer) {
      peer.lastSyncAt = Date.now();
      peer.circuitStates = { ...peerCircuits };
    }

    const updatedProviders: string[] = [];

    Object.entries(peerCircuits).forEach(([provider, remoteTelemetry]) => {
      const local = this.localCircuits.get(provider);

      if (!local) {
        this.localCircuits.set(provider, { ...remoteTelemetry });
        updatedProviders.push(provider);
        return;
      }

      // If remote has higher gossip version or remote reports OPEN while local is CLOSED
      if (remoteTelemetry.gossipVersion > local.gossipVersion) {
        this.localCircuits.set(provider, { ...remoteTelemetry });
        updatedProviders.push(provider);
      } else if (remoteTelemetry.state === "OPEN" && local.state === "CLOSED" && (remoteTelemetry.trippedAt || 0) > (local.lastUpdated - 60000)) {
        // Fast-track cluster-wide tripped state
        local.state = "OPEN";
        local.trippedAt = remoteTelemetry.trippedAt;
        local.lastUpdated = Date.now();
        updatedProviders.push(provider);
      }
    });

    return {
      updatedProviders,
      localState: this.getLocalCircuits()
    };
  }

  public getMeshStatus(): {
    localNodeId: string;
    localRegion: string;
    gossipVersion: number;
    localCircuits: Record<string, ProviderMeshTelemetry>;
    peerCount: number;
    peers: PeerNode[];
  } {
    return {
      localNodeId: this.localNodeId,
      localRegion: this.localRegion,
      gossipVersion: this.gossipVersion,
      localCircuits: this.getLocalCircuits(),
      peerCount: this.peers.size,
      peers: Array.from(this.peers.values())
    };
  }
}

export const globalCircuitMeshEngine = new CircuitMeshSyncEngine();
