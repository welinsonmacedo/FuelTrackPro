import React from 'react';

function OSItensInput({ itens, setItens }) {
  // itens = [{descricao:'Troca de óleo', quantidade:1, valor:120}, ...]

  const handleAddItem = () => {
    setItens([...itens, { descricao: '', quantidade: 1, valor: 0 }]);
  };

  const handleChange = (index, campo, valor) => {
    const novosItens = [...itens];
    novosItens[index][campo] = campo === 'descricao' ? valor : Number(valor);
    setItens(novosItens);
  };

  const handleRemove = (index) => {
    const novosItens = itens.filter((_, i) => i !== index);
    setItens(novosItens);
  };

  const total = itens.reduce((acc, i) => acc + i.quantidade * i.valor, 0);

  return (
    <div>
      <h3>Itens da OS</h3>
      {itens.map((item, i) => (
        <div key={i} style={{ display: 'flex', gap: '8px', marginBottom: '8px' }}>
          <input
            placeholder="Descrição"
            value={item.descricao}
            onChange={e => handleChange(i, 'descricao', e.target.value)}
          />
          <input
            type="number"
            min={1}
            value={item.quantidade}
            onChange={e => handleChange(i, 'quantidade', e.target.value)}
          />
          <input
            type="number"
            min={0}
            step={0.01}
            value={item.valor}
            onChange={e => handleChange(i, 'valor', e.target.value)}
          />
          <button onClick={() => handleRemove(i)}>Remover</button>
        </div>
      ))}
      <button onClick={handleAddItem}>Adicionar Item</button>
      <div><b>Total: R$ {total.toFixed(2)}</b></div>
    </div>
  );
}

export default OSItensInput;
