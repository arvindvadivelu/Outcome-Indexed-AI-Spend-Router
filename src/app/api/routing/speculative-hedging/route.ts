import { NextRequest, NextResponse } from 'next/server';
import { SpeculativeHedgingOptimizer } from '@/lib/speculative-hedging';

export async function GET(req: NextRequest) {
  try {
    const optimizer = SpeculativeHedgingOptimizer.getInstance();
    const metrics = optimizer.getMetrics();
    const config = optimizer.getConfig();
    const provider = req.nextUrl.searchParams.get('provider');

    if (provider) {
      const stats = optimizer.getProviderStats(provider);
      return NextResponse.json({ success: true, stats, config });
    }

    const openaiStats = optimizer.getProviderStats('openai');
    const anthropicStats = optimizer.getProviderStats('anthropic');
    const deepseekStats = optimizer.getProviderStats('deepseek');

    return NextResponse.json({
      success: true,
      metrics,
      config,
      providers: {
        openai: openaiStats,
        anthropic: anthropicStats,
        deepseek: deepseekStats,
      },
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
    const { action, config, provider, latencyMs, primaryProvider, secondaryProvider, primaryDelayMs, secondaryDelayMs, hedgeDelayMs } = body;
    const optimizer = SpeculativeHedgingOptimizer.getInstance();

    if (action === 'config') {
      if (!config) {
        return NextResponse.json({ success: false, error: 'config is required' }, { status: 400 });
      }
      optimizer.setConfig(config);
      return NextResponse.json({ success: true, config: optimizer.getConfig() });
    }

    if (action === 'record-latency') {
      if (!provider || latencyMs === undefined) {
        return NextResponse.json({ success: false, error: 'provider and latencyMs are required' }, { status: 400 });
      }
      optimizer.recordLatency(provider, latencyMs);
      return NextResponse.json({ success: true, stats: optimizer.getProviderStats(provider) });
    }

    if (action === 'simulate') {
      const prim = primaryProvider || 'openai';
      const sec = secondaryProvider || 'anthropic';
      const pDelay = primaryDelayMs ?? 500;
      const sDelay = secondaryDelayMs ?? 100;

      const result = await optimizer.executeWithHedging(
        prim,
        sec,
        (signal) =>
          new Promise((resolve, reject) => {
            const t = setTimeout(() => resolve({ provider: prim, output: 'Primary response payload' }), pDelay);
            signal.addEventListener('abort', () => {
              clearTimeout(t);
              reject(new Error('Primary aborted by hedging'));
            });
          }),
        (signal) =>
          new Promise((resolve, reject) => {
            const t = setTimeout(() => resolve({ provider: sec, output: 'Secondary hedged response payload' }), sDelay);
            signal.addEventListener('abort', () => {
              clearTimeout(t);
              reject(new Error('Secondary aborted by winner'));
            });
          }),
        hedgeDelayMs
      );

      return NextResponse.json({ success: true, result });
    }

    return NextResponse.json({ success: false, error: `Invalid action: ${action}` }, { status: 400 });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Internal error';
    return NextResponse.json({ success: false, error: msg }, { status: 500 });
  }
}
