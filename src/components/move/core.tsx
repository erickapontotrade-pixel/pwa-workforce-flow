import { useState, type ReactNode } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useMe, type Company } from "@/lib/session";
import { Empty, ErrorState, Loading } from "./states";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";

export function coreHead(title: string, description: string) {
  return { meta: [{ title: `${title} — A Ponto MOVE` }, { name: "description", content: description }, { property: "og:title", content: `${title} — A Ponto MOVE` }, { property: "og:description", content: description }, { property: "og:type", content: "website" }, { name: "twitter:card", content: "summary" }] };
}

export function CompanyScope({ children }: { children: (company: Company) => ReactNode }) {
  const me = useMe();
  const [id, setId] = useState("");
  const q = useQuery({ queryKey: ["scope-companies", me.data?.user.id], enabled: !!me.data, queryFn: async () => {
    const r = await supabase.from("companies").select("*").order("name");
    if (r.error) throw r.error;
    return r.data;
  } });
  if (me.isLoading || q.isLoading) return <Loading />;
  if (me.error || q.error) return <ErrorState error={me.error || q.error} retry={() => q.refetch()} />;
  if (!me.data?.isStaff && !me.data?.companies.length) return <Empty title="Área restrita a empresas e A Ponto" />;
  const companies = q.data ?? [];
  const company = companies.find(c => c.id === id) ?? companies[0];
  if (!company) return <Empty title="Cadastre uma empresa para continuar" />;
  return <div className="space-y-5"><div className="max-w-sm space-y-1"><Label htmlFor="company-scope">Empresa</Label><select id="company-scope" className="h-10 w-full rounded-md border bg-card px-3 text-sm" value={company.id} onChange={e => setId(e.target.value)}>{companies.map(c => <option key={c.id} value={c.id}>{c.name}{!c.active ? " · Inativa" : ""}</option>)}</select></div><div key={company.id}>{children(company)}</div></div>;
}

export type Field = { key: string; label: string; type?: string; required?: boolean; min?: number; options?: { value: string; label: string }[] };
export function RecordForm({ title, fields, initial, onSave, onClose }: { title: string; fields: Field[]; initial: Record<string, unknown>; onSave: (values: Record<string, string>) => Promise<void>; onClose: () => void }) {
  const [values, setValues] = useState<Record<string, string>>(() => Object.fromEntries(fields.map(f => [f.key, String(initial[f.key] ?? "")])));
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<unknown>(null);
  return <Dialog open onOpenChange={open => { if (!open && !busy) onClose(); }}><DialogContent className="max-h-[90dvh] overflow-y-auto sm:max-w-2xl"><DialogTitle>{title}</DialogTitle><form className="grid gap-4 sm:grid-cols-2" onSubmit={async e => { e.preventDefault(); setBusy(true); setError(null); try { await onSave(values); onClose(); } catch (err) { setError(err); } finally { setBusy(false); } }}>
    {fields.map(f => <div key={f.key} className={f.type === "textarea" ? "space-y-1.5 sm:col-span-2" : "space-y-1.5"}><Label htmlFor={`field-${f.key}`}>{f.label}{f.required ? " *" : ""}</Label>{f.options ? <select id={`field-${f.key}`} required={f.required} value={values[f.key]} onChange={e => setValues({ ...values, [f.key]: e.target.value })} className="h-10 w-full rounded-md border bg-card px-3 text-sm"><option value="">Selecione</option>{f.options.map(o => <option value={o.value} key={o.value}>{o.label}</option>)}</select> : f.type === "textarea" ? <Textarea id={`field-${f.key}`} value={values[f.key]} required={f.required} onChange={e => setValues({ ...values, [f.key]: e.target.value })} /> : <Input id={`field-${f.key}`} type={f.type ?? "text"} min={f.min} step={f.type === "number" ? "any" : undefined} required={f.required} value={values[f.key]} onChange={e => setValues({ ...values, [f.key]: e.target.value })} />}</div>)}
    {error ? <div className="sm:col-span-2"><ErrorState error={error} /></div> : null}<div className="flex justify-end gap-2 sm:col-span-2"><Button type="button" variant="outline" disabled={busy} onClick={onClose}>Cancelar</Button><Button disabled={busy} type="submit">{busy ? "Salvando…" : "Salvar"}</Button></div>
  </form></DialogContent></Dialog>;
}