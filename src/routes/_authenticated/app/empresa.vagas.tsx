import { createFileRoute } from "@tanstack/react-router";
import { JobsManager } from "@/components/move/JobsManager";
import { coreHead } from "@/components/move/core";
export const Route = createFileRoute("/_authenticated/app/empresa/vagas")({ head: () => coreHead("Gestão de vagas", "Crie, publique e acompanhe vagas fixas e candidatos."), component: JobsManager });