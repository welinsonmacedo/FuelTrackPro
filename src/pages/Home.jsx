import React, { useMemo } from "react";
import Card from "../components/Card";
import colors from "../styles/colors";
import { useMediasCalculadas } from "../hooks/useMediasCalculadas";
import { useViagens } from "../hooks/useViagens";
import { useAlertasPendentes } from "../hooks/useAlertasPendentes";

const Home = ({ usuario }) => {
  // Usa o hook passando filtro do usuário (exemplo: motorista)
  const { medias, loading: loadingMedias } = useMediasCalculadas({
    motorista: usuario?.id,
  });

  // Assume que useViagens também aceita filtro por usuário (motorista)
  const { viagens, loading: loadingViagens } = useViagens({
    motoristaId: usuario?.id,
  });

  // Passa o id do usuário para buscar alertas pendentes
  const { alertasCount, loading: loadingAlertas } = useAlertasPendentes(usuario?.id);

  // Calcula o consumo médio do usuário
  const consumoMedio = useMemo(() => {
    if (loadingMedias || !medias.length) return "...";
    // Pega a primeira média (ou ajuste conforme seu modelo)
    const mediaUsuario = medias[0];
    return mediaUsuario?.consumoMedio
      ? `${mediaUsuario.consumoMedio.toFixed(2)} km/l`
      : "N/D";
  }, [medias, loadingMedias]);

  // Pega as últimas 5 viagens do usuário
  const viagensRecentes = useMemo(() => {
    if (loadingViagens || !viagens.length) return [];
    const userViagens = viagens
      .filter((v) => v.motoristaId === usuario?.id)
      .sort((a, b) => new Date(b.dataInicio) - new Date(a.dataInicio));
    return userViagens.slice(0, 5);
  }, [viagens, loadingViagens, usuario]);

  return (
    <div
      style={{
        padding: 20,
        backgroundColor: colors.background,
        color: colors.textPrimary,
        minHeight: "100vh",
        fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
      }}
    >
      <h1 style={{ color: colors.primary }}>Olá, {usuario?.nome || "Usuário"}!</h1>

      <section style={{ marginTop: 30 }}>
        <h2>Resumo Rápido</h2>
        <div style={{ display: "flex", gap: 20, marginTop: 10 }}>
          <Card
            title="Consumo Médio"
            style={{ backgroundColor: colors.primaryDark, color: colors.background, flex: 1 }}
          >
            {loadingMedias ? "Carregando..." : consumoMedio}
          </Card>

          <Card
            title="Viagens Recentes"
            style={{ backgroundColor: colors.accent, color: colors.background, flex: 1 }}
          >
            {loadingViagens ? "Carregando..." : `${viagensRecentes.length} concluídas`}
          </Card>

          <Card
            title="Alertas"
            style={{ backgroundColor: colors.success, color: colors.background, flex: 1 }}
          >
            {loadingAlertas ? "Carregando..." : `${alertasCount} pendentes`}
          </Card>
        </div>
      </section>

      {/* Você pode mostrar detalhes das viagens recentes aqui */}
    </div>
  );
};

export default Home;
