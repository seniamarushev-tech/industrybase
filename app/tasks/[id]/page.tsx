import { redirect } from "next/navigation";
import { Badge, Card } from "@/components/ui";
import { createClient } from "@/lib/supabase-server";

export default async function TaskDetailsPage({ params }: { params: { id: string } }) {
  const supabase = createClient();
  const { data: userData } = await supabase.auth.getUser();
  const user = userData.user;

  const { data: task } = await supabase
    .from("tasks")
    .select("*, creator:profiles!tasks_creator_id_fkey(*)")
    .eq("id", params.id)
    .single();

  if (!task) redirect("/tasks");

  const isCreator = user?.id === task.creator_id;
  const { data: offers } = isCreator
    ? await supabase
        .from("offers")
        .select("*, proposer:profiles!offers_proposer_id_fkey(display_name, role, city, contact_email, contact_phone, contact_telegram)")
        .eq("task_id", params.id)
        .order("created_at", { ascending: false })
    : { data: [] };

  return (
    <section className="space-y-4">
      <Card className="space-y-3">
        <h1 className="text-2xl font-semibold">{task.title}</h1>
        <p className="text-sm text-muted">{task.description}</p>
        <div className="flex gap-2">
          <Badge>{task.category}</Badge><Badge>{task.city}</Badge><Badge>{task.status}</Badge>
          <Badge>{task.budget_type}</Badge><Badge>от {task.budget_min}</Badge>
        </div>
      </Card>

      {!isCreator && user && (
        <form action="/api/offers" method="post" className="space-y-2 rounded-xl border border-border bg-card p-4">
          <input type="hidden" name="task_id" value={task.id} />
          <textarea name="message" placeholder="Короткое сообщение" className="w-full rounded-lg border border-border bg-transparent p-2" />
          <input name="portfolio_url" placeholder="Portfolio URL (optional)" className="w-full rounded-lg border border-border bg-transparent p-2" />
          <button className="rounded-lg bg-accent px-4 py-2">Откликнуться</button>
        </form>
      )}

      {isCreator && (
        <div className="space-y-3">
          <h2 className="text-xl">Отклики</h2>
          {offers?.map((offer) => (
            <Card key={offer.id} className="space-y-2">
              <p className="font-medium">{offer.proposer.display_name}</p>
              <p className="text-sm text-muted">{offer.message}</p>
              <Badge>{offer.status}</Badge>
              {offer.status === "accepted" ? (
                <div className="text-sm">
                  <p>Контакт: {offer.proposer.contact_email || offer.proposer.contact_phone || offer.proposer.contact_telegram || "не указан"}</p>
                </div>
              ) : (
                <form action={`/api/offers/${offer.id}/accept`} method="post">
                  <button className="rounded-lg bg-accent px-3 py-1 text-sm">Принять отклик</button>
                </form>
              )}
            </Card>
          ))}
        </div>
      )}

      {isCreator && ["matched", "completed", "disputed"].includes(task.status) && (
        <Card className="space-y-2">
          <h3>Завершение задачи</h3>
          <form action={`/api/tasks/${task.id}/status`} method="post" className="flex gap-2">
            <button name="status" value="completed" className="rounded-lg bg-green-700 px-3 py-1">completed</button>
            <button name="status" value="disputed" className="rounded-lg bg-red-700 px-3 py-1">disputed</button>
          </form>
        </Card>
      )}

      {user && ["completed"].includes(task.status) && (
        <Card>
          <form action="/api/reviews" method="post" className="grid gap-2">
            <input type="hidden" name="task_id" value={task.id} />
            <input name="to_id" placeholder="ID второго участника" className="rounded-lg border border-border bg-transparent p-2" />
            <input name="rating" type="number" min={1} max={5} className="rounded-lg border border-border bg-transparent p-2" />
            <input name="flags" placeholder="late,no_show,rude,low_quality" className="rounded-lg border border-border bg-transparent p-2" />
            <textarea name="comment" className="rounded-lg border border-border bg-transparent p-2" placeholder="Комментарий" />
            <button className="rounded-lg bg-accent px-3 py-1">Оставить отзыв</button>
          </form>
        </Card>
      )}
    </section>
  );
}
