import { createFileRoute } from "@tanstack/react-router";
import { Reports } from "@/components/move/Reports";
import { coreHead } from "@/components/move/core";
export const Route = createFileRoute("/_authenticated/app/empresa/relatorios")({ head: () => coreHead("Relatórios", "Consulte recrutamento, freelancer, execução e exportações CSV."), component: Reports });