/**
 * Outcome-Indexed AI Spend Router - Ingress WAF Challenge Guard
 * Cryptographic Proof-of-Work (PoW) & Threat-Adaptive Challenge Engine
 * Production Readiness Hardening (PR-057)
 */

import crypto from 'crypto';

export interface ThreatProfile {
  ip: string;
  userAgent: string;
  requestPath: string;
  rpm: number;
  anomalyScore: number; // 0 (benign) to 100 (hostile)
}

export interface PoWChallenge {
  challengeId: string;
  targetIp: string;
  difficulty: number; // number of leading zeros required in hex hash
  seed: string;
  issuedAt: number;
  expiresAt: number;
  signature: string;
}

export interface ChallengeVerificationResult {
  valid: boolean;
  clearanceToken?: string;
  clearanceExpiresAt?: number;
  error?: string;
  latencyMs?: number;
}

export interface WafMetrics {
  totalChallengesIssued: number;
  totalChallengesSolved: number;
  totalChallengesFailed: number;
  activeClearancesCount: number;
  averageSolveTimeMs: number;
}

export class WafChallengeGuard {
  private static instance: WafChallengeGuard;
  private readonly secretKey: string;
  private readonly activeChallenges: Map<string, PoWChallenge> = new Map();
  private readonly consumedChallenges: Set<string> = new Set();
  private readonly clearanceTokens: Map<string, { ip: string; expiresAt: number }> = new Map();
  
  // Metrics
  private issuedCount = 0;
  private solvedCount = 0;
  private failedCount = 0;
  private totalSolveDurationMs = 0;

  private constructor() {
    this.secretKey = process.env.WAF_HMAC_SECRET || crypto.randomBytes(32).toString('hex');
  }

  public static getInstance(): WafChallengeGuard {
    if (!WafChallengeGuard.instance) {
      WafChallengeGuard.instance = new WafChallengeGuard();
    }
    return WafChallengeGuard.instance;
  }

  /**
   * Evaluate request threat and determine whether a PoW challenge is required
   */
  public evaluateThreat(profile: ThreatProfile): { requiresChallenge: boolean; difficulty: number; reason?: string } {
    // Check if client already holds a valid clearance token
    const clearance = Array.from(this.clearanceTokens.values()).find(
      (c) => c.ip === profile.ip && c.expiresAt > Date.now()
    );
    if (clearance) {
      return { requiresChallenge: false, difficulty: 0 };
    }

    if (profile.anomalyScore >= 80 || profile.rpm > 120) {
      return {
        requiresChallenge: true,
        difficulty: 4, // '0000' ~ 65536 hashes (~15-40ms in client JS)
        reason: 'High anomaly score or aggressive burst rate detected',
      };
    }

    if (profile.anomalyScore >= 50 || profile.rpm > 60) {
      return {
        requiresChallenge: true,
        difficulty: 3, // '000' ~ 4096 hashes (~2-5ms in client JS)
        reason: 'Moderate anomaly score detected',
      };
    }

    return { requiresChallenge: false, difficulty: 0 };
  }

  /**
   * Issue a cryptographic Proof-of-Work challenge
   */
  public issueChallenge(ip: string, difficulty = 3, ttlMs = 60000): PoWChallenge {
    const challengeId = `pow_${crypto.randomBytes(12).toString('hex')}`;
    const seed = crypto.randomBytes(16).toString('hex');
    const issuedAt = Date.now();
    const expiresAt = issuedAt + ttlMs;

    const signature = this.signChallenge(challengeId, ip, seed, difficulty, expiresAt);

    const challenge: PoWChallenge = {
      challengeId,
      targetIp: ip,
      difficulty,
      seed,
      issuedAt,
      expiresAt,
      signature,
    };

    this.activeChallenges.set(challengeId, challenge);
    this.issuedCount++;

    return challenge;
  }

