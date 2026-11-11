import React, { useState, useEffect } from "react";
import { Plus, Play, CheckCircle2, Clock, AlertCircle, FileText, CheckCircle, Edit, Trash2 } from "lucide-react";
import api from "../services/api";
import { 
  getServiceOrders, 
  getInspectionTemplates, 
  getClients, 
  getEquipments, 
  getUsers,
  saveOrderExecution, 
  createServiceOrder,
  updateServiceOrder, 
  deleteServiceOrder
} from "../services/api";
import ExecuteServiceOrderModal from "./ExecuteServiceOrderModal";
import NewServiceOrderModal from "./NewServiceOrderModal";
import assignMain from "../assets/assign-main.png";
import markWater from "../assets/water-mark.png";
import companyLogo from "../assets/logo.jpg";

export default function ServiceOrdersView() {
  const [orderToEdit, setOrderToEdit] = useState(null);
  const [orders, setOrders] = useState([]);
  const [templates, setTemplates] = useState([]);
  const [clients, setClients] = useState([]);
  const [equipments, setEquipments] = useState([]);
  const [technicians, setTechnicians] = useState([]);
  const [preselectedClientId, setPreselectedClientId] = useState(null);
  
  // Estado para controlar a aba ativa: "abertas" ou "concluidas"
  const [activeTab, setActiveTab] = useState(() => {
    return sessionStorage.getItem("@vetortecnica:os_activeTab") || "abertas";
  });

  const [selectedOrder, setSelectedOrder] = useState(null);
  const [isExecuteOpen, setIsExecuteOpen] = useState(false);
  const [isNewOpen, setIsNewOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    loadData();
    const savedClientId = sessionStorage.getItem("@vetortecnica:preselectedClientId");
    if (savedClientId) {
      sessionStorage.removeItem("@vetortecnica:preselectedClientId");
      setPreselectedClientId(parseInt(savedClientId));
      setIsNewOpen(true);
    }
  }, []);

  const loadData = async () => {
    try {
      const [resOrders, resTemplates, resClients, resEquipments, resTechs] = await Promise.all([
        getServiceOrders(),
        getInspectionTemplates(),
        getClients(),
        getEquipments(),
        getUsers()
      ]);
      setOrders(resOrders.data);
      setTemplates(resTemplates.data);
      setClients(resClients.data);
      setEquipments(resEquipments.data);
      setTechnicians(resTechs.data);
    } catch (error) {
      console.error("Erro ao carregar dados de Ordens de Serviço:", error);
    }
  };

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    sessionStorage.setItem("@vetortecnica:os_activeTab", tab);
  };

  const handleCreateOrder = async (orderData) => {
    setIsLoading(true);
    try {
      await createServiceOrder(orderData);
      setIsNewOpen(false);
      loadData();
      //window.location.reload();
    } catch (error) {
      console.error("Erro ao criar Ordem de Serviço:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveOrderForm = async (orderData) => {
      setIsLoading(true);
      try {
        if (orderToEdit) {
          await updateServiceOrder(orderToEdit.id, orderData);
        } else {
          await createServiceOrder(orderData);
        }
        setIsNewOpen(false);
        setOrderToEdit(null);
        loadData();
      } catch (error) {
        console.error("Erro ao salvar Ordem de Serviço:", error);
      } finally {
        setIsLoading(false);
      }
    };

    const handleDeleteOrder = async (id) => {
      if (!window.confirm("Tens a certeza que pretendes eliminar esta Ordem de Serviço?")) return;
      try {
        await deleteServiceOrder(id);
        loadData();
      } catch (error) {
        console.error("Erro ao apagar Ordem de Serviço:", error);
      }
    };

  const handleSaveExecution = async (executionData) => {
    setIsLoading(true);
    try {
      const response = await saveOrderExecution(executionData);
      loadData();
      return response; // Agora sim, retorna a resposta corretamente guardada
    } catch (error) {
      console.error("Erro ao salvar execução:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Separação lógica das ordens por estado
  const openOrders = orders.filter(os => os.status !== "concluida");
  const completedOrders = orders.filter(os => os.status === "concluida");

  const currentOrdersList = activeTab === "abertas" ? openOrders : completedOrders;

  // Função para exportar o PDF detalhado da Ordem de Serviço
  const handleExportPDF = async (osItem) => {
    let os = { ...osItem };
    try {
      // Busca apenas os dados atualizados da O.S. diretamente da API
      const resOs = await api.get(`service-orders/${os.id}/`);
      os = resOs.data;
    } catch (err) {
      console.log("Erro ao buscar dados atualizados da O.S.:", err);
    }

    const printWindow = window.open("", "_blank");
    if (!printWindow) return;

    const formatDate = (dateStr) => {
      if (!dateStr) return "—";
      return new Date(dateStr).toLocaleString("pt-PT");
    };

    const techNames = os.technicians_details && os.technicians_details.length > 0
      ? os.technicians_details.map(t => t.name || t.email).join(", ") 
      : "Aguardando atribuição";

    const renderEquipmentsHtml = () => {
      if (!os.order_equipments || os.order_equipments.length === 0) {
        return `
          <div style="text-align: center; padding: 15px; font-style: italic; color: #666; border: 1.5px dashed #000; margin-bottom: 10px;">
            Nenhum checklist/equipamento associado a esta Ordem de Serviço.
          </div>
        `;
      }

      return os.order_equipments.map((eqItem) => {
        const categories = eqItem.categories || [];
        
        const matchedTemplate = templates.find(
          (t) => t.id === eqItem.template || t.name === eqItem.template_name
        );
        
        const photos = eqItem.photos || (matchedTemplate && matchedTemplate.photos) || (eqItem.template && eqItem.template.photos) || [];

        if (categories.length === 0 && photos.length === 0) {
          return `
            <div class="section-title">Equipamento: ${eqItem.equipment_name || eqItem.equipment}</div>
            <div style="text-align: center; padding: 10px; font-style: italic; color: #666; border: 1px solid #000; margin-bottom: 8px;">
              Template de checklist não vinculado ou sem categorias.
            </div>
          `;
        }

        const categoriesHtml = categories.map((cat) => {
          const items = cat.items || [];
          const itemsHtml = items.length > 0 
            ? items.map((item) => `
                <tr>
                  <td class="col-label">${item.label}</td>
                  <td class="col-status">${item.status || "SIM"}</td>
                  <td class="col-obs">${item.observation || item.value || ""}</td>
                </tr>
              `).join("")
            : `
                <tr>
                  <td colspan="3" style="text-align: center; font-style: italic; color: #666;">Nenhum item nesta categoria.</td>
                </tr>
              `;

          return `
            <table class="checklist-table">
              <thead>
                <tr class="cat-header">
                  <th colspan="3" style="text-align: left;">${cat.title}</th>
                </tr>
              </thead>
              <tbody>
                ${itemsHtml}
              </tbody>
            </table>
          `;
        }).join("");

        const photosHtml = photos.length > 0 ? `
          <div class="photo-section-title">Relatório Fotográfico - ${eqItem.equipment_name || "Equipamento"}</div>
          <table class="photo-grid">
            ${photos.reduce((rows, photo, index) => {
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
        ` : "";

        return `
          <div class="section-title">Equipamento: ${eqItem.equipment_name || eqItem.equipment}</div>
          ${categoriesHtml}
          ${photosHtml}
        `;
      }).join("");
    };

    const htmlContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Ordem de Serviço - #${os.os_number}</title>
          <style>
            body {
              font-family: Arial, Helvetica, sans-serif;
              font-size: 10px;
              color: #000;
              margin: 0;
              padding: 0;
              position: relative;
              min-height: 100vh;
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
              width: 55%;
              text-align: left;
            }
            .col-status {
              width: 15%;
              text-align: center;
              font-weight: bold;
            }
            .col-obs {
              width: 30%;
              text-align: left;
            }
            .section-title {
              font-weight: bold;
              font-size: 10px;
              text-transform: uppercase;
              background-color: #e5e5e5;
              border: 1.5px solid #000;
              padding: 4px 6px;
              margin-top: 10px;
              margin-bottom: 4px;
            }
            .text-box {
              border: 1.5px solid #000;
              padding: 6px;
              font-size: 9px;
              margin-bottom: 10px;
              min-height: 25px;
            }
            .photo-section-title {
              font-size: 10.5px;
              font-weight: bold;
              text-transform: uppercase;
              background-color: #333;
              color: #fff;
              padding: 4px 6px;
              margin-top: 10px;
              margin-bottom: 4px;
              border: 1.5px solid #000;
            }
            .photo-grid {
              width: 100%;
              border-collapse: collapse;
              margin-bottom: 10px;
              table-layout: fixed;
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
              height: 400px;
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
              object-fit: cover;
            }
            .photo-caption {
              font-size: 9px;
              font-weight: bold;
              color: #222;
              text-align: left;
              margin-top: 2px;
              padding: 2px 4px;
              background: #f0f0f0;
              border: 1px solid #ddd;
              white-space: nowrap;
              overflow: hidden;
              text-overflow: ellipsis;
            }
            .signature-section {
              margin-top: 20px;
              page-break-inside: avoid;
            }
            .signature-table {
              width: 100%;
              border-collapse: collapse;
              margin-top: 5px;
            }
            .signature-cell {
              width: 50%;
              border: 1.5px solid #000;
              padding: 10px;
              text-align: center;
              vertical-align: bottom;
            }
            .signature-img-box {
              height: 60px;
              display: flex;
              align-items: center;
              justify-content: center;
              margin-bottom: 5px;
            }
            .signature-img {
              max-height: 50px;
              max-width: 180px;
              object-fit: contain;
            }
            .signature-line {
              border-top: 1px solid #000;
              margin-top: 5px;
              padding-top: 4px;
              font-weight: bold;
              font-size: 9px;
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
                <div class="title-main">RELATÓRIO DE EXECUÇÃO DE SERVIÇO</div>
                <div class="title-sub">ORDEM DE SERVIÇO Nº ${os.os_number}</div>
              </td>
              <td class="logo-cell" style="width: 100px;">
                <div style="font-size: 7px; color: #666; margin-bottom: 2px; font-weight: bold;">EMPRESA</div>
                <img src="${companyLogo}" class="logo-img" alt="Logo Empresa" />
              </td>
              <td class="logo-cell" style="width: 100px;">
                <div style="font-size: 7px; color: #666; margin-bottom: 2px; font-weight: bold;">CLIENTE</div>
                ${os.client_logo ? `
                  <img src="${os.client_logo}" class="logo-img" alt="Logo Cliente" />
                ` : `
                  <div style="font-size: 8px; font-style: italic; color: #999; height: 35px; display: flex; align-items: center; justify-content: center;">Sem logo</div>
                `}
              </td>
            </tr>
          </table>

          <table class="info-table">
            <tr>
              <td class="bg-gray" style="width: 12%;">CLIENTE</td>
              <td style="width: 53%; font-weight: bold;">${os.client_name || "—"}</td>
              <td class="bg-gray" style="width: 10%;">OS Nº</td>
              <td style="width: 25%; font-weight: bold;">#${os.os_number}</td>
            </tr>
            <tr>
              <td class="bg-gray">DATA/HORA</td>
              <td>Início: ${formatDate(os.execution_start)} - ${formatDate(os.execution_end)}</td>
              <td class="bg-gray">CHECK-IN / OUT</td>
              <td>In: ${formatDate(os.execution_start)} | Out: ${formatDate(os.execution_end)}</td>
            </tr>
            <tr>
              <td class="bg-gray">TÉCNICO</td>
              <td colspan="3">${techNames}</td>
            </tr>
          </table>

          ${os.execution_address ? `
            <div class="section-title">Local da Execução</div>
            <div class="text-box">${os.execution_address}</div>
          ` : ""}

          ${os.scope ? `
            <div class="section-title">Escopo do Serviço</div>
            <div class="text-box">${os.scope}</div>
          ` : ""}

          ${os.instructions ? `
            <div class="section-title">Instruções / Observações Técnicas</div>
            <div class="text-box">${os.instructions}</div>
          ` : ""}

          ${renderEquipmentsHtml()}

          ${os.complementary_services ? `
            <div class="section-title">Serviços Complementares Executados</div>
            <div class="text-box">${os.complementary_services}</div>
          ` : ""}
 
          ${os.conclusions ? `
            <div class="section-title">Conclusões Técnicas / Parecer Final</div>
            <div class="text-box">${os.conclusions}</div>
          ` : ""}

          <!-- BLOCO DE ASSINATURAS NO PDF -->
          <div class="signature-section">
            <div class="section-title">Assinaturas e Validação</div>
            <table class="signature-table">
              <tr>
                <td class="signature-cell">
                  <div class="signature-img-box">
                    <img src="${assignMain}" class="signature-img" alt="Assinatura Técnico" onerror="this.style.display='none'" />
                  </div>
                  <div class="signature-line">
                    Guilherme C. Junior<br/>
                    <span style="font-weight: normal; font-size: 8px;">Técnico Responsável</span>
                  </div>
                </td>
                <td class="signature-cell">
                  <div class="signature-img-box">
                    ${os.signature_details && os.signature_details.client_signature ? `
                      <img src="${os.signature_details.client_signature}" class="signature-img" alt="Assinatura Cliente" />
                    ` : `
                      <div style="
                        display: inline-flex;
                        align-items: center;
                        gap: 6px;
                        padding: 4px 10px;
                        background-color: #fef2f2;
                        color: #dc2626;
                        border: 1px solid #fecaca;
                        border-radius: 9999px;
                        font-size: 10px;
                        font-weight: 600;
                        font-family: system-ui, -apple-system, sans-serif;
                      ">
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                          <line x1="18" y1="6" x2="6" y2="18"></line>
                          <line x1="6" y1="6" x2="18" y2="18"></line>
                        </svg>
                        <span>Ainda não assinado pelo cliente</span>
                      </div>
                    `}
                  </div>
                  <div class="signature-line">
                    ${os.signature_details?.client_name || os.client_name || "Cliente / Responsável"}<br/>
                    <span style="font-weight: normal; font-size: 8px;">Representante do Cliente</span>
                  </div>
                </td>
              </tr>
            </table>
          </div>

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

  const handleExportWord = async (osItem) => {
  let os = { ...osItem };
  try {
    const resOs = await api.get(`service-orders/${os.id}/`);
    os = resOs.data;
  } catch (err) {
    console.log("Erro ao buscar dados atualizados da O.S.:", err);
  }

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
  const clientLogoBase64 = os.client_logo ? await convertImageToBase64(os.client_logo) : null;
  const assignBase64 = await convertImageToBase64(assignMain);
  const clientSignBase64 = os.signature_details?.client_signature ? await convertImageToBase64(os.signature_details.client_signature) : null;

  const formatDate = (dateStr) => {
    if (!dateStr) return "—";
    return new Date(dateStr).toLocaleString("pt-PT");
  };

  const techNames = os.technicians_details && os.technicians_details.length > 0
    ? os.technicians_details.map(t => t.name || t.email).join(", ") 
    : "Aguardando atribuição";

  const renderEquipmentsHtml = () => {
    if (!os.order_equipments || os.order_equipments.length === 0) {
      return `
        <table width="100%" style="width: 100% !important; border-collapse: collapse; mso-yfti-tbllook: 1194;">
          <tr><td style="border: none; height: 12px; font-size: 1px; line-height: 1px; padding: 0;">&nbsp;</td></tr>
        </table>
        <table width="100%" style="width: 100%; border-collapse: collapse;">
          <tr>
            <td width="100%" style="width: 100%; text-align: center; padding: 15px; font-style: italic; border: 1.5px dashed #000;">
              Nenhum checklist/equipamento associado a esta Ordem de Serviço.
            </td>
          </tr>
        </table>
      `;
    }

    return os.order_equipments.map((eqItem) => {
      const categories = eqItem.categories || [];
      const matchedTemplate = templates.find(
        (t) => t.id === eqItem.template || t.name === eqItem.template_name
      );
      const photos = eqItem.photos || (matchedTemplate && matchedTemplate.photos) || (eqItem.template && eqItem.template.photos) || [];

      const categoriesHtml = categories.map((cat) => {
        const items = cat.items || [];
        const itemsHtml = items.length > 0 
          ? items.map((item) => {
              const obsValue = item.observation || item.value || "";
              return `
                <tr>
                  <td width="68%" style="width: 68%; border: 1.5px solid #000; padding: 4px 6px;">${item.label}</td>
                  <td width="12%" style="width: 12%; border: 1.5px solid #000; padding: 4px 6px; text-align: center; font-weight: bold;">${item.status || "SIM"}</td>
                  <td width="20%" style="width: 20%; border: 1.5px solid #000; padding: 4px 6px; text-align: center;">${obsValue}</td>
                </tr>
              `;
            }).join("")
          : `
              <tr>
                <td width="100%" colspan="3" style="width: 100%; border: 1.5px solid #000; padding: 4px 6px; text-align: center; font-style: italic;">Nenhum item nesta categoria.</td>
              </tr>
            `;

        return `
          <table width="100%" style="width: 100%; table-layout: fixed; border-collapse: collapse; margin-top: 8px;">
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
      }).join("");

      const photosHtml = photos.length > 0 ? `
        <table width="100%" style="width: 100% !important; border-collapse: collapse; mso-yfti-tbllook: 1194;">
          <tr><td style="border: none; height: 14px; font-size: 1px; line-height: 1px; padding: 0;">&nbsp;</td></tr>
        </table>
        <table width="100%" style="width: 100% !important; table-layout: fixed; border-collapse: collapse;">
          <tr style="background-color: #333; color: #fff;">
            <td width="100%" colspan="2" style="width: 100%; border: 1.5px solid #000; padding: 5px 6px; font-weight: bold; font-size: 10pt; text-transform: uppercase;">
              RELATÓRIO FOTOGRÁFICO - ${eqItem.equipment_name || "EQUIPAMENTO"}
            </td>
          </tr>
          ${photos.reduce((rows, photo, index) => {
            if (index % 2 === 0) rows.push([]);
            rows[rows.length - 1].push(photo);
            return rows;
          }, []).map(row => `
            <tr>
              ${row.map(p => `
                <td width="50%" style="width: 50%; border: 1.5px solid #000; padding: 8px; text-align: center; vertical-align: top;">
                  <div style="background-color: #f9f9f9; border: 1px solid #ccc; padding: 4px; margin-bottom: 4px;">
                    <img src="${p.image}" style="width: 100%; max-height: 250px; object-fit: contain;" />
                  </div>
                  <div style="font-size: 8.5pt; font-weight: bold; text-align: left; background: #f0f0f0; padding: 3px; border: 1px solid #ddd;">
                    ${p.label || "Sem descrição"}
                  </div>
                </td>
              `).join("")}
              ${row.length === 1 ? '<td width="50%" style="width: 50%; border: 1.5px solid #000; padding: 8px;"></td>' : ''}
            </tr>
          `).join("")}
        </table>
      ` : "";

      return `
        <!-- Espaçador antes do bloco de equipamento -->
        <table width="100%" style="width: 100% !important; border-collapse: collapse; mso-yfti-tbllook: 1194;">
          <tr><td style="border: none; height: 14px; font-size: 1px; line-height: 1px; padding: 0;">&nbsp;</td></tr>
        </table>
        <table width="100%" style="width: 100% !important; table-layout: fixed; border-collapse: collapse;">
          <tr style="background-color: #e5e5e5;">
            <td width="100%" style="width: 100%; border: 1.5px solid #000; padding: 5px 6px; font-weight: bold; font-size: 10pt; text-transform: uppercase;">
              EQUIPAMENTO: ${eqItem.equipment_name || eqItem.equipment}
            </td>
          </tr>
        </table>
        ${categoriesHtml}
        ${photosHtml}
      `;
    }).join("");
  };

  const wordHtmlContent = `
    <html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'>
    <head>
      <meta charset="utf-8">
      <title>Ordem de Serviço - #${os.os_number}</title>
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
          <col style="width: 55%;">
          <col style="width: 22.5%;">
          <col style="width: 22.5%;">
        </colgroup>
        <tr>
          <td width="55%" style="width: 55%; border: 1.5px solid #000; padding: 8px; background-color: #fdfdfd;">
            <div style="font-size: 13pt; font-weight: bold; text-transform: uppercase; margin-bottom: 2px;">RELATÓRIO DE EXECUÇÃO DE SERVIÇO</div>
            <div style="font-size: 9pt; font-weight: bold; text-transform: uppercase;">ORDEM DE SERVIÇO Nº ${os.os_number}</div>
          </td>
          <td width="22.5%" style="width: 22.5%; border: 1.5px solid #000; text-align: center; padding: 4px; vertical-align: middle;">
            <div style="font-size: 7pt; color: #666; margin-bottom: 2px; font-weight: bold;">EMPRESA</div>
            <img src="${logoBase64}" width="65px" height="60" style="width: 65px; height: 60px; max-height: 60px; object-fit: contain;" />
          </td>
          <td width="22.5%" style="width: 22.5%; border: 1.5px solid #000; text-align: center; padding: 4px; vertical-align: middle;">
            <div style="font-size: 7pt; color: #666; margin-bottom: 2px; font-weight: bold;">CLIENTE</div>
            ${clientLogoBase64 ? `
              <img src="${clientLogoBase64}" width="65px" height="60" style="width: 65px; height: 60px; max-height: 60px; object-fit: contain;" />
            ` : `
              <span style="font-size: 8pt; color: #999; font-style: italic;">Sem logo</span>
            `}
          </td>
        </tr>
      </table>

      <!-- ESPAÇADOR -->
      <table width="100%" style="width: 100% !important; border-collapse: collapse; mso-yfti-tbllook: 1194;">
        <tr><td style="border: none; height: 10px; font-size: 1px; line-height: 1px; padding: 0;">&nbsp;</td></tr>
      </table>

      <!-- TABELA DE INFORMAÇÕES -->
      <table width="100%" style="width: 100% !important; table-layout: fixed; border-collapse: collapse;">
        <colgroup>
          <col style="width: 15%;">
          <col style="width: 45%;">
          <col style="width: 15%;">
          <col style="width: 25%;">
        </colgroup>
        <tr>
          <td style="background-color: #e5e5e5; font-weight: bold;">CLIENTE</td>
          <td style="font-weight: bold;">${os.client_name || "—"}</td>
          <td style="background-color: #e5e5e5; font-weight: bold;">OS Nº</td>
          <td style="font-weight: bold;">#${os.os_number}</td>
        </tr>
        <tr>
          <td style="background-color: #e5e5e5; font-weight: bold;">DATA/HORA</td>
          <td>Início: ${formatDate(os.execution_start)} - ${formatDate(os.execution_end)}</td>
          <td style="background-color: #e5e5e5; font-weight: bold;">CHECK-IN / OUT</td>
          <td>In: ${formatDate(os.execution_start)} | Out: ${formatDate(os.execution_end)}</td>
        </tr>
        <tr>
          <td style="background-color: #e5e5e5; font-weight: bold;">TÉCNICO</td>
          <td colspan="3">${techNames}</td>
        </tr>
      </table>

      ${os.execution_address ? `
        <table width="100%" style="width: 100% !important; border-collapse: collapse; mso-yfti-tbllook: 1194;">
          <tr><td style="border: none; height: 10px; font-size: 1px; line-height: 1px; padding: 0;">&nbsp;</td></tr>
        </table>
        <table width="100%" style="width: 100% !important; table-layout: fixed; border-collapse: collapse;">
          <colgroup><col style="width: 100%;"></colgroup>
          <tr style="background-color: #e5e5e5;"><td style="border: 1.5px solid #000; font-weight: bold; text-transform: uppercase; padding: 5px;">Local da Execução</td></tr>
        </table>
        <table width="100%" style="width: 100% !important; table-layout: fixed; border-collapse: collapse; margin-top: 3px;">
          <colgroup><col style="width: 100%;"></colgroup>
          <tr><td style="border: 1.5px solid #000; padding: 6px; font-size: 9pt;">${os.execution_address}</td></tr>
        </table>
      ` : ""}

      ${os.scope ? `
        <table width="100%" style="width: 100% !important; border-collapse: collapse; mso-yfti-tbllook: 1194;">
          <tr><td style="border: none; height: 10px; font-size: 1px; line-height: 1px; padding: 0;">&nbsp;</td></tr>
        </table>
        <table width="100%" style="width: 100% !important; table-layout: fixed; border-collapse: collapse;">
          <colgroup><col style="width: 100%;"></colgroup>
          <tr style="background-color: #e5e5e5;"><td style="border: 1.5px solid #000; font-weight: bold; text-transform: uppercase; padding: 5px;">Escopo do Serviço</td></tr>
        </table>
        <table width="100%" style="width: 100% !important; table-layout: fixed; border-collapse: collapse; margin-top: 3px;">
          <colgroup><col style="width: 100%;"></colgroup>
          <tr><td style="border: 1.5px solid #000; padding: 6px; font-size: 9pt;">${os.scope}</td></tr>
        </table>
      ` : ""}

      ${os.instructions ? `
        <table width="100%" style="width: 100% !important; border-collapse: collapse; mso-yfti-tbllook: 1194;">
          <tr><td style="border: none; height: 10px; font-size: 1px; line-height: 1px; padding: 0;">&nbsp;</td></tr>
        </table>
        <table width="100%" style="width: 100% !important; table-layout: fixed; border-collapse: collapse;">
          <colgroup><col style="width: 100%;"></colgroup>
          <tr style="background-color: #e5e5e5;"><td style="border: 1.5px solid #000; font-weight: bold; text-transform: uppercase; padding: 5px;">Instruções / Observações Técnicas</td></tr>
        </table>
        <table width="100%" style="width: 100% !important; table-layout: fixed; border-collapse: collapse; margin-top: 3px;">
          <colgroup><col style="width: 100%;"></colgroup>
          <tr><td style="border: 1.5px solid #000; padding: 6px; font-size: 9pt;">${os.instructions}</td></tr>
        </table>
      ` : ""}

      ${renderEquipmentsHtml()}

      ${os.complementary_services ? `
        <table width="100%" style="width: 100% !important; border-collapse: collapse; mso-yfti-tbllook: 1194;">
          <tr><td style="border: none; height: 10px; font-size: 1px; line-height: 1px; padding: 0;">&nbsp;</td></tr>
        </table>
        <table width="100%" style="width: 100% !important; table-layout: fixed; border-collapse: collapse;">
          <colgroup><col style="width: 100%;"></colgroup>
          <tr style="background-color: #e5e5e5;"><td style="border: 1.5px solid #000; font-weight: bold; text-transform: uppercase; padding: 5px;">Serviços Complementares Executados</td></tr>
        </table>
        <table width="100%" style="width: 100% !important; table-layout: fixed; border-collapse: collapse; margin-top: 3px;">
          <colgroup><col style="width: 100%;"></colgroup>
          <tr><td style="border: 1.5px solid #000; padding: 6px; font-size: 9pt;">${os.complementary_services}</td></tr>
        </table>
      ` : ""}

      ${os.conclusions ? `
        <table width="100%" style="width: 100% !important; border-collapse: collapse; mso-yfti-tbllook: 1194;">
          <tr><td style="border: none; height: 10px; font-size: 1px; line-height: 1px; padding: 0;">&nbsp;</td></tr>
        </table>
        <table width="100%" style="width: 100% !important; table-layout: fixed; border-collapse: collapse;">
          <colgroup><col style="width: 100%;"></colgroup>
          <tr style="background-color: #e5e5e5;"><td style="border: 1.5px solid #000; font-weight: bold; text-transform: uppercase; padding: 5px;">Conclusões Técnicas / Parecer Final</td></tr>
        </table>
        <table width="100%" style="width: 100% !important; table-layout: fixed; border-collapse: collapse; margin-top: 3px;">
          <colgroup><col style="width: 100%;"></colgroup>
          <tr><td style="border: 1.5px solid #000; padding: 6px; font-size: 9pt;">${os.conclusions}</td></tr>
        </table>
      ` : ""}

      <!-- ASSINATURAS -->
      <table width="100%" style="width: 100% !important; border-collapse: collapse; mso-yfti-tbllook: 1194;">
        <tr><td style="border: none; height: 16px; font-size: 1px; line-height: 1px; padding: 0;">&nbsp;</td></tr>
      </table>
      <table width="100%" style="width: 100% !important; table-layout: fixed; border-collapse: collapse;">
        <colgroup>
          <col style="width: 50%;">
          <col style="width: 50%;">
        </colgroup>
        <tr style="background-color: #e5e5e5;">
          <td colspan="2" style="border: 1.5px solid #000; font-weight: bold; text-transform: uppercase; padding: 5px;">Assinaturas e Validação</td>
        </tr>
        <tr>
          <td style="border: 1.5px solid #000; padding: 12px; text-align: center; vertical-align: bottom;">
            <div style="height: 50px; margin-bottom: 5px;">
              <img src="${assignBase64}" width="150" height="45" style="max-height: 45px; max-width: 180px;" />
            </div>
            <div style="border-top: 1px solid #000; padding-top: 4px; font-weight: bold; font-size: 9pt;">
              Guilherme C. Junior<br/>
              <span style="font-weight: normal; font-size: 8pt;">Técnico Responsável</span>
            </div>
          </td>
          <td style="border: 1.5px solid #000; padding: 12px; text-align: center; vertical-align: bottom;">
            <div style="height: 50px; margin-bottom: 5px;">
              ${clientSignBase64 ? `
                <img src="${clientSignBase64}" width="150" height="45" style="max-height: 45px; max-width: 180px;" />
              ` : `
                <span style="color: #dc2626; font-weight: bold; font-size: 9pt;">Ainda não assinado pelo cliente</span>
              `}
            </div>
            <div style="border-top: 1px solid #000; padding-top: 4px; font-weight: bold; font-size: 9pt;">
              ${os.signature_details?.client_name || os.client_name || "Cliente / Responsável"}<br/>
              <span style="font-weight: normal; font-size: 8pt;">Representante do Cliente</span>
            </div>
          </td>
        </tr>
      </table>
    </body>
    </html>
  `;

  const blob = new Blob(['\ufeff' + wordHtmlContent], {
    type: 'application/msword'
  });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `Ordem_de_Servico_${os.os_number}.doc`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
};

  return (
    <div className="space-y-6">
      {/* Header com Ações */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
        <div>
          <h2 className="text-lg font-bold text-slate-800">Ordens de Serviço</h2>
          <p className="text-xs text-slate-500">Gestão de vistorias, checklists e relatórios de campo</p>
        </div>
        <button
          onClick={() => {
            setOrderToEdit(null);
            setIsNewOpen(true);
          }}
          className="flex items-center gap-2 px-4 py-2 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold rounded-lg text-xs transition shadow-sm"
        >
          <Plus size={16} /> Nova Ordem de Serviço
        </button>
      </div>

      {/* Abas Superiores (Pills Modernas) para Alternar o Status */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-3">
        <button
          onClick={() => handleTabChange("abertas")}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all ${
            activeTab === "abertas"
              ? "bg-slate-900 text-white shadow-sm"
              : "bg-white text-slate-600 hover:bg-slate-100 border border-slate-200"
          }`}
        >
          <Clock size={14} className={activeTab === "abertas" ? "text-amber-400" : "text-slate-400"} />
          <span>Em Aberto / Em Campo</span>
          <span className={`ml-1 px-1.5 py-0.5 rounded-full text-[10px] ${
            activeTab === "abertas" ? "bg-amber-500 text-slate-950 font-extrabold" : "bg-slate-100 text-slate-600"
          }`}>
            {openOrders.length}
          </span>
        </button>

        <button
          onClick={() => handleTabChange("concluidas")}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all ${
            activeTab === "concluidas"
              ? "bg-slate-900 text-white shadow-sm"
              : "bg-white text-slate-600 hover:bg-slate-100 border border-slate-200"
          }`}
        >
          <CheckCircle size={14} className={activeTab === "concluidas" ? "text-green-400" : "text-slate-400"} />
          <span>Concluídas</span>
          <span className={`ml-1 px-1.5 py-0.5 rounded-full text-[10px] ${
            activeTab === "concluidas" ? "bg-green-500 text-slate-950 font-extrabold" : "bg-slate-100 text-slate-600"
          }`}>
            {completedOrders.length}
          </span>
        </button>
      </div>

      {/* Lista da Aba Ativa */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-600">
            <thead className="bg-slate-50 text-slate-700 font-semibold border-b border-slate-200">
              <tr>
                <th className="p-3">Nº O.S.</th>
                <th className="p-3">Cliente</th>
                <th className="p-3">Início Previsto</th>
                <th className="p-3">Status</th>
                <th className="p-3 text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {currentOrdersList.length === 0 ? (
                <tr>
                  <td colSpan="5" className="p-8 text-center text-slate-400 italic">
                    {activeTab === "abertas" 
                      ? "Nenhuma ordem de serviço aberta no momento." 
                      : "Nenhuma ordem de serviço concluída registada."}
                  </td>
                </tr>
              ) : (
                currentOrdersList.map((os) => (
                  <tr key={os.id} className="hover:bg-slate-50/80 transition">
                    <td className="p-3 font-bold text-slate-800">#{os.os_number}</td>
                    <td className="p-3">{os.client_name}</td>
                    <td className="p-3">
                      {os.execution_start ? new Date(os.execution_start).toLocaleString("pt-PT") : "—"}
                    </td>
                    <td className="p-3">
                      <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase inline-flex items-center gap-1 ${
                        os.status === "concluida" 
                          ? "bg-green-100 text-green-700" 
                          : os.status === "em_campo" 
                          ? "bg-blue-100 text-blue-700" 
                          : "bg-amber-100 text-amber-700"
                      }`}>
                        {os.status === "concluida" && <CheckCircle2 size={12} />}
                        {os.status === "em_campo" && <Clock size={12} />}
                        {os.status === "aberta" && <AlertCircle size={12} />}
                        {os.status}
                      </span>
                    </td>
                    <td className="p-3 text-right flex items-center justify-end gap-2">
                      {/* BOTÃO EXPORTAR PDF DA O.S. */}

                      <button
                        onClick={() => {
                          setOrderToEdit(os);
                          setIsNewOpen(true);
                        }}
                        className="p-1.5 bg-slate-100 text-slate-700 hover:bg-slate-200 rounded-lg transition"
                        title="Editar Ordem de Serviço"
                      >
                        <Edit size={14} />
                      </button>

                      {/* BOTÃO APAGAR O.S. */}
                      <button
                        onClick={() => handleDeleteOrder(os.id)}
                        className="p-1.5 bg-red-50 text-red-600 hover:bg-red-100 rounded-lg transition"
                        title="Eliminar Ordem de Serviço"
                      >
                        <Trash2 size={14} />
                      </button>

                      <button
                        onClick={() => handleExportPDF(os)}
                        className="px-3 py-1.5 bg-red-50 text-red-600 hover:bg-red-100 font-medium rounded-lg text-xs inline-flex items-center gap-1.5 transition"
                        title="Exportar Relatório PDF da O.S."
                      >
                        <FileText size={13} /> Exportar PDF
                      </button>

                      <button
                        onClick={() => handleExportWord(os)}
                        className="px-3 py-1.5 bg-blue-50 text-blue-700 hover:bg-blue-100 font-medium rounded-lg text-xs inline-flex items-center gap-1.5 transition"
                        title="Exportar Relatório Word da O.S."
                      >
                        <FileText size={13} /> Exportar Word
                      </button>

                      <button
                        onClick={() => {
                          setSelectedOrder(os);
                          setIsExecuteOpen(true);
                        }}
                        className="px-3 py-1.5 bg-blue-50 text-blue-600 hover:bg-blue-100 font-medium rounded-lg text-xs inline-flex items-center gap-1.5 transition"
                      >
                        <Play size={13} /> Executar / Checklist
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modais */}
      <NewServiceOrderModal
        isOpen={isNewOpen}
        onClose={() => {
          setIsNewOpen(false);
          setPreselectedClientId(null);
          setOrderToEdit(null);
        }}
        onSave={handleSaveOrderForm}
        isLoading={isLoading}
        clients={clients}
        equipments={equipments}
        templates={templates}
        technicians={technicians}
        preselectedClientId={preselectedClientId}
        orderToEdit={orderToEdit}
      />

      <ExecuteServiceOrderModal
        isOpen={isExecuteOpen}
        onClose={() => setIsExecuteOpen(false)}
        onSaveExecution={handleSaveExecution}
        serviceOrder={selectedOrder}
        templates={templates}
        isLoading={isLoading}
      />
    </div>
  );
}