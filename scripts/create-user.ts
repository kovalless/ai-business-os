import { config } from "dotenv";
import { and, eq } from "drizzle-orm";
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import { hashPassword } from "../src/lib/auth/password";
import * as schema from "../src/lib/db/schema";

config({ path: ".env.local" });

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL is not set. Copy .env.local.example to .env.local first.");
}

const queryClient = postgres(process.env.DATABASE_URL);
const db = drizzle(queryClient, { schema });

function arg(name: string): string | undefined {
  const prefix = `--${name}=`;
  return process.argv.find((a) => a.startsWith(prefix))?.slice(prefix.length);
}

// Bootstraps a real credentials login for local dev/testing — either the
// first owner account for a business, or a test account linked to an
// existing seeded business_members row (e.g. seed.ts's "Joris Vaneck",
// which has userId: null until a real account claims it). Bypasses the
// invite flow deliberately: this is a dev-side tool for standing up an
// account directly, not something end users would run.
async function main() {
  const email = arg("email");
  const password = arg("password");
  const businessName = arg("business");
  const name = arg("name") ?? email?.split("@")[0];
  const linkMember = arg("member");
  const role = arg("role") === "owner" ? ("owner" as const) : ("member" as const);

  if (!email || !password || !businessName) {
    console.error(
      'Usage: npm run auth:create-user -- --email=you@example.com --password=... --business="Vaneck & Co" [--name=...] [--member="Joris Vaneck"] [--role=owner|member]',
    );
    process.exitCode = 1;
    return;
  }
  if (password.length < 8) {
    console.error("Password must be at least 8 characters.");
    process.exitCode = 1;
    return;
  }

  const [business] = await db.select().from(schema.businesses).where(eq(schema.businesses.name, businessName)).limit(1);
  if (!business) {
    console.error(`No business named "${businessName}" found.`);
    process.exitCode = 1;
    return;
  }

  const [existingUser] = await db.select().from(schema.users).where(eq(schema.users.email, email)).limit(1);
  if (existingUser) {
    console.error(`A user with email ${email} already exists (id: ${existingUser.id}).`);
    process.exitCode = 1;
    return;
  }

  const passwordHash = await hashPassword(password);
  const [user] = await db.insert(schema.users).values({ email, name, passwordHash }).returning();

  if (linkMember) {
    const [member] = await db
      .select()
      .from(schema.businessMembers)
      .where(and(eq(schema.businessMembers.businessId, business.id), eq(schema.businessMembers.displayName, linkMember)))
      .limit(1);
    if (!member) {
      console.error(`No business_members row named "${linkMember}" found for ${businessName}.`);
      process.exitCode = 1;
      return;
    }
    await db.update(schema.businessMembers).set({ userId: user!.id }).where(eq(schema.businessMembers.id, member.id));
    console.log(`Linked ${email} to existing member "${linkMember}" (${member.role}).`);
  } else {
    const [member] = await db
      .insert(schema.businessMembers)
      .values({ businessId: business.id, userId: user!.id, displayName: name ?? email, role })
      .returning();
    console.log(`Created member "${member!.displayName}" (${member!.role}) for ${email}.`);
  }

  console.log(`User created: ${email} (id: ${user!.id})`);
}

main()
  .catch((err) => {
    console.error(err);
    process.exitCode = 1;
  })
  .finally(async () => {
    await queryClient.end();
  });
