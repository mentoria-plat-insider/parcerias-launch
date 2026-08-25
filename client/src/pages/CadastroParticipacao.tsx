import { useAuth } from "@/_core/hooks/useAuth";
import { startLogin } from "@/const";
import { BotaoCarregando } from "@/components/BotaoCarregando";
import { Button } from "@/components/ui/button";
import { trpc } from "@/lib/trpc";
import { CheckCircle2, Loader2, ShieldCheck, UserRound, UsersRound } from "lucide-react";
import { FormEvent, useEffect, useState } from "react";
import { toast } from "sonner";

type ParticipationRole = "expert" | "lancador";

export default function CadastroParticipacao() {
  const { user, isAuthenticated, loading } = useAuth();
  const utils = trpc.useUtils();
  const registration = trpc.registration.mine.useQuery(undefined, { enabled: isAuthenticated, retry: false });
  const [role, setRole] = useState<ParticipationRole>("expert");
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [instagram, setInstagram] = useState("");

  useEffect(() => {
    if (user?.name && !fullName) setFullName(user.name);
  }, [fullName, user?.name]);

  const submit = trpc.registration.submit.useMutation({
    onSuccess: async () => {
      await utils.registration.mine.invalidate();
      toast.success("Cadastro enviado para aprovação", { description: "A operação analisará suas informações antes de liberar o painel." });
    },
    onError: error => toast.error("Não foi possível enviar o cadastro", { description: error.message }),
  });

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    submit.mutate({
      requestedRole: role,
      fullName,
      phone: phone || undefined,
      instagram: instagram || undefined,
    });
  };

  if (loading || (isAuthenticated && registration.isLoading)) {
    return <main className="min-h-screen grid place-items-center bg-background text-foreground"><Loader2 className="size-7 animate-spin text-primary" aria-label="Carregando" /></main>;
  }

  if (!isAuthenticated) {
    return <main className="min-h-screen grid place-items-center bg-background px-5 text-foreground"><section className="w-full max-w-lg rounded-xl border border-border bg-card p-7 sm:p-9"><p className="label-ed text-primary">Encontro Insider · Rodada de Parcerias</p><h1 className="font-display mt-3 text-3xl font-semibold">Cadastre sua participação</h1><p className="mt-3 leading-relaxed text-muted-foreground">Este link é compartilhado com a comunidade. Entre com sua conta para enviar o cadastro como Expert ou Lançador e aguardar a aprovação da operação.</p><Button className="mt-7 w-full" size="lg" onClick={startLogin}>Entrar para fazer cadastro</Button></section></main>;
  }

  const current = registration.data;
  if (current?.status === "approved") {
    return <StatusCard title="Cadastro aprovado" text={`Sua participação como ${current.requestedRole === "expert" ? "Expert" : "Lançador"} foi liberada pela operação.`} actionLabel="Acessar meu painel" action={() => window.location.assign(`/painel/${current.requestedRole}`)} />;
  }
  if (current?.status === "pending") {
    return <StatusCard title="Cadastro em análise" text="Recebemos suas informações. A operação fará a avaliação e liberará o painel quando sua inscrição for aprovada." />;
  }

  return <main className="min-h-screen bg-background px-4 py-8 text-foreground sm:px-6 sm:py-12"><section className="mx-auto w-full max-w-2xl"><a href="/" className="label-ed text-primary hover:underline">← Voltar à página inicial</a><div className="mt-5 overflow-hidden rounded-xl border border-border bg-card shadow-sm"><div className="border-b border-border p-6 sm:p-8"><p className="label-ed text-primary">Participação no evento</p><h1 className="font-display mt-3 text-3xl font-semibold">{current?.status === "rejected" ? "Revise seu cadastro" : "Cadastre-se para a Rodada"}</h1><p className="mt-3 max-w-xl text-sm leading-relaxed text-muted-foreground">Escolha o perfil que representa sua participação. O acesso ao painel acontece somente após a aprovação de um Administrador.</p>{current?.status === "rejected" && current.reviewNote && <p className="mt-4 rounded-md border border-destructive/25 bg-destructive/5 p-3 text-sm text-muted-foreground"><strong className="text-foreground">Retorno da operação:</strong> {current.reviewNote}</p>}</div>
        <form className="space-y-6 p-6 sm:p-8" onSubmit={handleSubmit}>
          <fieldset><legend className="label-ed text-foreground">Como você participa?</legend><div className="mt-3 grid gap-3 sm:grid-cols-2"><RoleOption checked={role === "expert"} onChange={() => setRole("expert")} icon={<UserRound className="size-5" />} title="Sou Expert" text="Tenho um projeto e uma ROMA para apresentar." /><RoleOption checked={role === "lancador"} onChange={() => setRole("lancador")} icon={<UsersRound className="size-5" />} title="Sou Lançador" text="Quero conhecer projetos elegíveis para parceria." /></div></fieldset>
          <label className="block"><span className="label-ed text-foreground">Nome completo <span className="text-primary">*</span></span><input required maxLength={180} value={fullName} onChange={event => setFullName(event.target.value)} className="mt-2 min-h-11 w-full rounded-md border border-input bg-background px-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring/60" placeholder="Como a operação deve identificar você" /></label>
          <div className="grid gap-5 sm:grid-cols-2"><label className="block"><span className="label-ed text-foreground">Telefone</span><input value={phone} maxLength={32} onChange={event => setPhone(event.target.value)} className="mt-2 min-h-11 w-full rounded-md border border-input bg-background px-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring/60" placeholder="(00) 00000-0000" /></label><label className="block"><span className="label-ed text-foreground">Instagram</span><input value={instagram} maxLength={120} onChange={event => setInstagram(event.target.value)} className="mt-2 min-h-11 w-full rounded-md border border-input bg-background px-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring/60" placeholder="@seuperfil" /></label></div>
          <div className="rounded-md border border-primary/20 bg-primary/5 p-4 text-sm leading-relaxed text-muted-foreground"><ShieldCheck className="mr-2 inline size-4 text-primary" />Seus dados serão usados exclusivamente para identificar sua participação e viabilizar a operação da Rodada de Parcerias.</div>
          <BotaoCarregando type="submit" size="lg" className="w-full" carregando={submit.isPending} textoCarregando="Enviando cadastro…"><>Enviar para aprovação <CheckCircle2 className="size-4" /></></BotaoCarregando>
        </form></div></section></main>;
}

