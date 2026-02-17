"use client";

import { useRouter, useSearchParams } from "next/navigation";

export function TaskFilters() {
  const router = useRouter();
  const params = useSearchParams();

  const update = (key: string, value: string) => {
    const next = new URLSearchParams(params.toString());
    if (value) next.set(key, value);
    else next.delete(key);
    router.push(`/tasks?${next.toString()}`);
  };

  return (
    <div className="grid gap-2 md:grid-cols-4">
      <input
        placeholder="Категория"
        defaultValue={params.get("category") ?? ""}
        onBlur={(e) => update("category", e.target.value)}
        className="rounded-lg border border-border bg-transparent p-2"
      />
      <input
        placeholder="Город"
        defaultValue={params.get("city") ?? ""}
        onBlur={(e) => update("city", e.target.value)}
        className="rounded-lg border border-border bg-transparent p-2"
      />
      <input
        placeholder="Бюджет min"
        type="number"
        defaultValue={params.get("budget_min") ?? ""}
        onBlur={(e) => update("budget_min", e.target.value)}
        className="rounded-lg border border-border bg-transparent p-2"
      />
      <select
        defaultValue={params.get("budget_type") ?? ""}
        onChange={(e) => update("budget_type", e.target.value)}
        className="rounded-lg border border-border bg-transparent p-2"
      >
        <option value="">Тип бюджета</option>
        <option value="fixed">fixed</option>
        <option value="range">range</option>
        <option value="collab">collab</option>
      </select>
    </div>
  );
}
