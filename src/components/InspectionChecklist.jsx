import React, { useState, useRef } from "react";
import { Plus, Check, AlertCircle, Camera, Image as ImageIcon, Grid, Circle, X } from "lucide-react";
import { useInspectionChecklist } from "../hooks/useInspectionChecklist";
import CategoryModal from "./CategoryModal";

// Lista de slots de evidência padrão do layout
const REQUIRED_PHOTOS = [
  { id: "manometro", label: "MANÔMETRO", icon: "gauge" },
  { id: "valvula", label: "VÁLVULA V-204", icon: "plus" },
  { id: "painel", label: "PAINEL", icon: "grid" },
  { id: "sensor", label: "SENSOR ST-07", icon: "circle" },
];

export default function InspectionChecklist({ serviceOrderId }) {
  const {
    categories = [],
    photos = [],
    loading,
    error,
    addCategory,
    toggleItem,
    uploadPhoto,
  } = useInspectionChecklist();

  const [isModalOpen, setIsModalOpen] = useState(false);
  
  // Estados para o Modal de Seleção de Rótulo
  const [isLabelModalOpen, setIsLabelModalOpen] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [selectedLabel, setSelectedLabel] = useState(REQUIRED_PHOTOS[0].label);

  // Controla se o upload veio do botão geral da galeria/câmera
  const [isGenericUpload, setIsGenericUpload] = useState(false);

  // Refs para acionar captura de foto ou escolha de ficheiro
  const cameraInputRef = useRef(null);
  const galleryInputRef = useRef(null);

  const safeCategories = Array.isArray(categories) ? categories : [];
  const allItems = safeCategories.flatMap((cat) => cat.items || []);
  const completedCount = allItems.filter((i) => i.is_completed).length;
  const totalCount = allItems.length;
  const progressPercentage = totalCount > 0 ? (completedCount / totalCount) * 100 : 0;

  // Processa o ficheiro selecionado
  const handleFileSelected = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (isGenericUpload) {
      // Se veio do botão "Escolher da galeria", abre a modal para escolher o rótulo
      setSelectedFile(file);
      setIsLabelModalOpen(true);
    } else {
      // Se veio do clique num card de slot específico, faz upload direto
      uploadPhoto(serviceOrderId, selectedLabel, file);
      setSelectedLabel("");
    }

    // Reseta o input para permitir nova seleção do mesmo ficheiro
    e.target.value = "";
  };

  // Clique nos botões superiores de Câmera/Galeria
  const triggerGenericUpload = (type) => {
    setIsGenericUpload(true);
    setSelectedLabel(REQUIRED_PHOTOS[0].label);
    if (type === "camera") {
      cameraInputRef.current?.click();
    } else {
      galleryInputRef.current?.click();
    }
  };

  // Clique direto num Card de Slot específico
  const triggerSlotUpload = (label) => {
    setIsGenericUpload(false);
    setSelectedLabel(label);
    galleryInputRef.current?.click();
  };

  // Confirmação no Modal de Rótulo
  const handleConfirmUpload = () => {
    if (!selectedFile) return;

    uploadPhoto(serviceOrderId, selectedLabel, selectedFile);

    // Reseta estados da modal
    setIsLabelModalOpen(false);
    setSelectedFile(null);
    setSelectedLabel(REQUIRED_PHOTOS[0].label);
  };

  // Procura foto já existente para o rótulo
  const findUploadedPhoto = (label) => {
    return photos.find(
      (p) => p.label && p.label.toUpperCase() === label.toUpperCase()
    );
  };

  if (loading) {
    return <p className="text-xs font-mono text-gray-500 py-4">A carregar checklist...</p>;
  }

  if (error) {
    return <p className="text-xs font-mono text-red-500 py-4">Erro ao carregar checklist de inspeção.</p>;
  }

  return (
    <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6 space-y-6">
      {/* Subtítulo Superior */}
      <p className="text-[10px] font-mono text-gray-400 uppercase tracking-wider mb-1">
        RESPONSÁVEL · EQUIPE 3 · SETOR DE MANUTENÇÃO
      </p>

      {/* Cabeçalho */}
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold text-slate-800">
          Checklist de inspeção
        </h2>

        <div className="flex items-center gap-4">
          <button
            onClick={() => setIsModalOpen(true)}
            className="border border-amber-500/40 text-amber-600 hover:bg-amber-50 text-xs font-semibold px-3 py-1.5 rounded-lg flex items-center gap-1 transition"
          >
            <Plus size={14} /> Nova categoria
          </button>

          <div className="text-right">
            <span className="text-[10px] font-mono text-gray-400 uppercase mr-1">
              PROGRESSO
            </span>
            <span className="text-xl font-bold text-slate-800">
              {completedCount}/{totalCount}
            </span>
          </div>
        </div>
      </div>

      {/* Barra de Progresso */}
      <div className="w-full bg-gray-100 h-2 rounded-full overflow-hidden mb-6">
        <div
          className="bg-emerald-600 h-full transition-all duration-300"
          style={{ width: `${progressPercentage}%` }}
        />
      </div>

      {/* Categorias e Itens */}
      {safeCategories.length === 0 ? (
        <p className="text-xs text-gray-400 font-mono py-4">
          Nenhuma categoria de inspeção registada.
        </p>
      ) : (
        <div className="space-y-6">
          {safeCategories.map((cat) => (
            <div key={cat.id} className="space-y-1">
              <h3 className="font-semibold text-amber-700 text-xs uppercase tracking-wider mb-2">
                {cat.name}
              </h3>

              <div className="divide-y divide-gray-100">
                {cat.items && cat.items.length > 0 ? (
                  cat.items.map((item) => (
                    <div
                      key={item.id}
                      onClick={() => toggleItem(item.id, item.is_completed)}
                      className="flex items-center justify-between py-3 cursor-pointer hover:bg-slate-50/50 px-1 rounded transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-5 h-5 rounded flex items-center justify-center border transition-all ${
                            item.is_completed
                              ? "bg-emerald-600 border-emerald-600 text-white"
                              : item.is_warning
                              ? "bg-amber-50 border-amber-400 text-amber-500"
                              : "border-gray-300 hover:border-gray-400"
                          }`}
                        >
                          {item.is_completed && <Check size={12} strokeWidth={3} />}
                          {!item.is_completed && item.is_warning && <AlertCircle size={12} />}
                        </div>

                        <span
                          className={`text-sm ${
                            item.is_completed ? "text-slate-700" : "text-slate-600"
                          }`}
                        >
                          {item.title}
                        </span>
                      </div>

                      <span className="text-xs text-gray-400 font-normal">
                        {item.value || (item.is_completed ? "concluído" : "pendente")}
                      </span>
                    </div>
                  ))
                ) : (
                  <p className="text-xs text-gray-400 italic py-2">
                    Nenhum item nesta categoria.
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* SECÇÃO: EVIDÊNCIA FOTOGRÁFICA */}
      <div className="pt-4 border-t border-gray-100 space-y-3">
        <p className="text-[11px] font-mono text-slate-500 uppercase tracking-widest font-semibold">
          EVIDÊNCIA FOTOGRÁFICA
        </p>

        {/* Inputs ocultos para Câmera e Galeria */}
        <input
          type="file"
          ref={cameraInputRef}
          onChange={handleFileSelected}
          accept="image/*"
          capture="environment"
          className="hidden"
        />
        <input
          type="file"
          ref={galleryInputRef}
          onChange={handleFileSelected}
          accept="image/*"
          className="hidden"
        />

        {/* Botões de Ação */}
        <div className="flex items-center gap-2 mb-4">
          <button
            type="button"
            onClick={() => triggerGenericUpload("camera")}
            className="bg-[#6B4300] hover:bg-[#543400] text-white text-xs font-medium px-4 py-2 rounded-lg flex items-center gap-2 transition shadow-sm"
          >
            <div className="w-2 h-2 rounded-full bg-white border border-[#6B4300]" />
            Tirar foto
          </button>

          <button
            type="button"
            onClick={() => triggerGenericUpload("gallery")}
            className="bg-[#EAEFEF] hover:bg-[#DEE4E4] text-[#1E293B] text-xs font-semibold px-4 py-2 rounded-lg flex items-center gap-2 transition border border-slate-200"
          >
            <ImageIcon size={14} className="text-slate-700" />
            Escolher da galeria
          </button>
        </div>

        {/* Grid de Cards de Evidência Fotográfica */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {REQUIRED_PHOTOS.map((slot) => {
            const uploaded = findUploadedPhoto(slot.label);

            return (
              <div
                key={slot.id}
                onClick={() => !uploaded && triggerSlotUpload(slot.label)}
                className="relative bg-gradient-to-b from-[#515758] to-[#3B4042] hover:opacity-95 cursor-pointer text-slate-200 h-28 rounded-xl flex flex-col items-center justify-center gap-3 p-3 transition shadow-inner overflow-hidden border border-slate-600/30"
              >
                {uploaded ? (
                  <>
                    <img
                      src={uploaded.image}
                      alt={uploaded.label}
                      className="absolute inset-0 w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-black/40 flex items-end justify-center p-2">
                      <span className="text-[10px] font-mono font-bold tracking-wider text-white uppercase text-center truncate">
                        {slot.label}
                      </span>
                    </div>
                  </>
                ) : (
                  <>
                    {slot.icon === "gauge" && (
                      <div className="w-6 h-6 rounded-full border-2 border-dashed border-slate-300 opacity-80" />
                    )}
                    {slot.icon === "plus" && (
                      <Plus size={26} className="text-slate-300 opacity-80" strokeWidth={1.5} />
                    )}
                    {slot.icon === "grid" && (
                      <div className="w-5 h-5 border border-slate-300 grid grid-cols-2 gap-0.5 p-0.5 opacity-80">
                        <div className="bg-slate-300" />
                        <div className="bg-slate-300" />
                        <div className="bg-slate-300" />
                        <div className="bg-slate-300" />
                      </div>
                    )}
                    {slot.icon === "circle" && (
                      <div className="w-5 h-5 rounded-full border-2 border-slate-300 flex items-center justify-center opacity-80">
                        <div className="w-1.5 h-1.5 bg-slate-300 rounded-full" />
                      </div>
                    )}

                    <span className="text-[10px] font-mono tracking-wider text-slate-300 uppercase font-medium">
                      {slot.label}
                    </span>
                  </>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* RODAPÉ DO TÉCNICO RESPONSÁVEL */}
      <div className="bg-slate-900 text-white rounded-lg p-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-md bg-amber-600/30 text-amber-500 font-bold flex items-center justify-center text-sm">
            RT
          </div>
          <div>
            <h4 className="text-sm font-bold leading-none mb-1">Rafael Tavares</h4>
            <p className="text-xs text-slate-400">
              Téc. de Manutenção - CREM-PR 12.480
            </p>
          </div>
        </div>
        <span className="text-[10px] font-mono tracking-widest text-emerald-500 font-semibold uppercase">
          VETOR-OS-0187
        </span>
      </div>

      {/* Modal para nova categoria */}
      <CategoryModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={addCategory}
      />

      {/* MODAL DE SELEÇÃO DE RÓTULO DA FOTO (EXCLUSIVO PARA OS RÓTULOS DEFINIDOS) */}
      {isLabelModalOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md p-6 space-y-5 animate-in fade-in duration-200">
            <div className="flex justify-between items-center border-b pb-3">
              <h3 className="text-lg font-bold text-slate-800">
                Identificar Evidência
              </h3>
              <button
                onClick={() => setIsLabelModalOpen(false)}
                className="text-gray-400 hover:text-gray-600 transition"
              >
                <X size={20} />
              </button>
            </div>

            <p className="text-xs text-slate-500">
              Selecione o rótulo correspondente para a imagem selecionada:
            </p>

            {/* Pré-visualização da imagem escolhida */}
            {selectedFile && (
              <div className="flex items-center gap-3 bg-slate-50 p-2 rounded-lg border border-slate-100">
                <img
                  src={URL.createObjectURL(selectedFile)}
                  alt="Pré-visualização"
                  className="w-14 h-14 object-cover rounded-md border"
                />
                <div className="overflow-hidden">
                  <p className="text-xs font-semibold text-slate-700 truncate">
                    {selectedFile.name}
                  </p>
                  <p className="text-[10px] text-gray-400">
                    {(selectedFile.size / 1024).toFixed(1)} KB
                  </p>
                </div>
              </div>
            )}

            {/* Menu Select de Rótulos Apenas dos Slots Existentes */}
            <div className="space-y-2">
              <label className="block text-xs font-semibold text-slate-700 uppercase">
                Rótulo da Foto
              </label>
              <select
                value={selectedLabel}
                onChange={(e) => setSelectedLabel(e.target.value)}
                className="w-full bg-slate-50 border border-slate-300 text-slate-800 text-sm rounded-lg p-2.5 focus:ring-2 focus:ring-amber-500 focus:outline-none"
              >
                {REQUIRED_PHOTOS.map((slot) => (
                  <option key={slot.id} value={slot.label}>
                    {slot.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Botões de Ação do Modal */}
            <div className="flex justify-end gap-2 pt-2 border-t">
              <button
                type="button"
                onClick={() => setIsLabelModalOpen(false)}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg transition"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleConfirmUpload}
                className="px-4 py-2 text-xs font-semibold bg-amber-600 hover:bg-amber-700 text-white rounded-lg transition"
              >
                Guardar Foto
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}