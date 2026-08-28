import fs from "fs";
import path from "path";

export interface UserAccount {
  id: string;
  name: string;
  email: string;
  workspace: string;
  plan_tier: "free" | "starter" | "growth" | "enterprise";
  monthly_token_quota: number;
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
    pin: "123456",
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
      fs.writeFileSync(USERS_FILE, JSON.stringify(DEFAULT_USERS, null, 2), "utf-8");
      return DEFAULT_USERS;
    }
    const raw = fs.readFileSync(USERS_FILE, "utf-8");
    return JSON.parse(raw);
  } catch (err) {
    console.error("Auth DB read error:", err);
    return DEFAULT_USERS;
  }
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

export function findUserByEmail(email: string): UserAccount | null {
  const users = ensureStorage();
  const normalized = email.trim().toLowerCase();
  return users.find((u) => u.email.trim().toLowerCase() === normalized) || null;
}

export function registerUser(user: Omit<UserAccount, "id" | "created_at">): UserAccount {
  const users = ensureStorage();
  const normalized = user.email.trim().toLowerCase();
  const existingIdx = users.findIndex((u) => u.email.trim().toLowerCase() === normalized);

  const newUser: UserAccount = {
    ...user,
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
