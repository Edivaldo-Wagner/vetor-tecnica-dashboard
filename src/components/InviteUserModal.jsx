import React, { useState } from "react";
import { X } from "lucide-react";

export default function InviteUserModal({ isOpen, onClose, onSave }) {
  const [companyName, setCompanyName] = useState("");
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("Técnico de campo");
  const [saving, setSaving] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!companyName || !email) return;

    setSaving(true);
    const result = await onSave({
      company_name: companyName,
      email,
      role,
    });
    setSaving(false);

    if (result.success) {
      setCompanyName("");
      setEmail("");
      setRole("Técnico de campo");
      onClose();
    } else {
      alert(result.error || "Ocorreu um erro ao guardar.");
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6 space-y-5 animate-in fade-in duration-200">
        {/* Subcabeçalho e Fechar */}
        <div className="flex justify-between items-start">
          <div>
            <p className="text-[10px] font-mono text-gray-400 uppercase tracking-wider mb-1">
              ACESSO DA EQUIPE
            </p>
            <h3 className="text-xl font-bold text-slate-900">
              Convidar usuário
            </h3>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition p-1"
          >
            <X size={18} />
          </button>
        </div>

        {/* Formulário */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Nome da empresa */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Nome da empresa
            </label>
            <input
              type="text"
              required
              value={companyName}
              onChange={(e) => setCompanyName(e.target.value)}
              placeholder="Ex.: Acme Industrial"
              className="w-full bg-white border border-amber-600/60 rounded-lg px-3 py-2.5 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-amber-500/50 transition placeholder:text-gray-400"
            />
          </div>

          {/* E-mail */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              E-mail
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="responsavel@empresa.com"
              className="w-full bg-white border border-gray-200 rounded-lg px-3 py-2.5 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-amber-500/50 transition placeholder:text-gray-400"
            />
          </div>

          {/* Perfil de acesso */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Perfil de acesso
            </label>
            <select
              value={role}
              onChange={(e) => setRole(e.target.value)}
              className="w-full bg-white border border-gray-200 rounded-lg px-3 py-2.5 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-amber-500/50 transition"
            >
              <option value="Técnico de campo">Técnico de campo</option>
              <option value="Administrador">Administrador</option>
              <option value="Supervisor">Supervisor</option>
            </select>
          </div>

          {/* Botão de Submeter */}
          <div className="pt-2">
            <button
              type="submit"
              disabled={saving}
              className="w-full bg-[#111827] hover:bg-[#1f2937] text-white font-semibold text-xs py-3 rounded-lg transition disabled:opacity-50"
            >
              {saving ? "A guardar..." : "Salvar cadastro"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}