/**
 * Outcome-Indexed AI Spend Router - Zero-Downtime Shadow Dual-Write Migration Engine
 * Production Readiness Hardening (PR-058)
 */

import crypto from 'crypto';

export type MigrationStage = 'INIT' | 'DUAL_WRITE' | 'BACKFILL' | 'VERIFY' | 'CUTOVER' | 'COMPLETED' | 'ROLLED_BACK';

export interface MigrationConfig {
  migrationId: string;
  sourceTable: string;
  targetTable: string;
  keyColumn: string;
  transformFn?: (sourceRow: Record<string, any>) => Record<string, any>;
  batchSize?: number;
}

export interface VerificationReport {
  totalChecked: number;
  matchingCount: number;
  mismatchCount: number;
  missingInTargetCount: number;
  sourceChecksum: string;
  targetChecksum: string;
  isConsistent: boolean;
  timestamp: number;
}

export interface ShadowMigrationStatus {
  migrationId: string;
  sourceTable: string;
  targetTable: string;
  currentStage: MigrationStage;
  primaryWriteCount: number;
  shadowWriteCount: number;
  backfilledCount: number;
  lastVerification?: VerificationReport;
  startedAt: number;
  updatedAt: number;
}

export class ShadowDualWriteEngine {
  private static instance: ShadowDualWriteEngine;
  private readonly migrations: Map<string, ShadowMigrationStatus> = new Map();
  private readonly sourceTables: Map<string, Map<string, Record<string, any>>> = new Map();
  private readonly targetTables: Map<string, Map<string, Record<string, any>>> = new Map();
  private readonly migrationConfigs: Map<string, MigrationConfig> = new Map();

  private constructor() {}

  public static getInstance(): ShadowDualWriteEngine {
    if (!ShadowDualWriteEngine.instance) {
      ShadowDualWriteEngine.instance = new ShadowDualWriteEngine();
    }
    return ShadowDualWriteEngine.instance;
  }

  /**
   * Initialize a new live migration pipeline
   */
  public startMigration(config: MigrationConfig): ShadowMigrationStatus {
    const migrationId = config.migrationId;
    this.migrationConfigs.set(migrationId, {
      ...config,
      batchSize: config.batchSize || 100,
    });

    if (!this.sourceTables.has(config.sourceTable)) {
      this.sourceTables.set(config.sourceTable, new Map());
    }
    if (!this.targetTables.has(config.targetTable)) {
      this.targetTables.set(config.targetTable, new Map());
    }

    const status: ShadowMigrationStatus = {
      migrationId,
      sourceTable: config.sourceTable,
      targetTable: config.targetTable,
      currentStage: 'DUAL_WRITE',
      primaryWriteCount: 0,
      shadowWriteCount: 0,
      backfilledCount: 0,
      startedAt: Date.now(),
      updatedAt: Date.now(),
    };

    this.migrations.set(migrationId, status);
    return status;
  }

  /**
   * Execute an application write with shadow replication
   */
  public writeRecord(
    sourceTable: string,
    key: string,
    data: Record<string, any>,
    operation: 'INSERT' | 'UPDATE' | 'DELETE' = 'INSERT'
  ): { primarySuccess: boolean; shadowReplicated: boolean } {
    let sourceStore = this.sourceTables.get(sourceTable);
    if (!sourceStore) {
      sourceStore = new Map();
      this.sourceTables.set(sourceTable, sourceStore);
    }

    // 1. Primary Write
    if (operation === 'DELETE') {
      sourceStore.delete(key);
    } else {
      sourceStore.set(key, { ...data, _updatedAt: Date.now() });
    }

    // 2. Find active migration for this table
    let shadowReplicated = false;
    this.migrations.forEach((migration) => {
      if (
        migration.sourceTable === sourceTable &&
        (migration.currentStage === 'DUAL_WRITE' ||
          migration.currentStage === 'BACKFILL' ||
          migration.currentStage === 'VERIFY')
      ) {
        migration.primaryWriteCount++;
        const targetStore = this.targetTables.get(migration.targetTable);
        const config = this.migrationConfigs.get(migration.migrationId);

        if (targetStore) {
          if (operation === 'DELETE') {
            targetStore.delete(key);
          } else {
            const transformed = config?.transformFn ? config.transformFn(data) : { ...data };
            targetStore.set(key, { ...transformed, _updatedAt: Date.now(), _shadowReplicated: true });
          }
          migration.shadowWriteCount++;
          shadowReplicated = true;
          migration.updatedAt = Date.now();
        }
      }
    });

    return { primarySuccess: true, shadowReplicated };
  }

