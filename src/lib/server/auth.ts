import { cookies } from "next/headers";
import bcrypt from "bcryptjs";
import { SignJWT, jwtVerify } from "jose";
import { normalizeSavedAddresses } from "@/lib/addresses";
import { SavedAddress, User } from "@/lib/types";
import { isDatabaseConfigured } from "./db";
import {
  dbDeleteSession,
  dbFindPasswordResetToken,
  dbFindSessionUser,
  dbFindUserByEmail,
  dbFindUserById,
  dbFindUserByPhone,
  dbInsertSession,
  dbInsertUser,
  dbReplacePasswordResetToken,
  dbResetPasswordWithToken,
  dbUpdateUser,
} from "./supabase-store";
import { mutateStore, purgeExpired, readStore, StoredUser } from "./store";

const SESSION_COOKIE = "medlive_session";
const SESSION_DAYS = 30;
const BCRYPT_ROUNDS = 8;

function getSecret(): Uint8Array {
  const secret = process.env.AUTH_SECRET;
  if (!secret) {
    throw new Error(
      "AUTH_SECRET is not set. Copy .env.example to .env.local and add a long random string."
    );
  }
  return new TextEncoder().encode(secret);
}

export function toPublicUser(user: StoredUser): User {
  return {
    id: user.id,
    name: user.name,
    email: user.email ?? "",
    phone: user.phone ?? undefined,
    savedAddresses: normalizeSavedAddresses(user.savedAddresses),
  };
}

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, BCRYPT_ROUNDS);
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

export async function createSessionToken(userId: string): Promise<string> {
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + SESSION_DAYS);

  const token = await new SignJWT({ sub: userId })
    .setProtectedHeader({ alg: "HS256" })
    .setExpirationTime(`${SESSION_DAYS}d`)
    .setIssuedAt()
    .sign(getSecret());

  if (isDatabaseConfigured()) {
    await dbInsertSession({
      token,
      userId,
      expiresAt: expiresAt.toISOString(),
    });
    return token;
  }

  await mutateStore((store) => {
    purgeExpired(store);
    store.sessions.push({
      token,
      userId,
      expiresAt: expiresAt.toISOString(),
    });
  });

  return token;
}

export async function setSessionCookie(token: string): Promise<void> {
  const jar = await cookies();
  const crossOrigin = Boolean(process.env.FRONTEND_URL?.trim());
  const cookieDomain = process.env.COOKIE_DOMAIN?.trim();
  jar.set(SESSION_COOKIE, token, {
    httpOnly: true,
    secure: crossOrigin || process.env.NODE_ENV === "production",
    sameSite: crossOrigin ? "none" : "lax",
    path: "/",
    maxAge: SESSION_DAYS * 24 * 60 * 60,
    ...(cookieDomain ? { domain: cookieDomain } : {}),
  });
}

export async function clearSessionCookie(): Promise<void> {
  const jar = await cookies();
  const cookieDomain = process.env.COOKIE_DOMAIN?.trim();
  if (cookieDomain) {
    jar.set(SESSION_COOKIE, "", {
      httpOnly: true,
      secure: true,
      sameSite: "none",
      path: "/",
      maxAge: 0,
      domain: cookieDomain,
    });
  }
  jar.delete(SESSION_COOKIE);
}

export async function getSessionUser(): Promise<StoredUser | null> {
  const jar = await cookies();
  const token = jar.get(SESSION_COOKIE)?.value;
  if (!token) return null;

  try {
    const { payload } = await jwtVerify(token, getSecret());
    const userId = payload.sub;
    if (!userId || typeof userId !== "string") return null;

    if (isDatabaseConfigured()) {
      return dbFindSessionUser(token, userId);
    }

    const store = await readStore();
    purgeExpired(store);
    const session = store.sessions.find((s) => s.token === token && s.userId === userId);
    if (!session) return null;

    return store.users.find((u) => u.id === userId) ?? null;
  } catch {
    return null;
  }
}

export async function signOutSession(): Promise<void> {
  const jar = await cookies();
  const token = jar.get(SESSION_COOKIE)?.value;
  if (token) {
    if (isDatabaseConfigured()) {
      await dbDeleteSession(token);
    } else {
      await mutateStore((store) => {
        store.sessions = store.sessions.filter((s) => s.token !== token);
      });
    }
  }
  await clearSessionCookie();
}

