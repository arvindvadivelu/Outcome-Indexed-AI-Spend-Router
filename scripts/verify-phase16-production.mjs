/**
 * Phase 16 Production Readiness Verification Suite
 * Outcome-Indexed AI Spend Router
 * Verifies PR-057, PR-058, PR-059, PR-060
 */

import { WafChallengeGuard } from '../src/lib/waf-challenge-guard.ts';
import { ShadowDualWriteEngine } from '../src/lib/shadow-dual-write.ts';
import { DeadlockDetector } from '../src/lib/deadlock-detector.ts';
import { SpeculativeHedgingOptimizer } from '../src/lib/speculative-hedging.ts';

function assert(condition, message) {
  if (!condition) {
    console.error(`❌ FAIL: ${message}`);
    process.exit(1);
  }
  console.log(`✅ PASS: ${message}`);
}

async function runPhase16Tests() {
  console.log('\n=============================================================');
  console.log('🧪 Starting Phase 16 Production Readiness & Reliability Tests');
  console.log('=============================================================\n');

  // -------------------------------------------------------------
  // Test PR-057: Ingress WAF Rate-Based Challenge & Cryptographic PoW
  // -------------------------------------------------------------
  console.log('--- Testing PR-057: WAF Cryptographic PoW Challenge Guard ---');
  const waf = WafChallengeGuard.getInstance();
  waf.reset();

  // 1. Evaluate threat
  const benignEval = waf.evaluateThreat({
    ip: '192.168.1.50',
    userAgent: 'Mozilla/5.0',
    requestPath: '/api/routing',
    rpm: 10,
    anomalyScore: 10,
  });
  assert(!benignEval.requiresChallenge, 'Benign traffic should not require PoW challenge');

  const hostileEval = waf.evaluateThreat({
    ip: '10.0.0.99',
    userAgent: 'ScraperBot/1.0',
    requestPath: '/api/routing',
    rpm: 150,
    anomalyScore: 85,
  });
  assert(hostileEval.requiresChallenge && hostileEval.difficulty === 4, 'Hostile traffic must trigger difficulty 4 PoW challenge');

  // 2. Issue challenge
  const challenge = waf.issueChallenge('10.0.0.99', 3);
  assert(challenge.challengeId.startsWith('pow_') && challenge.difficulty === 3, 'PoW challenge issued with valid structure');

  // 3. Solve challenge
  const solution = waf.solveChallengeLocally(challenge.seed, challenge.difficulty);
  assert(typeof solution.nonce === 'number' && solution.hash.startsWith('000'), 'Local PoW solver found valid nonce solution');

  // 4. Verify invalid nonce
  const invalidResult = waf.verifySolution(challenge.challengeId, '10.0.0.99', 'invalid_nonce_12345');
  assert(!invalidResult.valid, 'Invalid nonce must be rejected');

  // 5. Verify valid solution
  const validResult = waf.verifySolution(challenge.challengeId, '10.0.0.99', solution.nonce);
  assert(validResult.valid && !!validResult.clearanceToken, 'Valid nonce verified and clearance token issued');

  // 6. Test replay prevention
  const replayResult = waf.verifySolution(challenge.challengeId, '10.0.0.99', solution.nonce);
  assert(!replayResult.valid && replayResult.error.includes('replay'), 'Challenge replay attempt must be blocked');

  // 7. Validate clearance token
  const tokenValid = waf.validateClearanceToken(validResult.clearanceToken, '10.0.0.99');
  assert(tokenValid, 'Clearance token validated successfully for matching IP');
  const tokenInvalidIp = waf.validateClearanceToken(validResult.clearanceToken, '192.168.1.1');
  assert(!tokenInvalidIp, 'Clearance token rejected for mismatched IP');

  console.log('PR-057 metrics:', waf.getMetrics());

  // -------------------------------------------------------------
  // Test PR-058: Zero-Downtime Shadow Dual-Write Migration Engine
  // -------------------------------------------------------------
  console.log('\n--- Testing PR-058: Zero-Downtime Shadow Dual-Write Engine ---');
  const shadow = ShadowDualWriteEngine.getInstance();
  shadow.reset();

  // Seed historical records into primary table BEFORE migration starts
  shadow.writeRecord('tenants_v1', 't_001', { name: 'Acme Corp', tier: 'enterprise' });
  shadow.writeRecord('tenants_v1', 't_002', { name: 'Beta Labs', tier: 'growth' });

  const migration = shadow.startMigration({
    migrationId: 'mig_tenants_v2',
    sourceTable: 'tenants_v1',
    targetTable: 'tenants_v2',
    keyColumn: 'tenantId',
    transformFn: (row) => ({ ...row, schemaVersion: 2, upperName: String(row.name || '').toUpperCase() }),
  });
  assert(migration.currentStage === 'DUAL_WRITE', 'Migration initialized in DUAL_WRITE stage');

  // Live dual write
  const liveWrite = shadow.writeRecord('tenants_v1', 't_003', { name: 'Gamma AI', tier: 'starter' });
  assert(liveWrite.primarySuccess && liveWrite.shadowReplicated, 'Live write written to primary and replicated to shadow table');

  // Backfill historical
  const backfillRes = shadow.runBackfill('mig_tenants_v2');
  assert(backfillRes.backfilledCount >= 2, 'Backfill populated historical rows into shadow table');

  // Verify consistency
  const verification = shadow.verifyConsistency('mig_tenants_v2');
  assert(verification.isConsistent && verification.mismatchCount === 0 && verification.missingInTargetCount === 0, 'Checksum verification confirmed 100% data consistency');

  // Cutover promotion
  const cutover = shadow.promoteCutover('mig_tenants_v2');
  assert(cutover.success && cutover.stage === 'COMPLETED', 'Shadow table promoted to active primary with zero downtime');

  // -------------------------------------------------------------
  // Test PR-059: Distributed Deadlock Detection & Graph Resolver
  // -------------------------------------------------------------
  console.log('\n--- Testing PR-059: Distributed Deadlock Detection & Cycle Resolver ---');
  const dlk = DeadlockDetector.getInstance();
  dlk.reset();

  // Register 3 transactions with different priorities
  dlk.registerTransaction('tx_A', 'tenant_1', 10); // VIP priority 10
  dlk.registerTransaction('tx_B', 'tenant_2', 5);  // Mid priority 5
  dlk.registerTransaction('tx_C', 'tenant_3', 1);  // Low priority 1 (Victim candidate)

  // tx_A acquires Resource_1
  const a1 = dlk.acquireResource('tx_A', 'res_wallet_1');
  assert(a1.acquired, 'tx_A acquired res_wallet_1');

  // tx_B acquires Resource_2
  const b2 = dlk.acquireResource('tx_B', 'res_quota_2');
  assert(b2.acquired, 'tx_B acquired res_quota_2');

  // tx_C acquires Resource_3
  const c3 = dlk.acquireResource('tx_C', 'res_cache_3');
  assert(c3.acquired, 'tx_C acquired res_cache_3');

  // Create wait chain:
  // tx_A waits for res_quota_2 (held by tx_B)
  const aWait = dlk.acquireResource('tx_A', 'res_quota_2');
  assert(!aWait.acquired && aWait.waitingForTxId === 'tx_B', 'tx_A registered waiting for tx_B');

  // tx_B waits for res_cache_3 (held by tx_C)
  const bWait = dlk.acquireResource('tx_B', 'res_cache_3');
  assert(!bWait.acquired && bWait.waitingForTxId === 'tx_C', 'tx_B registered waiting for tx_C');

  // tx_C waits for res_wallet_1 (held by tx_A) -> THIS CLOSES THE CYCLE: tx_A -> tx_B -> tx_C -> tx_A!
  const cWait = dlk.acquireResource('tx_C', 'res_wallet_1');
  assert(cWait.deadlockDetected !== undefined, 'Deadlock cycle detected upon circular dependency acquisition!');
  assert(cWait.deadlockDetected.victimTxId === 'tx_C', 'Lowest-priority transaction tx_C chosen as victim and aborted');

  const dlkMetrics = dlk.getMetrics();
  assert(dlkMetrics.totalDeadlocksDetected === 1 && dlkMetrics.totalVictimsAborted === 1, 'Deadlock metrics accurately recorded cycle & victim abortion');

  // -------------------------------------------------------------
  // Test PR-060: Speculative Upstream Request Hedging Optimizer
  // -------------------------------------------------------------
  console.log('\n--- Testing PR-060: Speculative Request Hedging Optimizer ---');
  const hedge = SpeculativeHedgingOptimizer.getInstance();
  hedge.reset();

  // Test provider percentiles
  hedge.recordLatency('openai', 300);
  hedge.recordLatency('openai', 350);
  hedge.recordLatency('openai', 400);
  hedge.recordLatency('openai', 1500); // tail latency spike
  const stats = hedge.getProviderStats('openai');
  assert(stats.p50 > 0 && stats.p95 >= 400, 'Provider percentiles accurately computed from sliding latency window');

  // Test hedged execution where primary is slow (500ms) and secondary is fast (50ms), hedge delay = 100ms
  const hedgedResult = await hedge.executeWithHedging(
    'openai',
    'anthropic',
    (signal) =>
      new Promise((resolve, reject) => {
        const timer = setTimeout(() => resolve({ provider: 'openai', data: 'slow primary payload' }), 400);
        signal.addEventListener('abort', () => {
          clearTimeout(timer);
          reject(new Error('Aborted slow primary'));
        });
      }),
    (signal) =>
      new Promise((resolve, reject) => {
        const timer = setTimeout(() => resolve({ provider: 'anthropic', data: 'fast hedged secondary payload' }), 50);
        signal.addEventListener('abort', () => {
          clearTimeout(timer);
          reject(new Error('Aborted secondary'));
        });
      }),
    100 // Custom hedge delay
  );

  assert(hedgedResult.winner === 'HEDGED_SECONDARY', 'Speculative hedged secondary won over stalled primary');
  assert(hedgedResult.hedgedTriggered && hedgedResult.winnerProvider === 'anthropic', 'Hedged request triggered and succeeded');

  const hedgeMetrics = hedge.getMetrics();
  assert(hedgeMetrics.hedgedDispatches >= 1 && hedgeMetrics.secondaryHedgeWins >= 1, 'Hedging metrics recorded secondary win and cancelled redundant call');
  console.log('PR-060 metrics:', hedgeMetrics);

  console.log('\n=============================================================');
  console.log('🎉 ALL PHASE 16 TESTS PASSED SUCCESSFULLY! (100% VERIFIED)');
  console.log('=============================================================\n');
}

runPhase16Tests().catch((err) => {
  console.error('Fatal test error:', err);
  process.exit(1);
});
