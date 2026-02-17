import { redirect } from "next/navigation";
import { Badge, Card } from "@/components/ui";
import { createClient } from "@/lib/supabase-server";

export default async function MePage() {
  const supabase = createClient();
  const { data: userData } = await supabase.auth.getUser();
  const user = userData.user;
  if (!user) redirect("/login");

  const [{ data: profile }, { data: trust }] = await Promise.all([
    supabase.from("profiles").select("*").eq("id", user.id).single(),
    supabase.rpc("get_trust_score", { profile_id: user.id }).single()
  ]);

  if (!profile) redirect("/onboarding");

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-semibold">Мой профиль</h1>
      <Card className="space-y-3">
        <p className="text-lg">{profile.display_name}</p>
        <div className="flex gap-2">
          <Badge>{profile.role}</Badge>
          <Badge>{profile.city}</Badge>
          <Badge className="text-purple-300">Trust {trust?.avg_rating ?? "0"}</Badge>
          <Badge className="text-orange-300">Demand badge</Badge>
        </div>
        <p className="text-sm text-muted">{profile.tags?.join(", ")}</p>
      </Card>
    </div>
  );
}
