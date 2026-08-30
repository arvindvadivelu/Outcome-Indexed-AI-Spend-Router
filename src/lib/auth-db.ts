import fs from "fs";
import path from "path";

export interface UserAccount {
  id: string;
  name: string;
  email: string;
  workspace: string;
  plan_tier: "free" | "starter" | "growth" | "enterprise";
  monthly_token_quota: number;
  tokens_used?: number;
  monthlySpendUSD?: number;
  baselineSpendUSD?: number;
  rules?: any[];
  apiKeys?: any[];
  logs?: any[];
  slaEscrowContracts?: any[];
  webhookConfig?: any;
  teamMembers?: any[];
  federationSettings?: any;
  pin: string;
  currency: "USD" | "INR";
  created_at: string;
  last_login_at?: string;
}

const DATA_DIR = path.join(process.cwd(), "data");
const USERS_FILE = path.join(DATA_DIR, "users.json");

// Default initial accounts seeded for instant login
const DEFAULT_USERS: UserAccount[] = [
  {
    id: "usr_alex_vance",
    name: "Alex Vance",
    email: "alex@company.com",
    workspace: "Acme AI Lab",
    plan_tier: "free",
    monthly_token_quota: 10000,
    tokens_used: 0,
    pin: "123456",
    currency: "USD",
    created_at: new Date().toISOString()
  },
  {
    id: "usr_varvind",
    name: "Arvind",
    email: "varvind2004@gmail.com",
    workspace: "Arvind's Workspace",
    plan_tier: "free",
    monthly_token_quota: 10000,
    tokens_used: 0,
    pin: "111111",
    currency: "USD",
    created_at: new Date().toISOString()
  },
  {
    id: "usr_lead_architect",
    name: "Lead Architect",
    email: "dev@outcomerouter.ai",
    workspace: "Core Inference Team",
    plan_tier: "growth",
    monthly_token_quota: 500000,
    tokens_used: 0,
    pin: "888999",
    currency: "INR",
    created_at: new Date().toISOString()
  }
];

// Active in-memory OTP storage: email -> { otp: string, expiresAt: number }
const ACTIVE_OTPS = new Map<string, { otp: string; expiresAt: number }>();

function ensureStorage(): UserAccount[] {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    if (!fs.existsSync(USERS_FILE)) {
      fs.writeFileSync(USERS_FILE, "[]", "utf-8");
      return [];
    }
    const raw = fs.readFileSync(USERS_FILE, "utf-8");
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch (err) {
    console.error("Auth DB read error:", err);
    return [];
  }
}

export function clearAllUsers(): void {
  saveUsers([]);
}

function saveUsers(users: UserAccount[]) {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    fs.writeFileSync(USERS_FILE, JSON.stringify(users, null, 2), "utf-8");
  } catch (err) {
    console.error("Auth DB write error:", err);
  }
}

export function getAllUsers(): UserAccount[] {
  return ensureStorage();
}

export function updateUserAccountState(email: string, updates: Partial<UserAccount>): UserAccount | null {
  const users = ensureStorage();
  const normalized = email.trim().toLowerCase();
  const index = users.findIndex((u) => u.email.trim().toLowerCase() === normalized);
  if (index === -1) return null;
  users[index] = {
    ...users[index],
    ...updates
  };
  saveUsers(users);
  return users[index];
}

export function findUserByEmail(email: string): UserAccount | null {
  const users = ensureStorage();
  const normalized = email.trim().toLowerCase();
  return users.find((u) => u.email.trim().toLowerCase() === normalized) || null;
}

export function findUserByApiKey(apiKey: string): { user: UserAccount; key: any } | null {
  if (!apiKey) return null;
  const users = ensureStorage();
  const trimmed = apiKey.trim();
  for (const u of users) {
    if (u.apiKeys && Array.isArray(u.apiKeys)) {
      const foundKey = u.apiKeys.find(
        (k: any) =>
          (k.full_key && k.full_key === trimmed) ||
          (k.key_prefix && trimmed.startsWith(k.key_prefix)) ||
          (k.id && k.id === trimmed)
      );
      if (foundKey) {
        return { user: u, key: foundKey };
      }
    }
  }
  return null;
}

export function registerUser(user: Omit<UserAccount, "id" | "created_at">): UserAccount {
  const users = ensureStorage();
  const normalized = user.email.trim().toLowerCase();
  const existingIdx = users.findIndex((u) => u.email.trim().toLowerCase() === normalized);

  const newUser: UserAccount = {
    ...user,
    tokens_used: user.tokens_used ?? 0,
    id: `usr_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
    created_at: new Date().toISOString()
  };

  if (existingIdx >= 0) {
    users[existingIdx] = { ...users[existingIdx], ...newUser };
  } else {
    users.unshift(newUser);
  }

  saveUsers(users);
  return newUser;
}

export function consumeUserTokens(email: string, amount: number): { allowed: boolean; tokens_used: number; monthly_token_quota: number; plan_tier: string; remaining: number } {
  const users = ensureStorage();
  const normalized = email.trim().toLowerCase();
  let user = users.find((u) => u.email.trim().toLowerCase() === normalized);

  if (!user) {
    // If not found, default to free tier with 10k quota
    return {
      allowed: true,
      tokens_used: amount,
      monthly_token_quota: 10000,
      plan_tier: "free",
      remaining: 10000 - amount
    };
  }

  const currentUsed = user.tokens_used || 0;
  const quota = user.monthly_token_quota || 10000;

  if (currentUsed >= quota) {
    return {
      allowed: false,
      tokens_used: currentUsed,
      monthly_token_quota: quota,
      plan_tier: user.plan_tier,
      remaining: 0
    };
  }

  const newUsed = currentUsed + amount;
  user.tokens_used = newUsed;
  saveUsers(users);

  return {
    allowed: true,
    tokens_used: newUsed,
    monthly_token_quota: quota,
    plan_tier: user.plan_tier,
    remaining: Math.max(0, quota - newUsed)
  };
}

export function resetUserTokens(email: string): boolean {
  const users = ensureStorage();
  const normalized = email.trim().toLowerCase();
  const user = users.find((u) => u.email.trim().toLowerCase() === normalized);
  if (!user) return false;
  user.tokens_used = 0;
  saveUsers(users);
  return true;
}

export function generateEmailOtp(email: string): string {
  const normalized = email.trim().toLowerCase();
  // Generate cryptographically random 6-digit code
  const code = Math.floor(100000 + Math.random() * 900000).toString();
  // 10 minutes expiry
  ACTIVE_OTPS.set(normalized, { otp: code, expiresAt: Date.now() + 10 * 60 * 1000 });
  return code;
}

export function verifyEmailOtp(email: string, enteredOtp: string): boolean {
  const normalized = email.trim().toLowerCase();
  const record = ACTIVE_OTPS.get(normalized);
  if (!record) return false;
  if (Date.now() > record.expiresAt) {
    ACTIVE_OTPS.delete(normalized);
    return false;
  }
  if (record.otp === enteredOtp.trim()) {
    ACTIVE_OTPS.delete(normalized);
    return true;
  }
  return false;
}

export function deleteUser(email: string): boolean {
  const users = ensureStorage();
  const normalized = email.trim().toLowerCase();
  const index = users.findIndex((u) => u.email.trim().toLowerCase() === normalized);
  if (index === -1) return false;
  users.splice(index, 1);
  saveUsers(users);
  return true;
}

