import { createAdminClient } from "@/lib/supabase-admin";

const cities = ["Moscow", "SPB", "Kazan", "Novosibirsk", "Ekb"];
const categories = ["Live Show", "Recording", "Mix & Master", "Session", "Production", "Promotion"];
const roles = ["artist", "producer", "customer"] as const;

async function main() {
  const supabase = createAdminClient();

  const profileIds = Array.from({ length: 30 }, (_, i) => crypto.randomUUID());
  const profiles = profileIds.map((id, i) => ({
    id,
    role: roles[i % roles.length],
    city: cities[i % cities.length],
    tags: ["demo", `genre-${i % 6}`],
    display_name: `Demo User ${i + 1}`,
    contact_email: `demo${i + 1}@example.com`,
    contact_phone: `+7999000${String(i).padStart(3, "0")}`,
    contact_telegram: `@demo_${i + 1}`
  }));

  const { error: profileError } = await supabase.from("profiles").upsert(profiles);
  if (profileError) throw profileError;

  const tasks = Array.from({ length: 20 }, (_, i) => {
    const creator_id = profileIds[(i + 5) % profileIds.length];
    const budgetType = i % 3 === 0 ? "collab" : i % 2 === 0 ? "range" : "fixed";
    return {
      creator_id,
      title: `Demo Task ${i + 1}`,
      category: categories[i % categories.length],
      city: cities[i % cities.length],
      event_date: null,
      budget_type: budgetType,
      budget_min: budgetType === "collab" ? 0 : 5000 + i * 1000,
      budget_max: budgetType === "range" ? 10000 + i * 1200 : null,
      description: "Demo task for MVP feed and testing.",
      visibility: "public",
      status: "open"
    };
  });

  const { error: taskError } = await supabase.from("tasks").insert(tasks);
  if (taskError) throw taskError;

  console.log("Seed completed: 30 profiles, 20 tasks");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
