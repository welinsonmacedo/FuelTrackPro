/* eslint-disable no-unused-vars */
export function PneuBox({
  pos,
  pneu,
  handleStatusChange,
  abrirModalRemover,
  kmRodado,
  onDropPneu,
}) {
  const allowDrop = (e) => {
    e.preventDefault();
  };

  const handleDrop = (e) => {
    e.preventDefault();
    const data = e.dataTransfer.getData("text/plain");
    if (!data) return;

    const pneuArrastado = JSON.parse(data);
    if (onDropPneu) onDropPneu(pneuArrastado, pos);
  };

  return (
    <div
      onDragOver={allowDrop}
      onDrop={handleDrop}
      style={{
        border: "2px dashed #aaa",
        width:100,
        minHeight: 150,
        padding: 12,
        borderRadius: 8,
        backgroundColor: pneu ? "#393b39" : "#fff",
        position: "relative",
        color:"#fff"
      }}
      title={pneu ? `${pneu.marca} ${pneu.modelo}` : "Solte um pneu aqui"}
    >
      {pneu ? (
        <>
          <div  style={{
        display:"flex",
        alignItems:"left",
        flexDirection:"column",
        gap:5,
        marginBottom:20
        
      }}>
            <strong>{pos}</strong>
            <strong>{pneu.marcaFogo}</strong>  
            <p>{pneu.marca} </p> 
            <p>{pneu.modelo}</p>
            <p>{pneu.status}</p>
          
          <button onClick={() => abrirModalRemover(pneu)}>Remover</button>
          </div>
        </>
      ) : (
        <div style={{ color: "#ad9f4e", fontStyle: "italic" }}>Vazio</div>
      )}
      {kmRodado !== null && (
        <div
          style={{
            position: "absolute",
            bottom: 4,
            right: 8,
            fontSize: 15,
            color: "#98ad65",
          }}
        >
          Km : {kmRodado}
        </div>
      )}
    </div>
  );
}
