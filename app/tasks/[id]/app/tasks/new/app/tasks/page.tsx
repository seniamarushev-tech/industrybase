import { TaskCard } from "@/components/task-card";
import { TaskFilters } from "@/components/task-filters";
import { createClient } from "@/lib/supabase-server";

export default async function TasksPage({
  searchParams
}: {
  searchParams: Record<string, string | undefined>;
}) {
  const supabase = createClient();
  let query = supabase
    .from("tasks")
    .select("*, creator:profiles!tasks_creator_id_fkey(display_name, trust_score)")
    .eq("status", "open")
    .not("budget_type", "is", null)
    .order("created_at", { ascending: false });

  if (searchParams.category) query = query.ilike("category", `%${searchParams.category}%`);
  if (searchParams.city) query = query.ilike("city", `%${searchParams.city}%`);
  if (searchParams.budget_type) query = query.eq("budget_type", searchParams.budget_type);
  if (searchParams.budget_min) query = query.gte("budget_min", Number(searchParams.budget_min));

  const { data: tasks } = await query.limit(100);

  return (
    <section className="space-y-4">
      <h1 className="text-2xl font-semibold">Лента задач</h1>
      <TaskFilters />
      <div className="grid gap-3">
        {tasks?.map((task) => <TaskCard key={task.id} task={task} />)}
      </div>
    </section>
  );
}
