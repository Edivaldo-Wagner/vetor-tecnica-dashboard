import React, { useState } from "react";
import { Plus, Edit2, Trash2 } from "lucide-react";
import { useEquipments } from "../hooks/useEquipments";
import NewEquipmentModal from "./NewEquipmentModal";

export default function EquipmentsView() {
  const { equipments, loading, error, addEquipment, editEquipment, removeEquipment } = useEquipments();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [equipmentToEdit, setEquipmentToEdit] = useState(null);

  const handleOpenCreate = () => {
    setEquipmentToEdit(null);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (eq) => {
    setEquipmentToEdit(eq);
    setIsModalOpen(true);
  };

  const handleDelete = async (id, name) => {
    if (window.confirm(`Tem certeza que deseja eliminar o equipamento "${name}"?`)) {
      try {
        await removeEquipment(id);
        window.location.reload()
      } catch (err) {
        alert("Erro ao eliminar o equipamento.");
      }
    }
  };

  const handleFormSubmit = async (formData) => {
    if (equipmentToEdit) {
      await editEquipment(equipmentToEdit.id, formData);
    } else {
      await addEquipment(formData);
    }
  };

  return (
    <div className="mt-6">
      {/* Subtítulo e Cabeçalho da Seção */}
      <div className="flex justify-between items-end mb-6">
        <div>
          <p className="text-[10px] font-mono text-gray-400 uppercase tracking-wider mb-1">
            GESTÃO TÉCNICA
          </p>
          <h2 className="text-3xl font-bold text-slate-800">
            Equipamentos / Sistemas
          </h2>
        </div>
        <button
          onClick={handleOpenCreate}
          className="bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold px-4 py-2.5 rounded-lg flex items-center gap-1.5 transition"
        >
          <Plus size={14} /> + Novo equipamento
        </button>
      </div>

      {/* Tabela de Equipamentos */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden p-6">
        {loading && (
          <p className="text-xs text-gray-500 py-4 font-mono">
            A carregar equipamentos da base de dados...
          </p>
        )}

        {error && (
          <p className="text-xs text-red-500 py-4 font-mono">
            Erro ao conectar com o servidor Django.
          </p>
        )}

        {!loading && !error && (
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-gray-100 text-[10px] font-mono text-gray-400 uppercase tracking-wider">
                <th className="pb-4 font-semibold w-1/4">SISTEMA / EQUIPAMENTO</th>
                <th className="pb-4 font-semibold w-1/4">CLIENTE ASSOCIADO</th>
                <th className="pb-4 font-semibold w-1/5">TIPO / MODELO</th>
                <th className="pb-4 font-semibold w-1/5">LOCALIZAÇÃO</th>
                <th className="pb-4 font-semibold w-1/10 text-right pr-4">AÇÕES</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50 text-xs">
              {equipments.length === 0 ? (
                <tr>
                  <td
                    colSpan={5}
                    className="py-6 text-center text-gray-400 font-mono"
                  >
                    Nenhum equipamento cadastrado na base de dados.
                  </td>
                </tr>
              ) : (
                equipments.map((eq) => (
                  <tr
                    key={eq.id}
                    className="hover:bg-gray-50/50 transition"
                  >
                    {/* Nome do Equipamento/Sistema */}
                    <td className="py-4 font-bold text-slate-800">
                      {eq.name}
                      {eq.serial_number && (
                        <span className="block text-[10px] font-mono font-normal text-gray-400">
                          S/N: {eq.serial_number}
                        </span>
                      )}
                    </td>

                    {/* Cliente */}
                    <td className="py-4 text-gray-600 font-medium">
                      {eq.client_name || `Cliente ID #${eq.client}`}
                    </td>

                    {/* Tipo / Modelo */}
                    <td className="py-4 text-gray-500 font-mono text-[11px]">
                      <div>{eq.system_type}</div>
                      {eq.model && (
                        <div className="text-[10px] text-gray-400">{eq.model}</div>
                      )}
                    </td>

                    {/* Localização */}
                    <td className="py-4 text-gray-500 font-mono text-[11px]">
                      {eq.location || "Não especificada"}
                    </td>

                    {/* Ações (Editar e Apagar) */}
                    <td className="py-4 text-right pr-4 space-x-2">
                      <button
                        onClick={() => handleOpenEdit(eq)}
                        className="p-1.5 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition"
                        title="Editar Equipamento"
                      >
                        <Edit2 size={15} />
                      </button>
                      <button
                        onClick={() => handleDelete(eq.id, eq.name)}
                        className="p-1.5 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition"
                        title="Apagar Equipamento"
                      >
                        <Trash2 size={15} />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        )}
      </div>

      {/* Modal de Adição/Edição de Equipamento */}
      <NewEquipmentModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleFormSubmit}
        equipmentToEdit={equipmentToEdit}
      />
    </div>
  );
}