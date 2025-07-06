import React, { useMemo } from "react";
import Card from "../components/Card";
import colors from "../styles/colors";
import { useMediasCalculadas } from "../hooks/useMediasCalculadas";
import { useViagens } from "../hooks/useViagens";
import { useAlertasManutencao } from "../hooks/useAlertasPendentes";

const Home = ({ usuario }) => {
  const { medias, loading: loadingMedias } = useMediasCalculadas({});
  const { viagens, loading: loadingViagens } = useViagens();
  const alertas = useAlertasManutencao();

 const consumoMedio = useMemo(() => {
  if (loadingMedias || !medias.length) return "...";

  // Somar todas as médias válidas
  const somaMedias = medias.reduce((acc, item) => {
    return acc + (typeof item.media === "number" ? item.media : 0);
  }, 0);

  // Contar quantas médias são números válidos
  const quantidadeValidos = medias.filter(item => typeof item.media === "number").length;

  if (quantidadeValidos === 0) return "N/D";

  const mediaFinal = somaMedias / quantidadeValidos;

  return `${mediaFinal.toFixed(2)} km/l`;
}, [medias, loadingMedias]);


  const viagensRecentes = useMemo(() => {
    if (loadingViagens || !viagens) return [];
    const userViagens = viagens
      .filter((v) => v.motoristaId === usuario?.id)
      .sort((a, b) => new Date(b.dataInicio) - new Date(a.dataInicio));
    return userViagens.slice(0, 5);
  }, [viagens, loadingViagens, usuario]);

  // Define a cor do card Alertas baseado na quantidade
  const corAlertas = useMemo(() => {
    const count = alertas.length;
    if (count > 10) return "#e74c3c"; // vermelho
    if (count >= 5) return "#f39c12"; // amarelo
    return "#27ae60"; // verde
  }, [alertas]);

  return (
    <div
      style={{
        padding: 20,
        backgroundColor: colors.background,
        color: colors.textPrimary,
        minHeight: "auto",
        fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
      }}
    >
    

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
            style={{ backgroundColor: corAlertas, color: colors.background, flex: 1 }}
          >
            {alertas.length} pendentes
          </Card>
        </div>
      </section>

  
    </div>
  );
};

export default Home;
