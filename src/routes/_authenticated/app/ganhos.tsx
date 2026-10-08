import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useMe, brl, fmtDate, downloadCSV } from "@/lib/session";
import { Empty, ErrorState, Loading, PageHeader, Stat } from "@/components/move/states";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

export const Route = createFileRoute("/_authenticated/app/ganhos")({ component: Ganhos });

function Ganhos() {
  const p = useMe().data?.professional;
  const q = useQuery({
    queryKey: ["earnings", p?.id],
    enabled: !!p,
    queryFn: async () => {
      const { data, error } = await supabase.from("freelance_earnings").select("*, companies(name)").eq("professional_id", p!.id).order("reference_date", { ascending: false });
      if (error) throw error;
      return data;
    },
  });
  const sum = (st: string[]) => (q.data ?? []).filter((e) => st.includes(e.status)).reduce((s, e) => s + Number(e.amount), 0);
  return (
    <div>
      <PageHeader eyebrow="Move Freela" title="Meus ganhos" desc="Valores de referência. Pagamentos são realizados fora da plataforma nesta versão."
        actions={<Button variant="outline" size="sm" disabled={!q.data?.length} onClick={() => downloadCSV("meus-ganhos.csv", (q.data ?? []).map((e) => ({ data: e.reference_date, empresa: e.companies?.name, atividade: e.activity_type, valor: e.amount, status: e.status })))}>Exportar CSV</Button>} />
      <div className="mb-6 grid grid-cols-2 gap-3 lg:grid-cols-4">
        <Stat label="Previstos" value={brl(sum(["previsto"]))} />
        <Stat label="Aprovados" value={brl(sum(["aprovado"]))} />
        <Stat label="Pagos" value={brl(sum(["pago"]))} />
        <Stat label="Pendentes" value={brl(sum(["pendente"]))} />
      </div>
      {q.isLoading ? <Loading /> : q.error ? <ErrorState error={q.error} /> : !q.data?.length ? <Empty title="Nenhum ganho ainda">Aceite um trabalho freelancer para ver seus ganhos previstos.</Empty> : (
        <div className="overflow-x-auto rounded-lg border bg-card">
          <Table>
            <TableHeader><TableRow><TableHead>Data</TableHead><TableHead>Empresa</TableHead><TableHead>Atividade</TableHead><TableHead>Valor</TableHead><TableHead>Status</TableHead></TableRow></TableHeader>
            <TableBody>{q.data.map((e) => (
              <TableRow key={e.id}><TableCell>{fmtDate(e.reference_date)}</TableCell><TableCell>{e.companies?.name}</TableCell><TableCell>{e.activity_type}</TableCell><TableCell>{brl(e.amount)}</TableCell><TableCell><Badge variant={e.status === "aprovado" || e.status === "pago" ? "success" : e.status === "cancelado" ? "destructive" : "muted"}>{e.status}</Badge></TableCell></TableRow>
            ))}</TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}
