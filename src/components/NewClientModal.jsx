import React, { useState, useEffect } from "react";
import { X } from "lucide-react";

const initialFormState = {
    name: "",
    contract_code: "",
    access_email: "",
    plan: "Essencial",
    monthly_fee: "",
    cnpj: "",
    trade_name: "",
    cep: "",
    state: "",
    address: "",
    number: "",
    complement: "",
    neighborhood: "",
    city: "",
    phone: "",
    contact_person: "",
    contact_email: "",
    status: "ativo",
};

export default function NewClientModal({ isOpen, onClose, onSubmit, clientToEdit }) {
  const [formData, setFormData] = useState(initialFormState);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (clientToEdit) {
      setFormData({
        name: clientToEdit.name || "",
        contract_code: clientToEdit.contract_code || "",
        access_email: clientToEdit.access_email || "",
        plan: clientToEdit.plan || "Essencial",
        monthly_fee: clientToEdit.monthly_fee || "",
        cnpj: clientToEdit.cnpj || "",
        trade_name: clientToEdit.trade_name || "",
        cep: clientToEdit.cep || "",
        state: clientToEdit.state || "",
        address: clientToEdit.address || "",
        number: clientToEdit.number || "",
        complement: clientToEdit.complement || "",
        neighborhood: clientToEdit.neighborhood || "",
        city: clientToEdit.city || "",
        phone: clientToEdit.phone || "",
        contact_person: clientToEdit.contact_person || "",
        contact_email: clientToEdit.contact_email || "",
        status: clientToEdit.status || "ativo",
      });
    } else {
      setFormData(initialFormState);
    }
  }, [clientToEdit, isOpen]);

  if (!isOpen) return null;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = { ...formData };

      if (payload.monthly_fee === "" || payload.monthly_fee === null) {
        payload.monthly_fee = 0;
      } else {
        payload.monthly_fee = parseFloat(payload.monthly_fee);
      }

      Object.keys(payload).forEach((key) => {
        if (key !== "monthly_fee" && key !== "status" && (payload[key] === "" || payload[key] === null)) {
          delete payload[key];
        }
      });

      await onSubmit(payload);
      setFormData(initialFormState);
      onClose();
      window.location.reload();
    } catch (error) {
      console.error("Erro ao guardar cliente:", error);
      alert("Ocorreu um erro ao guardar o cliente.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div 
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
     className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-xl max-h-[90vh] flex flex-col border border-gray-100 overflow-hidden">
        {/* Modal Header */}
        <div className="flex justify-between items-start border-b pb-4 px-6 pt-6">
          <div>
            <p className="text-[10px] font-mono text-gray-400 uppercase tracking-wider">
              {clientToEdit ? "ATUALIZAR CADASTRO" : "CLIENTE + CONTA DE ACESSO"}
            </p>
            <h3 className="text-2xl font-bold text-slate-800">
              {clientToEdit ? "Editar Cliente" : "Novo cliente"}
            </h3>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-slate-600">
            <X size={20} />
          </button>
        </div>

        {/* Modal Body */}
        <form onSubmit={handleSubmit} className="flex flex-col flex-1 overflow-hidden">
          <div className="p-6 overflow-y-auto space-y-4 flex-1">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Nome da empresa *
                </label>
                <input
                  required
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="Ex.: Acme Industrial"
                  className="w-full text-xs p-2.5 border border-gray-200 rounded-lg focus:outline-none focus:border-slate-800"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Contrato
                </label>
                <input
                  type="text"
                  name="contract_code"
                  value={formData.contract_code}
                  onChange={handleChange}
                  placeholder="Código do contrato"
                  className="w-full text-xs p-2.5 border border-gray-200 rounded-lg focus:outline-none focus:border-slate-800"
                />
              </div>
            </div>

            {clientToEdit && (
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Status
                </label>
                <select
                  name="status"
                  value={formData.status}
                  onChange={handleChange}
                  className="w-full text-xs p-2.5 border border-gray-200 rounded-lg bg-white focus:outline-none focus:border-slate-800"
                >
                  <option value="ativo">Ativo</option>
                  <option value="renovacao">Renovação</option>
                  <option value="inativo">Inativo</option>
                </select>
              </div>
            )}

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  E-mail de acesso
                </label>
                <input
                  type="email"
                  name="access_email"
                  value={formData.access_email}
                  onChange={handleChange}
                  placeholder="admin@empresa.com"
                  className="w-full text-xs p-2.5 border border-gray-200 rounded-lg focus:outline-none focus:border-slate-800"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Telefone
                </label>
                <input
                  type="text"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder="(00) 00000-0000"
                  className="w-full text-xs p-2.5 border border-gray-200 rounded-lg focus:outline-none focus:border-slate-800"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Plano
                </label>
                <select
                  name="plan"
                  value={formData.plan}
                  onChange={handleChange}
                  className="w-full text-xs p-2.5 border border-gray-200 rounded-lg bg-white focus:outline-none focus:border-slate-800"
                >
                  <option value="Essencial">Essencial</option>
                  <option value="Profissional">Profissional</option>
                  <option value="Empresarial">Empresarial</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Valor mensal (R$)
                </label>
                <input
                  type="number"
                  name="monthly_fee"
                  value={formData.monthly_fee}
                  onChange={handleChange}
                  placeholder="990"
                  className="w-full text-xs p-2.5 border border-gray-200 rounded-lg focus:outline-none focus:border-slate-800"
                />
              </div>
            </div>

            {/* DADOS COMPLETOS DO CLIENTE */}
            <div className="pt-4 border-t border-gray-100">
              <p className="text-[10px] font-mono text-gray-400 uppercase tracking-wider mb-3">
                DADOS COMPLETOS DO CLIENTE
              </p>

              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    CNPJ
                  </label>
                  <input
                    type="text"
                    name="cnpj"
                    value={formData.cnpj}
                    onChange={handleChange}
                    placeholder="00.000.000/0000-00"
                    className="w-full text-xs p-2.5 border border-gray-200 rounded-lg focus:outline-none focus:border-slate-800"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Nome fantasia
                  </label>
                  <input
                    type="text"
                    name="trade_name"
                    value={formData.trade_name}
                    onChange={handleChange}
                    placeholder="Nome usado no dia a dia"
                    className="w-full text-xs p-2.5 border border-gray-200 rounded-lg focus:outline-none focus:border-slate-800"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      CEP
                    </label>
                    <input
                      type="text"
                      name="cep"
                      value={formData.cep}
                      onChange={handleChange}
                      placeholder="00000-000"
                      className="w-full text-xs p-2.5 border border-gray-200 rounded-lg focus:outline-none focus:border-slate-800"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Estado
                    </label>
                    <input
                      type="text"
                      name="state"
                      value={formData.state}
                      onChange={handleChange}
                      placeholder="Estado"
                      className="w-full text-xs p-2.5 border border-gray-200 rounded-lg focus:outline-none focus:border-slate-800"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <div className="col-span-2">
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Endereço
                    </label>
                    <input
                      type="text"
                      name="address"
                      value={formData.address}
                      onChange={handleChange}
                      placeholder="Rua, avenida..."
                      className="w-full text-xs p-2.5 border border-gray-200 rounded-lg focus:outline-none focus:border-slate-800"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Número
                    </label>
                    <input
                      type="text"
                      name="number"
                      value={formData.number}
                      onChange={handleChange}
                      placeholder="Nº"
                      className="w-full text-xs p-2.5 border border-gray-200 rounded-lg focus:outline-none focus:border-slate-800"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Complemento
                  </label>
                  <input
                    type="text"
                    name="complement"
                    value={formData.complement}
                    onChange={handleChange}
                    placeholder="Sala, bloco... (opcional)"
                    className="w-full text-xs p-2.5 border border-gray-200 rounded-lg focus:outline-none focus:border-slate-800"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Cidade
                    </label>
                    <input
                      type="text"
                      name="city"
                      value={formData.city}
                      onChange={handleChange}
                      placeholder="Cidade"
                      className="w-full text-xs p-2.5 border border-gray-200 rounded-lg focus:outline-none focus:border-slate-800"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Responsável no cliente
                    </label>
                    <input
                      type="text"
                      name="contact_person"
                      value={formData.contact_person}
                      onChange={handleChange}
                      placeholder="Nome do responsável"
                      className="w-full text-xs p-2.5 border border-gray-200 rounded-lg focus:outline-none focus:border-slate-800"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    E-mail do responsável
                  </label>
                  <input
                    type="email"
                    name="contact_email"
                    value={formData.contact_email}
                    onChange={handleChange}
                    placeholder="contato@empresa.com"
                    className="w-full text-xs p-2.5 border border-gray-200 rounded-lg focus:outline-none focus:border-slate-800"
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="p-4 border-t border-gray-100 bg-white z-10 shrink-0 grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
            >
              Fechar
            </button>
            <button
              type="submit"
              disabled={saving}
              className="w-full bg-slate-900 hover:bg-slate-800 text-white font-semibold py-3 rounded-lg text-xs transition disabled:opacity-50"
            >
              {saving ? "A guardar..." : clientToEdit ? "Atualizar cadastro" : "Salvar cadastro"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}