import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useMe, fmtDate, fmtDateTime } from "@/lib/session";
import { STAGES, STAGE_LABEL } from "@/lib/labels";
import { Empty, ErrorState, Loading, PageHeader } from "@/components/move/states";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_authenticated/app/candidaturas")({ head: () => ({ meta: [{ title: "Minhas candidaturas — A Ponto MOVE" }, { name: "description", content: "Acompanhe suas candidaturas e entrevistas." }, { property: "og:title", content: "Minhas candidaturas — A Ponto MOVE" }, { property: "og:description", content: "Acompanhe suas candidaturas e entrevistas." }, { property: "og:type", content: "website" }, { name: "twitter:card", content: "summary" }] }), component: Candidaturas });

function Candidaturas() {
  const p = useMe().data?.professional;
  const q = useQuery({
    queryKey: ["my-apps-full", p?.id],
    enabled: !!p,
    queryFn: async () => {
      if (!p) throw new Error("Perfil profissional não encontrado");
      const { data, error } = await supabase.from("applications")
        .select("*, jobs(title, city, companies(name)), interviews(scheduled_at, status, location)")
        .eq("professional_id", p.id).order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });
  return (
    <div>
      <PageHeader eyebrow="Trabalho fixo" title="Minhas candidaturas" />
      {q.isLoading ? <Loading /> : q.error ? <ErrorState error={q.error} /> : !q.data?.length ? (
        <Empty title="Você ainda não se candidatou">Acesse Vagas para encontrar oportunidades de trabalho fixo.</Empty>
      ) : (
        <div className="space-y-3">
          {q.data.map((a) => {
            const idx = STAGES.indexOf(a.stage as (typeof STAGES)[number]);
            const next = a.interviews?.find((i) => i.status === "agendada");
            return (
              <div key={a.id} className="rounded-lg border bg-card p-5 shadow-card">
                <div className="flex justify-between gap-3">
                  <div>
                    <h3 className="font-semibold">{a.jobs?.title}</h3>
                    <p className="text-sm text-muted-foreground">{a.jobs?.companies?.name} · enviada em {fmtDate(a.created_at)}</p>
                  </div>
                  <Badge variant={a.stage === "reprovado" ? "destructive" : "signal"}>{STAGE_LABEL[a.stage]}</Badge>
                </div>
                {idx >= 0 && (
                  <div className="mt-4 flex gap-1">
                    {STAGES.map((s, i) => <div key={s} title={STAGE_LABEL[s]} className={cn("h-1.5 flex-1 rounded-full", i <= idx ? "bg-primary" : "bg-muted")} />)}
                  </div>
                )}
                {next && <p className="mt-3 text-sm">Entrevista agendada: <strong>{fmtDateTime(next.scheduled_at)}</strong> {next.location && `· ${next.location}`}</p>}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
