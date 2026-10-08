import { createFileRoute, Link, Outlet, useNavigate, useRouterState } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";
import {
  Bell, Briefcase, Building2, CalendarCheck, Home, LayoutDashboard, LogOut, User, Wallet, Zap, ListChecks,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useMe, errMsg } from "@/lib/session";
import { Logo } from "@/components/move/Logo";
import { Loading, ErrorState } from "@/components/move/states";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_authenticated/app")({
  head: () => ({ meta: [{ title: "Painel — A Ponto MOVE" }, { name: "robots", content: "noindex" }] }),
  component: AppShell,
});

const PRO_NAV = [
  { to: "/app", label: "Início", icon: Home, exact: true },
  { to: "/app/vagas", label: "Vagas", icon: Briefcase },
  { to: "/app/oportunidades", label: "Oportunidades", icon: Zap },
  { to: "/app/checkin", label: "Check-in", icon: CalendarCheck },
  { to: "/app/perfil", label: "Perfil", icon: User },
] as const;
const PRO_EXTRA = [
  { to: "/app/candidaturas", label: "Candidaturas", icon: ListChecks },
  { to: "/app/ganhos", label: "Meus ganhos", icon: Wallet },
] as const;
const CO_NAV = [
  { to: "/app/empresa", label: "Dashboard", icon: LayoutDashboard, exact: true },
  { to: "/app/empresa/vagas", label: "Gestão de vagas", icon: Briefcase },
  { to: "/app/empresa/recrutamento", label: "Recrutamento", icon: ListChecks },
  { to: "/app/empresa/freela", label: "MOVE FREELA", icon: Zap },
  { to: "/app/empresa/talentos", label: "Banco de talentos", icon: User },
  { to: "/app/empresa/empresas", label: "Empresas", icon: Building2 },
  { to: "/app/empresa/lojas", label: "Lojas", icon: Building2 },
  { to: "/app/empresa/relatorios", label: "Relatórios", icon: ListChecks },
] as const;

function AppShell() {
  const me = useMe();
  const [companyForm, setCompanyForm] = useState(false);
  const qc = useQueryClient();
  const navigate = useNavigate();
  const path = useRouterState({ select: (s) => s.location.pathname });

  const unread = useQuery({
    queryKey: ["notif-count"],
    enabled: !!me.data,
    refetchInterval: 60_000,
    queryFn: async () => {
      const { count, error } = await supabase.from("notifications").select("id", { count: "exact", head: true }).is("read_at", null);
      if (error) throw error;
      return count ?? 0;
    },
  });

  if (me.isLoading) return <Loading />;
  if (me.error) return <div className="p-6"><ErrorState error={me.error} retry={() => me.refetch()} /></div>;
  if (!me.data) return <Loading />;

  const { professional, company } = me.data;
  if (!professional && !company && !me.data.isStaff) return <Onboarding />;

  async function signOut() {
    await qc.cancelQueries();
    qc.clear();
    const { error } = await supabase.auth.signOut();
    if (error) { toast.error(errMsg(error)); return; }
    navigate({ to: "/auth", replace: true });
  }

  const isActive = (to: string, exact?: boolean) => (exact ? path === to : path === to || path.startsWith(to + "/"));
  const inCompany = path.startsWith("/app/empresa");

  return (
    <div className="min-h-screen bg-background lg:flex">
      <aside className="hidden w-64 shrink-0 flex-col bg-sidebar text-sidebar-foreground lg:flex lg:sticky lg:top-0 lg:h-screen">
        <div className="px-5 py-5"><Logo inverted /></div>
        <nav className="flex-1 space-y-6 overflow-y-auto px-3 pb-4">
          {professional && (
            <div>
              <p className="eyebrow px-3 pb-2 text-sidebar-foreground/50">Profissional</p>
              {[...PRO_NAV, ...PRO_EXTRA].map((n) => (
                <Link key={n.to} to={n.to} className={cn("flex items-center gap-3 rounded-md px-3 py-2 text-sm", isActive(n.to, "exact" in n && n.exact) ? "bg-sidebar-accent text-sidebar-accent-foreground signal-bar" : "hover:bg-sidebar-accent/60")}>
                  <n.icon className="h-4 w-4" /> {n.label}
                </Link>
              ))}
            </div>
          )}
          {(company || me.data.isStaff) && (
            <div>
              <p className="eyebrow px-3 pb-2 text-sidebar-foreground/50">{company?.name ?? "A Ponto"}</p>
              {CO_NAV.map((n) => (
                <Link key={n.to} to={n.to} className={cn("flex items-center gap-3 rounded-md px-3 py-2 text-sm", isActive(n.to, "exact" in n && n.exact) ? "bg-sidebar-accent text-sidebar-accent-foreground signal-bar" : "hover:bg-sidebar-accent/60")}>
                  <n.icon className="h-4 w-4" /> {n.label}
                </Link>
              ))}
            </div>
          )}
          {!company && (
            <Button variant="ghost" size="sm" onClick={() => setCompanyForm(true)}>+ Cadastrar uma empresa</Button>
          )}
        </nav>
        <div className="border-t border-sidebar-border p-3">
          <p className="truncate px-3 text-xs text-sidebar-foreground/60">{me.data.user.email}</p>
          <button onClick={signOut} className="mt-1 flex w-full items-center gap-3 rounded-md px-3 py-2 text-sm hover:bg-sidebar-accent/60"><LogOut className="h-4 w-4" /> Sair</button>
        </div>
      </aside>

      <Dialog open={companyForm} onOpenChange={setCompanyForm}><DialogContent><DialogTitle>Cadastrar empresa</DialogTitle><Onboarding companyOnly onComplete={() => setCompanyForm(false)} /></DialogContent></Dialog>
      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-30 flex h-14 items-center justify-between border-b bg-card/95 px-4 backdrop-blur lg:px-8">
          <div className="lg:hidden"><Logo /></div>
          <div className="hidden text-sm text-muted-foreground lg:block">{inCompany ? "Área da empresa" : "Área do profissional"}</div>
          <div className="flex items-center gap-1">
            {professional && company && (
              <Button variant="ghost" size="sm" asChild>
                <Link to={inCompany ? "/app" : "/app/empresa"}>{inCompany ? "Ver como profissional" : "Ver como empresa"}</Link>
              </Button>
            )}
            <Button variant="ghost" size="icon" asChild aria-label="Notificações">
              <Link to="/app/notificacoes" className="relative">
                <Bell />
                {!!unread.data && <span className="absolute right-1 top-1 h-2 w-2 rounded-full bg-signal" />}
              </Link>
            </Button>
            <Button variant="ghost" size="icon" className="lg:hidden" onClick={signOut} aria-label="Sair"><LogOut /></Button>
          </div>
        </header>
        {(company || me.data.isStaff) && (inCompany || !professional) && (
          <nav className="flex gap-1 overflow-x-auto border-b bg-card px-3 py-2 lg:hidden">
            {CO_NAV.map((n) => (
              <Link key={n.to} to={n.to} className={cn("whitespace-nowrap rounded-md px-3 py-1.5 text-xs font-medium", isActive(n.to, "exact" in n && n.exact) ? "bg-primary text-primary-foreground" : "text-muted-foreground")}>{n.label}</Link>
            ))}
          </nav>
        )}
        <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-6 pb-28 lg:px-8 lg:pb-10">
          <Outlet />
        </main>
      </div>

      {professional && !inCompany && (
        <nav className="fixed inset-x-0 bottom-0 z-40 grid grid-cols-5 border-t bg-card pb-[env(safe-area-inset-bottom)] lg:hidden">
          {PRO_NAV.map((n) => (
            <Link key={n.to} to={n.to} className={cn("flex flex-col items-center gap-1 py-2.5 text-[11px] font-medium", isActive(n.to, "exact" in n && n.exact) ? "text-primary" : "text-muted-foreground")}>
              <n.icon className={cn("h-5 w-5", isActive(n.to, "exact" in n && n.exact) && "text-primary")} />
              {n.label}
            </Link>
          ))}
        </nav>
      )}
    </div>
  );
}

