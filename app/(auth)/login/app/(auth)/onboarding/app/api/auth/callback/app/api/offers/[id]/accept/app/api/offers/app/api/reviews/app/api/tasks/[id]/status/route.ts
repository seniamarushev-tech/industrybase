import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase-server";

export async function POST(request: Request, { params }: { params: { id: string } }) {
  const supabase = createClient();
  const { data: userData } = await supabase.auth.getUser();
  const user = userData.user;
  if (!user) return new NextResponse("Unauthorized", { status: 401 });

  const form = await request.formData();
  const status = form.get("status");
  if (!["completed", "disputed"].includes(String(status))) {
    return new NextResponse("Invalid status", { status: 400 });
  }

  const { data: task } = await supabase.from("tasks").select("creator_id").eq("id", params.id).single();
  if (!task || task.creator_id !== user.id) return new NextResponse("Forbidden", { status: 403 });

  await supabase.from("tasks").update({ status }).eq("id", params.id);
  return NextResponse.redirect(new URL(`/tasks/${params.id}`, request.url));
}
