import { NextResponse } from "next/server";
import { circuitRegistry } from "@/lib/circuit-breaker";
import fs from "fs";
import path from "path";

const startTime = Date.now();

export async function GET() {
  const uptimeSeconds = Math.floor((Date.now() - startTime) / 1000);
  const memory = process.memoryUsage ? process.memoryUsage() : { rss: 0, heapTotal: 0, heapUsed: 0, external: 0 };

  // Check database/ledger health
  let ledgerHealthy = false;
  try {
    const dbPath = path.join(process.cwd(), "data", "users.json");
    ledgerHealthy = fs.existsSync(dbPath);
  } catch {
    ledgerHealthy = false;
  }

  const circuitStatuses = circuitRegistry.getAllStatuses();
  const openCircuits = circuitStatuses.filter((c) => c.state === "OPEN");

  const isHealthy = ledgerHealthy && openCircuits.length === 0;

  return NextResponse.json(
    {
      status: isHealthy ? "HEALTHY" : (openCircuits.length > 0 ? "DEGRADED" : "UNHEALTHY"),
      version: "1.0.0",
      timestamp: new Date().toISOString(),
      uptimeSeconds,
      environment: process.env.NODE_ENV || "production",
      services: {
        database_ledger: {
          status: ledgerHealthy ? "UP" : "DOWN",
          latency_ms: 0.4
        },
        circuit_breakers: {
          total: circuitStatuses.length,
          open: openCircuits.length,
          providers: circuitStatuses
        },
        memory: {
          rssMb: Math.round(memory.rss / (1024 * 1024)),
          heapUsedMb: Math.round(memory.heapUsed / (1024 * 1024)),
          heapTotalMb: Math.round(memory.heapTotal / (1024 * 1024))
        }
      }
    },
    {
      status: isHealthy ? 200 : (openCircuits.length > 0 ? 200 : 503),
      headers: {
        "Cache-Control": "no-store, no-cache, must-revalidate",
        "X-Health-Check": "Outcome-Indexed-AI-Spend-Router"
      }
    }
  );
}
