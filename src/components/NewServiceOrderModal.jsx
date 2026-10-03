import React, { useState, useEffect } from "react";
import { X, Loader2, Plus, Trash2, Users } from "lucide-react";

export default function NewServiceOrderModal({
  isOpen,
  onClose,
  onSave,
  isLoading,
  clients = [],
  equipments = [],
  templates = [],
  technicians = []
}) {
  const [osNumber, setOsNumber] = useState("");
  const [selectedClient, setSelectedClient] = useState("");
  const [scope, setScope] = useState("");
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
      // Gera um número automático de O.S. caso não esteja preenchido
      setOsNumber(Math.floor(1000 + Math.random() * 9000).toString());
      setSelectedTechs([]);
      setSelectedEquipments([]);
      setScope("");
      setExecutionStart("");
      setExecutionEnd("");
      setSelectedClient("");
    }
  }, [isOpen]);

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
      scope,
      execution_start: executionStart || null,
      execution_end: executionEnd || null,
      technicians: selectedTechs,
      order_equipments: selectedEquipments.filter((e) => e.equipment !== ""),
      status: "aberta"
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl my-8 overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <h2 className="text-lg font-semibold text-gray-800">Nova Ordem de Serviço</h2>
          <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded-lg">
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Nº da O.S. *</label>
              <input
                type="text"
                value={osNumber}
                onChange={(e) => setOsNumber(e.target.value)}
                required
                className="w-full px-3 py-2 border rounded-lg text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Cliente *</label>
              <select
                value={selectedClient}
                onChange={(e) => {
                  setSelectedClient(e.target.value);
                  setSelectedEquipments([]);
                }}
                required
                className="w-full px-3 py-2 border rounded-lg text-sm"
              >
                <option value="">Selecione o cliente...</option>
                {clients.map((c) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Início Previsto</label>
              <input
                type="datetime-local"
                value={executionStart}
                onChange={(e) => setExecutionStart(e.target.value)}
                className="w-full px-3 py-2 border rounded-lg text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Fim Previsto</label>
              <input
                type="datetime-local"
                value={executionEnd}
                onChange={(e) => setExecutionEnd(e.target.value)}
                className="w-full px-3 py-2 border rounded-lg text-sm"
              />
            </div>
          </div>

          {/* Campo de Seleção dos Técnicos Responsáveis */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-1.5">
              <Users className="w-4 h-4 text-gray-500" /> Técnicos Responsáveis
            </label>
            <div className="p-3 border rounded-lg bg-gray-50/50 max-h-36 overflow-y-auto space-y-2">
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

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Escopo do Serviço</label>
            <textarea
              rows={2}
              value={scope}
              onChange={(e) => setScope(e.target.value)}
              placeholder="Ex: Contrato de Manutenção Preventiva Mensal..."
              className="w-full px-3 py-2 border rounded-lg text-sm"
            />
          </div>

          {/* Seleção de Equipamentos e Checklists */}
          <div className="border-t pt-4">
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

            {selectedEquipments.map((item, idx) => (
              <div key={idx} className="flex gap-2 mb-2 items-center">
                <select
                  value={item.equipment}
                  onChange={(e) => handleEquipmentChange(idx, "equipment", e.target.value)}
                  className="flex-1 px-3 py-1.5 border rounded-lg text-sm"
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
                  className="flex-1 px-3 py-1.5 border rounded-lg text-sm"
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
            ))}
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t">
            <button
              type="button"
              onClick={onClose}
              disabled={isLoading}
              className="px-4 py-2 border rounded-lg text-sm text-gray-700 hover:bg-gray-50"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700 flex items-center gap-2"
            >
              {isLoading && <Loader2 className="w-4 h-4 animate-spin" />}
              Gerar Ordem de Serviço
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}