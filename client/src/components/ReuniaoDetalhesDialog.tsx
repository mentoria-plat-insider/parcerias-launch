import { CalendarDays, Clock3, MapPin, UsersRound } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";

interface ReuniaoDetalhesDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  perfil: "Expert" | "Lançador";
  nomeProjeto: string;
  statusInteresse: string;
  meeting: {
    scheduledFor: Date | string;
    location: string;
    resource: string;
    durationMinutes: number;
    operationalNote?: string | null;
  } | null;
}

export function ReuniaoDetalhesDialog({
  open,
  onOpenChange,
  perfil,
  nomeProjeto,
  statusInteresse,
  meeting,
}: ReuniaoDetalhesDialogProps) {
  if (!meeting) return null;

  const data = new Date(meeting.scheduledFor);
  const dataFormatada = data.toLocaleDateString("pt-BR", {
    weekday: "long",
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
  const horarioFormatado = data.toLocaleTimeString("pt-BR", {
    hour: "2-digit",
    minute: "2-digit",
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-xl overflow-hidden border-border bg-card p-0 shadow-2xl">
        <div className="relative overflow-hidden bg-gradient-to-br from-primary via-primary/95 to-[#6f70c9] px-6 pb-7 pt-7 text-primary-foreground sm:px-8">
          <div className="pointer-events-none absolute -right-12 -top-16 size-44 rounded-full border border-white/20" />
          <div className="pointer-events-none absolute -bottom-20 left-1/2 size-56 rounded-full border border-white/10" />
          <DialogHeader className="relative text-left">
            <div className="mb-4 flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-primary-foreground/75">
              <CalendarDays className="size-4" aria-hidden="true" />
              Reunião da Rodada
            </div>
            <DialogTitle className="font-display text-2xl leading-tight text-primary-foreground sm:text-3xl">
              Detalhes da reunião
            </DialogTitle>
            <DialogDescription className="mt-2 max-w-md text-sm leading-relaxed text-primary-foreground/80">
              Compromisso confirmado para a visualização de {perfil}. Este registro pertence ao ambiente demonstrativo.
            </DialogDescription>
          </DialogHeader>
        </div>

        <div className="space-y-5 px-6 py-6 sm:px-8 sm:py-7">
          <div className="rounded-xl border border-primary/20 bg-primary/5 p-5">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <p className="label-ed text-primary">Projeto</p>
                <h3 className="mt-2 font-display text-xl font-semibold leading-tight">{nomeProjeto}</h3>
              </div>
              <span className="inline-flex shrink-0 rounded-full border border-primary/25 bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
                {statusInteresse}
              </span>
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <DetailItem icon={<CalendarDays className="size-4" />} label="Data" value={dataFormatada} />
            <DetailItem icon={<Clock3 className="size-4" />} label="Horário e duração" value={`${horarioFormatado} · ${meeting.durationMinutes} min`} />
            <DetailItem icon={<MapPin className="size-4" />} label="Local" value={meeting.location} />
            <DetailItem icon={<UsersRound className="size-4" />} label="Recurso reservado" value={meeting.resource} />
          </div>

          {meeting.operationalNote && (
            <div className="rounded-xl border border-border bg-muted/35 p-4">
              <p className="label-ed">Nota operacional</p>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{meeting.operationalNote}</p>
            </div>
          )}

          <div className="flex items-start gap-3 rounded-xl border border-primary/20 bg-primary/5 px-4 py-3.5 text-sm leading-relaxed text-muted-foreground">
            <CalendarDays className="mt-0.5 size-4 shrink-0 text-primary" aria-hidden="true" />
            <p>Use este compromisso para demonstrar como um interesse confirmado evolui para uma agenda organizada pela operação.</p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function DetailItem({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="rounded-xl border border-border bg-background/60 p-4">
      <div className="flex items-center gap-2 text-primary">
        {icon}
        <span className="label-ed">{label}</span>
      </div>
      <p className="mt-2 text-sm font-medium leading-relaxed text-foreground">{value}</p>
    </div>
  );
}
