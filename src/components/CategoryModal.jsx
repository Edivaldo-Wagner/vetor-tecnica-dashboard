import React, { useState } from "react";
import { X } from "lucide-react";

export default function CategoryModal({ isOpen, onClose, onSave }) {
  const [name, setName] = useState("");
  const [itemsText, setItemsText] = useState("");
  const [saving, setSaving] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim()) return;

    setSaving(true);
    try {
      await onSave(name, itemsText);
      setName("");
      setItemsText("");
      onClose();
    } catch (err) {
      console.error("Erro ao salvar categoria:", err);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl relative animate-in fade-in zoom-in-95 duration-150">
        {/* Botão Fechar */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 text-gray-400 hover:text-gray-600 transition"
        >
          <X size={20} />
        </button>

        {/* Cabeçalho */}
        <p className="text-[10px] font-mono text-gray-400 uppercase tracking-wider mb-1">
          CHECKLIST
        </p>
        <h3 className="text-xl font-bold text-slate-800 mb-6">
          Nova categoria de verificação
        </h3>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Campo Nome da Categoria */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-2">
              Nome da categoria
            </label>
            <input
              type="text"
              placeholder="Ex.: Sistema de detecção e alarme"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className="w-full border border-gray-200 rounded-lg px-3.5 py-2.5 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-slate-800/20 focus:border-slate-800 transition"
            />
          </div>

          {/* Campo Itens a Verificar */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Itens a verificar
            </label>
            <p className="text-[11px] text-gray-400 mb-2">
              Digite um item por linha
            </p>
            <textarea
              rows={4}
              placeholder={`Ex.: Verificar painel de alarme\nTestar acionadores manuais\nConferir sirenes`}
              value={itemsText}
              onChange={(e) => setItemsText(e.target.value)}
              className="w-full border border-gray-200 rounded-lg px-3.5 py-2.5 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-slate-800/20 focus:border-slate-800 transition resize-none"
            />
          </div>

          {/* Botões de Ação */}
          <div className="flex justify-end items-center gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-200 text-slate-700 text-xs font-semibold rounded-lg hover:bg-gray-50 transition"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={saving}
              className="px-4 py-2 bg-slate-900 text-white text-xs font-semibold rounded-lg hover:bg-slate-800 disabled:opacity-50 transition"
            >
              {saving ? "A guardar..." : "Adicionar ao checklist"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
