import { Toaster } from "@/components/ui/sonner";
import { lazy, Suspense } from "react";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { AccessGate } from "./components/AccessGate";
import { ThemeProvider } from "./contexts/ThemeContext";
import { isModoOperacaoAdmin, isModoVisualizacaoAdmin, rotaAdministrativaDoPerfil } from "./lib/painelPreview";

const Home = lazy(() => import("./pages/Home"));
const CadastroParticipacao = lazy(() => import("./pages/CadastroParticipacao"));
const AdminPainel = lazy(() => import("./pages/admin/AdminPainel"));
const ExpertPainel = lazy(() => import("./pages/expert/ExpertPainel"));
const LancadorPainel = lazy(() => import("./pages/lancador/LancadorPainel"));
const NotFound = lazy(() => import("./pages/NotFound"));
function Router() {
  const modoVisualizacao = isModoVisualizacaoAdmin(window.location.pathname, window.location.search);
  const modoOperacaoAdmin = isModoOperacaoAdmin(window.location.pathname, window.location.search);
  const navegarComoAdmin = (papel: "admin" | "expert" | "lancador") => {
    window.location.href = rotaAdministrativaDoPerfil(papel);
  };

  // make sure to consider if you need authentication for certain routes
  return (
    <Suspense fallback={<main role="status" aria-live="polite" className="grid min-h-screen place-items-center bg-background px-6 text-center text-sm text-muted-foreground">Carregando a experiência FL Insider…</main>}>
    <Switch>
      <Route path={"/"} component={Home} />
      <Route path={"/cadastro"} component={CadastroParticipacao} />
      <Route path={"/painel/admin"}>
        {() => <AccessGate requiredRole="admin"><AdminPainel onTrocarPapel={navegarComoAdmin} /></AccessGate>}
      </Route>
      <Route path={"/painel/expert"}>
        {() => <AccessGate requiredRole="expert" allowAdminPreview={modoVisualizacao || modoOperacaoAdmin}><ExpertPainel modoVisualizacao={modoVisualizacao} modoOperacaoAdmin={modoOperacaoAdmin} onTrocarPapel={navegarComoAdmin} /></AccessGate>}
      </Route>
      <Route path={"/painel/lancador"}>
        {() => <AccessGate requiredRole="lancador" allowAdminPreview={modoVisualizacao || modoOperacaoAdmin}><LancadorPainel modoVisualizacao={modoVisualizacao} modoOperacaoAdmin={modoOperacaoAdmin} onTrocarPapel={navegarComoAdmin} /></AccessGate>}
      </Route>
      <Route path={"/404"} component={NotFound} />
      {/* Final fallback route */}
      <Route component={NotFound} />
    </Switch>
    </Suspense>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider defaultTheme="light" switchable>
        <TooltipProvider>
          <Toaster position="bottom-right" richColors />
          <Router />
        </TooltipProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
