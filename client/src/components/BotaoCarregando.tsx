import React, { type ComponentProps, type ReactNode } from "react";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type BotaoCarregandoProps = ComponentProps<typeof Button> & {
  carregando?: boolean;
  textoCarregando: string;
  children: ReactNode;
};

/**
 * Mantém a ação explícita enquanto uma mutação está em andamento, evitando
 * reenvios e comunicando o estado para leitores de tela.
 */
export function BotaoCarregando({
  carregando = false,
  textoCarregando,
  children,
  disabled,
  className,
  ...props
}: BotaoCarregandoProps) {
  return (
    <Button
      {...props}
      className={cn("gap-2 transition-transform duration-200 active:scale-[0.98]", className)}
      disabled={disabled || carregando}
      aria-busy={carregando}
    >
      {carregando ? (
        <>
          <Loader2 className="size-4 motion-safe:animate-spin" aria-hidden="true" />
          <span aria-live="polite">{textoCarregando}</span>
        </>
      ) : (
        children
      )}
    </Button>
  );
}
