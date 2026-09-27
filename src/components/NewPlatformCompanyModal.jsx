import React, { useState } from "react";
import { X } from "lucide-react";

export default function NewPlatformCompanyModal({ isOpen, onClose, onSubmit }) {
  const [formData, setFormData] = useState({
    name: "",
    plan: "Profissional",
    monthly_fee: "",
    users_count: 1,
    status: "ativa",
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
      console.error("Erro ao cadastrar empresa:", error);
      alert("Ocorreu um erro ao guardar a empresa.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto p-6 border border-gray-100">
        {/* Modal Header */}
        <div className="flex justify-between items-start mb-6 border-b pb-4">
          <div>
            <p className="text-[10px] font-mono text-gray-400 uppercase tracking-wider">
              PLATAFORMA + NOVA EMPRESA
            </p>
            <h3 className="text-2xl font-bold text-slate-800">Nova empresa</h3>
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
              placeholder="Ex.: Refinaria do Sul"
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
                step="0.01"
                name="monthly_fee"
                value={formData.monthly_fee}
                onChange={handleChange}
                placeholder="1890"
                className="w-full text-xs p-2.5 border border-gray-200 rounded-lg focus:outline-none focus:border-slate-800"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Qtd. Usuários
              </label>
              <input
                type="number"
                name="users_count"
                value={formData.users_count}
                onChange={handleChange}
                placeholder="1"
                className="w-full text-xs p-2.5 border border-gray-200 rounded-lg focus:outline-none focus:border-slate-800"
              />
            </div>

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
                <option value="ativa">Ativa</option>
                <option value="trial">Trial</option>
                <option value="inativa">Inativa</option>
              </select>
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