export async function signUpUser(data: {
  name: string;
  email: string;
  password: string;
  phone?: string;
}): Promise<{ user: StoredUser } | { error: string }> {
  const email = data.email.trim().toLowerCase();
  if (!email || !data.password) {
    return { error: "Valid email and password are required." };
  }

  const { validatePassword } = await import("@/lib/password-validation");
  const passwordError = validatePassword(data.password);
  if (passwordError) {
    return { error: passwordError };
  }

  if (isDatabaseConfigured()) {
    if (await dbFindUserByEmail(email)) {
      return { error: "An account with this email already exists." };
    }

    const user: StoredUser = {
      id: crypto.randomUUID(),
      name: data.name.trim(),
      email,
      phone: data.phone?.replace(/\D/g, "").slice(-10) || null,
      passwordHash: await hashPassword(data.password),
      isGuest: false,
      gstin: null,
      savedAddresses: [],
      createdAt: new Date().toISOString(),
    };
    await dbInsertUser(user);
    return { user };
  }

  return mutateStore(async (store) => {
    if (store.users.some((u) => u.email?.toLowerCase() === email)) {
      return { error: "An account with this email already exists." };
    }
    const user: StoredUser = {
      id: crypto.randomUUID(),
      name: data.name.trim(),
      email,
      phone: data.phone?.replace(/\D/g, "").slice(-10) || null,
      passwordHash: await hashPassword(data.password),
      isGuest: false,
      gstin: null,
      savedAddresses: [],
      createdAt: new Date().toISOString(),
    };
    store.users.push(user);
    return { user };
  });
}

export async function signInUser(
  email: string,
  password: string
): Promise<{ user: StoredUser } | { error: string }> {
  const normalized = email.trim().toLowerCase();

  if (isDatabaseConfigured()) {
    const user = await dbFindUserByEmail(normalized);
    if (!user?.passwordHash) return { error: "Invalid email or password." };
    const valid = await verifyPassword(password, user.passwordHash);
    if (!valid) return { error: "Invalid email or password." };
    return { user };
  }

  const store = await readStore();
  const user = store.users.find((u) => u.email?.toLowerCase() === normalized);
  if (!user?.passwordHash) return { error: "Invalid email or password." };
  const valid = await verifyPassword(password, user.passwordHash);
  if (!valid) return { error: "Invalid email or password." };
  return { user };
}

export async function upsertPhoneUser(phone: string, name?: string): Promise<StoredUser> {
  const cleaned = phone.replace(/\D/g, "").slice(-10);

  if (isDatabaseConfigured()) {
    const existing = await dbFindUserByPhone(cleaned);
    if (existing) {
      if (name?.trim()) {
        existing.name = name.trim();
        existing.isGuest = false;
        await dbUpdateUser(existing);
      }
      return existing;
    }

    const user: StoredUser = {
      id: crypto.randomUUID(),
      name: name?.trim() || "MedLive Customer",
      email: null,
      phone: cleaned,
      passwordHash: null,
      isGuest: false,
      gstin: null,
      savedAddresses: [],
      createdAt: new Date().toISOString(),
    };
    await dbInsertUser(user);
    return user;
  }

  return mutateStore((store) => {
    let user = store.users.find((u) => u.phone === cleaned);
    if (user) {
      if (name?.trim()) user.name = name.trim();
      user.isGuest = false;
      return user;
    }
    user = {
      id: crypto.randomUUID(),
      name: name?.trim() || "MedLive Customer",
      email: null,
      phone: cleaned,
      passwordHash: null,
      isGuest: false,
      gstin: null,
      savedAddresses: [],
      createdAt: new Date().toISOString(),
    };
    store.users.push(user);
    return user;
  });
}

export async function saveUserAddress(
  userId: string,
  address: SavedAddress,
  makeDefault = false
): Promise<StoredUser | null> {
  if (isDatabaseConfigured()) {
    const user = await dbFindUserById(userId);
    if (!user) return null;

    const existing = normalizeSavedAddresses(user.savedAddresses);
    const withoutDup = existing.filter((a) => a.id !== address.id);
    const isDefault = makeDefault || address.isDefault || withoutDup.length === 0;
    const saved: SavedAddress = { ...address, isDefault };
    user.savedAddresses = [
      ...withoutDup.map((a) => ({ ...a, isDefault: isDefault ? false : a.isDefault })),
      saved,
    ];
    user.phone = saved.phone;
    await dbUpdateUser(user);
    return user;
  }

  return mutateStore((store) => {
    const user = store.users.find((u) => u.id === userId);
    if (!user) return null;

    const existing = normalizeSavedAddresses(user.savedAddresses);
    const withoutDup = existing.filter((a) => a.id !== address.id);
    const isDefault = makeDefault || address.isDefault || withoutDup.length === 0;
    const saved: SavedAddress = { ...address, isDefault };
    user.savedAddresses = [
      ...withoutDup.map((a) => ({ ...a, isDefault: isDefault ? false : a.isDefault })),
      saved,
    ];
    user.phone = saved.phone;
    return user;
  });
}

