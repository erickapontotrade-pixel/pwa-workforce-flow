import { createFileRoute, Link } from "@tanstack/react-router";
import { Logo } from "@/components/move/Logo";

export const Route = createFileRoute("/privacidade")({
  head: () => ({
    meta: [
      { title: "Privacidade e LGPD — A Ponto MOVE" },
      { name: "description", content: "Como a A Ponto MOVE trata e protege seus dados pessoais conforme a LGPD." },
      { property: "og:title", content: "Privacidade e LGPD — A Ponto MOVE" },
      { property: "og:description", content: "Política de privacidade e direitos do titular de dados." },
    ],
  }),
  component: Privacy,
});

function Privacy() {
  return (
    <div className="mx-auto max-w-3xl px-5 py-10">
      <Link to="/"><Logo /></Link>
      <h1 className="mt-8 text-3xl font-bold">Privacidade e LGPD</h1>
      <div className="mt-6 space-y-4 text-sm leading-relaxed text-muted-foreground">
        <p>Coletamos apenas os dados necessários para conectar profissionais e empresas: identificação, contato, experiência, disponibilidade, documentos e registros de execução de trabalho.</p>
        <p><strong className="text-foreground">Acesso:</strong> empresas só veem perfis de profissionais que autorizaram participar do banco de talentos, e só veem documentos de candidatos em etapa de aprovação ou contratação com elas.</p>
        <p><strong className="text-foreground">Seus direitos:</strong> em "Perfil" você pode exportar todos os seus dados, revogar a participação no banco de talentos e solicitar exclusão da conta.</p>
        <p><strong className="text-foreground">Auditoria:</strong> ações críticas (vagas, candidaturas, contratações, documentos, check-ins e avaliações) ficam registradas com autor e data.</p>
        <p className="text-xs">Texto inicial do piloto — revise com seu jurídico antes da produção.</p>
      </div>
    </div>
  );
}
