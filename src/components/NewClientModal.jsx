import React, { useState } from "react";
import { X } from "lucide-react";

export default function NewClientModal({ isOpen, onClose, onSubmit }) {
  const [formData, setFormData] = useState({
    name: "",
    contract_code: "",
    access_email: "",
    initial_password: "",
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
  });

  const [saving, setSaving] = useState(false);

  if (!isOpen) return null;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await onSubmit(formData);
      onClose();
    } catch (error) {
      console.error("Erro ao cadastrar cliente:", error);
      alert("Ocorreu um erro ao guardar o cliente.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-xl max-h-[90vh] overflow-y-auto p-6 border border-gray-100">
        {/* Modal Header */}
        <div className="flex justify-between items-start mb-6 border-b pb-4">
          <div>
            <p className="text-[10px] font-mono text-gray-400 uppercase tracking-wider">
              CLIENTE + CONTA DE ACESSO
            </p>
            <h3 className="text-2xl font-bold text-slate-800">Novo cliente</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-gray-400 hover:text-slate-700 transition"
          >
            <X size={20} />
          </button>
        </div>

        {/* Modal Body */}
        <form onSubmit={handleSubmit} className="space-y-4">
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
              Senha inicial
            </label>
            <input
              type="password"
              name="initial_password"
              value={formData.initial_password}
              onChange={handleChange}
              placeholder="Mínimo de 6 caracteres"
              className="w-full text-xs p-2.5 border border-gray-200 rounded-lg focus:outline-none focus:border-slate-800"
            />
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
                    placeholder="Selecione/Estado"
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
                    placeholder="Rua, avenida ou rodovia"
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
                  placeholder="Sala, bloco, km... (opcional)"
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

          {/* Submit Button */}
          <div className="pt-4 border-t border-gray-100">
            <button
              type="submit"
              disabled={saving}
              className="w-full bg-slate-900 hover:bg-slate-800 text-white font-semibold py-3 rounded-lg text-xs transition disabled:opacity-50"
            >
              {saving ? "A guardar..." : "Salvar cadastro"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