function Onboarding({ companyOnly = false, onComplete }: { companyOnly?: boolean; onComplete?: () => void }) {
  const qc = useQueryClient();
  const navigate = useNavigate();
  const [co, setCo] = useState({ name: "", cnpj: "", city: "", segment: "" });
  const [busy, setBusy] = useState(false);

  async function becomePro() {
    setBusy(true);
    const { error } = await supabase.rpc("become_professional");
    setBusy(false);
    if (error) { toast.error(errMsg(error)); return; }
    await qc.invalidateQueries({ queryKey: ["me"] });
    navigate({ to: "/app/perfil" });
  }
  async function createCo(e: React.FormEvent) {
    e.preventDefault();
    if (co.name.trim().length < 2) { toast.error("Informe o nome da empresa"); return; }
    setBusy(true);
    const { error } = await supabase.rpc("create_company", { _name: co.name.trim(), _cnpj: co.cnpj, _city: co.city, _segment: co.segment });
    setBusy(false);
    if (error) { toast.error(errMsg(error)); return; }
    toast.success("Empresa criada");
    await qc.invalidateQueries({ queryKey: ["me"] });
    onComplete?.();
    navigate({ to: "/app/empresa" });
  }

  return (
    <div className={companyOnly ? "w-full" : "mx-auto max-w-4xl px-5 py-12"}>
      {!companyOnly && <Logo />}
      {!companyOnly && <h1 className="mt-8 text-3xl font-bold">Como você vai usar a A Ponto MOVE?</h1>}
      <div className={companyOnly ? "space-y-4" : "mt-8 grid gap-5 md:grid-cols-2"}>
        {!companyOnly && <div className="rounded-xl border bg-card p-6 shadow-card">
          <User className="h-6 w-6 text-primary" />
          <h2 className="mt-3 text-lg font-semibold">Quero trabalhar</h2>
          <p className="mt-1 text-sm text-muted-foreground">Crie seu perfil profissional e escolha Fixo, Freelancer ou os dois.</p>
          <Button className="mt-5" onClick={becomePro} disabled={busy}>Criar perfil profissional</Button>
        </div>}
        <form onSubmit={createCo} className="space-y-3 rounded-xl border bg-card p-6 shadow-card">
          <Building2 className="h-6 w-6 text-primary" />
          <h2 className="text-lg font-semibold">Quero contratar</h2>
          <div className="space-y-1.5"><Label>Nome da empresa *</Label><Input value={co.name} onChange={(e) => setCo({ ...co, name: e.target.value })} /></div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5"><Label>CNPJ</Label><Input value={co.cnpj} onChange={(e) => setCo({ ...co, cnpj: e.target.value })} /></div>
            <div className="space-y-1.5"><Label>Cidade</Label><Input value={co.city} onChange={(e) => setCo({ ...co, city: e.target.value })} /></div>
          </div>
          <div className="space-y-1.5"><Label>Segmento</Label><Input value={co.segment} placeholder="Ex.: Indústria de alimentos" onChange={(e) => setCo({ ...co, segment: e.target.value })} /></div>
          <Button type="submit" variant="signal" disabled={busy}>Criar empresa</Button>
        </form>
      </div>
    </div>
  );
}
