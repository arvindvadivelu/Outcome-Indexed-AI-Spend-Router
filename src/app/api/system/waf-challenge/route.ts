import { NextRequest, NextResponse } from 'next/server';
import { WafChallengeGuard } from '@/lib/waf-challenge-guard';

export async function GET(req: NextRequest) {
  try {
    const waf = WafChallengeGuard.getInstance();
    const metrics = waf.getMetrics();
    return NextResponse.json({
      success: true,
      status: 'ACTIVE',
      metrics,
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
    const { action, ip, anomalyScore, rpm, challengeId, nonce, token, seed, difficulty } = body;
    const waf = WafChallengeGuard.getInstance();
    const clientIp = ip || req.headers.get('x-forwarded-for') || '127.0.0.1';

    if (action === 'evaluate') {
      const result = waf.evaluateThreat({
        ip: clientIp,
        userAgent: req.headers.get('user-agent') || 'unknown',
        requestPath: req.nextUrl.pathname,
        rpm: typeof rpm === 'number' ? rpm : 10,
        anomalyScore: typeof anomalyScore === 'number' ? anomalyScore : 0,
      });
      return NextResponse.json({ success: true, ...result });
    }

    if (action === 'issue') {
      const challenge = waf.issueChallenge(clientIp, difficulty || 3);
      return NextResponse.json({ success: true, challenge });
    }

    if (action === 'verify') {
      if (!challengeId || nonce === undefined) {
        return NextResponse.json({ success: false, error: 'challengeId and nonce are required' }, { status: 400 });
      }
      const verification = waf.verifySolution(challengeId, clientIp, nonce);
      if (!verification.valid) {
        return NextResponse.json({ success: false, error: verification.error }, { status: 403 });
      }
      return NextResponse.json({
        success: true,
        clearanceToken: verification.clearanceToken,
        clearanceExpiresAt: verification.clearanceExpiresAt,
        latencyMs: verification.latencyMs,
      });
    }

    if (action === 'validate') {
      if (!token) {
        return NextResponse.json({ success: false, error: 'token is required' }, { status: 400 });
      }
      const isValid = waf.validateClearanceToken(token, clientIp);
      return NextResponse.json({ success: true, valid: isValid });
    }

    if (action === 'solve-test') {
      if (!seed || difficulty === undefined) {
        return NextResponse.json({ success: false, error: 'seed and difficulty are required' }, { status: 400 });
      }
      const solution = waf.solveChallengeLocally(seed, difficulty);
      return NextResponse.json({ success: true, solution });
    }

    return NextResponse.json({ success: false, error: `Invalid action: ${action}` }, { status: 400 });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Internal error';
    return NextResponse.json({ success: false, error: msg }, { status: 500 });
  }
}
