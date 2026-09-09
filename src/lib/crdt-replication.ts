import crypto from "crypto";

export interface VectorClock {
  [nodeId: string]: number;
}

export interface CrdtRecord<T = any> {
  key: string;
  value: T;
  nodeId: string;
  version: number;
  timestamp: number;
  lamportClock: number;
  vectorClock: VectorClock;
  deleted?: boolean;
}

export type ClockComparison = "ANCESTOR" | "DESCENDANT" | "EQUAL" | "CONCURRENT";

export class CrdtReplicationEngine {
  private localNodeId: string;
  private currentLamportClock: number = 0;
  private localVectorClock: VectorClock = {};
  private stateStore: Map<string, CrdtRecord> = new Map();
  private tombstoneStore: Map<string, CrdtRecord> = new Map();

  constructor(nodeId?: string) {
    this.localNodeId = nodeId || `node-${crypto.randomBytes(3).toString("hex")}`;
    this.localVectorClock[this.localNodeId] = 0;
  }

  public getNodeId(): string {
    return this.localNodeId;
  }

  public getVectorClock(): VectorClock {
    return { ...this.localVectorClock };
  }

  public getLamportClock(): number {
    return this.currentLamportClock;
  }

  public compareVectorClocks(v1: VectorClock, v2: VectorClock): ClockComparison {
    let greater = false;
    let lesser = false;

    const allNodes = new Set([...Object.keys(v1), ...Object.keys(v2)]);

    Array.from(allNodes).forEach((node) => {
      const c1 = v1[node] || 0;
      const c2 = v2[node] || 0;

      if (c1 > c2) greater = true;
      if (c1 < c2) lesser = true;
    });

    if (greater && !lesser) return "DESCENDANT";
    if (!greater && lesser) return "ANCESTOR";
    if (!greater && !lesser) return "EQUAL";
    return "CONCURRENT";
  }

  public setRecord<T = any>(key: string, value: T): CrdtRecord<T> {
    this.currentLamportClock += 1;
    this.localVectorClock[this.localNodeId] = (this.localVectorClock[this.localNodeId] || 0) + 1;

    const record: CrdtRecord<T> = {
      key,
      value,
      nodeId: this.localNodeId,
      version: this.localVectorClock[this.localNodeId],
      timestamp: Date.now(),
      lamportClock: this.currentLamportClock,
      vectorClock: { ...this.localVectorClock },
      deleted: false
    };

    this.stateStore.set(key, record);
    this.tombstoneStore.delete(key);
    return record;
  }

  public deleteRecord(key: string): CrdtRecord | null {
    const existing = this.stateStore.get(key);
    if (!existing) return null;

    this.currentLamportClock += 1;
    this.localVectorClock[this.localNodeId] = (this.localVectorClock[this.localNodeId] || 0) + 1;

    const tombstone: CrdtRecord = {
      key,
      value: null,
      nodeId: this.localNodeId,
      version: this.localVectorClock[this.localNodeId],
      timestamp: Date.now(),
      lamportClock: this.currentLamportClock,
      vectorClock: { ...this.localVectorClock },
      deleted: true
    };

    this.tombstoneStore.set(key, tombstone);
    this.stateStore.delete(key);
    return tombstone;
  }

  public getRecord<T = any>(key: string): T | null {
    const record = this.stateStore.get(key);
    if (!record || record.deleted) return null;
    return record.value as T;
  }

  public getAllRecords(): Record<string, any> {
    const result: Record<string, any> = {};
    this.stateStore.forEach((record, key) => {
      if (!record.deleted) {
        result[key] = record.value;
      }
    });
    return result;
  }

  public reconcileRecord(remoteRecord: CrdtRecord): { resolved: boolean; winner: "LOCAL" | "REMOTE" | "MERGED"; record: CrdtRecord } {
    // Advance local Lamport clock
    this.currentLamportClock = Math.max(this.currentLamportClock, remoteRecord.lamportClock) + 1;

    // Update vector clock for the remote node
    const remoteNodeCount = remoteRecord.vectorClock[remoteRecord.nodeId] || 0;
    this.localVectorClock[remoteRecord.nodeId] = Math.max(
      this.localVectorClock[remoteRecord.nodeId] || 0,
      remoteNodeCount
    );

    const localRecord = this.stateStore.get(remoteRecord.key) || this.tombstoneStore.get(remoteRecord.key);

    if (!localRecord) {
      if (remoteRecord.deleted) {
        this.tombstoneStore.set(remoteRecord.key, remoteRecord);
        this.stateStore.delete(remoteRecord.key);
      } else {
        this.stateStore.set(remoteRecord.key, remoteRecord);
      }
      return { resolved: true, winner: "REMOTE", record: remoteRecord };
    }

    const comparison = this.compareVectorClocks(localRecord.vectorClock, remoteRecord.vectorClock);

    if (comparison === "DESCENDANT") {
      // Local record is newer and causally dominates
      return { resolved: true, winner: "LOCAL", record: localRecord };
    }

    if (comparison === "ANCESTOR") {
      // Remote record is causally newer
      if (remoteRecord.deleted) {
        this.tombstoneStore.set(remoteRecord.key, remoteRecord);
        this.stateStore.delete(remoteRecord.key);
      } else {
        this.stateStore.set(remoteRecord.key, remoteRecord);
        this.tombstoneStore.delete(remoteRecord.key);
      }
      return { resolved: true, winner: "REMOTE", record: remoteRecord };
    }

    // Concurrent conflict: Resolve via LWW (Lamport clock + timestamp + lexicographical node tiebreak)
    let remoteWins = false;

    if (remoteRecord.lamportClock > localRecord.lamportClock) {
      remoteWins = true;
    } else if (remoteRecord.lamportClock === localRecord.lamportClock) {
      if (remoteRecord.timestamp > localRecord.timestamp) {
        remoteWins = true;
      } else if (remoteRecord.timestamp === localRecord.timestamp) {
        remoteWins = remoteRecord.nodeId.localeCompare(localRecord.nodeId) > 0;
      }
    }

    const winningRecord = remoteWins ? remoteRecord : localRecord;

    // Merge vector clocks so both histories are unified
    const mergedVectorClock: VectorClock = { ...localRecord.vectorClock };
    for (const [node, count] of Object.entries(remoteRecord.vectorClock)) {
      mergedVectorClock[node] = Math.max(mergedVectorClock[node] || 0, count);
    }
    winningRecord.vectorClock = mergedVectorClock;

    if (winningRecord.deleted) {
      this.tombstoneStore.set(winningRecord.key, winningRecord);
      this.stateStore.delete(winningRecord.key);
    } else {
      this.stateStore.set(winningRecord.key, winningRecord);
      this.tombstoneStore.delete(winningRecord.key);
    }

    return {
      resolved: true,
      winner: remoteWins ? "REMOTE" : "LOCAL",
      record: winningRecord
    };
  }

  public getFullSnapshot(): {
    nodeId: string;
    lamportClock: number;
    vectorClock: VectorClock;
    activeRecords: CrdtRecord[];
    tombstones: CrdtRecord[];
  } {
    return {
      nodeId: this.localNodeId,
      lamportClock: this.currentLamportClock,
      vectorClock: { ...this.localVectorClock },
      activeRecords: Array.from(this.stateStore.values()),
      tombstones: Array.from(this.tombstoneStore.values())
    };
  }
}

export const globalCrdtEngine = new CrdtReplicationEngine("primary-edge-node");
