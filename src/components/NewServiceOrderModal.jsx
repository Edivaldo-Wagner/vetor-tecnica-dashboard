import React, { useState, useEffect } from "react";
import { X, Loader2, Plus, Trash2, Users, MapPin, FileText, UploadCloud, Image as ImageIcon } from "lucide-react";
import companyLogo from "../assets/logo.jpg";

// Importe o seu logotipo estático aqui (ajuste o caminho de acordo com o seu projeto)
// import companyLogo from "../assets/logo.png"; 

export default function NewServiceOrderModal({
  isOpen,
  onClose,
  onSave,
  isLoading,
  clients = [],
  equipments = [],
  templates = [],
  technicians = [],
  preselectedClientId = null,
  orderToEdit = null
}) {
  const [osNumber, setOsNumber] = useState("");
  const [selectedClient, setSelectedClient] = useState("");
  const [executionAddress, setExecutionAddress] = useState("");
  const [scope, setScope] = useState("");
  const [instructions, setInstructions] = useState("");
  const [executionStart, setExecutionStart] = useState("");
  const [executionEnd, setExecutionEnd] = useState("");
  const [selectedTechs, setSelectedTechs] = useState([]);
  const [selectedEquipments, setSelectedEquipments] = useState([]);


  // Filtra equipamentos do cliente selecionado
  const availableEquipments = equipments.filter(
    (eq) => eq.client === parseInt(selectedClient)
  );

  useEffect(() => {
    if (isOpen) {
      if (orderToEdit) {
        setOsNumber(orderToEdit.os_number || "");
        setSelectedClient(orderToEdit.client ? orderToEdit.client.toString() : "");
        setExecutionAddress(orderToEdit.execution_address || "");
        setScope(orderToEdit.scope || "");
        setInstructions(orderToEdit.instructions || "");
        setExecutionStart(orderToEdit.execution_start ? orderToEdit.execution_start.slice(0, 16) : "");
        setExecutionEnd(orderToEdit.execution_end ? orderToEdit.execution_end.slice(0, 16) : "");
        setSelectedTechs(orderToEdit.technicians || []);
        
        if (orderToEdit.order_equipments && orderToEdit.order_equipments.length > 0) {
          setSelectedEquipments(
            orderToEdit.order_equipments.map(eq => ({
              equipment: eq.equipment,
              template: eq.template || ""
            }))
          );
        } else {
          setSelectedEquipments([]);
        }
      } else {
        setOsNumber(Math.floor(1000 + Math.random() * 9000).toString());
        setSelectedTechs([]);
        setSelectedEquipments([]);
        setScope("");
        setInstructions("");
        setExecutionAddress("");
        setExecutionStart("");
        setExecutionEnd("");

        if (preselectedClientId) {
          setSelectedClient(preselectedClientId.toString());
          const clientObj = clients.find((c) => c.id === parseInt(preselectedClientId));
          if (clientObj) {
            setExecutionAddress(clientObj.address || clientObj.location || "");
          }
        } else {
          setSelectedClient("");
        }
      }
    }
  }, [isOpen, preselectedClientId, clients, orderToEdit]);



  const handleClientChange = (clientId) => {
    setSelectedClient(clientId);
    setSelectedEquipments([]);

    const clientObj = clients.find((c) => c.id === parseInt(clientId));
    if (clientObj) {
      setExecutionAddress(clientObj.address || clientObj.location || "");
    } else {
      setExecutionAddress("");
    }
  };

  if (!isOpen) return null;

  const handleTechToggle = (techId) => {
    if (selectedTechs.includes(techId)) {
      setSelectedTechs(selectedTechs.filter((id) => id !== techId));
    } else {
      setSelectedTechs([...selectedTechs, techId]);
    }
  };

  const handleAddEquipment = () => {
    setSelectedEquipments([
      ...selectedEquipments,
      { equipment: "", template: "" }
    ]);
  };

  const handleRemoveEquipment = (index) => {
    setSelectedEquipments(selectedEquipments.filter((_, i) => i !== index));
  };

  const handleEquipmentChange = (index, field, value) => {
    const updated = [...selectedEquipments];
    updated[index][field] = value;
    setSelectedEquipments(updated);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave({
      os_number: osNumber,
      client: selectedClient,
      execution_address: executionAddress,
      scope,
      instructions,
      execution_start: executionStart || null,
      execution_end: executionEnd || null,
      technicians: selectedTechs,
      order_equipments_input: selectedEquipments.filter((eq) => eq.equipment !== ""),
      status: "aberta"
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl my-8 flex flex-col max-h-[90vh] overflow-hidden">
        
        {/* Cabeçalho Elegante com Logo Estático da Empresa */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 bg-gray-50/50">
          <div className="flex items-center gap-3">
            {/* Imagem do Logotipo Estático */}
            <img 
              src={companyLogo} // Substitua pelo seu arquivo de imagem (ex: companyLogo ou "/logo.png")
              alt="Logotipo da Empresa" 
              className="h-13 w-auto object-contain pr-3 border-r border-gray-200"
            />
            <div>
              <h2 className="text-lg font-semibold text-gray-800 leading-tight">
                {orderToEdit ? "Editar Ordem de Serviço" : "Nova Ordem de Serviço"}
              </h2>
              <p className="text-[11px] text-gray-400">Preencha os dados abaixo para emissão da O.S.</p>
            </div>
          </div>

          <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded-lg transition-colors">
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col flex-1 overflow-hidden">
          <div className="p-6 overflow-y-auto space-y-4 flex-1">
          {/* Nº da OS e Cliente */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Nº da O.S. *</label>
              <input
                type="text"
                value={osNumber}
                onChange={(e) => setOsNumber(e.target.value)}
                disabled={!!orderToEdit}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm font-semibold focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all outline-none disabled:bg-gray-100 disabled:text-gray-500 disabled:cursor-not-allowed"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Cliente *</label>
              <select
                value={selectedClient}
                onChange={(e) => handleClientChange(e.target.value)}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all outline-none"
              >
                <option value="">Selecione o cliente...</option>
                {clients.map((c) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Local da Execução */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-1">
              <MapPin className="w-4 h-4 text-gray-500" /> Local da Execução
            </label>
            <input
              type="text"
              value={executionAddress}
              onChange={(e) => setExecutionAddress(e.target.value)}
              placeholder="Av. Portugal, 1100, JARDIM NOVA ITAPEVI..."
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
            />
          </div>

          {/* Datas de Execução */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Início Previsto</label>
              <input
                type="datetime-local"
                value={executionStart}
                onChange={(e) => setExecutionStart(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Fim Previsto</label>
              <input
                type="datetime-local"
                value={executionEnd}
                onChange={(e) => setExecutionEnd(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
              />
            </div>
          </div>

          {/* Técnicos Responsáveis */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-1.5">
              <Users className="w-4 h-4 text-gray-500" /> Técnicos Responsáveis
            </label>
            <div className="p-3 border border-gray-300 rounded-lg bg-gray-50/50 max-h-36 overflow-y-auto space-y-2">
              {technicians.length === 0 ? (
                <p className="text-xs text-gray-400">Nenhum técnico cadastrado.</p>
              ) : (
                technicians.map((tech) => (
                  <label key={tech.id} className="flex items-center gap-2 cursor-pointer text-sm text-gray-700 hover:text-gray-900">
                    <input
                      type="checkbox"
                      checked={selectedTechs.includes(tech.id)}
                      onChange={() => handleTechToggle(tech.id)}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span>
                      {tech.first_name ? `${tech.first_name} ${tech.last_name}` : tech.username || tech.name || tech.email} 
                      {tech.role ? ` (${tech.role})` : ""}
                    </span>
                  </label>
                ))
              )}
            </div>
          </div>

          {/* Escopo do Serviço */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Escopo do Serviço</label>
            <textarea
              rows={2}
              value={scope}
              onChange={(e) => setScope(e.target.value)}
              placeholder="Ex: Contrato de Manutenção Preventiva Mensal no Sistema de Detecção..."
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
            />
          </div>

          {/* Instruções Técnicas / Complementos */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-1">
              <FileText className="w-4 h-4 text-gray-500" /> Instruções / Observações Técnicas
            </label>
            <textarea
              rows={2}
              value={instructions}
              onChange={(e) => setInstructions(e.target.value)}
              placeholder="Ex: RETIRAR BATERIAS NA ECOSAFETY E SEGUIR PARA O CLIENTE."
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
            />
          </div>

          {/* Seleção de Equipamentos e Checklists */}
          <div className="border-t border-gray-200 pt-4">
            <div className="flex justify-between items-center mb-2">
              <label className="text-sm font-medium text-gray-700">Sistemas / Equipamentos a Inspecionar</label>
              <button
                type="button"
                onClick={handleAddEquipment}
                disabled={!selectedClient}
                className="text-xs text-blue-600 hover:text-blue-700 flex items-center gap-1 font-medium disabled:opacity-50"
              >
                <Plus className="w-3.5 h-3.5" /> Adicionar Sistema
              </button>
            </div>

            {selectedEquipments.length === 0 ? (
              <p className="text-xs text-gray-400 italic">Nenhum equipamento adicionado ainda.</p>
            ) : (
              selectedEquipments.map((item, idx) => (
                <div key={idx} className="flex gap-2 mb-2 items-center">
                  <select
                    value={item.equipment}
                    onChange={(e) => handleEquipmentChange(idx, "equipment", e.target.value)}
                    className="flex-1 px-3 py-1.5 border border-gray-300 rounded-lg text-sm"
                    required
                  >
                    <option value="">Selecione o Equipamento...</option>
                    {availableEquipments.map((eq) => (
                      <option key={eq.id} value={eq.id}>{eq.name} ({eq.location})</option>
                    ))}
                  </select>

                  <select
                    value={item.template}
                    onChange={(e) => handleEquipmentChange(idx, "template", e.target.value)}
                    className="flex-1 px-1 py-1.5 border border-gray-300 rounded-lg text-sm"
                    required
                  >
                    <option value="">Selecione o Checklist...</option>
                    {templates.map((t) => (
                      <option key={t.id} value={t.id}>{t.name}</option>
                    ))}
                  </select>

                  <button
                    type="button"
                    onClick={() => handleRemoveEquipment(idx)}
                    className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))
            )}
          </div>
          </div>

          {/* Botões do Rodapé */}
          <div className="flex justify-end gap-3 px-6 py-4 border-t border-gray-100 bg-white z-10 shrink-0">
            <button
              type="button"
              onClick={onClose}
              disabled={isLoading}
              className="px-4 py-2 border border-gray-300 rounded-lg text-sm text-gray-700 hover:bg-gray-50"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white font-semibold py-3 rounded-lg text-xs transition disabled:opacity-50"
            >
              {isLoading && <Loader2 className="w-4 h-4 animate-spin" />}
              {orderToEdit ? "Guardar Alterações" : "Gerar Ordem de Serviço"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}