function RoleOption({ checked, onChange, icon, title, text }: { checked: boolean; onChange: () => void; icon: React.ReactNode; title: string; text: string }) {
  return <label className={`flex min-h-28 cursor-pointer gap-3 rounded-lg border p-4 transition-colors ${checked ? "border-primary bg-primary/5" : "border-border hover:bg-accent/50"}`}><input className="sr-only" type="radio" name="role" checked={checked} onChange={onChange} /><span className="mt-0.5 text-primary">{icon}</span><span><strong className="block text-sm">{title}</strong><span className="mt-1 block text-xs leading-relaxed text-muted-foreground">{text}</span></span></label>;
}

function StatusCard({ title, text, actionLabel, action }: { title: string; text: string; actionLabel?: string; action?: () => void }) {
  return <main className="min-h-screen grid place-items-center bg-background p-5 text-foreground"><section className="w-full max-w-md rounded-xl border border-border bg-card p-8 text-center"><div className="mx-auto flex size-12 items-center justify-center rounded-full bg-primary/10 text-primary"><CheckCircle2 className="size-6" /></div><p className="label-ed mt-6 text-primary">Rodada de Parcerias</p><h1 className="font-display mt-2 text-2xl font-semibold">{title}</h1><p className="mt-3 text-sm leading-relaxed text-muted-foreground">{text}</p>{action && <Button className="mt-7" onClick={action}>{actionLabel}</Button>}</section></main>;
}
