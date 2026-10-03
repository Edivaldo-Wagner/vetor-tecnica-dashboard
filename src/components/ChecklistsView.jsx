// ChecklistsView.jsx
import React, { useState } from "react";
import { ClipboardCheck, Plus, ChevronDown, ChevronRight, ListPlus, Loader2 } from "lucide-react";
import { useInspectionTemplates } from "../hooks/useInspectionTemplates";
import NewTemplateModal from "../components/NewTemplateModal";
import NewInspectionItemModal from "../components/NewInspectionItemModal";

export default function ChecklistsView() {
  const { templates, loading, error, addTemplate, addItemToTemplate } = useInspectionTemplates();
  const [expandedTemplates, setExpandedTemplates] = useState([]);

  // Modais
  const [isTemplateModalOpen, setIsTemplateModalOpen] = useState(false);
  const [isItemModalOpen, setIsItemModalOpen] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [isSaving, setIsSaving] = useState(false);

  const toggleExpand = (id) => {
    setExpandedTemplates((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleOpenItemModal = (template) => {
    setSelectedTemplate(template);
    setIsItemModalOpen(true);
  };

  // Função para criar novo modelo
  const handleSaveTemplate = async (payload) => {
    try {
      setIsSaving(true);
      await addTemplate(payload);
      setIsTemplateModalOpen(false);
    } catch (err) {
      console.error("Erro ao criar modelo:", err);
      alert("Erro ao salvar o modelo de checklist.");
    } finally {
      setIsSaving(false);
    }
  };

  // Função para adicionar item a um modelo existente
  const handleSaveItem = async (payload) => {
    try {
      setIsSaving(true);
      await addItemToTemplate(payload);
      setIsItemModalOpen(false);
      setSelectedTemplate(null);
    } catch (err) {
      console.error("Erro ao adicionar item:", err);
      alert("Erro ao salvar o item de inspeção.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="mt-6 space-y-6">
      {/* Cabeçalho */}
      <div className="flex justify-between items-end mb-6">
        <div>
          <p className="text-[10px] font-mono text-gray-400 uppercase tracking-wider mb-1">
            CONFIGURAÇÕES TÉCNICAS
          </p>
          <h2 className="text-3xl font-bold text-slate-800 flex items-center gap-2">
            <ClipboardCheck className="w-7 h-7 text-indigo-600" />
            Modelos de Checklist
          </h2>
        </div>
        <button
          onClick={() => setIsTemplateModalOpen(true)}
          className="bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold px-4 py-2.5 rounded-lg flex items-center gap-1.5 transition"
        >
          <Plus size={14} /> + Novo Modelo
        </button>
      </div>

      {/* Estados de Carregamento e Erro */}
      {loading && (
        <div className="flex items-center justify-center p-12 bg-white rounded-xl border border-gray-100">
          <Loader2 className="w-6 h-6 animate-spin text-slate-400" />
          <span className="ml-2 text-xs text-gray-500 font-mono">A carregar modelos...</span>
        </div>
      )}

      {error && (
        <div className="p-4 bg-red-50 text-red-600 text-xs rounded-lg font-mono">
          Erro ao carregar os modelos de checklist do servidor Django.
        </div>
      )}

      {/* Lista de Modelos */}
      {!loading && !error && (
        <div className="space-y-4">
          {templates.length === 0 ? (
            <div className="bg-white p-8 text-center rounded-xl border border-gray-100 text-gray-400 font-mono text-xs">
              Nenhum modelo cadastrado na base de dados.
            </div>
          ) : (
            templates.map((tmpl) => {
              const isExpanded = expandedTemplates.includes(tmpl.id);

              return (
                <div key={tmpl.id} className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
                  <div
                    className="p-4 bg-gray-50/50 flex items-center justify-between cursor-pointer hover:bg-gray-100/50 transition border-b border-gray-100"
                    onClick={() => toggleExpand(tmpl.id)}
                  >
                    <div className="flex items-center gap-3">
                      {isExpanded ? (
                        <ChevronDown className="w-5 h-5 text-gray-400" />
                      ) : (
                        <ChevronRight className="w-5 h-5 text-gray-400" />
                      )}
                      <div>
                        <h3 className="font-bold text-slate-800 text-base">{tmpl.name}</h3>
                        <span className="inline-block text-[10px] font-mono text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded border border-indigo-100 mt-1">
                          {tmpl.equipment_type_display || tmpl.equipment_type}
                        </span>
                      </div>
                    </div>

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleOpenItemModal(tmpl);
                      }}
                      className="flex items-center gap-1.5 text-xs font-semibold bg-white hover:bg-gray-50 text-slate-700 border border-gray-200 px-3 py-1.5 rounded-lg transition"
                    >
                      <ListPlus className="w-4 h-4 text-indigo-600" />
                      + Adicionar Item
                    </button>
                  </div>

                  {isExpanded && (
                    <div className="p-6 space-y-6">
                      {tmpl.categories?.length === 0 ? (
                        <p className="text-gray-400 text-xs font-mono text-center py-4">
                          Nenhuma categoria ou pergunta cadastrada neste modelo.
                        </p>
                      ) : (
                        tmpl.categories?.map((cat) => (
                          <div key={cat.id} className="border border-gray-100 rounded-lg p-4 bg-gray-50/30 space-y-3">
                            <div className="flex items-center justify-between border-b border-gray-100 pb-2">
                              <h4 className="font-bold text-slate-700 text-xs tracking-wider uppercase font-mono">
                                {cat.title}
                              </h4>
                              <span className="text-[10px] font-mono text-gray-400">
                                {cat.items?.length || 0} itens
                              </span>
                            </div>

                            <div className="divide-y divide-gray-100 bg-white rounded-lg border border-gray-100">
                              {cat.items?.map((item, idx) => (
                                <div key={item.id} className="p-3 flex items-center justify-between text-xs hover:bg-gray-50/50">
                                  <div className="flex items-center gap-3">
                                    <span className="text-gray-400 font-mono text-[10px] w-4">{idx + 1}.</span>
                                    <span className="text-slate-800 font-medium">{item.label}</span>
                                  </div>
                                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-gray-100 text-gray-600">
                                    {item.response_type === "BOOLEAN" && "Sim / Não / N/A"}
                                    {item.response_type === "NUMBER" && "Medição (Nº)"}
                                    {item.response_type === "TEXT" && "Texto Livre"}
                                  </span>
                                </div>
                              ))}
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      )}

      {/* Modais */}
      <NewTemplateModal
        isOpen={isTemplateModalOpen}
        onClose={() => setIsTemplateModalOpen(false)}
        onSave={handleSaveTemplate}
        isLoading={isSaving}
      />

      {selectedTemplate && (
        <NewInspectionItemModal
          isOpen={isItemModalOpen}
          template={selectedTemplate}
          onClose={() => setIsItemModalOpen(false)}
          onSave={handleSaveItem}
          isLoading={isSaving}
        />
      )}
    </div>
  );
}