export const MODALITY_LABEL = { fixo: "Fixo", freelancer: "Freelancer", ambos: "Fixo + Freelancer" } as const;

export const STAGES = [
  "candidatura", "triagem", "contato", "entrevista", "aprovacao", "documentos", "contratacao", "ativo",
] as const;
export const STAGE_LABEL: Record<string, string> = {
  candidatura: "Candidatura", triagem: "Triagem", contato: "Contato", entrevista: "Entrevista",
  aprovacao: "Aprovação", documentos: "Documentos", contratacao: "Contratação", ativo: "Ativo",
  reprovado: "Reprovado", desistiu: "Desistiu",
};

export const FREELA_STATUS_LABEL: Record<string, string> = {
  rascunho: "Rascunho", publicada: "Publicada", interessados: "Interessados", selecionados: "Selecionados",
  confirmada: "Confirmada", em_andamento: "Em andamento", concluida: "Concluída", cancelada: "Cancelada",
};

export const ASSIGNMENT_LABEL: Record<string, string> = {
  convidado: "Convite pendente", aceito: "Aceito", reservado: "Reservado", em_execucao: "Em execução",
  aguardando_aprovacao: "Aguardando aprovação", aprovado: "Aprovado", reprovado: "Reprovado", cancelado: "Cancelado",
};

export const ACTIVITY_TYPES = [
  "Diária", "Ação promocional", "Reposição", "Merchandising", "Inventário", "Pesquisa de preço", "Auditoria",
  "Evento", "Cobertura de ausência", "Campanha temporária", "Degustação", "Exposição", "Organização de loja",
  "Abastecimento", "Precificação",
];

export const PAY_UNIT_LABEL = { diaria: "/diária", hora: "/hora", atividade: "/atividade" } as const;

export const EXECUTION_RESULTS = [
  { v: "concluida", l: "Atividade concluída (Abastecido)", exec: true },
  { v: "ruptura_total", l: "Ruptura total", exec: true },
  { v: "nao_vende_confirmado", l: "Não vende na loja — confirmado pelo gerente", exec: true },
  { v: "nao_vende_pendente", l: "Não vende na loja — sem confirmação", exec: false },
  { v: "atividade_nao_minha", l: "Atividade não é minha", exec: false },
] as const;

export const DOC_STATUS_LABEL: Record<string, string> = {
  pendente: "Pendente", enviado: "Enviado", analise: "Em análise", aprovado: "Aprovado", recusado: "Recusado", expirado: "Expirado",
};

export const WEEKDAYS = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];
