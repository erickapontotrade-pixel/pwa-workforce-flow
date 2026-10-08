import { createFileRoute, Link, Navigate } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { ArrowRight, CalendarCheck, FileWarning, Star, Zap } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useMe, brl, fmtDateTime, profileCompleteness } from "@/lib/session";
import { ASSIGNMENT_LABEL, MODALITY_LABEL } from "@/lib/labels";
import { ErrorState, Loading, Stat } from "@/components/move/states";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";

export const Route = createFileRoute("/_authenticated/app/")({
  head: () => ({ meta: [{ title: "Início — A Ponto MOVE" }, { name: "description", content: "Agenda, oportunidades e desempenho profissional." }, { property: "og:title", content: "Início — A Ponto MOVE" }, { property: "og:description", content: "Agenda, oportunidades e desempenho profissional." }, { property: "og:type", content: "website" }, { name: "twitter:card", content: "summary" }] }), 
  component: Home,
});

function Home() {
  const me = useMe();
  const p = me.data?.professional;
  const data = useQuery({
    queryKey: ["pro-home", p?.id],
    enabled: !!p,
    queryFn: async () => {
      if (!p) throw new Error("Perfil profissional não encontrado");
      const now = new Date().toISOString();
      const [next, opps, jobs, docs, earn, skills, exps, avail] = await Promise.all([
        supabase.from("freelance_assignments").select("*, freelance_opportunities(title, location_name, city)").eq("professional_id", p.id)
          .in("status", ["convidado", "reservado", "em_execucao"]).gte("ends_at", now).order("starts_at").limit(3),
        supabase.from("freelance_opportunities").select("id", { count: "exact", head: true }).in("status", ["publicada", "interessados"]).gte("starts_at", now),
        supabase.from("jobs").select("id", { count: "exact", head: true }).eq("status", "publicada"),
        supabase.from("documents").select("id,status,expires_at").eq("professional_id", p.id),
        supabase.from("freelance_earnings").select("amount,status").eq("professional_id", p.id),
        supabase.from("professional_skills").select("skill_id", { count: "exact", head: true }).eq("professional_id", p.id),
        supabase.from("professional_experiences").select("id", { count: "exact", head: true }).eq("professional_id", p.id),
        supabase.from("availability").select("id", { count: "exact", head: true }).eq("professional_id", p.id),
      ]);
      for (const r of [next, opps, jobs, docs, earn, skills, exps, avail]) if (r.error) throw r.error;
      const d = docs.data ?? [];
      const soon = Date.now() + 30 * 864e5;
      return {
        next: next.data ?? [],
        opps: opps.count ?? 0,
        jobs: jobs.count ?? 0,
        docsPending: d.filter((x) => ["recusado", "expirado", "pendente"].includes(x.status) || (x.expires_at && new Date(x.expires_at).getTime() < soon)).length,
        docs: d.length,
        earnedApproved: (earn.data ?? []).filter((e) => ["aprovado", "pago"].includes(e.status)).reduce((s, e) => s + Number(e.amount), 0),
        earnedForecast: (earn.data ?? []).filter((e) => e.status === "previsto").reduce((s, e) => s + Number(e.amount), 0),
        skills: skills.count ?? 0, exps: exps.count ?? 0, avail: avail.count ?? 0,
      };
    },
  });

  if (me.isLoading) return <Loading />;
  if (!p) return <Navigate to="/app/empresa" />;
  const d = data.data;
  const pct = profileCompleteness(p, d && { skills: d.skills, exps: d.exps, avail: d.avail, docs: d.docs });
  const isFreela = p.modality === "freelancer" || p.modality === "ambos";
  const isFixo = p.modality === "fixo" || p.modality === "ambos";

  return (
    <div className="space-y-6">
      <div>
        <p className="eyebrow text-muted-foreground">Olá{p.full_name ? `, ${p.full_name.split(" ")[0]}` : ""}</p>
        <h1 className="text-2xl font-bold sm:text-3xl">Seu dia em movimento</h1>
      </div>

      {!p.modality && (
        <div className="rounded-lg border-l-4 border-signal bg-accent p-4">
          <p className="font-semibold">Escolha sua modalidade de trabalho</p>
          <p className="text-sm text-accent-foreground/80">Fixo, Freelancer ou os dois. É obrigatório para receber vagas e oportunidades.</p>
          <Button asChild size="sm" className="mt-3"><Link to="/app/perfil">Definir agora</Link></Button>
        </div>
      )}

      <div className="rounded-lg border bg-card p-4 shadow-card">
        <div className="flex items-center justify-between text-sm">
          <span className="font-medium">Perfil {pct}% completo</span>
          {p.modality && <Badge variant="signal">{MODALITY_LABEL[p.modality]}</Badge>}
        </div>
        <Progress value={pct} className="mt-2" />
        {pct < 100 && <Link to="/app/perfil" className="mt-2 inline-block text-xs text-muted-foreground underline">Completar perfil aumenta sua compatibilidade</Link>}
      </div>

      {data.error ? <ErrorState error={data.error} retry={() => data.refetch()} /> : data.isLoading ? <Loading /> : d && (
        <>
          <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
            {isFreela && <Stat label="Freelas abertos" value={d.opps} />}
            {isFixo && <Stat label="Vagas abertas" value={d.jobs} />}
            {isFreela && <Stat label="Ganhos aprovados" value={brl(d.earnedApproved)} hint={`Previsto ${brl(d.earnedForecast)}`} />}
            <Stat label="Avaliação" value={<span className="inline-flex items-center gap-1"><Star className="h-5 w-5 fill-signal text-signal" />{Number(p.rating_avg).toFixed(1)}</span>} hint={`${p.rating_count} avaliações`} />
          </div>

          <section>
            <div className="mb-3 flex items-center justify-between">
              <h2 className="text-lg font-semibold">Próximos trabalhos</h2>
              <Link to="/app/checkin" className="text-sm text-muted-foreground hover:text-foreground">Ver agenda</Link>
            </div>
            {d.next.length === 0 ? (
              <div className="rounded-lg border border-dashed bg-card p-6 text-center text-sm text-muted-foreground">
                Nenhum trabalho agendado.{" "}
                {isFreela && <Link to="/app/oportunidades" className="font-medium text-foreground underline">Ver oportunidades para você</Link>}
              </div>
            ) : (
              <div className="space-y-2">
                {d.next.map((a) => (
                  <Link key={a.id} to="/app/checkin" className="flex items-center gap-4 rounded-lg border bg-card p-4 shadow-card hover:border-primary/40">
                    <CalendarCheck className="h-5 w-5 text-primary" />
                    <div className="min-w-0 flex-1">
                      <p className="truncate font-medium">{a.freelance_opportunities?.title}</p>
                      <p className="text-xs text-muted-foreground">{fmtDateTime(a.starts_at)} · {a.freelance_opportunities?.location_name ?? a.freelance_opportunities?.city}</p>
                    </div>
                    <Badge variant={a.status === "convidado" ? "warning" : "muted"}>{ASSIGNMENT_LABEL[a.status]}</Badge>
                  </Link>
                ))}
              </div>
            )}
          </section>

          <div className="grid gap-3 sm:grid-cols-2">
            {isFreela && (
              <Link to="/app/oportunidades" className="group flex items-center justify-between rounded-lg bg-navy p-5 text-navy-foreground">
                <span className="flex items-center gap-3"><Zap className="text-signal" /> Oportunidades para você</span>
                <ArrowRight className="transition group-hover:translate-x-1" />
              </Link>
            )}
            {d.docsPending > 0 && (
              <Link to="/app/perfil" className="flex items-center gap-3 rounded-lg border border-warning bg-warning/10 p-5">
                <FileWarning className="text-warning-foreground" /> {d.docsPending} documento(s) precisam de atenção
              </Link>
            )}
          </div>
        </>
      )}
    </div>
  );
}
