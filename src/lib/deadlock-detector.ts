/**
 * Outcome-Indexed AI Spend Router - Distributed Deadlock Detection & Graph Resolver
 * Production Readiness Hardening (PR-059)
 */

export interface TransactionInfo {
  txId: string;
  tenantId: string;
  priority: number; // Higher number = higher priority (VIP)
  startedAt: number;
  status: 'ACTIVE' | 'WAITING' | 'ABORTED_VICTIM' | 'COMMITTED';
  heldResources: string[];
  waitingForResource?: string;
}

export interface DeadlockCycle {
  cycleId: string;
  txIds: string[];
  resourcesInvolved: string[];
  detectedAt: number;
  victimTxId: string;
  resolution: 'VICTIM_ABORTED';
}

export interface DeadlockMetrics {
  activeTransactionsCount: number;
  activeLocksCount: number;
  totalDeadlocksDetected: number;
  totalVictimsAborted: number;
  waitGraphNodes: number;
  waitGraphEdges: number;
}

export class DeadlockDetector {
  private static instance: DeadlockDetector;
  private readonly transactions: Map<string, TransactionInfo> = new Map();
  private readonly resourceHolders: Map<string, string> = new Map(); // resourceId -> txId
  private readonly deadlockHistory: DeadlockCycle[] = [];
  
  private totalCyclesDetected = 0;
  private totalVictimsAborted = 0;

  private constructor() {}

  public static getInstance(): DeadlockDetector {
    if (!DeadlockDetector.instance) {
      DeadlockDetector.instance = new DeadlockDetector();
    }
    return DeadlockDetector.instance;
  }

  /**
   * Register a new transaction
   */
  public registerTransaction(txId: string, tenantId: string, priority = 5): TransactionInfo {
    const tx: TransactionInfo = {
      txId,
      tenantId,
      priority,
      startedAt: Date.now(),
      status: 'ACTIVE',
      heldResources: [],
    };
    this.transactions.set(txId, tx);
    return tx;
  }

  /**
   * Acquire a resource lock or register a wait edge
   */
  public acquireResource(txId: string, resourceId: string): { acquired: boolean; waitingForTxId?: string; deadlockDetected?: DeadlockCycle } {
    const tx = this.transactions.get(txId);
    if (!tx || tx.status === 'ABORTED_VICTIM') {
      return { acquired: false };
    }

    const currentHolder = this.resourceHolders.get(resourceId);

    // Case 1: Resource is free or already held by this transaction
    if (!currentHolder || currentHolder === txId) {
      this.resourceHolders.set(resourceId, txId);
      if (!tx.heldResources.includes(resourceId)) {
        tx.heldResources.push(resourceId);
      }
      tx.waitingForResource = undefined;
      tx.status = 'ACTIVE';
      return { acquired: true };
    }

    // Case 2: Resource held by another transaction -> Add wait dependency
    tx.waitingForResource = resourceId;
    tx.status = 'WAITING';

    // Check for deadlock cycles in Wait-For Graph
    const cycle = this.detectAndResolveDeadlock();
    if (cycle) {
      return { acquired: false, waitingForTxId: currentHolder, deadlockDetected: cycle };
    }

    return { acquired: false, waitingForTxId: currentHolder };
  }

  /**
   * Release resources and finish/commit transaction
   */
  public commitTransaction(txId: string): { committed: boolean; releasedResources: string[] } {
    const tx = this.transactions.get(txId);
    if (!tx) return { committed: false, releasedResources: [] };

    const released = [...tx.heldResources];
    for (const res of released) {
      if (this.resourceHolders.get(res) === txId) {
        this.resourceHolders.delete(res);
      }
    }

    tx.heldResources = [];
    tx.waitingForResource = undefined;
    tx.status = 'COMMITTED';

    // Auto-promote any waiting transactions
    this.reassignFreedResources(released);

    return { committed: true, releasedResources: released };
  }

  /**
   * Abort a transaction and release its locks
   */
  public abortTransaction(txId: string, reason: string): boolean {
    const tx = this.transactions.get(txId);
    if (!tx) return false;

    const released = [...tx.heldResources];
    for (const res of released) {
      if (this.resourceHolders.get(res) === txId) {
        this.resourceHolders.delete(res);
      }
    }

    tx.heldResources = [];
    tx.waitingForResource = undefined;
    tx.status = 'ABORTED_VICTIM';

    this.reassignFreedResources(released);
    return true;
  }

