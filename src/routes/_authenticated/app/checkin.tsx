import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";
import { Camera, Loader2, LogIn, LogOut, MapPin } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useMe, errMsg, fmtDateTime } from "@/lib/session";
import { ASSIGNMENT_LABEL, EXECUTION_RESULTS } from "@/lib/labels";
import { Empty, ErrorState, Loading, PageHeader } from "@/components/move/states";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export const Route = createFileRoute("/_authenticated/app/checkin")({ head: () => ({ meta: [{ title: "Agenda e check-in — A Ponto MOVE" }, { name: "description", content: "Convites, presença, execução e evidências." }, { property: "og:title", content: "Agenda e check-in — A Ponto MOVE" }, { property: "og:description", content: "Convites, presença, execução e evidências." }, { property: "og:type", content: "website" }, { name: "twitter:card", content: "summary" }] }), component: Checkin });

function getPos(): Promise<{ lat: number | null; lng: number | null }> {
  return new Promise((res) => {
    if (!navigator.geolocation) return res({ lat: null, lng: null });
    navigator.geolocation.getCurrentPosition(
      (p) => res({ lat: p.coords.latitude, lng: p.coords.longitude }),
      () => res({ lat: null, lng: null }),
      { timeout: 8000, enableHighAccuracy: true },
    );
  });
}

function Checkin() {
  const p = useMe().data?.professional;
  const q = useQuery({
    queryKey: ["my-assignments", p?.id],
    enabled: !!p,
    queryFn: async () => {
      if (!p) throw new Error("Perfil profissional não encontrado");
      const { data, error } = await supabase.from("freelance_assignments")
        .select("*, freelance_opportunities(title, activity_type, location_name, address, city), freelance_evidence(id, kind, sku)")
        .eq("professional_id", p.id).order("starts_at", { ascending: true });
      if (error) throw error;
      return data;
    },
  });
  const active = (q.data ?? []).filter((a) => ["convidado", "reservado", "em_execucao", "aguardando_aprovacao"].includes(a.status));
  const past = (q.data ?? []).filter((a) => !active.includes(a));

  return (
    <div>
      <PageHeader eyebrow="Move Freela" title="Agenda e check-in" desc="Aceite convites, registre presença e envie evidências." />
      {q.isLoading ? <Loading /> : q.error ? <ErrorState error={q.error} retry={() => q.refetch()} /> : !q.data?.length ? (
        <Empty title="Sem trabalhos na agenda">Demonstre interesse em oportunidades — quando a empresa te selecionar, o convite aparece aqui.</Empty>
      ) : (
        <div className="space-y-4">
          {active.map((a) => <AssignmentCard key={a.id} a={a} />)}
          {past.length > 0 && (
            <>
              <h2 className="pt-4 text-lg font-semibold">Histórico</h2>
              {past.map((a) => (
                <div key={a.id} className="flex items-center justify-between rounded-lg border bg-card p-4 text-sm">
                  <span>{a.freelance_opportunities?.title} · {fmtDateTime(a.starts_at)}</span>
                  <Badge variant={a.status === "aprovado" ? "success" : "muted"}>{ASSIGNMENT_LABEL[a.status]}</Badge>
                </div>
              ))}
            </>
          )}
        </div>
      )}
    </div>
  );
}

type A = NonNullable<ReturnType<typeof useQuery<any>>["data"]>;

