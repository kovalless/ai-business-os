"use client";

import { startTransition, useActionState, useState } from "react";
import { Actuator, Field, Whisper } from "@/components/ui";
import { acceptInviteAction, type AcceptInviteState } from "./actions";

const initialState: AcceptInviteState = {};

export function AcceptInviteForm({ token }: { token: string }) {
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const boundAction = acceptInviteAction.bind(null, token);
  const [state, dispatch, pending] = useActionState(boundAction, initialState);

  return (
    <form
      className="flex flex-col gap-stride"
      onSubmit={(e) => {
        e.preventDefault();
        // dispatch must run inside a transition — see login-form.tsx.
        startTransition(() => {
          dispatch({ name, password });
        });
      }}
    >
      {state.error ? <Whisper tone="error">{state.error}</Whisper> : null}
      <Field label="Your name" value={name} onChange={setName} disabled={pending} />
      <Field label="Password" type="password" value={password} onChange={setPassword} disabled={pending} />
      <Actuator rank="primary" type="submit" disabled={pending}>
        {pending ? "Creating account…" : "Accept invite"}
      </Actuator>
    </form>
  );
}