  /**
   * Execute background backfill from primary to target shadow table
   */
  public runBackfill(migrationId: string): { backfilledCount: number; currentStage: MigrationStage } {
    const migration = this.migrations.get(migrationId);
    if (!migration) throw new Error(`Migration ${migrationId} not found`);

    const config = this.migrationConfigs.get(migrationId);
    const sourceStore = this.sourceTables.get(migration.sourceTable) || new Map();
    const targetStore = this.targetTables.get(migration.targetTable) || new Map();

    let backfilled = 0;
    sourceStore.forEach((row, key) => {
      if (!targetStore.has(key)) {
        const transformed = config?.transformFn ? config.transformFn(row) : { ...row };
        targetStore.set(key, { ...transformed, _backfilled: true });
        backfilled++;
      }
    });

    migration.backfilledCount += backfilled;
    migration.currentStage = 'VERIFY';
    migration.updatedAt = Date.now();

    return { backfilledCount: migration.backfilledCount, currentStage: migration.currentStage };
  }

  /**
   * Compute cryptographic checksums & verify consistency
   */
  public verifyConsistency(migrationId: string): VerificationReport {
    const migration = this.migrations.get(migrationId);
    if (!migration) throw new Error(`Migration ${migrationId} not found`);

    const sourceStore = this.sourceTables.get(migration.sourceTable) || new Map();
    const targetStore = this.targetTables.get(migration.targetTable) || new Map();
    const config = this.migrationConfigs.get(migrationId);

    let matchingCount = 0;
    let mismatchCount = 0;
    let missingInTargetCount = 0;

    const sourceHash = crypto.createHash('sha256');
    const targetHash = crypto.createHash('sha256');

    // Deterministically iterate source records
    const sortedKeys = Array.from(sourceStore.keys()).sort();
    for (const key of sortedKeys) {
      const srcVal = sourceStore.get(key)!;
      const expectedTarget = config?.transformFn ? config.transformFn(srcVal) : srcVal;
      const tgtVal = targetStore.get(key);

      sourceHash.update(`${key}:${JSON.stringify(this.stripMeta(srcVal))}`);

      if (!tgtVal) {
        missingInTargetCount++;
      } else {
        targetHash.update(`${key}:${JSON.stringify(this.stripMeta(tgtVal))}`);
        if (this.recordsMatch(expectedTarget, tgtVal)) {
          matchingCount++;
        } else {
          mismatchCount++;
        }
      }
    }

    const report: VerificationReport = {
      totalChecked: sortedKeys.length,
      matchingCount,
      mismatchCount,
      missingInTargetCount,
      sourceChecksum: sourceHash.digest('hex').substring(0, 16),
      targetChecksum: targetHash.digest('hex').substring(0, 16),
      isConsistent: mismatchCount === 0 && missingInTargetCount === 0,
      timestamp: Date.now(),
    };

    migration.lastVerification = report;
    migration.updatedAt = Date.now();
    return report;
  }

  /**
   * Promote shadow table to active primary (Cutover)
   */
  public promoteCutover(migrationId: string): { success: boolean; stage: MigrationStage; error?: string } {
    const migration = this.migrations.get(migrationId);
    if (!migration) throw new Error(`Migration ${migrationId} not found`);

    // Verify consistency before cutover
    const verification = this.verifyConsistency(migrationId);
    if (!verification.isConsistent) {
      migration.currentStage = 'ROLLED_BACK';
      migration.updatedAt = Date.now();
      return {
        success: false,
        stage: 'ROLLED_BACK',
        error: `Cutover rejected: Data mismatch detected (${verification.mismatchCount} mismatches, ${verification.missingInTargetCount} missing)`,
      };
    }

    migration.currentStage = 'COMPLETED';
    migration.updatedAt = Date.now();
    return { success: true, stage: 'COMPLETED' };
  }

  public getMigrationStatus(migrationId: string): ShadowMigrationStatus | undefined {
    return this.migrations.get(migrationId);
  }

  public getAllMigrations(): ShadowMigrationStatus[] {
    return Array.from(this.migrations.values());
  }

  private stripMeta(obj: Record<string, any>): Record<string, any> {
    const clean = { ...obj };
    delete clean._updatedAt;
    delete clean._shadowReplicated;
    delete clean._backfilled;
    return clean;
  }

  private recordsMatch(a: Record<string, any>, b: Record<string, any>): boolean {
    const cleanA = this.stripMeta(a);
    const cleanB = this.stripMeta(b);
    return JSON.stringify(cleanA) === JSON.stringify(cleanB);
  }

  public reset(): void {
    this.migrations.clear();
    this.sourceTables.clear();
    this.targetTables.clear();
    this.migrationConfigs.clear();
  }
}
