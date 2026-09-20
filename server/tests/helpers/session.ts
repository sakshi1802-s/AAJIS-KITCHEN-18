import jwt from "jsonwebtoken";
import type { Role } from "@shared/api";
import { User, type UserHydrated } from "../../src/models/User";

let n = 0;

export async function makeUser(overrides: Partial<{ role: Role; email: string; name: string; phone: string }> = {}) {
  n += 1;
  return User.create({
    googleId: `google-${n}-${Date.now()}`,
    name: overrides.name ?? `Customer ${n}`,
    email: overrides.email ?? `customer${n}.${Date.now()}@example.com`,
    phone: overrides.phone ?? null,
    role: overrides.role ?? "customer",
    addresses: [],
  });
}

/** A valid session cookie for supertest: `.set("Cookie", sessionCookie(user))`. */
export function sessionCookie(user: UserHydrated): string {
  const token = jwt.sign({ role: user.role }, process.env.JWT_SECRET!, {
    subject: user.id,
    expiresIn: "7d",
  });
  return `aji_session=${token}`;
}
