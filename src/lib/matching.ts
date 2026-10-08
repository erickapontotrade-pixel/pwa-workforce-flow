import type { Professional } from "./session";

/**
 * Matching determinístico (sem IA). Arquitetura preparada para trocar por um
 * scorer de IA: mesma assinatura, retorna score 0-100 e motivos.
 */
export type OpportunityLike = {
  city: string | null;
  required_skills: string[];
  requires_vehicle: boolean;
  pay_amount: number;
  pay_unit: "diaria" | "hora" | "atividade";
  starts_at: string;
  ends_at: string;
};

export type Availability = { weekday: number; start_time: string; end_time: string; kind: string };

export function matchScore(
  p: Professional | null,
  o: OpportunityLike,
  skills: string[],
  avail: Availability[],
): { score: number; reasons: string[] } {
  if (!p) return { score: 0, reasons: [] };
  const reasons: string[] = [];
  let total = 0;
  let got = 0;
  const add = (w: number, ok: number, label?: string) => {
    total += w;
    got += w * ok;
    if (label && ok >= 0.99) reasons.push(label);
  };

  add(15, p.modality === "freelancer" || p.modality === "ambos" ? 1 : 0, "Modalidade freelancer");
  const sameCity = !!(o.city && p.city && o.city.trim().toLowerCase() === p.city.trim().toLowerCase());
  add(20, sameCity ? 1 : 0.3, sameCity ? "Mesma cidade" : undefined);

  const req = o.required_skills.map((s) => s.toLowerCase());
  const mine = skills.map((s) => s.toLowerCase());
  const hit = req.length ? req.filter((s) => mine.includes(s)).length / req.length : 1;
  add(25, hit, hit === 1 ? "Habilidades compatíveis" : undefined);

  const start = new Date(o.starts_at);
  const end = new Date(o.ends_at);
  const wd = start.getDay();
  const st = start.toTimeString().slice(0, 5);
  const et = end.toTimeString().slice(0, 5);
  const free = avail.some((a) => a.kind === "livre" && a.weekday === wd && a.start_time.slice(0, 5) <= st && a.end_time.slice(0, 5) >= et);
  const blocked = avail.some((a) => a.kind === "fixo" && a.weekday === wd && a.start_time.slice(0, 5) < et && st < a.end_time.slice(0, 5));
  add(20, blocked ? 0 : free ? 1 : 0.4, free && !blocked ? "Disponível no horário" : undefined);

  add(5, !o.requires_vehicle || p.has_vehicle ? 1 : 0);

  const myRate = o.pay_unit === "hora" ? p.rate_hour : o.pay_unit === "diaria" ? p.rate_day : p.rate_activity;
  add(10, !myRate || Number(myRate) <= Number(o.pay_amount) ? 1 : 0.4, myRate && Number(myRate) <= Number(o.pay_amount) ? "Valor dentro da sua pretensão" : undefined);

  add(5, Number(p.rating_count) === 0 ? 0.6 : Number(p.rating_avg) / 5);

  return { score: Math.round((got / total) * 100), reasons };
}
