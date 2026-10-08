import { queryOptions, useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { Database } from "@/integrations/supabase/types";

export type AppRole = Database["public"]["Enums"]["app_role"];
export type Professional = Database["public"]["Tables"]["professionals"]["Row"];
export type Company = Database["public"]["Tables"]["companies"]["Row"];

export const STAFF_ROLES: AppRole[] = ["super_admin", "admin_aponto", "gestor_aponto", "rh_aponto"];

export const meQuery = queryOptions({
  queryKey: ["me"],
  queryFn: async () => {
    const { data: u } = await supabase.auth.getUser();
    const user = u.user;
    if (!user) return null;
    const [roles, prof, cu] = await Promise.all([
      supabase.from("user_roles").select("role").eq("user_id", user.id),
      supabase.from("professionals").select("*").eq("user_id", user.id).maybeSingle(),
      supabase.from("company_users").select("company_id, role, companies(*)").eq("user_id", user.id),
    ]);
    if (roles.error) throw roles.error;
    if (prof.error) throw prof.error;
    if (cu.error) throw cu.error;
    const companies = (cu.data ?? []).map((r) => r.companies as Company).filter(Boolean);
    const roleList = (roles.data ?? []).map((r) => r.role as AppRole);
    return {
      user,
      roles: roleList,
      professional: (prof.data ?? null) as Professional | null,
      companies,
      company: companies[0] ?? null,
      isStaff: roleList.some((r) => STAFF_ROLES.includes(r)),
    };
  },
  staleTime: 30_000,
});

export function useMe() {
  return useQuery(meQuery);
}

export function errMsg(e: unknown) {
  if (e && typeof e === "object" && "message" in e) return String((e as { message: string }).message);
  return "Algo deu errado. Tente novamente.";
}

export const brl = (v: number | null | undefined) =>
  v == null ? "—" : Number(v).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

export const fmtDateTime = (s: string | null | undefined) =>
  s ? new Date(s).toLocaleString("pt-BR", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" }) : "—";

export const fmtDate = (s: string | null | undefined) =>
  s ? new Date(s).toLocaleDateString("pt-BR", { day: "2-digit", month: "short", year: "numeric" }) : "—";

export function profileCompleteness(p: Professional | null, extra?: { skills?: number; exps?: number; avail?: number; docs?: number }) {
  if (!p) return 0;
  const checks = [
    p.full_name, p.cpf, p.phone, p.email, p.city, p.region, p.address, p.modality, p.headline,
    p.education, (p.rate_day || p.salary_expectation) ? 1 : null,
    extra?.skills, extra?.exps, extra?.avail, extra?.docs,
  ];
  return Math.round((checks.filter(Boolean).length / checks.length) * 100);
}

export function downloadCSV(filename: string, rows: Record<string, unknown>[]) {
  if (!rows.length) return;
  const headers = Object.keys(rows[0]);
  const esc = (v: unknown) => `"${String(v ?? "").replace(/"/g, '""')}"`;
  const csv = [headers.join(";"), ...rows.map((r) => headers.map((h) => esc(r[h])).join(";"))].join("\n");
  const blob = new Blob(["\ufeff" + csv], { type: "text/csv;charset=utf-8" });
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = filename;
  a.click();
  URL.revokeObjectURL(a.href);
}
