import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, BarChart3, Briefcase, ClipboardCheck, MapPin, Users, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Logo } from "@/components/move/Logo";
import hero from "@/assets/hero-move.jpg";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "A Ponto MOVE — Pessoas em movimento. Operações em resultado." },
      { name: "description", content: "Conectamos empresas e profissionais em trabalho fixo e freelancer, recrutamento, contratação e operações de campo em um único fluxo." },
      { property: "og:title", content: "A Ponto MOVE — Pessoas em movimento. Operações em resultado." },
      { property: "og:description", content: "Trabalho fixo, freelancer, recrutamento e operação de campo em um único fluxo." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Landing,
});

const PILLARS = [
  { icon: Briefcase, t: "Trabalho Fixo", d: "Vagas, triagem, entrevistas e contratação com SLA acompanhado etapa a etapa." },
  { icon: Zap, t: "Freelancer", d: "Move Freela: diárias, ações e coberturas com matching, aceite e agenda sem conflito." },
  { icon: Users, t: "Recrutamento", d: "Banco de talentos com filtros reais, segundo contato e histórico completo." },
  { icon: ClipboardCheck, t: "Gestão", d: "Documentos, experiência D+15/30/45, treinamentos e avaliações em um só lugar." },
  { icon: MapPin, t: "Operações", d: "Check-in/out, evidências por loja e atividade, regras de execução configuráveis." },
  { icon: BarChart3, t: "Indicadores", d: "Execução, produtividade, rupturas, presença e rankings em tempo real." },
];

function Landing() {
  return (
    <div className="min-h-screen bg-background">
      <section className="relative overflow-hidden bg-navy text-navy-foreground">
        <div className="absolute inset-0 bg-grid opacity-60" />
        <header className="relative mx-auto flex max-w-6xl items-center justify-between px-5 py-5">
          <Logo inverted />
          <div className="flex items-center gap-2">
            <Button asChild variant="navyOutline" size="sm"><Link to="/auth">Entrar</Link></Button>
          </div>
        </header>
        <div className="relative mx-auto grid max-w-6xl gap-10 px-5 pb-16 pt-8 lg:grid-cols-[1.1fr_1fr] lg:items-center lg:pb-24 lg:pt-14">
          <div>
            <p className="eyebrow text-signal">Fixo · Freelancer · Operação de campo</p>
            <h1 className="mt-4 text-4xl font-extrabold leading-[1.05] sm:text-5xl lg:text-6xl">
              Pessoas em movimento.<br />
              <span className="text-signal">Operações em resultado.</span>
            </h1>
            <p className="mt-5 max-w-xl text-base text-navy-foreground/80 sm:text-lg">
              A A Ponto MOVE conecta empresas e profissionais e transforma contratação, trabalho freelancer e operação em um único fluxo.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Button asChild variant="signal" size="lg" className="h-12">
                <Link to="/auth" search={{ tipo: "empresa", modo: "cadastro" }}>QUERO CONTRATAR <ArrowRight /></Link>
              </Button>
              <Button asChild variant="navyOutline" size="lg" className="h-12">
                <Link to="/auth" search={{ tipo: "profissional", modo: "cadastro" }}>QUERO TRABALHAR <ArrowRight /></Link>
              </Button>
            </div>
          </div>
          <div className="relative">
            <img src={hero} alt="Profissionais de campo trabalhando em um supermercado" width={1600} height={1104} className="aspect-[4/3] w-full rounded-xl object-cover shadow-2xl" />
            <div className="absolute -bottom-5 left-5 rounded-lg bg-card p-4 text-card-foreground shadow-card">
              <p className="eyebrow text-muted-foreground">Meta de reposição</p>
              <p className="font-display text-2xl font-bold">SLA D+0</p>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-5 py-20">
        <p className="eyebrow text-muted-foreground">Uma plataforma, seis frentes</p>
        <h2 className="mt-2 max-w-2xl text-3xl font-bold">Do primeiro contato ao resultado na gôndola.</h2>
        <div className="mt-10 grid gap-px overflow-hidden rounded-xl border bg-border sm:grid-cols-2 lg:grid-cols-3">
          {PILLARS.map(({ icon: I, t, d }) => (
            <div key={t} className="bg-card p-6">
              <I className="h-6 w-6 text-primary" />
              <h3 className="mt-4 text-lg font-semibold">{t}</h3>
              <p className="mt-1 text-sm text-muted-foreground">{d}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="border-y bg-card">
        <div className="mx-auto grid max-w-6xl gap-10 px-5 py-16 md:grid-cols-2">
          <div>
            <p className="eyebrow text-muted-foreground">Para empresas</p>
            <h3 className="mt-2 text-2xl font-bold">Publique vaga fixa, freelancer ou ambos.</h3>
            <p className="mt-2 text-muted-foreground">Acompanhe candidatos, freelas confirmados, execução por loja e custo da operação.</p>
            <Button asChild className="mt-5"><Link to="/auth" search={{ tipo: "empresa", modo: "cadastro" }}>Começar como empresa</Link></Button>
          </div>
          <div>
            <p className="eyebrow text-muted-foreground">Para profissionais</p>
            <h3 className="mt-2 text-2xl font-bold">Escolha: Fixo, Freelancer ou os dois.</h3>
            <p className="mt-2 text-muted-foreground">Veja oportunidades compatíveis com você, monte sua agenda e acompanhe seus ganhos.</p>
            <Button asChild variant="outline" className="mt-5"><Link to="/auth" search={{ tipo: "profissional", modo: "cadastro" }}>Criar meu perfil</Link></Button>
          </div>
        </div>
      </section>

      <footer className="mx-auto flex max-w-6xl flex-col gap-3 px-5 py-8 text-sm text-muted-foreground sm:flex-row sm:justify-between">
        <Logo />
        <div className="flex gap-4">
          <Link to="/privacidade" className="hover:text-foreground">Privacidade e LGPD</Link>
          <span>© {new Date().getFullYear()} A Ponto MOVE</span>
        </div>
      </footer>
    </div>
  );
}
