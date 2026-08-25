/** Determina quando o Administrador está apenas visualizando outro perfil. */
export function isModoVisualizacaoAdmin(pathname: string, search: string) {
  const ePainelDeOutroPerfil = pathname === "/painel/expert" || pathname === "/painel/lancador";
  return ePainelDeOutroPerfil && new URLSearchParams(search).get("modo") === "leitura";
}

/** O modo operacional usa exclusivamente os registros fictícios reservados para validação. */
export function isModoOperacaoAdmin(pathname: string, search: string) {
  const ePainelDeOutroPerfil = pathname === "/painel/expert" || pathname === "/painel/lancador";
  const params = new URLSearchParams(search);
  return ePainelDeOutroPerfil && (params.get("operacao") === "admin" || params.get("visualizacao") === "admin");
}

/** O Administrador precisa manter a troca de perfil durante a validação operacional. */
export function deveMostrarTrocaPapel(papel: "admin" | "expert" | "lancador", modoVisualizacao = false, modoOperacaoAdmin = false) {
  return papel === "admin" || modoVisualizacao || modoOperacaoAdmin;
}

/** Define o destino seguro de cada papel quando a navegação parte de um Administrador. */
export function rotaAdministrativaDoPerfil(papel: "admin" | "expert" | "lancador") {
  return papel === "admin" ? "/painel/admin" : `/painel/${papel}?operacao=admin`;
}
