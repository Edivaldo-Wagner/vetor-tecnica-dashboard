import React, { useState } from "react";
import { X, Plus, Trash2, Loader2 } from "lucide-react";

export default function NewTemplateModal({ 
  isOpen, 
  onClose, 
  onSave = () => {}, // Valor padrão para evitar crash
  isLoading 
}) {
  const [templateName, setTemplateName] = useState("");
  const [equipmentType, setEquipmentType] = useState("SDAI");
  const [categories, setCategories] = useState([
    { title: "01 - INSPEÇÃO GERAL", items: [{ label: "", response_type: "BOOLEAN" }] }
  ]);

  if (!isOpen) return null;

  // Adicionar Nova Categoria/Bloco
  const handleAddCategory = () => {
    setCategories([
      ...categories,
      { title: "", items: [{ label: "", response_type: "BOOLEAN" }] }
    ]);
  };

  // Remover Categoria
  const handleRemoveCategory = (catIndex) => {
    setCategories(categories.filter((_, idx) => idx !== catIndex));
  };

  // Alterar Título da Categoria
  const handleCategoryTitleChange = (catIndex, value) => {
    const updated = [...categories];
    updated[catIndex].title = value;
    setCategories(updated);
  };

  // Adicionar Item dentro de uma Categoria
  const handleAddItem = (catIndex) => {
    const updated = [...categories];
    updated[catIndex].items.push({ label: "", response_type: "BOOLEAN" });
    setCategories(updated);
  };

  // Remover Item
  const handleRemoveItem = (catIndex, itemIndex) => {
    const updated = [...categories];
    updated[catIndex].items = updated[catIndex].items.filter((_, idx) => idx !== itemIndex);
    setCategories(updated);
  };

  // Alterar Dados do Item
  const handleItemChange = (catIndex, itemIndex, field, value) => {
    const updated = [...categories];
    updated[catIndex].items[itemIndex][field] = value;
    setCategories(updated);
  };

  // Submeter Formulário
  const handleSubmit = (e) => {
  e.preventDefault();

  const payload = {
    name: templateName,
    equipment_type: equipmentType,
    categories: categories
      .filter((cat) => cat.title.trim() !== "") // Ignora categorias sem título
      .map((cat, catIdx) => ({
        title: cat.title,
        order: catIdx + 1,
        items: cat.items
          .filter((item) => item.label.trim() !== "") // Ignora perguntas em branco
          .map((item, itemIdx) => ({
            label: item.label,
            response_type: item.response_type,
            order: itemIdx + 1,
          })),
      })),
  };

  onSave(payload);
};

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-3xl overflow-hidden my-8">
        {/* Cabecalho */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <h2 className="text-lg font-semibold text-gray-800">Criar Novo Modelo de Checklist</h2>
          <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded-lg transition-colors">
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6 max-h-[75vh] overflow-y-auto">
          {/* Informacoes Basicas */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Nome do Modelo *
              </label>
              <input
                type="text"
                placeholder="Ex: Checklist SDAI - Central GST"
                value={templateName}
                onChange={(e) => setTemplateName(e.target.value)}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Tipo de Sistema / Equipamento
              </label>
              <select
                value={equipmentType}
                onChange={(e) => setEquipmentType(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="SDAI">Sistema de Detecção e Alarme de Incêndio</option>
                <option value="BOMBAS">Casa de Bombas / Motobombas</option>
                <option value="SPRINKLERS">Rede de Chuveiros (Sprinklers)</option>
                <option value="ILUMINACAO">Iluminação de Emergência</option>
                <option value="EXTINTORES">Extintores de Incêndio</option>
                <option value="OUTRO">Outro Sistema</option>
              </select>
            </div>
          </div>

          <hr className="border-gray-100" />

          {/* Categorias e Perguntas */}
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="text-md font-semibold text-gray-700">Categorias & Verificações</h3>
              <button
                type="button"
                onClick={handleAddCategory}
                className="flex items-center gap-1 text-sm text-blue-600 hover:text-blue-700 font-medium"
              >
                <Plus className="w-4 h-4" /> Adicionar Categoria
              </button>
            </div>

            {categories.map((category, catIndex) => (
              <div key={catIndex} className="p-4 bg-gray-50 rounded-lg border border-gray-200 space-y-4">
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    placeholder="Título da Categoria (Ex: 01 - CENTRAL DE ALARME)"
                    value={category.title}
                    onChange={(e) => handleCategoryTitleChange(catIndex, e.target.value)}
                    className="flex-1 px-3 py-1.5 bg-white border border-gray-300 rounded-lg text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  {categories.length > 1 && (
                    <button
                      type="button"
                      onClick={() => handleRemoveCategory(catIndex)}
                      className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                      title="Remover Categoria"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>

                {/* Items da Categoria */}
                <div className="pl-4 space-y-2 border-l-2 border-gray-200">
                  {category.items.map((item, itemIndex) => (
                    <div key={itemIndex} className="flex items-center gap-2">
                      <input
                        type="text"
                        placeholder="Pergunta / Item a inspecionar"
                        value={item.label}
                        onChange={(e) =>
                          handleItemChange(catIndex, itemIndex, "label", e.target.value)
                        }
                        className="flex-1 px-3 py-1.5 bg-white border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                      <select
                        value={item.response_type}
                        onChange={(e) =>
                          handleItemChange(catIndex, itemIndex, "response_type", e.target.value)
                        }
                        className="px-2 py-1.5 bg-white border border-gray-300 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="BOOLEAN">Sim/Não/NA</option>
                        <option value="NUMBER">Número/Medição</option>
                        <option value="TEXT">Texto Livre</option>
                      </select>
                      {category.items.length > 1 && (
                        <button
                          type="button"
                          onClick={() => handleRemoveItem(catIndex, itemIndex)}
                          className="p-1 text-gray-400 hover:text-red-500 rounded"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  ))}

                  <button
                    type="button"
                    onClick={() => handleAddItem(catIndex)}
                    className="text-xs text-blue-600 hover:underline pt-1 inline-block"
                  >
                    + Adicionar item a esta categoria
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Botoes de Acao */}
          <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
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
              Guardar Modelo
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}