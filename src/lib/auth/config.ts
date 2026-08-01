import { DrizzleAdapter } from "@auth/drizzle-adapter";
import { eq } from "drizzle-orm";
import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { db } from "@/lib/db/client";
import { accounts, businessMembers, sessions, users, verificationTokens } from "@/lib/db/schema";
import "./types";
import { verifyPassword } from "./password";

// `declare module "next-auth/jwt"` doesn't resolve as an augmentation
// target under this project's moduleResolution: "bundler" — confirmed by
// isolating it in its own file with nothing else present, so this is a
// TypeScript/package-exports limitation, not a file-organization mistake.
// A plain `import type { JWT } from "next-auth/jwt"` resolves fine; only
// the ambient-augmentation form fails. Working around it locally instead
// of fighting a global augmentation: the extra fields only need to be
// typed where the jwt/session callbacks below actually touch them.
type AppToken = {
  userId?: string;
  businessId?: string | null;
  memberId?: string | null;
  role?: "owner" | "member" | null;
};

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: DrizzleAdapter(db, {
    usersTable: users,
    accountsTable: accounts,
    sessionsTable: sessions,
    verificationTokensTable: verificationTokens,
  }),
  // JWT strategy, not database — Auth.js hard-errors on database sessions
  // for a credentials-only provider set (Credentials bypasses the adapter
  // for identity, so there's no session row for it to create). The
  // adapter and its tables stay configured regardless: they're what a
  // future OAuth or magic-link provider attaches to, at which point real
  // database sessions become available again. Immediate revocation — the
  // actual goal behind "database sessions" — is achieved here instead by
  // the jwt callback re-querying business_members on every request: a
  // removed member's token stays cryptographically valid but carries no
  // usable business context from the next request on.
  session: { strategy: "jwt" },
  pages: { signIn: "/login" },
  providers: [
    Credentials({
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      authorize: async (credentials) => {
        const email = credentials.email;
        const password = credentials.password;
        if (typeof email !== "string" || typeof password !== "string") return null;

        const [user] = await db.select().from(users).where(eq(users.email, email)).limit(1);
        if (!user?.passwordHash) return null;

        const valid = await verifyPassword(password, user.passwordHash);
        if (!valid) return null;

        return { id: user.id, email: user.email, name: user.name };
      },
    }),
  ],
  callbacks: {
    jwt: async ({ token, user }) => {
      const current = token as typeof token & AppToken;
      const userId = user?.id ?? current.userId;
      if (!userId) return token;

      const [member] = await db
        .select({ id: businessMembers.id, businessId: businessMembers.businessId, role: businessMembers.role })
        .from(businessMembers)
        .where(eq(businessMembers.userId, userId))
        .limit(1);

      const next: typeof token & AppToken = {
        ...current,
        userId,
        businessId: member?.businessId ?? null,
        memberId: member?.id ?? null,
        role: member?.role ?? null,
      };
      return next;
    },
    session: async ({ session, token }) => {
      const current = token as typeof token & AppToken;
      return {
        ...session,
        user: {
          ...session.user,
          id: current.userId,
          businessId: current.businessId ?? null,
          memberId: current.memberId ?? null,
          role: current.role ?? null,
        },
      };
    },
  },
});
