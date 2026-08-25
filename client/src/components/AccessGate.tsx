import { useAuth } from "@/_core/hooks/useAuth";
import { startLogin } from "@/const";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { resolveAccessGateDecision } from "@/lib/accessGateDecision";
import { Loader2, LockKeyhole, ShieldAlert } from "lucide-react";
import React, { type ReactNode } from "react";

type RequiredRole = "admin" | "expert" | "lancador";

const labelByRole = {
  admin: "Administrador",
  expert: "Expert",
  lancador: "Lançador",
} as const;

export function AccessGate({ requiredRole, children, allowAdminPreview = false }: { requiredRole: RequiredRole; children: ReactNode; allowAdminPreview?: boolean }) {
  const { user, loading, isAuthenticated } = useAuth();
  const registration = trpc.registration.mine.useQuery(undefined, {
    enabled: isAuthenticated && user?.role !== "admin",
    retry: false,
    refetchOnWindowFocus: false,
  });

  if (loading || (isAuthenticated && user?.role !== "admin" && registration.isLoading)) {
    return <GateState icon={<Loader2 className="size-6 animate-spin" />} title="Verificando seu acesso" text="Aguarde um instante enquanto confirmamos suas permissões." />;
  }

  const current = registration.data;
  const decision = resolveAccessGateDecision({
    isAuthenticated,
    userRole: user?.role,
    requiredRole,
    allowAdminPreview,
    registration: current ? { status: current.status, requestedRole: current.requestedRole } : null,
  });

  if (decision === "login-required") {
    return <GateState icon={<LockKeyhole className="size-6" />} title="Acesso protegido" text="Entre com sua conta para solicitar participação ou acessar um painel aprovado." action={<Button onClick={startLogin}>Entrar para continuar</Button>} />;
  }

  if (decision === "admin-only") {
    return <GateState icon={<ShieldAlert className="size-6" />} title="Área restrita à operação" text="Este painel é exclusivo para administradores responsáveis pela triagem e agenda do evento." action={<Button variant="outline" onClick={() => window.location.assign("/cadastro")}>Ver meu cadastro</Button>} />;
  }

  if (decision === "registration-required") {
    return <GateState icon={<LockKeyhole className="size-6" />} title="Cadastro necessário" text="Antes de acessar o painel, envie seu cadastro para a avaliação da operação." action={<Button onClick={() => window.location.assign("/cadastro")}>Fazer cadastro</Button>} />;
  }

  const currentRegistration = current!;

  if (decision === "registration-pending") {
    return <GateState icon={<Loader2 className="size-6" />} title="Cadastro em análise" text="A operação está avaliando sua inscrição. O painel será liberado após a aprovação." action={<Button variant="outline" onClick={() => window.location.assign("/cadastro")}>Ver status</Button>} />;
  }

  if (decision === "registration-rejected") {
    return <GateState icon={<ShieldAlert className="size-6" />} title="Cadastro precisa de revisão" text={currentRegistration.reviewNote || "Revise suas informações e reenvie o cadastro para uma nova análise."} action={<Button onClick={() => window.location.assign("/cadastro")}>Revisar cadastro</Button>} />;
  }

  if (decision === "role-mismatch") {
    return <GateState icon={<ShieldAlert className="size-6" />} title="Perfil sem permissão para este painel" text={`Seu cadastro foi aprovado como ${labelByRole[currentRegistration.requestedRole]}.`} action={<Button onClick={() => window.location.assign(`/painel/${currentRegistration.requestedRole}`)}>Ir para meu painel</Button>} />;
  }

  return <>{children}</>;
}

function GateState({ icon, title, text, action }: { icon: ReactNode; title: string; text: string; action?: ReactNode }) {
  return <main className="min-h-screen bg-background text-foreground grid place-items-center p-6"><section className="w-full max-w-md rounded-xl border border-border bg-card p-7 text-center shadow-sm"><div className="mx-auto flex size-12 items-center justify-center rounded-full bg-primary/10 text-primary">{icon}</div><p className="label-ed mt-6 text-primary">Rodada de Parcerias</p><h1 className="font-display mt-2 text-2xl font-semibold">{title}</h1><p className="mt-3 text-sm leading-relaxed text-muted-foreground">{text}</p>{action && <div className="mt-6 flex justify-center">{action}</div>}</section></main>;
}
