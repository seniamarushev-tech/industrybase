import { TaskCard } from "@/components/task-card";
import { createClient } from "@/lib/supabase-server";

export default async function HomePage() {
  const supabase = createClient();
  const { data: tasks } = await supabase
    .from("tasks")
    .select("*, creator:profiles!tasks_creator_id_fkey(display_name, trust_score)")
    .eq("status", "open")
    .not("budget_type", "is", null)
    .order("created_at", { ascending: false })
    .limit(20);

  return (
    <section className="space-y-4">
      <h1 className="text-2xl font-semibold">Live Market Feed</h1>
      <p className="text-sm text-muted">Открытые задачи в реальном времени по всей индустрии.</p>
      <div className="grid gap-3">
        {tasks?.map((task) => <TaskCard key={task.id} task={task} />)}
      </div>
    </section>
  );
}
