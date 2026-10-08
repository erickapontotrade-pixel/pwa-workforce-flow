# Ponto Connect

CONSTRUA AGORA O PRODUTO COMPLETO "A PONTO MOVE" — versão inicial de produção/piloto.

IDENTIDADE
Nome: A Ponto MOVE
Slogan: Pessoas em movimento. Operações em resultado.
Produto SaaS multiempresa, mobile-first, para conectar empresas e profissionais em TRABALHO FIXO e FREELANCER, além de recrutamento, contratação e operações de campo. Não copie visual, textos, layouts ou identidade de terceiros.

STACK
React + TypeScript + Tailwind + shadcn/ui + Supabase/PostgreSQL/Auth/Storage + RLS + biblioteca de gráficos. PWA-ready. Arquitetura modular e escalável. Evite integrações pagas no MVP.

REGRA PRINCIPAL
Antes de implementar, analise o projeto atual e preserve tudo que já existir. Não apague funcionalidades, não duplique tabelas/componentes, não faça rebuild desnecessário. Toda tela deve ser funcional, responsiva, com loading, empty state, erro, sucesso e validação. Toda ação crítica deve tratar erro e registrar auditoria quando aplicável.

PERFIS
SUPER_ADMIN, ADMIN_APONTO, GESTOR_APONTO, RH_APONTO, GESTOR_EMPRESA, EMPRESA, PROFISSIONAL. Implementar autorização real no backend/RLS, não somente no frontend, com isolamento entre empresas.

DESIGN
Premium + corporativo + tecnológico + humano + operacional. Azul-marinho, amarelo, branco e cinza. Tipografia, espaçamento, ícones e componentes consistentes. Evitar aparência genérica, excesso de cards/gradientes e visual infantil.

LANDING
Hero: "Pessoas em movimento. Operações em resultado."
Subheadline: "A A Ponto MOVE conecta empresas e profissionais e transforma contratação, trabalho freelancer e operação em um único fluxo."
CTAs: QUERO CONTRATAR / QUERO TRABALHAR.
Apresentar Trabalho Fixo, Freelancer, Recrutamento, Gestão, Operações e Indicadores.

PROFISSIONAL
Cadastro progressivo com nome, CPF, telefone, email, cidade/região, endereço, foto, experiências, formação, habilidades, empresas anteriores, funções, disponibilidade e documentos.
Campo obrigatório: modalidade de trabalho = FIXO / FREELANCER / FIXO + FREELANCER.
Perfil com completude, experiência, habilidades, modalidade, disponibilidade, região, pretensão salarial, valor/hora, diária, valor por atividade, disponibilidade imediata, raio de deslocamento, avaliações, histórico, documentos, treinamentos e desempenho.
Agenda de disponibilidade por dia/horário/região/distância. Impedir conflito de agenda.

TRABALHO FIXO
Vagas com cargo, descrição, requisitos, salário, benefícios, jornada, escala, localização, quantidade, início e status.
Fluxo: Publicada > Candidaturas > Triagem > Contato > Entrevista > Aprovação > Documentos > Contratação > Ativo.
Banco de talentos com filtros por região, experiência, cargo, habilidades, modalidade, disponibilidade, avaliação, salário, valor freelancer, distância e documentos.
Segundo contato com data, horário, canal, responsável, resultado e próximo contato.
Entrevistas com agendamento, resultado e reagendamento.
SLA: primeiro contato, entrevista, aprovação, contratação e tempo total; meta D+0 para reposição.

FREELANCER — MÓDULO "MOVE FREELA"
O profissional pode buscar trabalhos avulsos, temporários ou recorrentes.
Tipos: diária, ação promocional, reposição, merchandising, inventário, pesquisa de preço, auditoria, evento, cobertura de ausência, campanha temporária, degustação, exposição, organização de loja, abastecimento e atividades configuráveis.
Empresa publica oportunidade com título, descrição, atividade, loja/local, endereço, data, horário, duração, quantidade, valor diária/hora/atividade, requisitos, habilidades, experiência, raio, veículo/uniforme, treinamento e observações.
Status: Rascunho > Publicada > Interessados > Selecionados > Confirmada > Em andamento > Concluída/Cancelada.
Mural "Oportunidades para você" com compatibilidade, localização, data, horário, duração, valor, distância e requisitos. Botões TENHO INTERESSE/NÃO TENHO INTERESSE.
Matching por modalidade, localização, distância, disponibilidade, habilidades, experiência, valor, avaliação, documentos e treinamentos. Exibir percentual de compatibilidade. Preparar arquitetura para IA futura, sem depender dela.
Fluxo freelancer: Interesse > Seleção > Convite > Aceite > Reserva > Check-in > Execução > Evidências > Aprovação > Ganho > Avaliação > Histórico.
Criar agenda, impedir dupla reserva, check-in/check-out com horário/localização, evidências antes/depois/loja/exposição/produtos/atividade/comprovantes.
Área "Meus ganhos": realizados, aprovados, previstos, pagos, pendentes, período, empresa e atividade. Não processar pagamentos reais no MVP; preparar estrutura futura.
Avaliação: pontualidade, execução, qualidade, postura, organização, evidências e cumprimento. Criar reputação com nota, taxa de aceite, conclusão, cancelamentos e avaliações.

FIXO + FREELA
Quem escolher ambos usa os dois módulos. Verificar automaticamente conflitos de agenda entre trabalho fixo e freelancer.

CONTRATAÇÃO/DOCUMENTOS
Fluxo aprovado > documentos > conferência > contrato > assinatura > ativação. Documentos com status pendente/enviado/análise/aprovado/recusado/expirado e alertas de vencimento.
Preparar estrutura de assinatura digital futura.

