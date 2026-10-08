import { createFileRoute } from "@tanstack/react-router";
import { Companies } from "@/components/move/Entities";
import { coreHead } from "@/components/move/core";
export const Route = createFileRoute("/_authenticated/app/empresa/empresas")({ head: () => coreHead("Empresas", "Cadastro e manutenção das empresas A Ponto MOVE."), component: Companies });