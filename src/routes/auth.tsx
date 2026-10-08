import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { z } from "zod";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Logo } from "@/components/move/Logo";
import { errMsg } from "@/lib/session";
import { cn } from "@/lib/utils";

const search = z.object({
  tipo: z.enum(["profissional", "empresa"]).optional(),
  modo: z.enum(["entrar", "cadastro"]).optional(),
});

export const Route = createFileRoute("/auth")({
  validateSearch: search,
  head: () => ({
    meta: [
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
      { title: "Entrar ou criar conta — A Ponto MOVE" },
      { name: "description", content: "Acesse sua conta A Ponto MOVE como profissional ou empresa." },
      { property: "og:title", content: "Entrar — A Ponto MOVE" },
      { property: "og:description", content: "Acesse ou crie sua conta A Ponto MOVE." },
    ],
  }),
  component: AuthPage,
});

const signupSchema = z.object({
  name: z.string().trim().min(3, "Informe seu nome completo").max(120),
  email: z.string().trim().email("Email inválido").max(255),
  password: z.string().min(8, "Mínimo de 8 caracteres").max(72),
});

function AuthPage() {
  const s = Route.useSearch();
  const navigate = useNavigate();
  const [mode, setMode] = useState<"entrar" | "cadastro" | "esqueci">(s.modo ?? "entrar");
  const [tipo, setTipo] = useState<"profissional" | "empresa">(s.tipo ?? "profissional");
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [consent, setConsent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => { if (data.user) navigate({ to: "/app", replace: true }); });
    const { data } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === "SIGNED_IN" && session) navigate({ to: "/app", replace: true });
    });
    return () => data.subscription.unsubscribe();
  }, [navigate]);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      if (mode === "esqueci") {
        const { error } = await supabase.auth.resetPasswordForEmail(form.email, { redirectTo: `${window.location.origin}/reset-password` });
        if (error) throw error;
        toast.success("Enviamos um link para redefinir sua senha.");
        setMode("entrar");
      } else if (mode === "cadastro") {
        const parsed = signupSchema.safeParse(form);
        if (!parsed.success) throw new Error(parsed.error.issues[0]?.message ?? "Dados inválidos");
        if (!consent) throw new Error("É preciso aceitar a política de privacidade (LGPD).");
        const { data, error } = await supabase.auth.signUp({
          email: parsed.data.email,
          password: parsed.data.password,
          options: {
            emailRedirectTo: window.location.origin + "/app",
            data: { full_name: parsed.data.name, account_type: tipo, lgpd_consent: "true" },
          },
        });
        if (error) throw error;
        if (data.session) navigate({ to: "/app" });
        else setSent(true);
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email: form.email, password: form.password });
        if (error) throw new Error(error.message.includes("Invalid") ? "Email ou senha incorretos." : error.message);
        navigate({ to: "/app" });
      }
    } catch (err) {
      toast.error(errMsg(err));
    } finally {
      setLoading(false);
    }
  }

  async function google() {
    setLoading(true);
    try {
      const r = await lovable.auth.signInWithOAuth("google", { redirect_uri: window.location.origin + "/auth" });
      if (r.error) throw r.error;
    } catch (e) { toast.error(errMsg(e)); } finally { setLoading(false); }
  }

  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      <div className="relative hidden overflow-hidden bg-navy p-10 text-navy-foreground lg:flex lg:flex-col lg:justify-between">
        <div className="absolute inset-0 bg-grid opacity-60" />
        <Link to="/" className="relative"><Logo inverted /></Link>
        <div className="relative">
          <h2 className="text-4xl font-extrabold leading-tight">Pessoas em movimento.<br /><span className="text-signal">Operações em resultado.</span></h2>
          <p className="mt-4 max-w-md text-navy-foreground/75">Um único fluxo para contratação fixa, freelancer e operação de campo.</p>
        </div>
        <p className="relative eyebrow text-navy-foreground/50">Versão piloto</p>
      </div>

      <div className="flex items-center justify-center px-5 py-10">
        <div className="w-full max-w-sm">
          <Link to="/" className="lg:hidden"><Logo /></Link>
          {sent ? (
            <div className="mt-8">
              <h1 className="text-2xl font-bold">Confirme seu email</h1>
              <p className="mt-2 text-sm text-muted-foreground">Enviamos um link de confirmação para <strong>{form.email}</strong>. Depois de confirmar, você entra direto na plataforma.</p>
              <Button variant="outline" className="mt-6 w-full" onClick={() => { setSent(false); setMode("entrar"); }}>Voltar para o login</Button>
            </div>
          ) : (
            <>
              <h1 className="mt-8 text-2xl font-bold">
                {mode === "cadastro" ? "Criar conta" : mode === "esqueci" ? "Recuperar senha" : "Entrar"}
              </h1>
              {mode === "cadastro" && (
                <div className="mt-5 grid grid-cols-2 gap-2 rounded-lg bg-muted p-1">
                  {(["profissional", "empresa"] as const).map((t) => (
                    <button key={t} type="button" onClick={() => setTipo(t)}
                      className={cn("rounded-md py-2 text-sm font-medium transition", tipo === t ? "bg-card shadow-card" : "text-muted-foreground")}>
                      {t === "profissional" ? "Quero trabalhar" : "Quero contratar"}
                    </button>
                  ))}
                </div>
              )}
              <form onSubmit={submit} className="mt-5 space-y-4">
                {mode === "cadastro" && (
                  <div className="space-y-1.5">
                    <Label htmlFor="name">Nome completo</Label>
                    <Input id="name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
                  </div>
                )}
                <div className="space-y-1.5">
                  <Label htmlFor="email">Email</Label>
                  <Input id="email" type="email" autoComplete="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required />
                </div>
                {mode !== "esqueci" && (
                  <div className="space-y-1.5">
                    <div className="flex justify-between">
                      <Label htmlFor="pw">Senha</Label>
                      {mode === "entrar" && <button type="button" className="text-xs text-muted-foreground hover:text-foreground" onClick={() => setMode("esqueci")}>Esqueci a senha</button>}
                    </div>
                    <Input id="pw" type="password" autoComplete={mode === "cadastro" ? "new-password" : "current-password"} value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} required />
                  </div>
                )}
                {mode === "cadastro" && (
                  <label className="flex items-start gap-2 text-xs text-muted-foreground">
                    <Checkbox checked={consent} onCheckedChange={(v) => setConsent(!!v)} className="mt-0.5" />
                    <span>Li e aceito a <Link to="/privacidade" className="underline">política de privacidade</Link> e o tratamento dos meus dados conforme a LGPD.</span>
                  </label>
                )}
                <Button type="submit" className="w-full" disabled={loading}>
                  {loading && <Loader2 className="animate-spin" />}
                  {mode === "cadastro" ? "Criar conta" : mode === "esqueci" ? "Enviar link" : "Entrar"}
                </Button>
              </form>
              {mode !== "esqueci" && (
                <>
                  <div className="my-5 flex items-center gap-3 text-xs text-muted-foreground"><div className="h-px flex-1 bg-border" />ou<div className="h-px flex-1 bg-border" /></div>
                  <Button variant="outline" className="w-full" disabled={loading} onClick={google}>Continuar com Google</Button>
                </>
              )}
              <p className="mt-6 text-center text-sm text-muted-foreground">
                {mode === "cadastro" ? "Já tem conta? " : "Ainda não tem conta? "}
                <button className="font-medium text-foreground underline" onClick={() => setMode(mode === "cadastro" ? "entrar" : "cadastro")}>
                  {mode === "cadastro" ? "Entrar" : "Criar conta"}
                </button>
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
