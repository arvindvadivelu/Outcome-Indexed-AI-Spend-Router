import { NextRequest, NextResponse } from 'next/server';
import { DeadlockDetector } from '@/lib/deadlock-detector';

export async function GET(req: NextRequest) {
  try {
    const detector = DeadlockDetector.getInstance();
    const metrics = detector.getMetrics();
    const graph = detector.getGraphState();
    const history = detector.getHistory();

    return NextResponse.json({
      success: true,
      metrics,
      graph,
      history,
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
    const { action, txId, tenantId, priority, resourceId, reason } = body;
    const detector = DeadlockDetector.getInstance();

    if (action === 'register') {
      if (!txId || !tenantId) {
        return NextResponse.json({ success: false, error: 'txId and tenantId are required' }, { status: 400 });
      }
      const tx = detector.registerTransaction(txId, tenantId, priority || 5);
      return NextResponse.json({ success: true, transaction: tx });
    }

    if (action === 'acquire') {
      if (!txId || !resourceId) {
        return NextResponse.json({ success: false, error: 'txId and resourceId are required' }, { status: 400 });
      }
      const result = detector.acquireResource(txId, resourceId);
      return NextResponse.json({ success: true, ...result });
    }

    if (action === 'commit') {
      if (!txId) {
        return NextResponse.json({ success: false, error: 'txId is required' }, { status: 400 });
      }
      const result = detector.commitTransaction(txId);
      return NextResponse.json({ success: true, ...result });
    }

    if (action === 'abort') {
      if (!txId) {
        return NextResponse.json({ success: false, error: 'txId is required' }, { status: 400 });
      }
      const aborted = detector.abortTransaction(txId, reason || 'Manual abort');
      return NextResponse.json({ success: true, aborted });
    }

    if (action === 'detect') {
      const cycle = detector.detectAndResolveDeadlock();
      return NextResponse.json({ success: true, cycleDetected: !!cycle, cycle });
    }

    return NextResponse.json({ success: false, error: `Invalid action: ${action}` }, { status: 400 });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Internal error';
    return NextResponse.json({ success: false, error: msg }, { status: 500 });
  }
}