EXPERIÊNCIA
Avaliações D+15, D+30, D+45 e final. Indicadores: produtividade, assiduidade, adaptação, execução, postura, qualidade e relacionamento. Alertas D-30, D-15, D-7, D-3, D-0. Objetivo antecipar substituição e atingir SLA D+0.

TREINAMENTOS
Treinamentos, módulos, materiais, avaliações, certificados e progresso. Permitir treinamento obrigatório por oportunidade.

EMPRESA
Dashboard com vagas, candidatos, freelancers, oportunidades, trabalhos em andamento, profissionais, produtividade, custos, avaliações e indicadores.
Publicação deve permitir escolher VAGA FIXA, FREELANCER ou AMBOS.

OPERAÇÃO DE CAMPO
Criar equipes, líderes, profissionais, lojas, endereços, horários, rotas, frequência e atividades.
Atividades: reposição, abastecimento, merchandising, auditoria, inventário, pesquisa, exposição, precificação.
Check-in/out e evidências vinculados a profissional + empresa + loja + atividade + data/hora.
Preparar geolocalização real futura.

REGRAS A PONTO
Execução configurável. Padrão:
- atividade concluída = executada;
- ruptura total = executada;
- "não vende na loja" = executada somente quando confirmada;
- "atividade não é minha" = NÃO executada;
- não usar "ruptura parcial"; somente Abastecido ou Ruptura Total.
Permitir configuração por empresa/operação.
Fotos: se todos produtos na mesma gôndola, foto geral da categoria; se separados, foto por SKU.

PRODUTIVIDADE
Totais, executadas, concluídas, rupturas, % execução, produtividade/hora, loja, indústria e profissional. Criar rankings de execução, produtividade, pontualidade, qualidade e avaliação.
Dashboard executivo com profissionais ativos, vagas críticas, freelancers disponíveis, oportunidades, trabalhos, execução, produtividade, absenteísmo, SLA, turnover, experiência e pendências.

ALERTAS
Vaga parada, candidato sem contato, SLA em risco, entrevista pendente, documento vencendo, experiência, avaliação atrasada, baixa produtividade, queda de execução, aumento de ruptura, atraso check-in, freelancer sem confirmação e oportunidade próxima sem profissional.

COMUNICAÇÃO
Central de notificações e comunicados. Preparar WhatsApp/email/push futuros.

RELATÓRIOS
Exportação PDF/Excel/CSV: recrutamento, vagas, profissionais, freelancers, trabalhos, produtividade, execução, rupturas, presença, avaliações, SLA e contratos.

LGPD/AUDITORIA
Consentimento, privacidade, controle de acesso, exclusão/exportação quando aplicável e audit_logs. Proteger dados pessoais.

BANCO
Criar/reutilizar estrutura para users, profiles, companies, company_users, professionals, professional_experiences, skills, professional_skills, work_preferences, availability, jobs, applications, recruitment_processes, recruitment_stages, recruitment_history, talent_pool, interviews, hiring_processes, documents, document_types, contracts, trainings, training_modules, training_progress, teams, stores, routes, assignments, attendance, checkins, checkouts, activities, activity_results, products, industries, evidence, evaluations, evaluation_cycles, performance_metrics, goals, notifications, reports, audit_logs, settings.
Freelancer: freelance_opportunities, freelance_applications, freelance_assignments, freelance_availability, freelance_rates, freelance_checkins, freelance_checkouts, freelance_evidence, freelance_reviews, freelance_earnings, freelance_status_history.
Use relacionamentos, índices, constraints e RLS adequados. Não duplique tabelas se equivalentes já existirem.

MOBILE/PWA
Mobile-first. Para profissional: Início | Vagas | Oportunidades | Check-in | Perfil. Mostrar próxima oportunidade, próxima escala, vagas, freelas, desempenho e documentos pendentes. Preparar câmera, localização, push e offline futuro.

ORDEM DE CONSTRUÇÃO
1 Design System
2 arquitetura
3 banco
4 auth
5 permissões/RLS
6 landing
7 cadastro/perfil/modalidade/disponibilidade
8 vagas/candidaturas
9 recrutamento/segundo contato/entrevistas/SLA
10 banco de talentos/matching
11 contratação/documentos
12 experiência 30 dias
13 treinamentos
14 módulo freelancer/oportunidades/aceite/agenda/check-in/out/evidências/ganhos/avaliações
15 empresas/equipes/lojas/rotas
16 operações/atividades/rupturas
17 produtividade/dashboards
18 alertas/notificações
19 relatórios/auditoria/LGPD
20 PWA
21 testes
22 piloto
23 correções
24 produção.

CRITÉRIO
Não criar botões sem ação, telas sem fluxo ou dados falsos como reais. Usar DEMO quando necessário. Testar autenticação, permissões, RLS, cadastro, fixo, freelancer, matching, recrutamento, contratação, documentos, experiência, check-in/out, evidências, avaliações, produtividade, dashboards, relatórios e mobile.

ECONOMIA DE CRÉDITOS
Agrupar implementação em grandes blocos, reutilizar componentes, não reconstruir, não instalar dependências desnecessárias e não fazer integrações pagas no MVP. Após cada bloco, executar testes de regressão.

COMECE AGORA.
Primeiro analise o estado atual do projeto (se houver), depois construa a fundação e os primeiros módulos funcionais. Não apenas descreva o que faria: IMPLEMENTE O CÓDIGO. Ao final desta etapa, deixe o projeto executável, navegável e preparado para os próximos módulos.

This project was built with [Lovable](https://lovable.dev).

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/2273b5af-206b-4a61-abee-3bdf6df34d82).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
