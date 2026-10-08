import { createFileRoute } from "@tanstack/react-router";
import { TalentPool } from "@/components/move/TalentPool";
import { coreHead } from "@/components/move/core";
export const Route = createFileRoute("/_authenticated/app/empresa/talentos")({ head: () => coreHead("Banco de talentos", "Pesquise profissionais e vincule a vagas e oportunidades."), component: TalentPool });