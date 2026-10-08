import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";
import { Briefcase, MapPin } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useMe, brl, errMsg, fmtDate } from "@/lib/session";
import { Empty, ErrorState, Loading, PageHeader } from "@/components/move/states";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";

export const Route = createFileRoute("/_authenticated/app/vagas")({ head: () => ({ meta: [{ title: "Vagas — A Ponto MOVE" }, { name: "description", content: "Oportunidades de trabalho fixo." }, { property: "og:title", content: "Vagas — A Ponto MOVE" }, { property: "og:description", content: "Oportunidades de trabalho fixo." }, { property: "og:type", content: "website" }, { name: "twitter:card", content: "summary" }] }), component: Vagas });

function Vagas() {
  const me = useMe();
  const p = me.data?.professional;
  const qc = useQueryClient();
  const [q, setQ] = useState("");
  const list = useQuery({
    queryKey: ["jobs-open"],
    queryFn: async () => {
      const { data, error } = await supabase.from("jobs").select("*, companies(name)").eq("status", "publicada").order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });
  const mine = useQuery({
    queryKey: ["my-apps", p?.id],
    enabled: !!p,
    queryFn: async () => {
      if (!p) throw new Error("Perfil profissional não encontrado");
      const { data, error } = await supabase.from("applications").select("job_id").eq("professional_id", p.id);
      if (error) throw error;
      return data ?? [];
    },
  });
  const apply = useMutation({
    mutationFn: async (job_id: string) => {
      if (!p?.modality) throw new Error("Defina sua modalidade de trabalho no perfil antes de se candidatar.");
      if (p.modality === "freelancer") throw new Error("Sua modalidade é só Freelancer. Altere para Fixo ou Fixo + Freelancer no perfil.");
      const { error } = await supabase.from("applications").insert({ job_id, professional_id: p.id });
      if (error) throw error;
    },
    onSuccess: () => { toast.success("Candidatura enviada!"); qc.invalidateQueries({ queryKey: ["my-apps"] }); },
    onError: (e) => toast.error(errMsg(e)),
  });
  const applied = new Set((mine.data ?? []).map((a) => a.job_id));
  const rows = (list.data ?? []).filter((j) => !q || `${j.title} ${j.city} ${j.description}`.toLowerCase().includes(q.toLowerCase()));

  return (
    <div>
      <PageHeader eyebrow="Trabalho fixo" title="Vagas" desc="Vagas abertas por empresas na plataforma." />
      <Input placeholder="Buscar por cargo, cidade..." value={q} onChange={(e) => setQ(e.target.value)} className="mb-4 max-w-md" />
      {list.isLoading ? <Loading /> : list.error ? <ErrorState error={list.error} retry={() => list.refetch()} /> : rows.length === 0 ? (
        <Empty title="Nenhuma vaga aberta no momento">Novas vagas aparecem aqui assim que as empresas publicarem.</Empty>
      ) : (
        <div className="grid gap-3 md:grid-cols-2">
          {rows.map((j) => (
            <div key={j.id} className="flex flex-col rounded-lg border bg-card p-5 shadow-card">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h3 className="font-semibold">{j.title}</h3>
                  <p className="text-sm text-muted-foreground">{j.companies?.name}</p>
                </div>
                <Briefcase className="h-5 w-5 text-muted-foreground" />
              </div>
              <p className="mt-3 line-clamp-3 text-sm text-muted-foreground">{j.description}</p>
              <div className="mt-3 flex flex-wrap gap-2 text-xs">
                {j.city && <Badge variant="muted"><MapPin className="mr-1 h-3 w-3" />{j.city}</Badge>}
                {j.salary && <Badge variant="muted">{brl(j.salary)}</Badge>}
                {j.schedule && <Badge variant="muted">{j.schedule}</Badge>}
                {j.start_date && <Badge variant="muted">Início {fmtDate(j.start_date)}</Badge>}
              </div>
              {j.benefits && <p className="mt-2 text-xs text-muted-foreground">Benefícios: {j.benefits}</p>}
              <div className="mt-4">
                {applied.has(j.id) ? <Badge variant="success">Candidatura enviada</Badge> : (
                  <Button size="sm" onClick={() => apply.mutate(j.id)} disabled={apply.isPending || !p}>Candidatar-me</Button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
