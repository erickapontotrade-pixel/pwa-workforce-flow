import { createFileRoute } from "@tanstack/react-router";
import { Recruitment } from "@/components/move/Recruitment";
import { coreHead } from "@/components/move/core";
import { z } from "zod";
export const Route = createFileRoute("/_authenticated/app/empresa/recrutamento")({ validateSearch: z.object({ vaga: z.string().optional() }), head: () => coreHead("Recrutamento", "Triagem, contatos, entrevistas, contratação e histórico de candidatos."), component: RecruitmentPage });
function RecruitmentPage() { const { vaga } = Route.useSearch(); return <Recruitment {...(vaga ? { jobId: vaga } : {})} />; }