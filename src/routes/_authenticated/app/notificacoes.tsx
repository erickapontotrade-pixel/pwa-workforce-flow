import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { fmtDateTime, errMsg } from "@/lib/session";
import { Empty, ErrorState, Loading, PageHeader } from "@/components/move/states";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_authenticated/app/notificacoes")({ head: () => ({ meta: [{ title: "Notificações — A Ponto MOVE" }, { name: "description", content: "Avisos de candidaturas e trabalhos." }, { property: "og:title", content: "Notificações — A Ponto MOVE" }, { property: "og:description", content: "Avisos de candidaturas e trabalhos." }, { property: "og:type", content: "website" }, { name: "twitter:card", content: "summary" }] }), component: Notifs });

function Notifs() {
  const qc = useQueryClient();
  const q = useQuery({
    queryKey: ["notifs"],
    queryFn: async () => {
      const { data, error } = await supabase.from("notifications").select("*").order("created_at", { ascending: false }).limit(100);
      if (error) throw error;
      return data;
    },
  });
  async function readAll() {
    const { error } = await supabase.from("notifications").update({ read_at: new Date().toISOString() }).is("read_at", null);
    if (error) return toast.error(errMsg(error));
    toast.success("Notificações marcadas como lidas");
    qc.invalidateQueries({ queryKey: ["notifs"] });
    qc.invalidateQueries({ queryKey: ["notif-count"] });
  }
  return (
    <div>
      <PageHeader title="Notificações" desc="Avisos de candidaturas, convites e trabalhos. Email, WhatsApp e push chegam nas próximas versões."
        actions={<Button variant="outline" size="sm" onClick={readAll}>Marcar todas como lidas</Button>} />
      {q.isLoading ? <Loading /> : q.error ? <ErrorState error={q.error} /> : !q.data?.length ? <Empty title="Tudo em dia">Você não tem notificações.</Empty> : (
        <div className="divide-y rounded-lg border bg-card">
          {q.data.map((n) => (
            <div key={n.id} className={cn("flex gap-3 p-4", !n.read_at && "bg-accent/40")}>
              <span className={cn("mt-1.5 h-2 w-2 shrink-0 rounded-full", n.read_at ? "bg-transparent" : "bg-signal")} />
              <div className="flex-1">
                <p className="font-medium">{n.title}</p>
                {n.body && <p className="text-sm text-muted-foreground">{n.body}</p>}
                <p className="mt-1 text-xs text-muted-foreground">{fmtDateTime(n.created_at)}</p>
              </div>
              {n.link && <a href={n.link} className="self-center text-sm underline">Abrir</a>}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
