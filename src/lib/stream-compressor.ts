import zlib from "zlib";

/**
 * ⚡ Edge Response Stream Chunk Compressor & Compression Ratio Monitor
 * Compresses stream buffers on wire inference endpoints and reports payload savings.
 */

export interface CompressionMetrics {
  rawBytes: number;
  compressedBytes: number;
  compressionRatio: number; // e.g. 0.38 = 62% smaller
  algorithmUsed: "gzip" | "identity";
}

export function compressResponseChunk(chunkText: string): {
  compressedBuffer: Buffer;
  metrics: CompressionMetrics;
} {
  const rawBuffer = Buffer.from(chunkText, "utf-8");
  const rawBytes = rawBuffer.length;

  if (rawBytes < 64) {
    return {
      compressedBuffer: rawBuffer,
      metrics: {
        rawBytes,
        compressedBytes: rawBytes,
        compressionRatio: 1.0,
        algorithmUsed: "identity"
      }
    };
  }

  const compressedBuffer = zlib.gzipSync(rawBuffer);
  const compressedBytes = compressedBuffer.length;
  const ratio = parseFloat((compressedBytes / rawBytes).toFixed(3));

  return {
    compressedBuffer,
    metrics: {
      rawBytes,
      compressedBytes,
      compressionRatio: ratio,
      algorithmUsed: "gzip"
    }
  };
}
