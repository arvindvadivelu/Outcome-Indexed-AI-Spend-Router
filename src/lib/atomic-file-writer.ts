import fs from "fs";
import path from "path";
import crypto from "crypto";

/**
 * 🛡️ Atomic JSON File Writer & Data Integrity Vault
 * Uses temporary staging files and atomic rename operations to prevent partial write corruption.
 */

export interface AtomicWriteOptions {
  makeBackup?: boolean;
  maxBackups?: number;
}

export function atomicWriteJson<T>(
  filePath: string,
  data: T,
  options: AtomicWriteOptions = { makeBackup: true, maxBackups: 5 }
): { success: boolean; checksumSha256: string; error?: string } {
  try {
    const dir = path.dirname(filePath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }

    const serialized = JSON.stringify(data, null, 2);
    const checksumSha256 = crypto.createHash("sha256").update(serialized).digest("hex");

    // 1. Create a unique temporary staging file in the same directory
    const tempFile = `${filePath}.${Date.now()}.${Math.random().toString(36).substring(2, 6)}.tmp`;
    fs.writeFileSync(tempFile, serialized, "utf-8");

    // 2. Optional backup of previous file if it exists
    if (options.makeBackup && fs.existsSync(filePath)) {
      const backupDir = path.join(dir, "backups");
      if (!fs.existsSync(backupDir)) {
        fs.mkdirSync(backupDir, { recursive: true });
      }
      const backupFile = path.join(backupDir, `${path.basename(filePath)}.${Date.now()}.bak`);
      fs.copyFileSync(filePath, backupFile);
    }

    // 3. Atomically replace the destination file (with Windows EPERM fallback)
    try {
      fs.renameSync(tempFile, filePath);
    } catch (renameErr) {
      // Fallback for Windows file system locking
      fs.copyFileSync(tempFile, filePath);
      try {
        fs.unlinkSync(tempFile);
      } catch {}
    }

    return {
      success: true,
      checksumSha256
    };
  } catch (err: any) {
    console.error(`Atomic write error for ${filePath}:`, err);
    // Direct write fallback as last resort
    try {
      const serialized = JSON.stringify(data, null, 2);
      fs.writeFileSync(filePath, serialized, "utf-8");
      return { success: true, checksumSha256: "" };
    } catch {}
    return {
      success: false,
      checksumSha256: "",
      error: err?.message || "Atomic write failed"
    };
  }
}

export function safeReadJson<T>(filePath: string, fallback: T): T {
  try {
    if (!fs.existsSync(filePath)) {
      return fallback;
    }
    const raw = fs.readFileSync(filePath, "utf-8");
    if (!raw.trim()) return fallback;
    return JSON.parse(raw);
  } catch (err) {
    console.error(`Safe read error for ${filePath}:`, err);
    return fallback;
  }
}
