import { createFileRoute } from "@tanstack/react-router";
import { FreelaManager } from "@/components/move/FreelaManager";
import { coreHead } from "@/components/move/core";
export const Route = createFileRoute("/_authenticated/app/empresa/freela")({ head: () => coreHead("Gestão MOVE FREELA", "Oportunidades, seleção, evidências, aprovação e avaliações."), component: FreelaManager });