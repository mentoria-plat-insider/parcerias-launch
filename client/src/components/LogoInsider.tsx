/** Wordmark oficial com variante azul para fundo claro e branca para fundo escuro. */
import { cn } from "@/lib/utils";
import { useTheme } from "@/contexts/ThemeContext";

type VarianteLogo = "auto" | "branca" | "azul";

export function LogoInsider({ className, compact = false, variante = "auto" }: { className?: string; compact?: boolean; variante?: VarianteLogo }) {
  const { theme } = useTheme();
  const usarLogoBranca = variante === "branca" || (variante === "auto" && theme === "dark");
  const src = usarLogoBranca ? "/manus-storage/logo-insider-branco_fe284232.svg" : "/manus-storage/logo-insider-azul_c96ee098.svg";
  return <img src={src} alt="FL Insider" className={cn("insider-wordmark h-auto", compact ? "h-8 w-auto" : "w-40", className)} />;
}