  /**
   * Build Wait-For Graph (WFG) and detect cycles using DFS
   */
  public detectAndResolveDeadlock(): DeadlockCycle | null {
    // Build adjacency list: txA -> txB (txA is waiting for resource held by txB)
    const adjList: Map<string, string[]> = new Map();
    this.transactions.forEach((tx, id) => {
      if (tx.status === 'WAITING' && tx.waitingForResource) {
        const holder = this.resourceHolders.get(tx.waitingForResource);
        if (holder && holder !== id && this.transactions.has(holder)) {
          adjList.set(id, [holder]);
        }
      }
    });

    const visited: Set<string> = new Set();
    const inStack: Set<string> = new Set();
    const parentPath: string[] = [];

    const dfs = (curr: string): string[] | null => {
      visited.add(curr);
      inStack.add(curr);
      parentPath.push(curr);

      const neighbors = adjList.get(curr) || [];
      for (const next of neighbors) {
        if (!visited.has(next)) {
          const cycle = dfs(next);
          if (cycle) return cycle;
        } else if (inStack.has(next)) {
          // Found cycle!
          const cycleStartIndex = parentPath.indexOf(next);
          return parentPath.slice(cycleStartIndex);
        }
      }

      inStack.delete(curr);
      parentPath.pop();
      return null;
    };

    let detectedTxCycle: string[] | null = null;
    const allWaiters = Array.from(adjList.keys());
    for (const waiter of allWaiters) {
      if (!visited.has(waiter)) {
        detectedTxCycle = dfs(waiter);
        if (detectedTxCycle) break;
      }
    }

    if (!detectedTxCycle || detectedTxCycle.length === 0) {
      return null;
    }

    // Deadlock Cycle found!
    this.totalCyclesDetected++;

    // Select victim: pick lowest priority tx, tie-breaker = newest startedAt
    let victimId = detectedTxCycle[0];
    let minPriority = Infinity;
    let newestStart = 0;

    for (const txId of detectedTxCycle) {
      const tx = this.transactions.get(txId);
      if (tx) {
        if (tx.priority < minPriority || (tx.priority === minPriority && tx.startedAt > newestStart)) {
          minPriority = tx.priority;
          newestStart = tx.startedAt;
          victimId = txId;
        }
      }
    }

    // Collect resources involved
    const resourcesInvolved: string[] = [];
    for (const txId of detectedTxCycle) {
      const tx = this.transactions.get(txId);
      if (tx?.waitingForResource && !resourcesInvolved.includes(tx.waitingForResource)) {
        resourcesInvolved.push(tx.waitingForResource);
      }
      for (const h of tx?.heldResources || []) {
        if (!resourcesInvolved.includes(h)) {
          resourcesInvolved.push(h);
        }
      }
    }

    // Abort victim
    this.abortTransaction(victimId, 'Deadlock resolution victim selection');
    this.totalVictimsAborted++;

    const cycleInfo: DeadlockCycle = {
      cycleId: `dlk_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      txIds: detectedTxCycle,
      resourcesInvolved,
      detectedAt: Date.now(),
      victimTxId: victimId,
      resolution: 'VICTIM_ABORTED',
    };

    this.deadlockHistory.unshift(cycleInfo);
    if (this.deadlockHistory.length > 50) {
      this.deadlockHistory.pop();
    }

    return cycleInfo;
  }

  private reassignFreedResources(freedResources: string[]): void {
    for (const res of freedResources) {
      // Find first active waiter
      const waiter = Array.from(this.transactions.values()).find(
        (t) => t.status === 'WAITING' && t.waitingForResource === res
      );
      if (waiter) {
        this.resourceHolders.set(res, waiter.txId);
        waiter.heldResources.push(res);
        waiter.waitingForResource = undefined;
        waiter.status = 'ACTIVE';
      }
    }
  }

  public getGraphState() {
    const nodes = Array.from(this.transactions.values()).map((t) => ({
      txId: t.txId,
      tenantId: t.tenantId,
      status: t.status,
      priority: t.priority,
      held: t.heldResources,
      waitingFor: t.waitingForResource,
    }));

    const edges: Array<{ from: string; to: string; resource: string }> = [];
    this.transactions.forEach((tx, fromTxId) => {
      if (tx.status === 'WAITING' && tx.waitingForResource) {
        const holder = this.resourceHolders.get(tx.waitingForResource);
        if (holder) {
          edges.push({ from: fromTxId, to: holder, resource: tx.waitingForResource });
        }
      }
    });

    return { nodes, edges };
  }

  public getMetrics(): DeadlockMetrics {
    const graph = this.getGraphState();
    return {
      activeTransactionsCount: Array.from(this.transactions.values()).filter((t) => t.status === 'ACTIVE' || t.status === 'WAITING').length,
      activeLocksCount: this.resourceHolders.size,
      totalDeadlocksDetected: this.totalCyclesDetected,
      totalVictimsAborted: this.totalVictimsAborted,
      waitGraphNodes: graph.nodes.length,
      waitGraphEdges: graph.edges.length,
    };
  }

  public getHistory(): DeadlockCycle[] {
    return this.deadlockHistory;
  }

  public reset(): void {
    this.transactions.clear();
    this.resourceHolders.clear();
    this.deadlockHistory.length = 0;
    this.totalCyclesDetected = 0;
    this.totalVictimsAborted = 0;
  }
}
