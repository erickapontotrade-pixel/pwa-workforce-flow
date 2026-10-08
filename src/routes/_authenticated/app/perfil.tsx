import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useMe, errMsg, type Professional } from "@/lib/session";
import { MODALITY_LABEL, WEEKDAYS } from "@/lib/labels";
import { Empty, ErrorState, Loading, PageHeader } from "@/components/move/states";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import type { Database } from "@/integrations/supabase/types";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_authenticated/app/perfil")({ head: () => ({ meta: [{ title: "Meu perfil — A Ponto MOVE" }, { name: "description", content: "Dados profissionais, modalidade e disponibilidade." }, { property: "og:title", content: "Meu perfil — A Ponto MOVE" }, { property: "og:description", content: "Dados profissionais, modalidade e disponibilidade." }, { property: "og:type", content: "website" }, { name: "twitter:card", content: "summary" }] }), component: Perfil });

const FIELDS = [
  ["full_name", "Nome completo"], ["cpf", "CPF"], ["phone", "Telefone"], ["email", "Email"], ["city", "Cidade"],
  ["region", "Região/bairro"], ["address", "Endereço"], ["headline", "Função principal"], ["education", "Formação"],
] as const;
const NUMS = [["salary_expectation", "Pretensão salarial (R$)"], ["rate_hour", "Valor/hora (R$)"], ["rate_day", "Diária (R$)"], ["rate_activity", "Valor por atividade (R$)"], ["travel_radius_km", "Raio de deslocamento (km)"]] as const;

