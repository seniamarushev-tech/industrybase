import Link from "next/link";
import { Badge, Card } from "@/components/ui";

export function TaskCard({ task }: { task: any }) {
  return (
    <Card>
      <div className="mb-2 flex items-center justify-between gap-2">
        <Link href={`/tasks/${task.id}`} className="font-medium hover:text-accent">
          {task.title}
        </Link>
        <Badge>{task.status}</Badge>
      </div>
      <p className="mb-3 text-sm text-muted">{task.description}</p>
      <div className="flex flex-wrap gap-2 text-xs">
        <Badge>{task.category}</Badge>
        <Badge>{task.city}</Badge>
        <Badge className="text-green-300">{task.budget_type}</Badge>
        <Badge className="text-green-300">от {task.budget_min ?? 0}</Badge>
        <Badge className="text-purple-300">trust: {task.creator?.trust_score ?? "n/a"}</Badge>
      </div>
    </Card>
  );
}
