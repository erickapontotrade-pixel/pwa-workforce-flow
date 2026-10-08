import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Bar, BarChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { supabase } from "@/integrations/supabase/client";
import { useMe, brl } from "@/lib/session";
import { STAGE_LABEL, STAGES } from "@/lib/labels";
import { Empty, ErrorState, Loading, PageHeader, Stat } from "@/components/move/states";

export const Route = createFileRoute("/_authenticated/app/empresa/")({ head: () => ({ meta: [{ title: "Dashboard da empresa — A Ponto MOVE" }, { name: "description", content: "Indicadores de vagas, candidaturas e trabalhos freelancer." }, { property: "og:title", content: "Dashboard da empresa — A Ponto MOVE" }, { property: "og:description", content: "Indicadores de vagas, candidaturas e trabalhos freelancer." }, { property: "og:type", content: "website" }, { name: "twitter:card", content: "summary" }] }), component: Dash });

function Dash() {
  const c = useMe().data?.company;
  const q = useQuery({
    queryKey: ["co-dash", c?.id],
    enabled: !!c,
    queryFn: async () => {
      if (!c) throw new Error("Nenhuma empresa vinculada");
      const [jobs, apps, opps, asg, earn] = await Promise.all([
        supabase.from("jobs").select("id,status").eq("company_id", c.id),
        supabase.from("applications").select("stage, jobs!inner(company_id)").eq("jobs.company_id", c.id),
        supabase.from("freelance_opportunities").select("id,status").eq("company_id", c.id),
        supabase.from("freelance_assignments").select("status, executed").eq("company_id", c.id),
        supabase.from("freelance_earnings").select("amount,status").eq("company_id", c.id),
      ]);
      for (const r of [jobs, apps, opps, asg, earn]) if (r.error) throw r.error;
      const a = asg.data ?? [];
      const done = a.filter((x) => x.executed != null);
      return {
        jobs: (jobs.data ?? []).filter((j) => j.status === "publicada").length,
        apps: apps.data ?? [],
        opps: (opps.data ?? []).filter((o) => !["concluida", "cancelada", "rascunho"].includes(o.status)).length,
        running: a.filter((x) => x.status === "em_execucao").length,
        pending: a.filter((x) => x.status === "aguardando_aprovacao").length,
        exec: done.length ? Math.round((done.filter((x) => x.executed).length / done.length) * 100) : null,
        cost: (earn.data ?? []).filter((e) => e.status !== "cancelado").reduce((s, e) => s + Number(e.amount), 0),
      };
    },
  });
  if (!c) return <Empty title="Nenhuma empresa vinculada" />;
  const d = q.data;
  const funnel = STAGES.map((s) => ({ etapa: STAGE_LABEL[s], total: (d?.apps ?? []).filter((a) => a.stage === s).length }));
  return (
    <div className="space-y-6">
      <PageHeader eyebrow={c.name} title="Dashboard" />
      {q.error ? <ErrorState error={q.error} retry={() => q.refetch()} /> : q.isLoading || !d ? <Loading /> : (
        <>
          <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
            <Stat label="Vagas abertas" value={d.jobs} />
            <Stat label="Candidatos" value={d.apps.length} />
            <Stat label="Freelas abertos" value={d.opps} />
            <Stat label="Em andamento" value={d.running} hint={`${d.pending} aguardando aprovação`} />
            <Stat label="% Execução" value={d.exec == null ? "—" : `${d.exec}%`} />
            <Stat label="Custo freela" value={brl(d.cost)} />
          </div>
          <div className="rounded-lg border bg-card p-5 shadow-card">
            <h2 className="mb-4 font-semibold">Funil de recrutamento</h2>
            <div className="h-64"><ResponsiveContainer><BarChart data={funnel}><XAxis dataKey="etapa" fontSize={11} /><YAxis allowDecimals={false} fontSize={11} /><Tooltip /><Bar dataKey="total" fill="var(--chart-1)" radius={[4, 4, 0, 0]} /></BarChart></ResponsiveContainer></div>
          </div>
        </>
      )}
    </div>
  );
}