function Perfil() {
  const me = useMe();
  const qc = useQueryClient();
  const p = me.data?.professional;
  const [f, setF] = useState<Partial<Record<keyof Professional, string | number | boolean | null>>>({});
  const [busy, setBusy] = useState(false);
  useEffect(() => { if (p) setF(p); }, [p]);

  const extra = useQuery({
    queryKey: ["pro-extra", p?.id],
    enabled: !!p,
    queryFn: async () => {
      if (!p) throw new Error("Perfil profissional não encontrado");
      const [all, mine, av] = await Promise.all([
        supabase.from("skills").select("*").order("name"),
        supabase.from("professional_skills").select("skill_id").eq("professional_id", p.id),
        supabase.from("availability").select("*").eq("professional_id", p.id).order("weekday"),
      ]);
      for (const r of [all, mine, av]) if (r.error) throw r.error;
      return { skills: all.data ?? [], mine: new Set((mine.data ?? []).map((s) => s.skill_id)), avail: av.data ?? [] };
    },
  });
  const [slot, setSlot] = useState({ weekday: 1, start_time: "08:00", end_time: "17:00", kind: "livre" });

  if (me.isLoading) return <Loading />;
  if (!p) return <Empty title="Perfil profissional não encontrado" />;

  async function save() {
    if (!p) return;
    if (!String(f.full_name ?? "").trim()) { toast.error("Informe seu nome completo."); return; }
    if (!f.modality) { toast.error("Escolha a modalidade de trabalho (obrigatório)."); return; }
    setBusy(true);
    const payload: Database["public"]["Tables"]["professionals"]["Update"] = { modality: f.modality as Professional["modality"], immediate_availability: !!f.immediate_availability, has_vehicle: !!f.has_vehicle, talent_pool_consent: !!f.talent_pool_consent };
    FIELDS.forEach(([k]) => {
      if (k !== "full_name") payload[k] = String(f[k] ?? "") || null;
    });
    payload.full_name = String(f.full_name ?? "");
    NUMS.forEach(([k]) => {
      if (k !== "travel_radius_km") payload[k] = f[k] === "" || f[k] == null ? null : Number(f[k]);
    });
    payload.travel_radius_km = f.travel_radius_km === "" || f.travel_radius_km == null ? 10 : Number(f.travel_radius_km);
    if (payload.travel_radius_km == null) payload.travel_radius_km = 10;
    const { error } = await supabase.from("professionals").update(payload).eq("id", p.id);
    setBusy(false);
    if (error) { toast.error(errMsg(error)); return; }
    toast.success("Perfil salvo");
    qc.invalidateQueries({ queryKey: ["me"] });
  }
  async function toggleSkill(id: string, on: boolean) {
    if (!p) return;
    const r = on ? await supabase.from("professional_skills").delete().eq("professional_id", p.id).eq("skill_id", id)
      : await supabase.from("professional_skills").insert({ professional_id: p.id, skill_id: id });
    if (r.error) toast.error(errMsg(r.error));
    extra.refetch();
  }
  async function addSlot() {
    if (!p) return;
    if (!slot.start_time || !slot.end_time || slot.start_time >= slot.end_time) { toast.error("O horário final deve ser posterior ao inicial."); return; }
    const { error } = await supabase.from("availability").insert({ ...slot, professional_id: p.id });
    if (error) { toast.error(errMsg(error)); return; }
    toast.success("Horário adicionado");
    extra.refetch();
  }
  async function exportData() {
    if (!p) return;
    const results = await Promise.all([
      supabase.from("professionals").select("*").eq("id", p.id),
      supabase.from("professional_skills").select("*").eq("professional_id", p.id),
      supabase.from("availability").select("*").eq("professional_id", p.id),
      supabase.from("applications").select("*").eq("professional_id", p.id),
      supabase.from("freelance_applications").select("*").eq("professional_id", p.id),
      supabase.from("freelance_assignments").select("*").eq("professional_id", p.id),
      supabase.from("freelance_earnings").select("*").eq("professional_id", p.id),
      supabase.from("documents").select("*").eq("professional_id", p.id),
    ]);
    const tables = ["professionals", "professional_skills", "availability", "applications", "freelance_applications", "freelance_assignments", "freelance_earnings", "documents"];
    const out: Record<string, unknown> = {};
    for (const [index, r] of results.entries()) {
      if (r.error) { toast.error(errMsg(r.error)); return; }
      const table = tables[index];
      if (table) out[table] = r.data;
    }
    const a = document.createElement("a");
    a.href = URL.createObjectURL(new Blob([JSON.stringify(out, null, 2)], { type: "application/json" }));
    a.download = "meus-dados-aponto-move.json";
    a.click();
    URL.revokeObjectURL(a.href);
  }

  return (
    <div className="space-y-8">
      <PageHeader eyebrow="Cadastro" title="Meu perfil" actions={<Button variant="outline" size="sm" onClick={exportData}>Exportar meus dados (LGPD)</Button>} />
      <section className="rounded-lg border bg-card p-5 shadow-card">
        <Label>Modalidade de trabalho *</Label>
        <div className="mt-2 grid gap-2 sm:grid-cols-3">
          {(Object.keys(MODALITY_LABEL) as (keyof typeof MODALITY_LABEL)[]).map((m) => (
            <button key={m} type="button" onClick={() => setF({ ...f, modality: m })}
              className={cn("rounded-md border p-3 text-sm font-medium", f.modality === m ? "border-primary bg-primary text-primary-foreground" : "hover:border-primary/40")}>{MODALITY_LABEL[m]}</button>
          ))}
        </div>
      </section>
      <section className="grid gap-4 rounded-lg border bg-card p-5 shadow-card sm:grid-cols-2">
        {FIELDS.map(([k, l]) => <div key={k} className="space-y-1.5"><Label>{l}</Label><Input value={String(f[k] ?? "")} maxLength={200} onChange={(e) => setF({ ...f, [k]: e.target.value })} /></div>)}
        {NUMS.map(([k, l]) => <div key={k} className="space-y-1.5"><Label>{l}</Label><Input type="number" min={0} value={String(f[k] ?? "")} onChange={(e) => setF({ ...f, [k]: e.target.value })} /></div>)}
        <label className="flex items-center gap-2 text-sm"><Switch checked={!!f.immediate_availability} onCheckedChange={(v) => setF({ ...f, immediate_availability: v })} />Disponibilidade imediata</label>
        <label className="flex items-center gap-2 text-sm"><Switch checked={!!f.has_vehicle} onCheckedChange={(v) => setF({ ...f, has_vehicle: v })} />Tenho veículo</label>
        <label className="flex items-center gap-2 text-sm sm:col-span-2"><Switch checked={!!f.talent_pool_consent} onCheckedChange={(v) => setF({ ...f, talent_pool_consent: v })} />Autorizo aparecer no banco de talentos das empresas</label>
        <div className="sm:col-span-2"><Button onClick={save} disabled={busy}>Salvar perfil</Button></div>
      </section>
      {extra.isLoading && <Loading />}
      {extra.error && <ErrorState error={extra.error} retry={() => extra.refetch()} />}
      <section className="rounded-lg border bg-card p-5 shadow-card">
        <h2 className="font-semibold">Habilidades</h2>
        <div className="mt-3 flex flex-wrap gap-2">
          {extra.data?.skills.map((s) => {
            const on = extra.data?.mine.has(s.id) ?? false;
            return <button key={s.id} onClick={() => toggleSkill(s.id, on)}><Badge variant={on ? "signal" : "outline"} className="cursor-pointer py-1">{s.name}</Badge></button>;
          })}
        </div>
      </section>
      <section className="rounded-lg border bg-card p-5 shadow-card">
        <h2 className="font-semibold">Agenda de disponibilidade</h2>
        <p className="text-xs text-muted-foreground">"Jornada fixa" bloqueia freelas no mesmo horário. Horários sobrepostos são recusados.</p>
        <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-5">
          <select className="h-9 rounded-md border bg-background px-2 text-sm" value={slot.weekday} onChange={(e) => setSlot({ ...slot, weekday: Number(e.target.value) })}>{WEEKDAYS.map((d, i) => <option key={d} value={i}>{d}</option>)}</select>
          <Input type="time" value={slot.start_time} onChange={(e) => setSlot({ ...slot, start_time: e.target.value })} />
          <Input type="time" value={slot.end_time} onChange={(e) => setSlot({ ...slot, end_time: e.target.value })} />
          <select className="h-9 rounded-md border bg-background px-2 text-sm" value={slot.kind} onChange={(e) => setSlot({ ...slot, kind: e.target.value })}><option value="livre">Livre p/ freela</option><option value="fixo">Jornada fixa</option></select>
          <Button variant="outline" onClick={addSlot}>Adicionar</Button>
        </div>
        <div className="mt-3 space-y-1">
          {extra.data?.avail.map((a) => (
            <div key={a.id} className="flex items-center justify-between rounded-md bg-muted px-3 py-2 text-sm">
              <span>{WEEKDAYS[a.weekday]} {a.start_time.slice(0, 5)}–{a.end_time.slice(0, 5)} · {a.kind === "fixo" ? "Jornada fixa" : "Livre"}</span>
              <button className="text-xs text-destructive" onClick={async () => { const { error } = await supabase.from("availability").delete().eq("id", a.id); if (error) { toast.error(errMsg(error)); return; } toast.success("Horário removido"); extra.refetch(); }}>Remover</button>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
