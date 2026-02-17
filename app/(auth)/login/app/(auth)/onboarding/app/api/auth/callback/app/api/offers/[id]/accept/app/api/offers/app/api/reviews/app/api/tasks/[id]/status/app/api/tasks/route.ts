import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase-server";
import { taskSchema } from "@/lib/validators";

export async function POST(request: Request) {
  const supabase = createClient();
  const { data: userData } = await supabase.auth.getUser();
  const user = userData.user;
  if (!user) return new NextResponse("Unauthorized", { status: 401 });

  const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single();
  if (!profile || !["customer", "producer"].includes(profile.role)) {
    return new NextResponse("Forbidden", { status: 403 });
  }

  const parsed = taskSchema.safeParse(await request.json());
  if (!parsed.success) return new NextResponse(parsed.error.errors[0].message, { status: 400 });

  if (parsed.data.budget_type !== "collab" && parsed.data.budget_min <= 0) {
    return new NextResponse("Budget required", { status: 400 });
  }

  const { error } = await supabase.from("tasks").insert({
    ...parsed.data,
    creator_id: user.id,
    status: "open"
  });
  if (error) return new NextResponse(error.message, { status: 400 });

  return NextResponse.json({ ok: true });
}
