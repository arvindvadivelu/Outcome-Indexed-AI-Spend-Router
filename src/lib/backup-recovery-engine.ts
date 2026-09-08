import fs from "fs";
import path from "path";
import crypto from "crypto";
import { atomicLock } from "./atomic-lock";

/**
 * 💾 Automated Production Database JSON Ledger Backup & Snapshot Engine
 * Takes point-in-time rotating snapshots, generates SHA-256 integrity hashes, and handles disaster recovery.
 * Protected by distributed atomic mutex locks against concurrent write/restore races.
 */

export interface BackupSnapshot {
  id: string;
  timestamp: string;
  sourceFiles: string[];
  totalRecordsCount: number;
  checksumSha256: string;
  snapshotPath: string;
}

const DATA_DIR = path.join(process.cwd(), "data");
const BACKUP_DIR = path.join(DATA_DIR, "snapshots");
const BACKUP_LOCK_KEY = "lock:db_snapshot_operation";

export function createProductionSnapshot(): BackupSnapshot {
  const lock = atomicLock.acquireLock(BACKUP_LOCK_KEY, 15000, "backup_engine");
  if (!lock.success) {
    throw new Error(lock.error || "Cannot create snapshot: database operation lock is held by another worker.");
  }

  try {
    if (!fs.existsSync(BACKUP_DIR)) {
      fs.mkdirSync(BACKUP_DIR, { recursive: true });
    }

    const usersPath = path.join(DATA_DIR, "users.json");
    const paymentsPath = path.join(DATA_DIR, "payments.json");

    const usersData = fs.existsSync(usersPath) ? JSON.parse(fs.readFileSync(usersPath, "utf-8")) : [];
    const paymentsData = fs.existsSync(paymentsPath) ? JSON.parse(fs.readFileSync(paymentsPath, "utf-8")) : [];

    const snapshotPayload = {
      snapshotVersion: "1.0.0",
      createdAt: new Date().toISOString(),
      tables: {
        users: usersData,
        payments: paymentsData
      }
    };

    const serialized = JSON.stringify(snapshotPayload, null, 2);
    const checksum = crypto.createHash("sha256").update(serialized).digest("hex");
    const snapshotId = `snapshot_${Date.now()}`;
    const filename = `${snapshotId}.json`;
    const fullPath = path.join(BACKUP_DIR, filename);

    const { atomicWriteJson } = require("./atomic-file-writer");
    atomicWriteJson(fullPath, snapshotPayload);

    // Keep only the 10 most recent snapshots
    try {
      const files = fs.readdirSync(BACKUP_DIR)
        .filter((f) => f.startsWith("snapshot_") && f.endsWith(".json"))
        .sort()
        .reverse();
      if (files.length > 10) {
        files.slice(10).forEach((oldFile) => {
          fs.unlinkSync(path.join(BACKUP_DIR, oldFile));
        });
      }
    } catch (err) {
      console.warn("Snapshot rotation warning:", err);
    }

    return {
      id: snapshotId,
      timestamp: snapshotPayload.createdAt,
      sourceFiles: ["users.json", "payments.json"],
      totalRecordsCount: usersData.length + paymentsData.length,
      checksumSha256: checksum,
      snapshotPath: fullPath
    };
  } finally {
    if (lock.lockToken) {
      atomicLock.releaseLock(BACKUP_LOCK_KEY, lock.lockToken);
    }
  }
}

export function listAvailableSnapshots(): string[] {
  if (!fs.existsSync(BACKUP_DIR)) return [];
  return fs.readdirSync(BACKUP_DIR).filter((f) => f.endsWith(".json"));
}

export function restoreProductionSnapshot(snapshotIdOrFilename: string): { success: boolean; restoredTables: string[]; error?: string } {
  const lock = atomicLock.acquireLock(BACKUP_LOCK_KEY, 30000, "restore_engine");
  if (!lock.success) {
    return { success: false, restoredTables: [], error: lock.error || "Cannot restore: database operation lock is active." };
  }

  try {
    const filename = snapshotIdOrFilename.endsWith(".json") ? snapshotIdOrFilename : `${snapshotIdOrFilename}.json`;
    const targetFile = path.join(BACKUP_DIR, filename);
    if (!fs.existsSync(targetFile)) {
      return { success: false, restoredTables: [], error: `Snapshot '${filename}' not found` };
    }
    const raw = fs.readFileSync(targetFile, "utf-8");
    const parsed = JSON.parse(raw);
    const tables = parsed.tables || {};
    const restoredTables: string[] = [];

    const { atomicWriteJson } = require("./atomic-file-writer");

    if (Array.isArray(tables.users)) {
      atomicWriteJson(path.join(DATA_DIR, "users.json"), tables.users);
      restoredTables.push("users.json");
    }
    if (Array.isArray(tables.payments)) {
      atomicWriteJson(path.join(DATA_DIR, "payments.json"), tables.payments);
      restoredTables.push("payments.json");
    }

    return { success: true, restoredTables };
  } catch (err: any) {
    return { success: false, restoredTables: [], error: err?.message || "Failed to restore snapshot" };
  } finally {
    if (lock.lockToken) {
      atomicLock.releaseLock(BACKUP_LOCK_KEY, lock.lockToken);
    }
  }
}
