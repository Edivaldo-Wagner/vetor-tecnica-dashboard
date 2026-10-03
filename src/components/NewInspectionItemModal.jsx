// NewInspectionItemModal.jsx
import React, { useState } from "react";
import { X, Loader2 } from "lucide-react";

export default function NewInspectionItemModal({ 
  isOpen, 
  onClose, 
  onSave, 
  isLoading, 
  template 
}) {
  const [label, setLabel] = useState("");
  const [responseType, setResponseType] = useState("BOOLEAN");
  const [selectedCategoryId, setSelectedCategoryId] = useState("");
  const [newCategoryTitle, setNewCategoryTitle] = useState("");

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();

    onSave({
      templateId: template?.id,
      categoryId: selectedCategoryId || null,
      newCategoryTitle: selectedCategoryId ? null : newCategoryTitle,
      label: label,
      responseType: responseType,
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden">
        {/* Cabeçalho */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <h2 className="text-lg font-semibold text-gray-800">
            Adicionar Item de Inspeção
          </h2>
          <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded-lg transition-colors">
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Formulário */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Seleção de Categoria */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Categoria
            </label>
            <select
              value={selectedCategoryId}
              onChange={(e) => setSelectedCategoryId(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
            >
              <option value="">+ Criar Nova Categoria</option>
              {template?.categories?.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.title}
                </option>
              ))}
            </select>
          </div>

          {/* Campo para Nova Categoria (Caso não selecione uma existente) */}
          {!selectedCategoryId && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Nome da Nova Categoria *
              </label>
              <input
                type="text"
                placeholder="Ex: 02 - DETECTORES DE FUMAÇA"
                value={newCategoryTitle}
                onChange={(e) => setNewCategoryTitle(e.target.value)}
                required={!selectedCategoryId}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
              />
            </div>
          )}

          {/* Pergunta / Descrição */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Pergunta / Descrição do Item *
            </label>
            <input
              type="text"
              placeholder="Ex: Verificar tensão das pilhas/baterias"
              value={label}
              onChange={(e) => setLabel(e.target.value)}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
            />
          </div>

          {/* Tipo de Resposta */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Tipo de Resposta
            </label>
            <select
              value={responseType}
              onChange={(e) => setResponseType(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
            >
              <option value="BOOLEAN">Conforme / Não Conforme / NA (Sim/Não)</option>
              <option value="NUMBER">Valor Numérico / Medição (Ex: Amperagem, Tensão)</option>
              <option value="TEXT">Texto Livre / Observação</option>
            </select>
          </div>

          {/* Botões */}
          <div className="flex justify-end gap-3 pt-4 border-t border-gray-100 mt-6">
            <button
              type="button"
              onClick={onClose}
              disabled={isLoading}
              className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 flex items-center gap-2 transition-colors"
            >
              {isLoading && <Loader2 className="w-4 h-4 animate-spin" />}
              Adicionar Item
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}