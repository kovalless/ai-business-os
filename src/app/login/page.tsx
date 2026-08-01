import { redirect } from "next/navigation";
import { Panel } from "@/components/ui";
import { getCurrentMember } from "@/lib/auth/session";
import { LoginForm } from "./login-form";

// Server Component: redirects an already-authenticated user away rather
// than showing the form again. This is the one piece of route protection
// Milestone B needs — see session.ts and the middleware note there.
// Renders inside the existing root layout's Frame (Rail included) rather
// than a bare pre-auth shell: splitting that out would mean moving every
// existing room into a route group, out of scope here per "don't touch
// existing UI rooms." Known, deliberate cosmetic limitation until
// Milestone C actually gates those rooms and that restructuring becomes
// necessary anyway.
export default async function LoginPage() {
  const member = await getCurrentMember();
  if (member) {
    redirect("/today");
  }

  return (
    <div className="flex h-full min-w-0 flex-1 items-center justify-center p-court">
      <Panel tone="outline" className="w-full max-w-[360px]">
        <h1 className="text-title font-medium text-ink">Sign in</h1>
        <p className="mt-step text-bodysm text-ink-3">AI Business OS</p>
        <div className="mt-bay">
          <LoginForm />
        </div>
      </Panel>
    </div>
  );
}