function AssignmentCard({ a }: { a: A }) {
  const qc = useQueryClient();
  const { data: me } = useMe();
  const [result, setResult] = useState("");
  const [report, setReport] = useState("");
  const [kind, setKind] = useState("antes");
  const [sku, setSku] = useState("");
  const [uploading, setUploading] = useState(false);
  const refresh = () => qc.invalidateQueries({ queryKey: ["my-assignments"] });

  const act = useMutation({
    mutationFn: async (action: "aceitar" | "recusar" | "checkin" | "checkout") => {
      if (action === "aceitar" || action === "recusar") {
        const { error } = await supabase.rpc("freela_respond", { _assignment_id: a.id, _accept: action === "aceitar" });
        if (error) throw error;
        return;
      }
      const pos = await getPos();
      if (action === "checkin") {
        const { error } = await supabase.rpc("freela_checkin", { _assignment_id: a.id, _lat: pos.lat as number, _lng: pos.lng as number });
        if (error) throw error;
      } else {
        if (!result) throw new Error("Informe o resultado da execução.");
        const { error } = await supabase.rpc("freela_checkout", { _assignment_id: a.id, _lat: pos.lat as number, _lng: pos.lng as number, _result: result, _report: report });
        if (error) throw error;
      }
    },
    onSuccess: (_, v) => { toast.success({ aceitar: "Trabalho reservado na sua agenda!", recusar: "Convite recusado", checkin: "Check-in registrado", checkout: "Check-out enviado para aprovação" }[v]); refresh(); },
    onError: (e) => toast.error(errMsg(e)),
  });

  async function upload(file: File) {
    if (!me) return;
    if (file.size > 10 * 1024 * 1024) return toast.error("Arquivo acima de 10MB");
    setUploading(true);
    try {
      const path = `${me.user.id}/${a.id}/${Date.now()}-${file.name.replace(/[^\w.-]/g, "_")}`;
      const up = await supabase.storage.from("move-files").upload(path, file);
      if (up.error) throw up.error;
      const { error } = await supabase.from("freelance_evidence").insert({ assignment_id: a.id, kind, file_path: path, sku: sku || null, created_by: me.user.id });
      if (error) throw error;
      toast.success("Evidência enviada");
      setSku("");
      refresh();
    } catch (e) { toast.error(errMsg(e)); } finally { setUploading(false); }
  }

  const o = a.freelance_opportunities;
  return (
    <div className="rounded-lg border bg-card p-5 shadow-card">
      <div className="flex items-start justify-between gap-3">
        <div>
          <Badge variant="muted">{o?.activity_type}</Badge>
          <h3 className="mt-2 font-semibold">{o?.title}</h3>
          <p className="flex items-center gap-1 text-sm text-muted-foreground"><MapPin className="h-3.5 w-3.5" />{o?.location_name} {o?.address && `· ${o.address}`}</p>
          <p className="text-sm text-muted-foreground">{fmtDateTime(a.starts_at)} até {fmtDateTime(a.ends_at)}</p>
        </div>
        <Badge variant={a.status === "convidado" ? "warning" : a.status === "em_execucao" ? "signal" : "muted"}>{ASSIGNMENT_LABEL[a.status]}</Badge>
      </div>

      {a.status === "convidado" && (
        <div className="mt-4 flex gap-2">
          <Button variant="signal" disabled={act.isPending} onClick={() => act.mutate("aceitar")}>Aceitar e reservar</Button>
          <Button variant="ghost" disabled={act.isPending} onClick={() => act.mutate("recusar")}>Recusar</Button>
        </div>
      )}
      {a.status === "reservado" && (
        <Button className="mt-4 w-full sm:w-auto" disabled={act.isPending} onClick={() => act.mutate("checkin")}>
          {act.isPending ? <Loader2 className="animate-spin" /> : <LogIn />} Fazer check-in agora
        </Button>
      )}
      {a.status === "em_execucao" && (
        <div className="mt-4 space-y-4 border-t pt-4">
          <p className="text-xs text-muted-foreground">Check-in às {fmtDateTime(a.checkin_at)}{a.checkin_lat ? " · localização registrada" : " · sem localização"}</p>
          <div>
            <p className="text-sm font-medium">Evidências ({a.freelance_evidence?.length ?? 0})</p>
            <p className="text-xs text-muted-foreground">Produtos na mesma gôndola: 1 foto geral da categoria. Produtos separados: 1 foto por SKU.</p>
            <div className="mt-2 grid gap-2 sm:grid-cols-[160px_1fr_auto]">
              <Select value={kind} onValueChange={setKind}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {["antes", "depois", "loja", "exposicao", "produto", "atividade", "comprovante"].map((k) => <SelectItem key={k} value={k}>{k}</SelectItem>)}
                </SelectContent>
              </Select>
              <Input placeholder="SKU (opcional)" value={sku} onChange={(e) => setSku(e.target.value)} />
              <Button asChild variant="outline" disabled={uploading}>
                <label className="cursor-pointer">
                  {uploading ? <Loader2 className="animate-spin" /> : <Camera />} Foto
                  <input type="file" accept="image/*,application/pdf" capture="environment" className="hidden" onChange={(e) => { const f = e.target.files?.[0]; if (f) upload(f); e.target.value = ""; }} />
                </label>
              </Button>
            </div>
            {!!a.freelance_evidence?.length && (
              <div className="mt-2 flex flex-wrap gap-1.5">{a.freelance_evidence.map((ev: { id: string; kind: string; sku: string | null }) => <Badge key={ev.id} variant="muted">{ev.kind}{ev.sku ? ` · ${ev.sku}` : ""}</Badge>)}</div>
            )}
          </div>
          <div className="space-y-1.5">
            <Label>Resultado da execução</Label>
            <Select value={result} onValueChange={setResult}>
              <SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
              <SelectContent>{EXECUTION_RESULTS.map((r) => <SelectItem key={r.v} value={r.v}>{r.l}</SelectItem>)}</SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5"><Label>Relato (opcional)</Label><Textarea value={report} onChange={(e) => setReport(e.target.value)} maxLength={1000} /></div>
          <Button disabled={act.isPending} onClick={() => act.mutate("checkout")}><LogOut /> Fazer check-out</Button>
        </div>
      )}
      {a.status === "aguardando_aprovacao" && <p className="mt-3 text-sm text-muted-foreground">Check-out às {fmtDateTime(a.checkout_at)}. Aguardando aprovação da empresa.</p>}
    </div>
  );
}
