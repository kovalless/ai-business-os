"use server";

import { AuthError } from "next-auth";
import { signIn } from "@/lib/auth/config";

export type LoginState = { error?: string };

// Takes an explicit payload rather than FormData: the existing Field
// primitive (src/components/ui/Field.tsx) is fully controlled — value/
// onChange only, no `name` forwarded to the underlying input — so native
// form-field collection into FormData isn't available without changing
// that shared component. login-form.tsx calls this directly with
// controlled state instead.
export async function loginAction(_prevState: LoginState, payload: { email: string; password: string }): Promise<LoginState> {
  try {
    await signIn("credentials", {
      email: payload.email,
      password: payload.password,
      redirectTo: "/today",
    });
    return {};
  } catch (error) {
    if (error instanceof AuthError) {
      return { error: "Incorrect email or password." };
    }
    // signIn's own redirect-on-success throws a Next.js control-flow
    // error that isn't an AuthError — must be rethrown, not swallowed.
    throw error;
  }
}
