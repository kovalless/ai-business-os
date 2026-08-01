"use client";

import { startTransition, useActionState, useState } from "react";
import { Actuator, Field, Whisper } from "@/components/ui";
import { loginAction, type LoginState } from "./actions";

const initialState: LoginState = {};

export function LoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [state, dispatch, pending] = useActionState(loginAction, initialState);

  return (
    <form
      className="flex flex-col gap-stride"
      onSubmit={(e) => {
        e.preventDefault();
        // dispatch must run inside a transition — calling it bare
        // desyncs `pending` and, observed in testing, can leave the
        // action's navigation half-applied.
        startTransition(() => {
          dispatch({ email, password });
        });
      }}
    >
      {state.error ? <Whisper tone="error">{state.error}</Whisper> : null}
      <Field label="Email" type="email" value={email} onChange={setEmail} disabled={pending} />
      <Field label="Password" type="password" value={password} onChange={setPassword} disabled={pending} />
      <Actuator rank="primary" type="submit" disabled={pending}>
        {pending ? "Signing in…" : "Sign in"}
      </Actuator>
    </form>
  );
}
