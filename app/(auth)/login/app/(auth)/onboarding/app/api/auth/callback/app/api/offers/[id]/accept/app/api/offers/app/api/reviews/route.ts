import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase-server";
import { reviewSchema } from "@/lib/validators";

export async function POST(request: Request) {
  const supabase = createClient();
  const { data: userData } = await supabase.auth.getUser();
  const user = userData.user;
  if (!user) return new NextResponse("Unauthorized", { status: 401 });

  const form = await request.formData();
  const rawFlags = String(form.get("flags") || "");
  const parsed = reviewSchema.safeParse({
    task_id: form.get("task_id"),
    to_id: form.get("to_id"),
    rating: form.get("rating"),
    flags: rawFlags ? rawFlags.split(",").map((f) => f.trim()) : [],
    comment: form.get("comment")
  });

  if (!parsed.success) return new NextResponse(parsed.error.errors[0].message, { status: 400 });

  const { data: connection } = await supabase
    .from("connections")
    .select("*")
    .eq("task_id", parsed.data.task_id)
    .or(`a_id.eq.${user.id},b_id.eq.${user.id}`)
    .single();
  if (!connection) return new NextResponse("No connection", { status: 403 });

  const { error } = await supabase.from("reviews").insert({ ...parsed.data, from_id: user.id });
  if (error) return new NextResponse(error.message, { status: 400 });

  return NextResponse.redirect(new URL(`/tasks/${parsed.data.task_id}`, request.url));
}
