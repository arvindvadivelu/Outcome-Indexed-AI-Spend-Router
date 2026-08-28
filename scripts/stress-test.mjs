// ==============================================================================
// ⚡ Outcome-Indexed AI Spend Router - Production Web Performance Stress Suite
// Audits routes, latency distributions, TTFB, throughput (RPS), and compute score
// ==============================================================================

import http from 'http';
import https from 'https';

const BASE_URL = process.env.BASE_URL || 'http://localhost:3000';
const CONCURRENCY = 25; // Concurrent simulated workers
const ITERATIONS_PER_ROUTE = 40; // Total 40 requests per route per run

const ROUTES_TO_TEST = [
  '/',
  '/pricing',
  '/features',
  '/docs',
  '/app/dashboard',
  '/app/routing',
  '/app/benchmarks',
  '/app/analytics/tokens',
  '/app/logs',
  '/app/settings/api-keys',
  '/app/billing'
];

function makeRequest(url) {
  return new Promise((resolve) => {
    const startTime = process.hrtime.bigint();
    let firstByteTime = null;

    const req = http.get(url, (res) => {
      res.once('data', () => {
        if (!firstByteTime) {
          firstByteTime = process.hrtime.bigint();
        }
      });

      res.on('data', () => {});

      res.on('end', () => {
        const endTime = process.hrtime.bigint();
        const totalDurationMs = Number(endTime - startTime) / 1e6;
        const ttfbMs = firstByteTime ? Number(firstByteTime - startTime) / 1e6 : totalDurationMs;

        resolve({
          statusCode: res.statusCode,
          durationMs: totalDurationMs,
          ttfbMs,
          success: res.statusCode >= 200 && res.statusCode < 400
        });
      });
    });

    req.on('error', (err) => {
      const endTime = process.hrtime.bigint();
      const totalDurationMs = Number(endTime - startTime) / 1e6;
      resolve({
        statusCode: 0,
        durationMs: totalDurationMs,
        ttfbMs: totalDurationMs,
        success: false,
        error: err.message
      });
    });

    req.setTimeout(5000, () => {
      req.destroy();
      resolve({
        statusCode: 408,
        durationMs: 5000,
        ttfbMs: 5000,
        success: false,
        error: 'Timeout'
      });
    });
  });
}

async function runWorkerPool(route, totalRequests, concurrency) {
  const url = `${BASE_URL}${route}`;
  const results = [];
  let completed = 0;

  async function worker() {
    while (completed < totalRequests) {
      completed++;
      const res = await makeRequest(url);
      results.push(res);
    }
  }

  const workers = Array.from({ length: concurrency }, () => worker());
  await Promise.all(workers);
  return results;
}

function calculatePercentile(values, p) {
  if (!values.length) return 0;
  const sorted = [...values].sort((a, b) => a - b);
  const index = Math.ceil((p / 100) * sorted.length) - 1;
  return sorted[Math.max(0, Math.min(index, sorted.length - 1))];
}

async function runPerformanceAudit() {
  console.log('============================================================');
  console.log(' ⚡ HIGH-CONCURRENCY WEB PERFORMANCE STRESS TEST AUDIT');
  console.log(` Target Host: ${BASE_URL} | Workers: ${CONCURRENCY}`);
  console.log('============================================================\n');

  const suiteStartTime = Date.now();
  let totalRequestsAcrossAll = 0;
  let totalSuccessAcrossAll = 0;
  const allLatencies = [];
  const allTtfb = [];

  const routeSummaries = [];

  for (const route of ROUTES_TO_TEST) {
    process.stdout.write(`[*] Stress-testing route: ${route.padEnd(24)} `);
    const results = await runWorkerPool(route, ITERATIONS_PER_ROUTE, CONCURRENCY);

    const successful = results.filter((r) => r.success);
    const latencies = successful.map((r) => r.durationMs);
    const ttfbList = successful.map((r) => r.ttfbMs);

    totalRequestsAcrossAll += results.length;
    totalSuccessAcrossAll += successful.length;
    allLatencies.push(...latencies);
    allTtfb.push(...ttfbList);

    const p50 = calculatePercentile(latencies, 50);
    const p95 = calculatePercentile(latencies, 95);
    const p99 = calculatePercentile(latencies, 99);
    const avgTtfb = ttfbList.length ? (ttfbList.reduce((a, b) => a + b, 0) / ttfbList.length) : 0;
    const successRate = (successful.length / results.length) * 100;

    console.log(`✓ [P50: ${p50.toFixed(1)}ms | P95: ${p95.toFixed(1)}ms | TTFB: ${avgTtfb.toFixed(1)}ms | Success: ${successRate.toFixed(0)}%]`);

    routeSummaries.push({
      route,
      successRate,
      p50,
      p95,
      p99,
      avgTtfb
    });
  }

  const suiteDurationSec = (Date.now() - suiteStartTime) / 1000;
  const overallRps = totalRequestsAcrossAll / suiteDurationSec;
  const overallP50 = calculatePercentile(allLatencies, 50);
  const overallP95 = calculatePercentile(allLatencies, 95);
  const overallP99 = calculatePercentile(allLatencies, 99);
  const overallTtfb = allTtfb.length ? (allTtfb.reduce((a, b) => a + b, 0) / allTtfb.length) : 0;
  const overallSuccessRate = (totalSuccessAcrossAll / totalRequestsAcrossAll) * 100;

  // Composite Performance Confidence Score Algorithm (0 to 100%)
  // 1. Success rate weight: 40% (must be 100% -> 40 pts)
  // 2. Latency P95 weight: 35% (< 50ms = full 35 pts, < 100ms = 30 pts)
  // 3. TTFB speed weight: 15% (< 25ms = full 15 pts)
  // 4. Throughput weight: 10% (> 100 RPS = full 10 pts)
  let score = 0;
  score += (overallSuccessRate / 100) * 40;
  score += Math.max(0, Math.min(35, 35 * (1 - Math.max(0, overallP95 - 10) / 150)));
  score += Math.max(0, Math.min(15, 15 * (1 - Math.max(0, overallTtfb - 5) / 50)));
  score += Math.max(0, Math.min(10, (overallRps / 100) * 10));

  const confidenceScorePct = Math.min(99.4, Math.max(0, score));

  console.log('\n============================================================');
  console.log(' 📊 AUDIT & STRESS TEST RESULTS');
  console.log('------------------------------------------------------------');
  console.log(` • Total Simulated Requests:  ${totalRequestsAcrossAll}`);
  console.log(` • Success / Uptime Rate:     ${overallSuccessRate.toFixed(1)}%`);
  console.log(` • Throughput (RPS):          ${overallRps.toFixed(1)} req/sec`);
  console.log(` • Average TTFB:              ${overallTtfb.toFixed(2)} ms`);
  console.log(` • P50 Latency:               ${overallP50.toFixed(2)} ms`);
  console.log(` • P95 Latency:               ${overallP95.toFixed(2)} ms`);
  console.log(` • P99 Latency:               ${overallP99.toFixed(2)} ms`);
  console.log('------------------------------------------------------------');
  console.log(` 🏆 PERFORMANCE CONFIDENCE SCORE: ${confidenceScorePct.toFixed(1)}%`);
  console.log('============================================================\n');

  if (confidenceScorePct >= 95) {
    console.log('✅ TARGET ACHIEVED: Web performance exceeds 95% Confidence threshold!');
    process.exit(0);
  } else {
    console.warn('⚠️ Performance score below 95% threshold. Further optimization recommended.');
    process.exit(1);
  }
}

runPerformanceAudit();
