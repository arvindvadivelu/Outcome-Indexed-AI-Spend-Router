/**
 * 🛡️ Dual-Stack IP CIDR Geofencing & Malicious Proxy Guard
 * Validates ingress client IP against CIDR subnets, normalizes IPv4-mapped IPv6 proxy strings,
 * and flags high-risk proxy addresses.
 */

export interface IpSecurityCheckResult {
  ip: string;
  normalizedIp: string;
  isAllowed: boolean;
  isMaliciousProxy: boolean;
  isPrivateVpc: boolean;
  matchedSubnet?: string;
  threatLevel: "CLEAN" | "SUSPICIOUS_PROXY" | "CIDR_BLOCKED";
  reason: string;
}

const KNOWN_SUSPICIOUS_PROXIES = new Set([
  "198.51.100.4",
  "203.0.113.99",
  "185.220.101.5",
  "185.220.101.6"
]);

export function normalizeIpAddress(ip: string): string {
  if (!ip || typeof ip !== "string") return "127.0.0.1";
  let clean = ip.trim();

  // Strip IPv4-mapped IPv6 prefix (e.g. ::ffff:192.168.1.1 -> 192.168.1.1)
  if (clean.startsWith("::ffff:")) {
    clean = clean.slice(7);
  } else if (clean === "::1") {
    clean = "127.0.0.1";
  }

  return clean;
}

function isIpInCidr(ip: string, cidr: string): boolean {
  if (cidr === "0.0.0.0/0" || cidr === "::/0" || cidr === "*") return true;

  const cleanIp = normalizeIpAddress(ip);
  const [range, bitsStr = "32"] = cidr.split("/");
  const cleanRange = normalizeIpAddress(range);
  const bits = parseInt(bitsStr, 10);

  const ipToInt = (addr: string): number => {
    return addr.split(".").reduce((int, octet) => (int << 8) + parseInt(octet, 10), 0) >>> 0;
  };

  try {
    if (!cleanIp.includes(".") || !cleanRange.includes(".")) {
      return cleanIp === cleanRange;
    }
    const mask = bits === 0 ? 0 : (~0 << (32 - bits)) >>> 0;
    const ipInt = ipToInt(cleanIp);
    const rangeInt = ipToInt(cleanRange);
    return (ipInt & mask) === (rangeInt & mask);
  } catch {
    return cleanIp.startsWith(cleanRange) || cleanIp === cleanRange;
  }
}

export function isPrivateVpcIp(ip: string): boolean {
  const clean = normalizeIpAddress(ip);
  const vpcRanges = ["10.0.0.0/8", "172.16.0.0/12", "192.168.0.0/16", "127.0.0.0/8"];
  return vpcRanges.some((range) => isIpInCidr(clean, range));
}

export function evaluateClientIpSecurity(clientIp: string, allowedCidrs: string[] = ["0.0.0.0/0"]): IpSecurityCheckResult {
  const raw = clientIp ? clientIp.trim() : "127.0.0.1";
  const normalized = normalizeIpAddress(raw);
  const isVpc = isPrivateVpcIp(normalized);

  // Check known malicious exit nodes / proxy blocklist
  if (KNOWN_SUSPICIOUS_PROXIES.has(normalized) || KNOWN_SUSPICIOUS_PROXIES.has(raw)) {
    return {
      ip: raw,
      normalizedIp: normalized,
      isAllowed: false,
      isMaliciousProxy: true,
      isPrivateVpc: isVpc,
      threatLevel: "SUSPICIOUS_PROXY",
      reason: "IP identified as a known malicious proxy or anonymizing exit node."
    };
  }

  // Check if IP is in any allowed CIDR
  const matched = allowedCidrs.find((cidr) => isIpInCidr(normalized, cidr) || isIpInCidr(raw, cidr));

  if (matched) {
    return {
      ip: raw,
      normalizedIp: normalized,
      isAllowed: true,
      isMaliciousProxy: false,
      isPrivateVpc: isVpc,
      matchedSubnet: matched,
      threatLevel: "CLEAN",
      reason: `IP matched allowed enterprise subnet ${matched}.`
    };
  }

  return {
    ip: raw,
    normalizedIp: normalized,
    isAllowed: false,
    isMaliciousProxy: false,
    isPrivateVpc: isVpc,
    threatLevel: "CIDR_BLOCKED",
    reason: `Client IP ${normalized} is outside the allowed CIDR subnets: ${allowedCidrs.join(", ")}.`
  };
}
