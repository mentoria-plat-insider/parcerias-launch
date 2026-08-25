/** Controle persistente de aparência — FL Insider v5. */
import { Moon, Sun } from "lucide-react";
import { useTheme } from "@/contexts/ThemeContext";
import { cn } from "@/lib/utils";

export function ThemeToggle({ className }: { className?: string }) {
  const { theme, toggleTheme } = useTheme();
  if (!toggleTheme) return null;
  const claro = theme === "light";
  return <button type="button" onClick={toggleTheme} title={claro ? "Ativar modo escuro" : "Ativar modo claro"} aria-label={claro ? "Ativar modo escuro" : "Ativar modo claro"}
    className={cn("inline-flex size-10 items-center justify-center rounded-md border border-border bg-card text-foreground shadow-sm transition-all duration-150 hover:bg-accent active:scale-[0.96]", className)}>
    {claro ? <Moon className="size-4" /> : <Sun className="size-4" />}
  </button>;
}
