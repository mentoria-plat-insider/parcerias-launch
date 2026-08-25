import { Eye, ShieldCheck } from "lucide-react";

export function ModoVisualizacao({ perfil, pagina }: { perfil: "Expert" | "Lançador"; pagina: string }) {
  const descricao = perfil === "Expert"
    ? pagina === "cadastro"
      ? "Aqui o Expert cria, revisa e envia o projeto para a curadoria operacional."
      : pagina === "reunioes"
        ? "Aqui o Expert acompanha os interesses que evoluíram para uma reunião presencial."
        : "Aqui o Expert acompanha o projeto, a ROMA e o resultado da triagem manual."
    : pagina === "reunioes"
      ? "Aqui o Lançador acompanha os interesses declarados e as reuniões organizadas pela operação."
      : "Aqui o Lançador explora apenas projetos elegíveis e declara interesse para a Rodada de Parcerias.";

  return (
    <section className="space-y-5 rise-in" aria-label={`Visualização do painel de ${perfil}`}>
      <div className="rounded-lg border border-primary/30 bg-primary/5 p-5 flex gap-3">
        <Eye className="size-5 shrink-0 text-primary" aria-hidden="true" />
        <div>
          <p className="label-ed text-primary">Visualização administrativa</p>
          <h2 className="font-display mt-1 text-lg font-semibold">Painel de {perfil} em modo somente leitura</h2>
          <p className="mt-2 text-sm text-muted-foreground">{descricao}</p>
        </div>
      </div>
      <div className="rounded-lg border border-border bg-card p-6">
        <div className="flex gap-3">
          <ShieldCheck className="size-5 shrink-0 text-primary" aria-hidden="true" />
          <div>
            <h3 className="font-display font-semibold">Privacidade preservada</h3>
            <p className="mt-1 text-sm text-muted-foreground">Nenhum dado de participante, projeto, interesse ou reunião é carregado nesta visualização. Para retornar à operação, selecione Administrador no menu de perfis.</p>
          </div>
        </div>
      </div>
    </section>
  );
}
