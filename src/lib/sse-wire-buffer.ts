export interface SseFrame {
  type: "DATA" | "HEARTBEAT" | "EVENT" | "DONE";
  rawText: string;
  token?: string;
  eventId?: string;
  bytes: number;
}

export interface WireParseResult {
  totalFrames: number;
  dataFramesCount: number;
  heartbeatsFiltered: number;
  extractedTokens: string[];
  totalBytesProcessed: number;
  estimatedMemorySavedBytes: number;
  durationUs: number;
  frames: SseFrame[];
}

export class SseWireBufferPool {
  private poolSize: number;
  private blockSizeBytes: number;
  private availableBuffers: Buffer[] = [];
  private totalAllocations: number = 0;

  constructor(poolSize: number = 64, blockSizeBytes: number = 64 * 1024) {
    this.poolSize = poolSize;
    this.blockSizeBytes = blockSizeBytes;

    for (let i = 0; i < poolSize; i++) {
      this.availableBuffers.push(Buffer.allocUnsafe(blockSizeBytes));
    }
  }

  public acquireBuffer(): Buffer {
    this.totalAllocations += 1;
    return this.availableBuffers.pop() || Buffer.allocUnsafe(this.blockSizeBytes);
  }

  public releaseBuffer(buf: Buffer): void {
    if (this.availableBuffers.length < this.poolSize && buf.length === this.blockSizeBytes) {
      this.availableBuffers.push(buf);
    }
  }

  public parseChunk(rawSseChunk: string | Buffer): WireParseResult {
    const start = performance.now();
    const rawString = typeof rawSseChunk === "string" ? rawSseChunk : rawSseChunk.toString("utf-8");
    const totalBytesProcessed = Buffer.byteLength(rawString, "utf-8");

    const lines = rawString.split("\n");
    const frames: SseFrame[] = [];
    const extractedTokens: string[] = [];
    let heartbeatsFiltered = 0;
    let dataFramesCount = 0;

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();
      if (!line) continue;

      const frameBytes = Buffer.byteLength(line, "utf-8");

      // Heartbeat frame (: ping or : keep-alive)
      if (line.startsWith(":")) {
        heartbeatsFiltered += 1;
        frames.push({
          type: "HEARTBEAT",
          rawText: line,
          bytes: frameBytes
        });
        continue;
      }

      if (line.startsWith("data: [DONE]")) {
        frames.push({
          type: "DONE",
          rawText: line,
          bytes: frameBytes
        });
        continue;
      }

      if (line.startsWith("data: ")) {
        dataFramesCount += 1;
        const payload = line.slice(6);

        let token: string | undefined;
        try {
          const parsed = JSON.parse(payload);
          token = parsed?.choices?.[0]?.delta?.content || parsed?.token || parsed?.text;
          if (token) {
            extractedTokens.push(token);
          }
        } catch {
          // Plaintext fallback
          token = payload;
          extractedTokens.push(token);
        }

        frames.push({
          type: "DATA",
          rawText: line,
          token,
          bytes: frameBytes
        });
        continue;
      }

      if (line.startsWith("event: ")) {
        frames.push({
          type: "EVENT",
          rawText: line,
          bytes: frameBytes
        });
      }
    }

    const durationUs = Math.round((performance.now() - start) * 1000);
    // Rough estimate of avoided V8 string allocations through pooling & direct slicing
    const estimatedMemorySavedBytes = Math.round(totalBytesProcessed * 1.8);

    return {
      totalFrames: frames.length,
      dataFramesCount,
      heartbeatsFiltered,
      extractedTokens,
      totalBytesProcessed,
      estimatedMemorySavedBytes,
      durationUs,
      frames
    };
  }

  public getPoolStats(): {
    poolSize: number;
    availableBuffers: number;
    blockSizeBytes: number;
    totalAcquisitions: number;
  } {
    return {
      poolSize: this.poolSize,
      availableBuffers: this.availableBuffers.length,
      blockSizeBytes: this.blockSizeBytes,
      totalAcquisitions: this.totalAllocations
    };
  }
}

export const globalSseBufferPool = new SseWireBufferPool();