  /**
   * Verify client submitted solution nonce
   */
  public verifySolution(
    challengeId: string,
    ip: string,
    nonce: string | number
  ): ChallengeVerificationResult {
    if (this.consumedChallenges.has(challengeId)) {
      this.failedCount++;
      return { valid: false, error: 'Challenge replay detected' };
    }

    const challenge = this.activeChallenges.get(challengeId);

    if (!challenge) {
      this.failedCount++;
      return { valid: false, error: 'Challenge not found or expired' };
    }

    if (Date.now() > challenge.expiresAt) {
      this.activeChallenges.delete(challengeId);
      this.failedCount++;
      return { valid: false, error: 'Challenge timestamp expired' };
    }

    if (challenge.targetIp !== ip) {
      this.failedCount++;
      return { valid: false, error: 'IP address mismatch' };
    }

    // Verify HMAC signature integrity
    const expectedSig = this.signChallenge(
      challengeId,
      challenge.targetIp,
      challenge.seed,
      challenge.difficulty,
      challenge.expiresAt
    );

    if (!crypto.timingSafeEqual(Buffer.from(challenge.signature), Buffer.from(expectedSig))) {
      this.failedCount++;
      return { valid: false, error: 'Challenge signature tampering detected' };
    }

    // Compute hash: SHA256(seed + nonce)
    const computedHash = crypto
      .createHash('sha256')
      .update(`${challenge.seed}${nonce}`)
      .digest('hex');

    const targetPrefix = '0'.repeat(challenge.difficulty);
    if (!computedHash.startsWith(targetPrefix)) {
      this.failedCount++;
      return { valid: false, error: `Invalid nonce solution. Hash ${computedHash.substring(0, 8)} does not match prefix ${targetPrefix}` };
    }

    // Mark challenge as consumed
    this.consumedChallenges.add(challengeId);
    this.activeChallenges.delete(challengeId);

    const solveDuration = Date.now() - challenge.issuedAt;
    this.totalSolveDurationMs += solveDuration;
    this.solvedCount++;

    // Issue Clearance Token (valid for 1 hour)
    const clearanceExpiresAt = Date.now() + 3600000;
    const clearanceToken = this.createClearanceToken(ip, clearanceExpiresAt);
    this.clearanceTokens.set(clearanceToken, { ip, expiresAt: clearanceExpiresAt });

    return {
      valid: true,
      clearanceToken,
      clearanceExpiresAt,
      latencyMs: solveDuration,
    };
  }

  /**
   * Validate clearance token on protected routes
   */
  public validateClearanceToken(token: string, ip: string): boolean {
    const entry = this.clearanceTokens.get(token);
    if (!entry) return false;
    if (entry.ip !== ip) return false;
    if (Date.now() > entry.expiresAt) {
      this.clearanceTokens.delete(token);
      return false;
    }
    return true;
  }

  /**
   * Helper solver for testing / trusted environments
   */
  public solveChallengeLocally(seed: string, difficulty: number): { nonce: number; hash: string } {
    const targetPrefix = '0'.repeat(difficulty);
    let nonce = 0;
    while (true) {
      const hash = crypto.createHash('sha256').update(`${seed}${nonce}`).digest('hex');
      if (hash.startsWith(targetPrefix)) {
        return { nonce, hash };
      }
      nonce++;
      if (nonce > 10000000) {
        throw new Error('Exceeded max iterations searching for PoW nonce');
      }
    }
  }

  private signChallenge(challengeId: string, ip: string, seed: string, difficulty: number, expiresAt: number): string {
    const payload = `${challengeId}:${ip}:${seed}:${difficulty}:${expiresAt}`;
    return crypto.createHmac('sha256', this.secretKey).update(payload).digest('hex');
  }

  private createClearanceToken(ip: string, expiresAt: number): string {
    const payload = `${ip}:${expiresAt}:${crypto.randomBytes(8).toString('hex')}`;
    const sig = crypto.createHmac('sha256', this.secretKey).update(payload).digest('hex');
    return `waf_clr_${Buffer.from(payload).toString('base64url')}.${sig.substring(0, 16)}`;
  }

  public getMetrics(): WafMetrics {
    return {
      totalChallengesIssued: this.issuedCount,
      totalChallengesSolved: this.solvedCount,
      totalChallengesFailed: this.failedCount,
      activeClearancesCount: this.clearanceTokens.size,
      averageSolveTimeMs: this.solvedCount > 0 ? Math.round(this.totalSolveDurationMs / this.solvedCount) : 0,
    };
  }

  public reset(): void {
    this.activeChallenges.clear();
    this.consumedChallenges.clear();
    this.clearanceTokens.clear();
    this.issuedCount = 0;
    this.solvedCount = 0;
    this.failedCount = 0;
    this.totalSolveDurationMs = 0;
  }
}
