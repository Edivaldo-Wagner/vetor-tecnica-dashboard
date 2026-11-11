// ChecklistsView.jsx
import React, { useState, useEffect } from "react";
import { ClipboardCheck, Plus, ChevronDown, ChevronRight, ListPlus, Edit2, Trash2, Loader2, FileText } from "lucide-react";
import api, { getEquipments } from "../services/api";
import { useInspectionTemplates } from "../hooks/useInspectionTemplates";
import NewTemplateModal from "../components/NewTemplateModal";
import NewInspectionItemModal from "../components/NewInspectionItemModal";
import markWater from "../assets/water-mark.png";
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
            .watermark-container {
              display: flex;
              position: fixed;
              top: 0;
              left: 0;
              width: 100vw;
              height: 100vh;
              align-items: center;
              justify-content: center;
              z-index: -1;
              pointer-events: none;
            }
            @media print {
              .watermark-img {
                width: 210mm;
                height: 220mm;
                object-fit: fill;
                opacity: 1;
              }
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
          <div class="watermark-container">
            <img src="${markWater}" class="watermark-img" alt="Marca d'água" />
          </div>
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

  const handleExportWord = async (tmpl) => {
    const convertImageToBase64 = async (imgSrc) => {
      if (!imgSrc) return "";
      if (imgSrc.startsWith("data:")) return imgSrc;
      try {
        const response = await fetch(imgSrc);
        const blob = await response.blob();
        return new Promise((resolve) => {
          const reader = new FileReader();
          reader.onloadend = () => resolve(reader.result);
          reader.readAsDataURL(blob);
        });
      } catch (e) {
        console.error("Erro ao converter imagem para base64:", e);
        return imgSrc;
      }
    };

    const logoBase64 = await convertImageToBase64(companyLogo);

    // Converte todas as imagens do relatório fotográfico para Base64 antecipadamente
    let processedPhotos = [];
    if (tmpl.photos && tmpl.photos.length > 0) {
      processedPhotos = await Promise.all(
        tmpl.photos.map(async (p) => ({
          ...p,
          base64Image: await convertImageToBase64(p.image)
        }))
      );
    }

    const renderPhotosHtml = () => {
      if (processedPhotos.length === 0) return "";

      const rowsHtml = processedPhotos.reduce((rows, photo, index) => {
        if (index % 2 === 0) rows.push([]);
        rows[rows.length - 1].push(photo);
        return rows;
      }, []).map(row => `
        <tr>
          ${row.map(p => `
            <td width="50%" style="width: 50%; border: 1.5px solid #000; padding: 8px; text-align: center; vertical-align: top;">
              <div style="background-color: #f9f9f9; border: 1px solid #ccc; padding: 4px; margin-bottom: 4px;">
                <img src="${p.base64Image}" style="width: 100%; max-height: 250px; object-fit: contain;" />
              </div>
              <div style="font-size: 8.5pt; font-weight: bold; text-align: left; background: #f0f0f0; padding: 3px; border: 1px solid #ddd;">
                ${p.label || "Sem descrição"}
              </div>
            </td>
          `).join("")}
          ${row.length === 1 ? '<td width="50%" style="width: 50%; border: 1.5px solid #000; padding: 8px;"></td>' : ''}
        </tr>
      `).join("");

      return `
        <table width="100%" style="width: 100% !important; border-collapse: collapse; mso-yfti-tbllook: 1194;">
          <tr><td style="border: none; height: 14px; font-size: 1px; line-height: 1px; padding: 0;">&nbsp;</td></tr>
        </table>
        <table width="100%" style="width: 100% !important; table-layout: fixed; border-collapse: collapse;">
          <tr style="background-color: #333; color: #fff;">
            <td width="100%" colspan="2" style="width: 100%; border: 1.5px solid #000; padding: 5px 6px; font-weight: bold; font-size: 10pt; text-transform: uppercase;">
              RELATÓRIO FOTOGRÁFICO
            </td>
          </tr>
          ${rowsHtml}
        </table>
      `;
    };

    const wordHtmlContent = `
      <html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'>
      <head>
        <meta charset="utf-8">
        <title>Modelo - ${tmpl.name}</title>
        <style>
          @page {
            size: 21cm 29.7cm;
            margin: 2cm;
          }
          body {
            font-family: Arial, Helvetica, sans-serif;
            font-size: 9pt;
            color: #000;
            width: 100%;
          }
          table {
            border-collapse: collapse;
            width: 100% !important;
            mso-table-lspace: 0pt;
            mso-table-rspace: 0pt;
          }
          td, th {
            border: 1.5px solid #000;
            padding: 4px 6px;
            vertical-align: middle;
          }
        </style>
      </head>
      <body>
        <!-- CABEÇALHO PRINCIPAL -->
        <table width="100%" style="width: 100% !important; table-layout: fixed; border-collapse: collapse;">
          <colgroup>
            <col style="width: 75%;">
            <col style="width: 25%;">
          </colgroup>
          <tr>
            <td width="75%" style="width: 75%; border: 1.5px solid #000; padding: 8px; background-color: #fdfdfd;">
              <div style="font-size: 13pt; font-weight: bold; text-transform: uppercase; margin-bottom: 2px;">${tmpl.equipment_type_display || tmpl.equipment_type || "SISTEMA DE INSPEÇÃO"}</div>
              <div style="font-size: 9pt; font-weight: bold; text-transform: uppercase;">${tmpl.name}</div>
            </td>
            <td width="25%" style="width: 25%; border: 1.5px solid #000; text-align: center; padding: 4px; vertical-align: middle;">
              <img src="${logoBase64}" width="75px" height="75" style="width: 75px; height: 75px; max-height: 75px; object-fit: contain;" />
            </td>
          </tr>
        </table>

        <!-- ESPAÇADOR -->
        <table width="100%" style="width: 100% !important; border-collapse: collapse; mso-yfti-tbllook: 1194;">
          <tr><td style="border: none; height: 10px; font-size: 1px; line-height: 1px; padding: 0;">&nbsp;</td></tr>
        </table>

        <!-- TABELA DE INFORMAÇÕES GLOBAIS -->
        <table width="100%" style="width: 100% !important; table-layout: fixed; border-collapse: collapse;">
          <colgroup>
            <col style="width: 15%;">
            <col style="width: 45%;">
            <col style="width: 15%;">
            <col style="width: 25%;">
          </colgroup>
          <tr>
            <td style="background-color: #e5e5e5; font-weight: bold;">CLIENTE</td>
            <td style="color: #666; font-style: italic;">Aguardando emissão da Ordem de Serviço</td>
            <td style="background-color: #e5e5e5; font-weight: bold;">OS Nº</td>
            <td style="color: #666; font-style: italic;">Pendente de Abertura</td>
          </tr>
          <tr>
            <td style="background-color: #e5e5e5; font-weight: bold;">DATA/HORA</td>
            <td style="color: #666; font-style: italic;">Aguardando agendamento</td>
            <td style="background-color: #e5e5e5; font-weight: bold;">CHECK-IN / OUT</td>
            <td style="color: #666; font-style: italic;">Aguardando execução em campo</td>
          </tr>
          <tr>
            <td style="background-color: #e5e5e5; font-weight: bold;">TÉCNICO</td>
            <td colspan="3" style="color: #666; font-style: italic;">Aguardando atribuição de equipa técnica</td>
          </tr>
        </table>

        <!-- CATEGORIAS E ITENS -->
        ${tmpl.categories && tmpl.categories.length > 0 ? tmpl.categories.map((cat) => {
          const itemsHtml = cat.items && cat.items.length > 0 
            ? cat.items.map((item) => `
                <tr>
                  <td width="68%" style="width: 68%; border: 1.5px solid #000; padding: 4px 6px;">${item.label}</td>
                  <td width="12%" style="width: 12%; border: 1.5px solid #000; padding: 4px 6px; text-align: center; font-weight: bold;">${item.status || "SIM"}</td>
                  <td width="20%" style="width: 20%; border: 1.5px solid #000; padding: 4px 6px; text-align: center;">${item.observation || ""}</td>
                </tr>
              `).join("")
            : `
                <tr>
                  <td width="100%" colspan="3" style="width: 100%; border: 1.5px solid #000; padding: 4px 6px; text-align: center; font-style: italic;">Nenhum item cadastrado nesta categoria.</td>
                </tr>
              `;

          return `
            <table width="100%" style="width: 100% !important; border-collapse: collapse; mso-yfti-tbllook: 1194;">
              <tr><td style="border: none; height: 10px; font-size: 1px; line-height: 1px; padding: 0;">&nbsp;</td></tr>
            </table>
            <table width="100%" style="width: 100% !important; table-layout: fixed; border-collapse: collapse;">
              <thead>
                <tr style="background-color: #e5e5e5;">
                  <th width="100%" colspan="3" style="width: 100%; border: 1.5px solid #000; padding: 5px 6px; text-align: left; text-transform: uppercase; font-size: 9.5pt;">${cat.title}</th>
                </tr>
              </thead>
              <tbody>
                ${itemsHtml}
              </tbody>
            </table>
          `;
        }).join("") : `
          <table width="100%" style="width: 100% !important; border-collapse: collapse; mso-yfti-tbllook: 1194;">
            <tr><td style="border: none; height: 10px; font-size: 1px; line-height: 1px; padding: 0;">&nbsp;</td></tr>
          </table>
          <table width="100%" style="width: 100%;">
            <tr><td style="text-align: center; padding: 15px; font-style: italic; border: 1.5px dashed #000;">Nenhuma categoria associada a este modelo de checklist.</td></tr>
          </table>
        `}

        <!-- RELATÓRIO FOTOGRÁFICO -->
        ${renderPhotosHtml()}
      </body>
      </html>
    `;

    const blob = new Blob(['\ufeff' + wordHtmlContent], {
      type: 'application/msword'
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Modelo_Checklist_${tmpl.name.replace(/\s+/g, '_')}.doc`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // Função para criar ou atualizar modelo de checklist com sincronização perfeita de fotos
  const handleSaveTemplate = async (templatePayload, photosList) => {
    try {
      setIsSaving(true);

      if (templateToEdit) {
        // 1. Atualiza os dados básicos e categorias do template via JSON limpo
        await editTemplate(templateToEdit.id, templatePayload);

        // 2. Sincroniza as fotografias
        const originalPhotos = templateToEdit.photos || [];
        const currentPhotoIds = photosList.filter(p => p.file === null).map(p => String(p.id));

        // Apagar fotos que foram removidas pelo utilizador
        for (const orig of originalPhotos) {
          if (!currentPhotoIds.includes(String(orig.id))) {
            try {
              await api.delete(`inspection-photos/${orig.id}/`);
            } catch (e) {
              console.error("Erro ao apagar foto:", e);
            }
          }
        }

        // Adicionar novas fotos ou atualizar legendas das existentes
        for (const photo of photosList) {
          if (photo.file) {
            // Nova foto: upload via FormData dedicado
            const formData = new FormData();
            formData.append("template", templateToEdit.id);
            formData.append("label", photo.caption || "Sem descrição");
            formData.append("image", photo.file);
            try {
              await api.post("inspection-photos/", formData, {
                headers: { "Content-Type": "multipart/form-data" }
              });
            } catch (e) {
              console.error("Erro ao carregar nova foto:", e);
            }
          } else {
            // Foto existente: atualizar legenda se foi alterada
            const orig = originalPhotos.find(p => String(p.id) === String(photo.id));
            if (orig && orig.label !== photo.caption) {
              try {
                await api.patch(`inspection-photos/${photo.id}/`, {
                  label: photo.caption || "Sem descrição"
                });
              } catch (e) {
                console.error("Erro ao atualizar legenda da foto:", e);
              }
            }
          }
        }

      } else {
        // Criar novo modelo (o hook addTemplate já lida com as fotos iniciais)
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
  };;

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
                        onClick={(e) => {
                          e.stopPropagation();
                          handleExportWord(tmpl);
                        }}
                        className="flex items-center gap-1.5 text-xs font-semibold bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 px-3 py-1.5 rounded-lg transition"
                        title="Exportar Word do Checklist"
                      >
                        <FileText className="w-4 h-4 text-blue-600" />
                        Exportar Word
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