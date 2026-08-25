/** Wordmark oficial com variante azul para fundo claro e branca para fundo escuro. */
import { cn } from "@/lib/utils";
import { useTheme } from "@/contexts/ThemeContext";

type VarianteLogo = "auto" | "branca" | "azul";

export function LogoInsider({ className, compact = false, variante = "auto" }: { className?: string; compact?: boolean; variante?: VarianteLogo }) {
  const { theme } = useTheme();
  const usarLogoBranca = variante === "branca" || (variante === "auto" && theme === "dark");
  const src = usarLogoBranca ? "/manus-storage/LOGO_INSIDER_BRANCO_98928175.svg" : "/manus-storage/LOGO_INSIDER_AZUL_ee788ab9.svg";
  return <img src={src} alt="FL Insider" className={cn("insider-wordmark h-auto", compact ? "h-8 w-auto" : "w-40", className)} />;
}
