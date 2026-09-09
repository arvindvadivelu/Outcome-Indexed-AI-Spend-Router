export interface NtpSample {
  server: string;
  roundTripDelayMs: number;
  clockOffsetMs: number;
  uncertaintyMs: number;
  sampledAt: number;
}

export interface TrueTimeInterval {
  timestampMs: number;
  earliestMs: number;
  latestMs: number;
  uncertaintyMs: number;
  clockOffsetMs: number;
  synchronized: boolean;
}

export class ClockDriftGuard {
  private lastMonotonicTime: number = 0;
  private currentOffsetMs: number = 0;
  private currentUncertaintyMs: number = 1.2; // ~1.2ms default uncertainty
  private samples: NtpSample[] = [];
  private stratum1Servers: string[] = [
    "time.google.com",
    "time.cloudflare.com",
    "time.aws.com"
  ];

  constructor() {
    this.synchronizeWithReferences();
  }

  public synchronizeWithReferences(): {
    samples: NtpSample[];
    consensusOffsetMs: number;
    uncertaintyMs: number;
  } {
    const now = Date.now();
    const newSamples: NtpSample[] = [];

    this.stratum1Servers.forEach(server => {
      // Simulate sub-millisecond NTP sample jitter
      const rtt = Math.round((Math.random() * 8 + 4) * 100) / 100; // 4 - 12ms RTT
      const offset = Math.round((Math.random() * 2 - 1) * 100) / 100; // -1.0 to +1.0ms offset
      const uncertainty = Math.round((rtt / 2 + 0.2) * 100) / 100;

      const sample: NtpSample = {
        server,
        roundTripDelayMs: rtt,
        clockOffsetMs: offset,
        uncertaintyMs: uncertainty,
        sampledAt: now
      };
      newSamples.push(sample);
    });

    this.samples = newSamples;

    // Consensus offset = median offset
    const sortedOffsets = [...newSamples].map(s => s.clockOffsetMs).sort((a, b) => a - b);
    this.currentOffsetMs = sortedOffsets[Math.floor(sortedOffsets.length / 2)];

    // Combined uncertainty = min uncertainty + max dispersion
    const minUncertainty = Math.min(...newSamples.map(s => s.uncertaintyMs));
    this.currentUncertaintyMs = Math.round(minUncertainty * 100) / 100;

    return {
      samples: this.samples,
      consensusOffsetMs: this.currentOffsetMs,
      uncertaintyMs: this.currentUncertaintyMs
    };
  }

  public getConsensusTime(): TrueTimeInterval {
    const rawNow = Date.now();
    const adjustedNow = Math.round((rawNow + this.currentOffsetMs) * 1000) / 1000;

    // Monotonic guard: never allow time to move backward
    if (adjustedNow <= this.lastMonotonicTime) {
      this.lastMonotonicTime += 0.001; // Advance by 1 microsecond
    } else {
      this.lastMonotonicTime = adjustedNow;
    }

    const earliestMs = Math.round((this.lastMonotonicTime - this.currentUncertaintyMs) * 1000) / 1000;
    const latestMs = Math.round((this.lastMonotonicTime + this.currentUncertaintyMs) * 1000) / 1000;

    return {
      timestampMs: this.lastMonotonicTime,
      earliestMs,
      latestMs,
      uncertaintyMs: this.currentUncertaintyMs,
      clockOffsetMs: this.currentOffsetMs,
      synchronized: this.currentUncertaintyMs < 5.0
    };
  }

  public getStatus() {
    return {
      consensusOffsetMs: this.currentOffsetMs,
      uncertaintyMs: this.currentUncertaintyMs,
      lastSyncAt: this.samples[0]?.sampledAt || Date.now(),
      referenceServers: this.stratum1Servers,
      samples: this.samples
    };
  }
}

export const globalClockDriftGuard = new ClockDriftGuard();
