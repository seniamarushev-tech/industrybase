import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase-server";

export async function POST(_request: Request, { params }: { params: { id: string } }) {
  const supabase = createClient();
  const { data: userData } = await supabase.auth.getUser();
  const user = userData.user;
  if (!user) return new NextResponse("Unauthorized", { status: 401 });

  const { data: offer } = await supabase.from("offers").select("*").eq("id", params.id).single();
  if (!offer) return new NextResponse("Not found", { status: 404 });

  const { data: task } = await supabase.from("tasks").select("creator_id").eq("id", offer.task_id).single();
  if (!task || task.creator_id !== user.id) return new NextResponse("Forbidden", { status: 403 });

  await supabase.from("offers").update({ status: "accepted" }).eq("id", offer.id);
  await supabase.from("tasks").update({ status: "matched" }).eq("id", offer.task_id);
  await supabase.from("connections").insert({ task_id: offer.task_id, a_id: user.id, b_id: offer.proposer_id });

  return NextResponse.redirect(new URL(`/tasks/${offer.task_id}`, _request.url));
}
