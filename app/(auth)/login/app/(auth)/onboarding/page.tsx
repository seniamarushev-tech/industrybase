"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { createClient } from "@/lib/supabase-browser";
import { onboardingSchema } from "@/lib/validators";

const tagOptions = ["vocal", "dj", "mix", "master", "guitar", "hiphop", "pop", "soundtrack"];

export default function OnboardingPage() {
  const router = useRouter();
  const [form, setForm] = useState({
    role: "artist",
    city: "",
    display_name: "",
    tags: [] as string[],
    contact_email: "",
    contact_phone: "",
    contact_telegram: ""
  });
  const [error, setError] = useState<string>("");

  const submit = async () => {
    const parsed = onboardingSchema.safeParse(form);
    if (!parsed.success) return setError(parsed.error.errors[0].message);

    const supabase = createClient();
    const { data: userData } = await supabase.auth.getUser();
    const user = userData.user;
    if (!user) return setError("Нужен логин");

    const { error: upsertError } = await supabase.from("profiles").upsert({ id: user.id, ...parsed.data });
    if (upsertError) return setError(upsertError.message);
    router.push("/me");
  };

  return (
    <div className="mx-auto max-w-2xl space-y-4">
      <h1 className="text-2xl font-semibold">Onboarding</h1>
      <div className="grid gap-3 md:grid-cols-2">
        <select
          className="rounded-lg border border-border bg-transparent p-2"
          onChange={(e) => setForm((s) => ({ ...s, role: e.target.value }))}
        >
          <option value="artist">Artist</option>
          <option value="producer">Producer</option>
          <option value="customer">Customer</option>
        </select>
        <input className="rounded-lg border border-border bg-transparent p-2" placeholder="Display name" onChange={(e) => setForm((s) => ({ ...s, display_name: e.target.value }))} />
        <input className="rounded-lg border border-border bg-transparent p-2" placeholder="City" onChange={(e) => setForm((s) => ({ ...s, city: e.target.value }))} />
        <input className="rounded-lg border border-border bg-transparent p-2" placeholder="Contact email" onChange={(e) => setForm((s) => ({ ...s, contact_email: e.target.value }))} />
        <input className="rounded-lg border border-border bg-transparent p-2" placeholder="Phone" onChange={(e) => setForm((s) => ({ ...s, contact_phone: e.target.value }))} />
        <input className="rounded-lg border border-border bg-transparent p-2" placeholder="Telegram" onChange={(e) => setForm((s) => ({ ...s, contact_telegram: e.target.value }))} />
      </div>
      <div className="flex flex-wrap gap-2">
        {tagOptions.map((tag) => (
          <button
            key={tag}
            className={`rounded-full border px-3 py-1 text-sm ${form.tags.includes(tag) ? "border-accent text-accent" : "border-border"}`}
            onClick={() =>
              setForm((s) => ({
                ...s,
                tags: s.tags.includes(tag) ? s.tags.filter((t) => t !== tag) : [...s.tags, tag]
              }))
            }
          >
            {tag}
          </button>
        ))}
      </div>
      <button onClick={submit} className="rounded-lg bg-accent px-4 py-2 text-sm font-medium">
        Сохранить профиль
      </button>
      {error && <p className="text-red-300">{error}</p>}
    </div>
  );
}
