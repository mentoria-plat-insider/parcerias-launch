/** Componentes compartilhados — FL Insider v4: catálogo curado e reunião presencial. */
import { ReactNode } from "react";
import { CheckCircle2, CircleAlert, Clock3, CalendarClock, Instagram } from "lucide-react";
import { cn } from "@/lib/utils";
import { Triagem } from "@/lib/mockData";

export function FotoPerfil({ src, alt, size = "md" }: { src: string; alt: string; size?: "sm" | "md" | "lg" }) {
  const dim = size === "lg" ? "size-20" : size === "sm" ? "size-9" : "size-12";
  return <img src={src} alt={alt} className={cn(dim, "rounded-full border-2 border-card shadow-sm object-cover shrink-0")} />;
}

export function Label({ children, className }: { children: ReactNode; className?: string }) {
  return <span className={cn("label-ed", className)}>{children}</span>;
}

export function LinhaDado({ rotulo, valor }: { rotulo: string; valor: ReactNode }) {
  return <div className="flex flex-col gap-1 py-2 border-b border-border/60 last:border-b-0 sm:flex-row sm:items-baseline sm:justify-between sm:gap-4"><Label>{rotulo}</Label><span className="w-full text-sm font-medium text-left sm:w-auto sm:text-right">{valor}</span></div>;
}

export function InstagramHandle({ handle }: { handle: string }) {
  return <span className="inline-flex items-center gap-1.5 text-sm text-muted-foreground"><Instagram className="size-3.5" />{handle}</span>;
}

export function BadgeStatus({ status }: { status: string }) {
  const estilos: Record<string, string> = {
    "Aprovado": "bg-primary/15 text-primary", "Em validação": "bg-accent text-accent-foreground", "Enviado": "bg-accent text-accent-foreground", "Reprovado": "bg-muted text-muted-foreground", "Rascunho": "bg-muted text-muted-foreground",
    "Elegível para catálogo": "bg-primary/15 text-primary", "Em triagem": "bg-accent text-accent-foreground", "Não elegível": "bg-muted text-muted-foreground", "Em estruturação": "bg-muted text-muted-foreground", "Validado para lançamento": "bg-primary/15 text-primary", "Já lançado": "bg-primary/15 text-primary",
    "Interesse declarado": "bg-accent text-accent-foreground", "Reunião solicitada": "bg-accent text-accent-foreground", "Reunião confirmada": "bg-primary/15 text-primary", "Encerrado": "bg-muted text-muted-foreground", "Começando": "bg-muted text-muted-foreground", "Em crescimento": "bg-accent text-accent-foreground", "Experiente": "bg-primary/15 text-primary",
  };
  return <span className={cn("inline-flex items-center rounded-sm px-2 py-0.5 text-xs font-semibold", estilos[status] ?? "bg-muted text-muted-foreground")}>{status}</span>;
}

export function ChecklistTriagem({ triagem }: { triagem: Triagem }) {
  const criterios = [["Nicho", triagem.nicho], ["Avatar", triagem.avatar], ["ROMA", triagem.roma], ["Maturidade", triagem.maturidade]] as const;
  return <div className="grid grid-cols-2 gap-2">{criterios.map(([nome, aprovado]) => <span key={nome} className={cn("flex items-center gap-1.5 text-xs rounded-sm px-2 py-1.5", aprovado ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground")}>
    {aprovado ? <CheckCircle2 className="size-3.5" /> : <CircleAlert className="size-3.5" />}{nome}
  </span>)}</div>;
}

export function IconeStatusReuniao({ status }: { status: string }) {
  if (status === "Reunião confirmada") return <CalendarClock className="size-4 text-primary" />;
  return <Clock3 className="size-4 text-muted-foreground" />;
}
