import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Logo } from "@/components/move/Logo";
import { errMsg } from "@/lib/session";

export const Route = createFileRoute("/reset-password")({
  head: () => ({
    meta: [
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
      { title: "Redefinir senha — A Ponto MOVE" },
      { name: "description", content: "Defina uma nova senha para sua conta A Ponto MOVE." },
      { property: "og:title", content: "Redefinir senha — A Ponto MOVE" },
      { property: "og:description", content: "Defina uma nova senha." },
    ],
  }),
  component: Reset,
});

function Reset() {
  const [pw, setPw] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (pw.length < 8) { toast.error("Mínimo de 8 caracteres"); return; }
    setLoading(true);
    const { error } = await supabase.auth.updateUser({ password: pw });
    setLoading(false);
    if (error) { toast.error(errMsg(error)); return; }
    toast.success("Senha atualizada");
    navigate({ to: "/app" });
  }
  return (
    <div className="mx-auto flex min-h-screen max-w-sm flex-col justify-center px-5">
      <Logo />
      <h1 className="mt-8 text-2xl font-bold">Nova senha</h1>
      <form onSubmit={submit} className="mt-5 space-y-4">
        <div className="space-y-1.5"><Label>Nova senha</Label><Input type="password" value={pw} onChange={(e) => setPw(e.target.value)} /></div>
        <Button className="w-full" disabled={loading}>Salvar senha</Button>
      </form>
    </div>
  );
}
