import crypto from "crypto";

/**
 * 🌀 High-Performance Consistent Hash Ring & Shard Router
 * Distributes tenant accounts and telemetry partitions across database shards
 * using virtual nodes with uniform keyspace distribution and minimal re-hashing on scale.
 */

export class ConsistentHashRing {
  private ring: Map<number, string> = new Map();
  private sortedKeys: number[] = [];
  private nodes: Set<string> = new Set();
  private vnodesCount: number;

  constructor(nodes: string[] = ["shard-0", "shard-1", "shard-2", "shard-3"], vnodesCount: number = 64) {
    this.vnodesCount = vnodesCount;
    for (const node of nodes) {
      this.addNode(node);
    }
  }

  private hash(key: string): number {
    const digest = crypto.createHash("md5").update(key).digest("hex");
    // Parse 32-bit integer from first 8 hex characters
    return parseInt(digest.substring(0, 8), 16);
  }

  public addNode(nodeId: string): void {
    this.nodes.add(nodeId);
    for (let i = 0; i < this.vnodesCount; i++) {
      const vnodeKey = `${nodeId}#vnode${i}`;
      const hashVal = this.hash(vnodeKey);
      this.ring.set(hashVal, nodeId);
    }
    this.rebuildSortedKeys();
  }

  public removeNode(nodeId: string): void {
    this.nodes.delete(nodeId);
    for (let i = 0; i < this.vnodesCount; i++) {
      const vnodeKey = `${nodeId}#vnode${i}`;
      const hashVal = this.hash(vnodeKey);
      this.ring.delete(hashVal);
    }
    this.rebuildSortedKeys();
  }

  private rebuildSortedKeys(): void {
    this.sortedKeys = Array.from(this.ring.keys()).sort((a, b) => a - b);
  }

  /**
   * Returns the designated shard node for a given key (e.g. tenant email, partition ID).
   */
  public getNode(key: string): string {
    if (this.sortedKeys.length === 0) {
      return "shard-0";
    }

    const hashVal = this.hash(key);

    // Binary search for the first virtual node >= hashVal
    let low = 0;
    let high = this.sortedKeys.length - 1;
    let foundIdx = 0;

    while (low <= high) {
      const mid = Math.floor((low + high) / 2);
      if (this.sortedKeys[mid] >= hashVal) {
        foundIdx = mid;
        high = mid - 1;
      } else {
        low = mid + 1;
      }
    }

    // Wrap around to 0 if hashVal is greater than all nodes in ring
    if (low >= this.sortedKeys.length) {
      foundIdx = 0;
    }

    const ringKey = this.sortedKeys[foundIdx];
    return this.ring.get(ringKey) || "shard-0";
  }

  public getNodes(): string[] {
    return Array.from(this.nodes);
  }

  public getTotalVnodes(): number {
    return this.ring.size;
  }
}

export const defaultHashRing = new ConsistentHashRing();