export async function updateUserGstin(userId: string, gstin: string | null): Promise<void> {
  if (isDatabaseConfigured()) {
    const user = await dbFindUserById(userId);
    if (!user) return;
    user.gstin = gstin;
    await dbUpdateUser(user);
    return;
  }

  await mutateStore((store) => {
    const user = store.users.find((u) => u.id === userId);
    if (user) user.gstin = gstin;
  });
}

const RESET_TOKEN_HOURS = 1;

async function sendPasswordResetEmail(email: string, resetUrl: string): Promise<void> {
  if (process.env.NODE_ENV !== "production") {
    console.log(`[password-reset] ${email} → ${resetUrl}`);
  }
}

export async function requestPasswordReset(email: string): Promise<{ success: true }> {
  const normalized = email.trim().toLowerCase();
  if (!normalized) {
    return { success: true };
  }

  if (isDatabaseConfigured()) {
    const user = await dbFindUserByEmail(normalized);
    if (user?.passwordHash) {
      const expiresAt = new Date(
        Date.now() + RESET_TOKEN_HOURS * 60 * 60 * 1000
      ).toISOString();
      const token = await dbReplacePasswordResetToken(user.id, normalized, expiresAt);
      const baseUrl =
        process.env.FRONTEND_URL?.split(",")[0]?.trim() ||
        process.env.NEXT_PUBLIC_APP_URL ||
        "http://localhost:3000";
      await sendPasswordResetEmail(normalized, `${baseUrl}/auth/reset-password?token=${token}`);
    }
    return { success: true };
  }

  const resetUrl = await mutateStore((store) => {
    purgeExpired(store);
    if (!store.passwordResetTokens) store.passwordResetTokens = [];

    const user = store.users.find(
      (u) => u.email?.toLowerCase() === normalized && u.passwordHash
    );
    if (!user) {
      return null;
    }

    store.passwordResetTokens = store.passwordResetTokens.filter(
      (t) => t.userId !== user.id
    );

    const token = crypto.randomUUID();
    const expiresAt = new Date(Date.now() + RESET_TOKEN_HOURS * 60 * 60 * 1000).toISOString();

    store.passwordResetTokens.push({
      token,
      userId: user.id,
      email: normalized,
      expiresAt,
    });

    const baseUrl =
      process.env.FRONTEND_URL?.split(",")[0]?.trim() ||
      process.env.NEXT_PUBLIC_APP_URL ||
      "http://localhost:3000";
    return `${baseUrl}/auth/reset-password?token=${token}`;
  });

  if (resetUrl) {
    await sendPasswordResetEmail(normalized, resetUrl);
  }

  return { success: true };
}

export async function validatePasswordResetToken(
  token: string
): Promise<{ valid: true; email: string } | { valid: false; error: string }> {
  if (isDatabaseConfigured()) {
    const record = await dbFindPasswordResetToken(token);
    if (!record) {
      return { valid: false, error: "This reset link is invalid or has expired." };
    }
    return { valid: true, email: record.email };
  }

  const store = await readStore();
  purgeExpired(store);
  const record = (store.passwordResetTokens ?? []).find((t) => t.token === token);
  if (!record) {
    return { valid: false, error: "This reset link is invalid or has expired." };
  }
  if (new Date(record.expiresAt).getTime() < Date.now()) {
    return { valid: false, error: "This reset link has expired. Request a new one." };
  }
  return { valid: true, email: record.email };
}

export async function resetPasswordWithToken(
  token: string,
  password: string
): Promise<{ success: true } | { error: string }> {
  const { validatePassword } = await import("@/lib/password-validation");
  const passwordError = validatePassword(password);
  if (passwordError) {
    return { error: passwordError };
  }

  const passwordHash = await hashPassword(password);

  if (isDatabaseConfigured()) {
    return dbResetPasswordWithToken(token, passwordHash);
  }

  return mutateStore(async (store) => {
    purgeExpired(store);
    if (!store.passwordResetTokens) store.passwordResetTokens = [];

    const idx = store.passwordResetTokens.findIndex((t) => t.token === token);
    if (idx === -1) {
      return { error: "This reset link is invalid or has expired." };
    }

    const record = store.passwordResetTokens[idx];
    if (new Date(record.expiresAt).getTime() < Date.now()) {
      store.passwordResetTokens.splice(idx, 1);
      return { error: "This reset link has expired. Request a new one." };
    }

    const user = store.users.find((u) => u.id === record.userId);
    if (!user) {
      return { error: "Account not found." };
    }

    user.passwordHash = passwordHash;
    store.passwordResetTokens.splice(idx, 1);
    store.sessions = store.sessions.filter((s) => s.userId !== user.id);

    return { success: true as const };
  });
}
