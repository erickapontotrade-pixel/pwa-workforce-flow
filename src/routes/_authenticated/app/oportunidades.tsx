import { createFileRoute, Link } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { useState } from "react";
import { Car, Clock, MapPin, Shirt } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useMe, brl, errMsg, fmtDateTime } from "@/lib/session";
import { matchScore } from "@/lib/matching";
import { PAY_UNIT_LABEL } from "@/lib/labels";
import { Empty, ErrorState, Loading, PageHeader } from "@/components/move/states";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";

export const Route = createFileRoute("/_authenticated/app/oportunidades")({ head: () => ({ meta: [{ title: "Oportunidades — A Ponto MOVE" }, { name: "description", content: "Trabalhos freelancer compatíveis com seu perfil." }, { property: "og:title", content: "Oportunidades — A Ponto MOVE" }, { property: "og:description", content: "Trabalhos freelancer compatíveis com seu perfil." }, { property: "og:type", content: "website" }, { name: "twitter:card", content: "summary" }] }), component: Mural });

function Mural() {
  const [filter, setFilter] = useState("");
  const p = useMe().data?.professional;
  const qc = useQueryClient();
  const q = useQuery({
    queryKey: ["mural", p?.id],
    enabled: !!p,
    queryFn: async () => {
      if (!p) throw new Error("Perfil profissional não encontrado");
      const [opps, mySkills, avail, apps] = await Promise.all([
        supabase.from("freelance_opportunities").select("*, companies(name)").in("status", ["publicada", "interessados", "selecionados"])
          .gte("starts_at", new Date().toISOString()).order("starts_at"),
        supabase.from("professional_skills").select("skills(name)").eq("professional_id", p.id),
        supabase.from("availability").select("weekday,start_time,end_time,kind").eq("professional_id", p.id),
        supabase.from("freelance_applications").select("opportunity_id,status").eq("professional_id", p.id),
      ]);
      for (const r of [opps, mySkills, avail, apps]) if (r.error) throw r.error;
      const skills = (mySkills.data ?? []).map((s) => s.skills?.name).filter(Boolean) as string[];
      const statusBy = new Map((apps.data ?? []).map((a) => [a.opportunity_id, a.status]));
      const names = new Map(await Promise.all(Array.from(new Set((opps.data ?? []).map(o => o.company_id))).map(async id => { const r = await supabase.rpc("company_display_name", { _id: id }); if (r.error) throw r.error; return [id, r.data] as const; })));
      return (opps.data ?? [])
        .map(o => ({ ...o, companies: { name: names.get(o.company_id) } }))
        .map((o) => ({ ...o, match: matchScore(p, o, skills, avail.data ?? []), my: statusBy.get(o.id) }))
        .filter((o) => o.my !== "sem_interesse")
        .sort((a, b) => b.match.score - a.match.score);
    },
  });

  const respond = useMutation({
    mutationFn: async ({ id, interested, score }: { id: string; interested: boolean; score: number }) => {
      if (!p?.modality) throw new Error("Defina sua modalidade de trabalho no perfil.");
      if (p.modality === "fixo") throw new Error("Sua modalidade é só Fixo. Altere no perfil para receber freelas.");
      const { error } = await supabase.from("freelance_applications").upsert(
        { opportunity_id: id, professional_id: p.id, status: interested ? "interessado" : "sem_interesse", match_score: score },
        { onConflict: "opportunity_id,professional_id" },
      );
      if (error) throw error;
    },
    onSuccess: (_, v) => { toast.success(v.interested ? "Interesse registrado! A empresa será avisada." : "Ok, ocultamos esta oportunidade."); qc.invalidateQueries({ queryKey: ["mural"] }); },
    onError: (e) => toast.error(errMsg(e)),
  });

  if (p && !p.modality) return <Empty title="Defina sua modalidade" action={<Button asChild><Link to="/app/perfil">Ir para o perfil</Link></Button>}>Escolha Freelancer ou Fixo + Freelancer para ver oportunidades.</Empty>;

  return (
    <div>
      <PageHeader eyebrow="Move Freela" title="Oportunidades para você" desc="Ordenadas pela compatibilidade com seu perfil, agenda e região." />
      <Input aria-label="Buscar oportunidades" className="mb-4 max-w-md" placeholder="Título, cidade, atividade ou local" value={filter} onChange={e => setFilter(e.target.value)} />
      {q.isLoading ? <Loading /> : q.error ? <ErrorState error={q.error} retry={() => q.refetch()} /> : !q.data?.length ? (
        <Empty title="Nenhuma oportunidade agora">Complete habilidades e disponibilidade no perfil para receber mais oportunidades.</Empty>
      ) : (
        <div className="grid gap-3 md:grid-cols-2">
          {q.data.filter(o => !filter || `${o.title} ${o.city} ${o.activity_type} ${o.location_name}`.toLowerCase().includes(filter.toLowerCase())).map((o) => {
            const hours = Math.round((new Date(o.ends_at).getTime() - new Date(o.starts_at).getTime()) / 36e5);
            const s = o.match.score;
            return (
              <div key={o.id} className="flex flex-col rounded-lg border bg-card p-5 shadow-card">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <Badge variant="muted">{o.activity_type}</Badge>
                    <h3 className="mt-2 font-semibold">{o.title}</h3>
                    <p className="text-sm text-muted-foreground">{o.companies?.name}</p>
                  </div>
                  <div className={cn("grid h-14 w-14 shrink-0 place-items-center rounded-full border-4 font-display text-sm font-bold",
                    s >= 75 ? "border-success text-success" : s >= 50 ? "border-signal text-foreground" : "border-muted text-muted-foreground")}>
                    {s}%
                  </div>
                </div>
                <div className="mt-3 grid grid-cols-2 gap-2 text-sm">
                  <span className="flex items-center gap-1.5 text-muted-foreground"><Clock className="h-4 w-4" />{fmtDateTime(o.starts_at)} · {hours}h</span>
                  <span className="flex items-center gap-1.5 text-muted-foreground"><MapPin className="h-4 w-4" />{o.location_name ?? o.city ?? "—"}</span>
                </div>
                <p className="mt-3 font-display text-xl font-bold">{brl(o.pay_amount)}<span className="text-sm font-normal text-muted-foreground">{PAY_UNIT_LABEL[o.pay_unit]}</span></p>
                <p className="mt-2 whitespace-pre-wrap text-sm text-muted-foreground">{o.description}</p>
                {o.requirements && <p className="mt-1 text-xs text-muted-foreground">Requisitos: {o.requirements}</p>}
                <div className="mt-2 flex flex-wrap gap-1.5">
                  {o.requires_vehicle && <Badge variant="outline"><Car className="mr-1 h-3 w-3" />Veículo</Badge>}
                  {o.requires_uniform && <Badge variant="outline"><Shirt className="mr-1 h-3 w-3" />Uniforme</Badge>}
                  {o.match.reasons.slice(0, 3).map((r) => <Badge key={r} variant="success">{r}</Badge>)}
                </div>
                <div className="mt-4 flex gap-2">
                  {o.my === "interessado" ? <Badge variant="success" className="py-1.5">Interesse enviado</Badge> : o.my === "selecionado" ? <Badge variant="signal" className="py-1.5">Você foi selecionado — veja Check-in</Badge> : (
                    <>
                      <Button size="sm" variant="signal" disabled={respond.isPending} onClick={() => respond.mutate({ id: o.id, interested: true, score: s })}>TENHO INTERESSE</Button>
                      <Button size="sm" variant="ghost" disabled={respond.isPending} onClick={() => respond.mutate({ id: o.id, interested: false, score: s })}>NÃO TENHO INTERESSE</Button>
                    </>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
