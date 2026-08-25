/** Modelagem BPMN da Rodada de Parcerias, renderizada com BPMN.io. */
import { useEffect, useRef, useState } from "react";
import BpmnViewer from "bpmn-js/lib/Viewer";
import "bpmn-js/dist/assets/diagram-js.css";
import "bpmn-js/dist/assets/bpmn-font/css/bpmn.css";
import { CheckCircle2, CircleAlert, Download, Expand, Workflow } from "lucide-react";
import { Button } from "@/components/ui/button";
import { fluxoParceriasBpmn } from "@/lib/fluxoParceriasBpmn";

export default function FluxoBpmn() {
  const containerRef = useRef<HTMLDivElement>(null);
  const viewerRef = useRef<any>(null);
  const [erro, setErro] = useState(false);
  const [ampliado, setAmpliado] = useState(false);

  useEffect(() => {
    if (!containerRef.current) return;
    const viewer = new BpmnViewer({ container: containerRef.current });
    viewerRef.current = viewer;
    viewer.importXML(fluxoParceriasBpmn).then(() => {
      const canvas = viewer.get("canvas") as { zoom: (value: string) => void };
      canvas.zoom("fit-viewport");
    }).catch(() => setErro(true));
    return () => viewer.destroy();
  }, []);

  const baixar = () => {
    const blob = new Blob([fluxoParceriasBpmn], { type: "application/xml" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url; anchor.download = "fluxo-parcerias-fl-insider.bpmn"; anchor.click();
    URL.revokeObjectURL(url);
  };
  const ajustar = () => (viewerRef.current?.get("canvas") as { zoom: (value: string) => void })?.zoom("fit-viewport");

  return <section className="space-y-5 rise-in">
    <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
      <div><p className="label-ed mb-2">BPMN 2.0 · operação do evento</p><h2 className="font-display text-2xl font-semibold">Fluxo da Rodada de Parcerias</h2><p className="mt-2 max-w-2xl text-sm text-muted-foreground">A modelagem traduz as regras validadas: não há score ou match automático. A operação faz a triagem, o Lançador explora o catálogo e a equipe organiza a conversa presencial.</p></div>
      <div className="flex gap-2"><Button variant="outline" className="bg-card hover:bg-accent gap-2" onClick={ajustar}><Expand className="size-4" />Ajustar visão</Button><Button className="gap-2" onClick={baixar}><Download className="size-4" />Baixar BPMN</Button></div>
    </div>
    <div className="grid gap-3 md:grid-cols-3">
      {[{ titulo: "Expert", texto: "Preenche, envia e ajusta o próprio projeto quando necessário.", cor: "bg-primary/10" }, { titulo: "Operação", texto: "Confere, realiza a triagem e organiza mesa e horário.", cor: "bg-insider-gold/15" }, { titulo: "Lançador", texto: "Explora os projetos elegíveis e declara interesse em conversar.", cor: "bg-secondary" }].map((item) => <div key={item.titulo} className="rounded-lg border border-border bg-card p-4"><div className={`mb-3 flex size-8 items-center justify-center rounded-md ${item.cor}`}><Workflow className="size-4 text-primary" /></div><h3 className="font-display font-semibold">{item.titulo}</h3><p className="mt-1 text-sm text-muted-foreground">{item.texto}</p></div>)}
    </div>
    <div className={`bpmn-shell ${ampliado ? "bpmn-ampliado" : ""}`}><div className="bpmn-toolbar"><span><span className="size-2 rounded-full bg-primary inline-block mr-2" />Modelo operacional vigente</span><button onClick={() => setAmpliado(!ampliado)} className="text-xs font-medium text-primary hover:underline">{ampliado ? "Reduzir" : "Ampliar"}</button></div>{erro ? <div className="flex h-[460px] items-center justify-center gap-3 text-sm text-destructive"><CircleAlert className="size-5" />Não foi possível carregar o modelo BPMN.</div> : <div ref={containerRef} className="bpmn-viewer" />}</div>
    <div className="rounded-lg border border-primary/20 bg-primary/5 p-4 flex gap-3"><CheckCircle2 className="size-5 shrink-0 text-primary" /><p className="text-sm"><strong>Resultado do processo:</strong> uma reunião presencial confirmada entre Expert e Lançador. A parceria comercial é discutida pelas partes fora da plataforma.</p></div>
  </section>;
}
