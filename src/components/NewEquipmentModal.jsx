import React, { useState, useEffect } from "react";
import { X } from "lucide-react";
import { useClients } from "../hooks/useClients";

const initialFormState = {
    client: "",
    name: "",
    system_type: "SDAI",
    model: "",
    location: "",
    serial_number: "",
    notes: "",
};

export default function NewEquipmentModal({ isOpen, onClose, onSubmit, equipmentToEdit }) {
  const { clients } = useClients();
  const [formData, setFormData] = useState(initialFormState);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (equipmentToEdit) {
      setFormData({
        client: equipmentToEdit.client || "",
        name: equipmentToEdit.name || "",
        system_type: equipmentToEdit.system_type || "SDAI",
        model: equipmentToEdit.model || "",
        location: equipmentToEdit.location || "",
        serial_number: equipmentToEdit.serial_number || "",
        notes: equipmentToEdit.notes || "",
      });
    } else {
      setFormData(initialFormState);
    }
  }, [equipmentToEdit, isOpen]);

  if (!isOpen) return null;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await onSubmit(formData);
      setFormData(initialFormState);
      onClose();
      window.location.reload();
    } catch (error) {
      console.error("Erro ao guardar equipamento:", error);
      alert("Ocorreu um erro ao guardar o equipamento.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
     className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-xl max-h-[90vh] flex flex-col border border-gray-100 overflow-hidden">
        {/* Modal Header */}
        <div className="flex justify-between items-start border-b pb-4 px-6 pt-6">
          <div>
            <p className="text-[10px] font-mono text-gray-400 uppercase tracking-wider">
              {equipmentToEdit ? "ATUALIZAR EQUIPAMENTO" : "EQUIPAMENTO + VÍNCULO AO CLIENTE"}
            </p>
            <h3 className="text-2xl font-bold text-slate-800">
              {equipmentToEdit ? "Editar Equipamento" : "Novo equipamento / sistema"}
            </h3>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-slate-600">
            <X size={20} />
          </button>
        </div>

        {/* Modal Body */}
        <form onSubmit={handleSubmit} className="flex flex-col flex-1 overflow-hidden">
          <div className="p-6 overflow-y-auto space-y-4 flex-1">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Cliente associado *
              </label>
              <select
                required
                name="client"
                value={formData.client}
                onChange={handleChange}
                className="w-full text-xs p-2.5 border border-gray-200 rounded-lg bg-white focus:outline-none focus:border-slate-800"
              >
                <option value="">Selecione o cliente...</option>
                {clients.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name || c.nome_empresa}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Nome do Sistema / Equipamento *
              </label>
              <input
                required
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="Ex.: Central de Alarme - Sala Bombeiros"
                className="w-full text-xs p-2.5 border border-gray-200 rounded-lg focus:outline-none focus:border-slate-800"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Tipo de Sistema
                </label>
                <select
                  name="system_type"
                  value={formData.system_type}
                  onChange={handleChange}
                  className="w-full text-xs p-2.5 border border-gray-200 rounded-lg bg-white focus:outline-none focus:border-slate-800"
                >
                  <option value="SDAI">Alarme de Incêndio (SDAI)</option>
                  <option value="BOMBAS">Casa de Bombas</option>
                  <option value="SPRINKLERS">Sprinklers</option>
                  <option value="ILUMINACAO">Iluminação Emergência</option>
                  <option value="EXTINTORES">Extintores</option>
                  <option value="OUTRO">Outro</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Modelo / Fabricante
                </label>
                <input
                  type="text"
                  name="model"
                  value={formData.model}
                  onChange={handleChange}
                  placeholder="Ex.: GST-200/2 Black"
                  className="w-full text-xs p-2.5 border border-gray-200 rounded-lg focus:outline-none focus:border-slate-800"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Localização na Planta
                </label>
                <input
                  type="text"
                  name="location"
                  value={formData.location}
                  onChange={handleChange}
                  placeholder="Ex.: Portaria Principal"
                  className="w-full text-xs p-2.5 border border-gray-200 rounded-lg focus:outline-none focus:border-slate-800"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Nº de Série
                </label>
                <input
                  type="text"
                  name="serial_number"
                  value={formData.serial_number}
                  onChange={handleChange}
                  placeholder="Ex.: SN-9823412"
                  className="w-full text-xs p-2.5 border border-gray-200 rounded-lg focus:outline-none focus:border-slate-800"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Observações Técnicas
              </label>
              <textarea
                rows={3}
                name="notes"
                value={formData.notes}
                onChange={handleChange}
                placeholder="Detalhes adicionais sobre o equipamento..."
                className="w-full text-xs p-2.5 border border-gray-200 rounded-lg focus:outline-none focus:border-slate-800"
              />
            </div>
          </div>
 
          <div className="p-4 border-t border-gray-100 bg-white z-10 shrink-0 grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
            >
              Fechar
            </button>
            <button
              type="submit"
              disabled={saving}
              className="w-full bg-slate-900 hover:bg-slate-800 text-white font-semibold py-3 rounded-lg text-xs transition disabled:opacity-50"
            >
              {saving ? "A guardar..." : equipmentToEdit ? "Atualizar equipamento" : "Salvar equipamento"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}