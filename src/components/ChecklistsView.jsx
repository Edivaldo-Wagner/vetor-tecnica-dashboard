// ChecklistsView.jsx
import React, { useState, useEffect } from "react";
import { ClipboardCheck, Plus, ChevronDown, ChevronRight, ListPlus, Edit2, Trash2, Loader2, FileText } from "lucide-react";
import { getEquipments } from "../services/api";
import { useInspectionTemplates } from "../hooks/useInspectionTemplates";
import NewTemplateModal from "../components/NewTemplateModal";
import NewInspectionItemModal from "../components/NewInspectionItemModal";
import companyLogo from "../assets/logo.jpg";

export default function ChecklistsView() {
  const { templates, loading, error, addTemplate, editTemplate, removeTemplate, addItemToTemplate } = useInspectionTemplates();
  const [expandedTemplates, setExpandedTemplates] = useState([]);
  const [equipments, setEquipments] = useState([]);

  // Modais
  const [templateToEdit, setTemplateToEdit] = useState(null);
  const [isTemplateModalOpen, setIsTemplateModalOpen] = useState(false);
  const [isItemModalOpen, setIsItemModalOpen] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    const fetchEquipments = async () => {
      try {
        const res = await getEquipments();
        setEquipments(res.data);
      } catch (err) {
        console.error("Erro ao carregar equipamentos:", err);
      }
    };
    fetchEquipments();
  }, []);

  const handleOpenCreate = () => {
    setTemplateToEdit(null);
    setIsTemplateModalOpen(true);
  };

  const handleOpenEdit = (tmpl, e) => {
    e.stopPropagation();
    setTemplateToEdit(tmpl);
    setIsTemplateModalOpen(true);
  };

  const handleDeleteTemplate = async (tmpl, e) => {
    e.stopPropagation();
    if (window.confirm(`Tem certeza que deseja apagar o modelo "${tmpl.name}"?`)) {
      try {
        await removeTemplate(tmpl.id);
        window.location.reload();
      } catch (err) {
        alert("Erro ao eliminar o modelo de checklist.");
      }
    }
  };

  const toggleExpand = (id) => {
    setExpandedTemplates((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleOpenItemModal = (template) => {
    setSelectedTemplate(template);
    setIsItemModalOpen(true);
  };

  const handleExportPDF = (tmpl) => {
    const printWindow = window.open("", "_blank");
    if (!printWindow) return;

    const htmlContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Relatório - ${tmpl.name}</title>
          <style>
            @page {
              size: A4 portrait;
              margin: 10mm;
            }
            body {
              font-family: Arial, Helvetica, sans-serif;
              font-size: 10px;
              color: #000;
              margin: 0;
              padding: 0;
            }
            .header-table {
              width: 100%;
              border-collapse: collapse;
              margin-bottom: 5px;
            }
            .header-table td {
              border: 1.5px solid #000;
              padding: 4px 6px;
              vertical-align: middle;
            }
            .title-box {
              font-weight: bold;
              text-transform: uppercase;
            }
            .title-main {
              font-size: 13px;
              margin-bottom: 2px;
            }
            .title-sub {
              font-size: 9px;
            }
            .logo-cell {
              width: 130px;
              text-align: center;
              padding: 2px !important;
            }
            .logo-img {
              max-height: 45px;
              max-width: 120px;
              object-fit: contain;
            }
            .info-table {
              width: 100%;
              border-collapse: collapse;
              margin-bottom: 10px;
            }
            .info-table td {
              border: 1.5px solid #000;
              padding: 4px 5px;
              font-size: 8.5px;
            }
            .bg-gray {
              background-color: #e5e5e5;
              font-weight: bold;
            }
            .pending-text {
              color: #666;
              font-style: italic;
            }
            .checklist-table {
              width: 100%;
              border-collapse: collapse;
              margin-bottom: 8px;
            }
            .checklist-table td, .checklist-table th {
              border: 1.5px solid #000;
              padding: 3px 5px;
              font-size: 9px;
            }
            .cat-header {
              background-color: #e5e5e5;
              font-weight: bold;
              text-transform: uppercase;
              font-size: 9.5px;
            }
            .col-label {
              width: 60%;
              text-align: left;
            }
            .col-status {
              width: 12%;
              text-align: center;
              font-weight: bold;
            }
            .col-obs {
              width: 28%;
              text-align: left;
            }
            
            /* Estilos para o Relatório Fotográfico no PDF */
            .photo-section-title {
              font-size: 11px;
              font-weight: bold;
              text-transform: uppercase;
              background-color: #333;
              color: #fff;
              padding: 5px 8px;
              margin-top: 15px;
              margin-bottom: 8px;
              border: 1.5px solid #000;
            }
            .photo-grid {
              width: 100%;
              border-collapse: collapse;
            }
            .photo-cell {
              width: 50%;
              border: 1.5px solid #000;
              padding: 6px;
              vertical-align: top;
              text-align: center;
            }
            .photo-container {
              width: 100%;
              height: 400px; /* Altura fixa rigorosa para todas as caixas de foto */
              background-color: #f9f9f9;
              border: 1px solid #ccc;
              display: flex;
              align-items: center;
              justify-content: center;
              margin-bottom: 4px;
              overflow: hidden;
            }
            .photo-img {
              width: 100%;
              height: 100%;
              object-fit: cover; /* Preenche a caixa uniformemente mantendo padrão idêntico */
            }
            .photo-caption {
              font-size: 9px;
              font-weight: bold;
              color: #222;
              text-align: left;
              margin-top: 4px;
              padding: 2px 4px;
              background: #f0f0f0;
              border: 1px solid #ddd;
            }
          </style>
        </head>
        <body>
          <!-- Cabeçalho Principal -->
          <table class="header-table">
            <tr>
              <td class="title-box">
                <div class="title-main">${tmpl.equipment_type_display || tmpl.equipment_type || "SISTEMA DE INSPEÇÃO"}</div>
                <div class="title-sub">${tmpl.name}</div>
              </td>
              <td class="logo-cell">
                <img src="${companyLogo}" class="logo-img" alt="Logo" />
              </td>
            </tr>
          </table>

          <!-- Tabela de Informações Globais da O.S. -->
          <table class="info-table">
            <tr>
              <td class="bg-gray" style="width: 12%;">CLIENTE</td>
              <td class="pending-text" style="width: 53%;">Aguardando emissão da Ordem de Serviço</td>
              <td class="bg-gray" style="width: 10%;">OS Nº</td>
              <td class="pending-text" style="width: 25%;">Pendente de Abertura</td>
            </tr>
            <tr>
              <td class="bg-gray">DATA/HORA</td>
              <td class="pending-text">Aguardando agendamento</td>
              <td class="bg-gray">CHECK-IN / OUT</td>
              <td class="pending-text">Aguardando execução em campo</td>
            </tr>
            <tr>
              <td class="bg-gray">TÉCNICO</td>
              <td colspan="3" class="pending-text">Aguardando atribuição de equipa técnica</td>
            </tr>
          </table>

          <!-- Tabelas de Categorias e Itens -->
          ${tmpl.categories && tmpl.categories.length > 0 ? tmpl.categories.map((cat) => `
            <table class="checklist-table">
              <thead>
                <tr class="cat-header">
                  <th colspan="3" style="text-align: left;">${cat.title}</th>
                </tr>
              </thead>
              <tbody>
                ${cat.items && cat.items.length > 0 ? cat.items.map((item) => `
                  <tr>
                    <td class="col-label">${item.label}</td>
                    <td class="col-status">${item.status || "SIM"}</td>
                    <td class="col-obs">${item.observation || ""}</td>
                  </tr>
                `).join("") : `
                  <tr>
                    <td colspan="3" style="text-align: center; font-style: italic; color: #666;">Nenhum item cadastrado nesta categoria.</td>
                  </tr>
                `}
              </tbody>
            </table>
          `).join("") : `
            <div style="text-align: center; padding: 20px; font-style: italic; color: #666;">Nenhuma categoria associada a este modelo de checklist.</div>
          `}

          <!-- Relatório Fotográfico (Se houver fotos) -->
          ${tmpl.photos && tmpl.photos.length > 0 ? `
            <div class="photo-section-title">Relatório Fotográfico</div>
            <table class="photo-grid">
              ${tmpl.photos.reduce((rows, photo, index) => {
                if (index % 2 === 0) rows.push([]);
                rows[rows.length - 1].push(photo);
                return rows;
              }, []).map(row => `
                <tr>
                  ${row.map(p => `
                    <td class="photo-cell">
                      <div class="photo-container">
                        <img src="${p.image}" class="photo-img" alt="Foto de Inspeção" />
                      </div>
                      <div class="photo-caption">${p.label || "Sem descrição"}</div>
                    </td>
                  `).join("")}
                  ${row.length === 1 ? '<td class="photo-cell" style="border: 1.5px solid #000;"></td>' : ''}
                </tr>
              `).join("")}
            </table>
          ` : ""}

          <script>
            window.onload = function() {
              window.print();
            };
          </script>
        </body>
      </html>
    `;

    printWindow.document.write(htmlContent);
    printWindow.document.close();
  };

  // Função para criar novo modelo
  const handleSaveTemplate = async (templatePayload, photosList) => {
    try {
      setIsSaving(true);
      if (templateToEdit) {
        await editTemplate(templateToEdit.id, templatePayload);
      } else {
        await addTemplate(templatePayload, photosList);
      }
      setIsTemplateModalOpen(false);
      setTemplateToEdit(null);
      window.location.reload();
    } catch (err) {
      console.error("Erro ao guardar modelo:", err);
      alert("Ocorreu um erro ao guardar o modelo de checklist.");
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
      window.location.reload();
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

                    <div className="flex items-center gap-2">
                      {/* Botão Exportar PDF */}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleExportPDF(tmpl);
                        }}
                        className="flex items-center gap-1.5 text-xs font-semibold bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 px-3 py-1.5 rounded-lg transition"
                        title="Exportar PDF do Checklist"
                      >
                        <FileText className="w-4 h-4 text-red-600" />
                        Exportar PDF
                      </button>

                      <button
                          onClick={(e) => handleOpenEdit(tmpl, e)}
                          className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition"
                          title="Editar Modelo"
                        >
                          <Edit2 size={16} />
                        </button>

                        {/* Botão Apagar */}
                        <button
                          onClick={(e) => handleDeleteTemplate(tmpl, e)}
                          className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition"
                          title="Apagar Modelo"
                        >
                          <Trash2 size={16} />
                        </button>
                      {/* Botão Adicionar Item 
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleOpenItemModal(tmpl);
                        }}
                        className="flex items-center gap-1.5 text-xs font-semibold bg-white hover:bg-gray-50 text-slate-700 border border-gray-200 px-3 py-1.5 rounded-lg transition"
                      >
                        <ListPlus className="w-4 h-4 text-indigo-600" />
                        + Adicionar Item
                      </button>*/}
                    </div>
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
                                  <div className="flex items-center gap-2 font-mono text-[10px]">
                                    <span className={`px-2 py-0.5 rounded font-bold ${
                                      item.status === "SIM" ? "bg-green-100 text-green-700" :
                                      item.status === "NÃO" ? "bg-red-100 text-red-700" : "bg-gray-100 text-gray-600"
                                    }`}>
                                      {item.status || "SIM"}
                                    </span>
                                    {item.observation && (
                                      <span className="text-gray-500 bg-gray-50 px-2 py-0.5 rounded border border-gray-200">
                                        {item.observation}
                                      </span>
                                    )}
                                  </div>
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
        equipments={equipments}
        templateToEdit={templateToEdit}
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