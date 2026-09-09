import { NextRequest, NextResponse } from 'next/server';
import { ShadowDualWriteEngine } from '@/lib/shadow-dual-write';

export async function GET(req: NextRequest) {
  try {
    const engine = ShadowDualWriteEngine.getInstance();
    const migrationId = req.nextUrl.searchParams.get('migrationId');

    if (migrationId) {
      const status = engine.getMigrationStatus(migrationId);
      if (!status) {
        return NextResponse.json({ success: false, error: 'Migration not found' }, { status: 404 });
      }
      return NextResponse.json({ success: true, status });
    }

    const migrations = engine.getAllMigrations();
    return NextResponse.json({
      success: true,
      count: migrations.length,
      migrations,
      timestamp: new Date().toISOString(),
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Internal error';
    return NextResponse.json({ success: false, error: msg }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { action, migrationId, sourceTable, targetTable, keyColumn, key, data, operation } = body;
    const engine = ShadowDualWriteEngine.getInstance();

    if (action === 'start') {
      if (!migrationId || !sourceTable || !targetTable) {
        return NextResponse.json({ success: false, error: 'migrationId, sourceTable, and targetTable are required' }, { status: 400 });
      }
      const status = engine.startMigration({
        migrationId,
        sourceTable,
        targetTable,
        keyColumn: keyColumn || 'id',
      });
      return NextResponse.json({ success: true, status });
    }

    if (action === 'write') {
      if (!sourceTable || !key || !data) {
        return NextResponse.json({ success: false, error: 'sourceTable, key, and data are required' }, { status: 400 });
      }
      const writeResult = engine.writeRecord(sourceTable, key, data, operation || 'INSERT');
      return NextResponse.json({ success: true, ...writeResult });
    }

    if (action === 'backfill') {
      if (!migrationId) {
        return NextResponse.json({ success: false, error: 'migrationId is required' }, { status: 400 });
      }
      const result = engine.runBackfill(migrationId);
      return NextResponse.json({ success: true, ...result });
    }

    if (action === 'verify') {
      if (!migrationId) {
        return NextResponse.json({ success: false, error: 'migrationId is required' }, { status: 400 });
      }
      const report = engine.verifyConsistency(migrationId);
      return NextResponse.json({ success: true, report });
    }

    if (action === 'cutover') {
      if (!migrationId) {
        return NextResponse.json({ success: false, error: 'migrationId is required' }, { status: 400 });
      }
      const cutoverResult = engine.promoteCutover(migrationId);
      return NextResponse.json({ ...cutoverResult });
    }

    return NextResponse.json({ success: false, error: `Invalid action: ${action}` }, { status: 400 });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Internal error';
    return NextResponse.json({ success: false, error: msg }, { status: 500 });
  }
}
