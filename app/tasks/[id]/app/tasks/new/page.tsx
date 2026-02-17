"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { createClient } from "@/lib/supabase-browser";
import { taskCategories } from "@/lib/utils";
import { taskSchema } from "@/lib/validators";

export default function NewTaskPage() {
  const router = useRouter();
  const [error, setError] = useState("");
  const [form, setForm] = useState({
    title: "",
    category: taskCategories[0],
    city: "",
    event_date: "",
    budget_type: "fixed",
    budget_min: 1000,
    budget_max: 0,
    description: "",
    visibility: "public",
    targeted_profile_id: ""
  });

  const submit = async () => {
    const parsed = taskSchema.safeParse(form);
    if (!parsed.success) return setError(parsed.error.errors[0].message);

    const res = await fetch("/api/tasks", {
      method: "POST",
      body: JSON.stringify(parsed.data)
    });
    if (!res.ok) return setError(await res.text());
    router.push("/tasks");
  };

  return (
    <section className="mx-auto max-w-2xl space-y-3">
      <h1 className="text-2xl font-semibold">Новая задача</h1>
      <div className="grid gap-2">
        <input className="rounded-lg border border-border bg-transparent p-2" placeholder="Заголовок" onChange={(e) => setForm((s) => ({ ...s, title: e.target.value }))} />
        <select className="rounded-lg border border-border bg-transparent p-2" onChange={(e) => setForm((s) => ({ ...s, category: e.target.value }))}>
          {taskCategories.map((cat) => <option key={cat}>{cat}</option>)}
        </select>
        <input className="rounded-lg border border-border bg-transparent p-2" placeholder="Город" onChange={(e) => setForm((s) => ({ ...s, city: e.target.value }))} />
        <input className="rounded-lg border border-border bg-transparent p-2" type="date" onChange={(e) => setForm((s) => ({ ...s, event_date: e.target.value }))} />
        <select className="rounded-lg border border-border bg-transparent p-2" onChange={(e) => setForm((s) => ({ ...s, budget_type: e.target.value }))}>
          <option value="fixed">fixed</option><option value="range">range</option><option value="collab">collab</option>
        </select>
        <input className="rounded-lg border border-border bg-transparent p-2" type="number" placeholder="budget min" onChange={(e) => setForm((s) => ({ ...s, budget_min: Number(e.target.value) }))} />
        <input className="rounded-lg border border-border bg-transparent p-2" type="number" placeholder="budget max" onChange={(e) => setForm((s) => ({ ...s, budget_max: Number(e.target.value) }))} />
        <textarea className="rounded-lg border border-border bg-transparent p-2" placeholder="Описание" onChange={(e) => setForm((s) => ({ ...s, description: e.target.value }))} />
        <select className="rounded-lg border border-border bg-transparent p-2" onChange={(e) => setForm((s) => ({ ...s, visibility: e.target.value }))}>
          <option value="public">public</option><option value="targeted">targeted</option>
        </select>
        <input className="rounded-lg border border-border bg-transparent p-2" placeholder="targeted_profile_id" onChange={(e) => setForm((s) => ({ ...s, targeted_profile_id: e.target.value }))} />
      </div>
      <button onClick={submit} className="rounded-lg bg-accent px-4 py-2">Опубликовать</button>
      {error && <p className="text-red-300">{error}</p>}
    </section>
  );
}
