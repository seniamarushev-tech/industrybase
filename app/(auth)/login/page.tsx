"use client";

import { createClient } from "@/lib/supabase-browser";
import { useState } from "react";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<string>("");

  const signIn = async () => {
    const supabase = createClient();
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: { emailRedirectTo: `${window.location.origin}/api/auth/callback` }
    });
    setStatus(error ? error.message : "Проверьте почту для magic link");
  };

  return (
    <div className="mx-auto max-w-md space-y-4">
      <h1 className="text-2xl font-semibold">Login</h1>
      <input
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="email"
        className="w-full rounded-lg border border-border bg-transparent p-2"
      />
      <button onClick={signIn} className="rounded-lg bg-accent px-4 py-2 text-sm font-medium">
        Войти по magic link
      </button>
      {status && <p className="text-sm text-muted">{status}</p>}
    </div>
  );
}
