import { createFileRoute } from "@tanstack/react-router";
import { Stores } from "@/components/move/Entities";
import { coreHead } from "@/components/move/core";
export const Route = createFileRoute("/_authenticated/app/empresa/lojas")({ head: () => coreHead("Lojas", "Gerencie lojas vinculadas às empresas, vagas e freelas."), component: Stores });