/**
 * 🛡️ IP CIDR Geofencing & Malicious Proxy Guard
 * Validates ingress client IP against CIDR subnets and flags high-risk proxy addresses.
 */

export interface IpSecurityCheckResult {
  ip: string;
  isAllowed: boolean;
  isMaliciousProxy: boolean;
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

function isIpInCidr(ip: string, cidr: string): boolean {
  if (cidr === "0.0.0.0/0" || cidr === "::/0") return true;
  const [range, bitsStr = "32"] = cidr.split("/");
  const bits = parseInt(bitsStr, 10);
  
  const ipToInt = (addr: string): number => {
    return addr.split(".").reduce((int, octet) => (int << 8) + parseInt(octet, 10), 0) >>> 0;
  };

  try {
    const mask = bits === 0 ? 0 : (~0 << (32 - bits)) >>> 0;
    const ipInt = ipToInt(ip);
    const rangeInt = ipToInt(range);
    return (ipInt & mask) === (rangeInt & mask);
  } catch {
    return ip.startsWith(range) || ip === range;
  }
}

export function evaluateClientIpSecurity(clientIp: string, allowedCidrs: string[] = ["0.0.0.0/0"]): IpSecurityCheckResult {
  const cleanIp = clientIp.trim();

  // Check known malicious exit nodes / proxy blocklist
  if (KNOWN_SUSPICIOUS_PROXIES.has(cleanIp)) {
    return {
      ip: cleanIp,
      isAllowed: false,
      isMaliciousProxy: true,
      threatLevel: "SUSPICIOUS_PROXY",
      reason: "IP identified as a known malicious proxy or anonymizing exit node."
    };
  }

  // Check if IP is in any allowed CIDR
  const matched = allowedCidrs.find((cidr) => isIpInCidr(cleanIp, cidr));

  if (matched) {
    return {
      ip: cleanIp,
      isAllowed: true,
      isMaliciousProxy: false,
      matchedSubnet: matched,
      threatLevel: "CLEAN",
      reason: `IP matched allowed enterprise subnet ${matched}.`
    };
  }

  return {
    ip: cleanIp,
    isAllowed: false,
    isMaliciousProxy: false,
    threatLevel: "CIDR_BLOCKED",
    reason: `Client IP ${cleanIp} is outside the allowed CIDR subnets: ${allowedCidrs.join(", ")}.`
  };
}
