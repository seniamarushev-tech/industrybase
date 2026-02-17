import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase-server";
import { offerSchema } from "@/lib/validators";

async function parseBody(request: Request) {
  const contentType = request.headers.get("content-type") || "";
  if (contentType.includes("application/json")) return request.json();
  const form = await request.formData();
  return {
    task_id: form.get("task_id"),
    message: form.get("message"),
    portfolio_url: form.get("portfolio_url")
  };
}

export async function POST(request: Request) {
  const supabase = createClient();
  const { data: userData } = await supabase.auth.getUser();
  const user = userData.user;
  if (!user) return new NextResponse("Unauthorized", { status: 401 });

  const parsed = offerSchema.safeParse(await parseBody(request));
  if (!parsed.success) return new NextResponse(parsed.error.errors[0].message, { status: 400 });

  const { data: task } = await supabase.from("tasks").select("creator_id,status").eq("id", parsed.data.task_id).single();
  if (!task || task.status !== "open") return new NextResponse("Task unavailable", { status: 400 });
  if (task.creator_id === user.id) return new NextResponse("Cannot offer on own task", { status: 400 });

  const { error } = await supabase.from("offers").insert({ ...parsed.data, proposer_id: user.id, status: "sent" });
  if (error) return new NextResponse(error.message, { status: 400 });

  return NextResponse.redirect(new URL(`/tasks/${parsed.data.task_id}`, request.url));
}
