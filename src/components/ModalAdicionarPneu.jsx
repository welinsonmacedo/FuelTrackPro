/* eslint-disable no-unused-vars */
import React, { useState } from "react";
import { Modal } from "./Modal";
import { FormField } from "./FormField";
import { SubmitButton } from "./SubmitButton";
import { format } from "date-fns";

 export function ModalAdicionarPneu({ isOpen, onClose, onSalvar, posicao, placa }) {
  const [form, setForm] = useState({
    marca: "",
    modelo: "",
    medida: "",
    status: "Novo",
    posicao: posicao || "",
    dataInstalacao: format(new Date(), "yyyy-MM-dd"),
    kmInstalacao: "",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.marca || !form.modelo || !form.medida) {
      alert("Preencha todos os campos obrigatórios.");
      return;
    }

    await onSalvar(form);
    setForm({
      marca: "",
      modelo: "",
      medida: "",
      status: "Novo",
      posicao: posicao || "",
      dataInstalacao: format(new Date(), "yyyy-MM-dd"),
      kmInstalacao: "",
    });
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={`Adicionar Pneu - ${posicao}`}>
      <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        <FormField
          label="Marca"
          name="marca"
          value={form.marca}
          onChange={handleChange}
          required
        />
        <FormField
          label="Modelo"
          name="modelo"
          value={form.modelo}
          onChange={handleChange}
          required
        />
        <FormField
          label="Medida"
          name="medida"
          value={form.medida}
          onChange={handleChange}
          required
        />
        <FormField
          label="Status"
          name="status"
          value={form.status}
          onChange={handleChange}
          type="select"
          options={["Novo", "Usado", "Recapado", "Em Manutenção"]}
        />
        <FormField
          label="Data de Instalação"
          name="dataInstalacao"
          type="date"
          value={form.dataInstalacao}
          onChange={handleChange}
        />
        <FormField
          label="KM de Instalação"
          name="kmInstalacao"
          type="number"
          value={form.kmInstalacao}
          onChange={handleChange}
        />
        <SubmitButton label="Salvar Pneu" />
      </form>
    </Modal>
  );
}

