import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { motoristaSchema } from '../schemas/motoristaSchema';
import { useMotoristas } from '../hooks/useMotoristas';
import { useAuditoria } from '../hooks/useAuditoria';
import { SearchInput } from '../components/SearchInput';
import { FormField } from '../components/FormField';
import { ListItem } from '../components/ListItem';
import { ConfirmDialog } from '../components/ConfirmDialog';
import { SubmitButton } from '../components/SubmitButton';
import { Form } from '../components/Form';
import { Modal } from '../components/Modal';
import { formataDataInput } from '../utils/data';

const MotoristasList = () => {
  const { motoristas, adicionarMotorista, editarMotorista, excluirMotorista } = useMotoristas();
  const { log } = useAuditoria();

  const [busca, setBusca] = useState('');
  const [editando, setEditando] = useState(null);
  const [mostrarForm, setMostrarForm] = useState(false);
  const [tituloForm, setTituloForm] = useState('Cadastro');
  const [confirmarId, setConfirmarId] = useState(null);

  const filtrados = motoristas.filter((m) =>
    m.nome.toLowerCase().includes(busca.toLowerCase())
  );

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm({ resolver: yupResolver(motoristaSchema) });

  // Resetar o form quando modal abrir/fechar ou editando mudar
  useEffect(() => {
    if (!mostrarForm) {
      reset({});
      setEditando(null);
    } else {
      if (editando) {
        reset({
          ...editando,
          dataEmissao: formataDataInput(editando.dataEmissao),
          dataValidade: formataDataInput(editando.dataValidade),
        });
      } else {
        reset({});
      }
    }
  }, [mostrarForm, editando, reset]);

  const abrirCadastro = () => {
    setEditando(null);
    setTituloForm('Cadastro');
    setMostrarForm(true);
  };

  const fecharModal = () => {
    setMostrarForm(false);
  };

  const onSubmit = async (dados) => {
    if (editando) {
      const dadosAntes = editando;
      await editarMotorista(editando.id, dados);
      await log(
        'auditoriaMotoristas',
        'Editar motorista',
        'Atualizou dados do motorista',
        dadosAntes,
        dados,
        'MotoristasList'
      );
    } else {
      await adicionarMotorista(dados);
      await log(
        'auditoriaMotoristas',
        'Criar motorista',
        'Cadastro de novo motorista',
        null,
        dados,
        'MotoristasList'
      );
    }
    fecharModal();
  };

  const handleEdit = (item) => {
    setEditando(item);
    setTituloForm('Editar');
    setMostrarForm(true);
  };

  const handleConfirmDelete = async () => {
    const dadosAntes = motoristas.find((m) => m.id === confirmarId);
    await excluirMotorista(confirmarId);
    await log(
      'auditoriaMotoristas',
      'Excluir motorista',
      'Removeu motorista',
      dadosAntes,
      null,
      'MotoristasList'
    );
    setConfirmarId(null);
  };

  return (
    <div
      style={{
        maxWidth: '900px',
        margin: '20px auto',
        padding: '20px 15px',
        backgroundColor: '#fff',
        borderRadius: '8px',
        boxSizing: 'border-box',
      }}
    >
      <h2 style={{ marginBottom: '20px' }}>Motoristas</h2>

      <button
        onClick={abrirCadastro}
        style={{
          marginBottom: '20px',
          padding: '12px 20px',
          fontSize: '16px',
          cursor: 'pointer',
          borderRadius: '6px',
          border: 'none',
          backgroundColor: '#3498db',
          color: '#fff',
          width: '100%',
          maxWidth: '400px',
          boxSizing: 'border-box',
        }}
      >
        Cadastrar Motorista
      </button>

      <Modal isOpen={mostrarForm} onClose={fecharModal} title={`${tituloForm} Motorista`}>
        <Form
          onSubmit={handleSubmit(onSubmit)}
          style={{
            padding: 0,
            border: 'none',
            maxWidth: '100%',
            boxSizing: 'border-box',
          }}
        >
          {/* Label para datas, placeholder para outros */}
          <FormField
            placeholder="Nome"
            name="nome"
            register={register}
            error={errors.nome}
            inputStyle={{
              width: '100%',
              maxWidth: '400px',
              boxSizing: 'border-box',
              padding: '8px',
              borderRadius: '4px',
              border: '1px solid #ccc',
              fontSize: '14px',
              height: '38px',
              marginBottom: '12px',
            }}
          />
          <FormField
            placeholder="CNH"
            name="cnh"
            register={register}
            error={errors.cnh}
            inputStyle={{
              width: '100%',
              maxWidth: '400px',
              boxSizing: 'border-box',
              padding: '8px',
              borderRadius: '4px',
              border: '1px solid #ccc',
              fontSize: '14px',
              height: '38px',
              marginBottom: '12px',
            }}
          />
          <FormField
            placeholder="Categoria"
            name="categoria"
            register={register}
            error={errors.categoria}
            inputStyle={{
              width: '100%',
              maxWidth: '400px',
              boxSizing: 'border-box',
              padding: '8px',
              borderRadius: '4px',
              border: '1px solid #ccc',
              fontSize: '14px',
              height: '38px',
              marginBottom: '12px',
            }}
          />
          <FormField
            label="Data de Emissão"
            name="dataEmissao"
            type="date"
            register={register}
            error={errors.dataEmissao}
            inputStyle={{
              width: '100%',
              maxWidth: '400px',
              boxSizing: 'border-box',
              padding: '8px',
              borderRadius: '4px',
              border: '1px solid #ccc',
              fontSize: '14px',
              height: '38px',
              marginBottom: '12px',
            }}
          />
          <FormField
            label="Data de Validade"
            name="dataValidade"
            type="date"
            register={register}
            error={errors.dataValidade}
            inputStyle={{
              width: '100%',
              maxWidth: '400px',
              boxSizing: 'border-box',
              padding: '8px',
              borderRadius: '4px',
              border: '1px solid #ccc',
              fontSize: '14px',
              height: '38px',
              marginBottom: '12px',
            }}
          />
          <FormField
            placeholder="CPF"
            name="cpf"
            register={register}
            error={errors.cpf}
            inputStyle={{
              width: '100%',
              maxWidth: '400px',
              boxSizing: 'border-box',
              padding: '8px',
              borderRadius: '4px',
              border: '1px solid #ccc',
              fontSize: '14px',
              height: '38px',
              marginBottom: '12px',
            }}
          />

          <SubmitButton loading={isSubmitting}>
            {editando ? 'Atualizar' : 'Cadastrar'}
          </SubmitButton>
        </Form>
      </Modal>

      <SearchInput
        value={busca}
        onChange={setBusca}
        placeholder="Buscar motoristas..."
        style={{
          marginBottom: '20px',
          padding: '8px',
          width: '100%',
          maxWidth: '400px',
          borderRadius: '6px',
          border: '1px solid #ccc',
          boxSizing: 'border-box',
        }}
      />

      <div style={{ width: '100%', maxWidth: '900px' }}>
        {filtrados.map((m) => (
          <ListItem
            key={m.id}
            title={m.nome}
            subtitle={`CNH: ${m.cnh} | CPF: ${m.cpf}`}
            onEdit={() => handleEdit(m)}
            onDelete={() => setConfirmarId(m.id)}
            style={{ marginBottom: '12px' }}
          />
        ))}
      </div>

      {confirmarId && (
        <ConfirmDialog
          title="Excluir motorista"
          message="Tem certeza que deseja excluir este motorista?"
          onConfirm={handleConfirmDelete}
          onCancel={() => setConfirmarId(null)}
        />
      )}
    </div>
  );
};

export default MotoristasList;
