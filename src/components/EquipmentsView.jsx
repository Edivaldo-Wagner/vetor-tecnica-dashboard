import React, { useState } from "react";
import { Plus } from "lucide-react";
import { useEquipments } from "../hooks/useEquipments";
import NewEquipmentModal from "./NewEquipmentModal";

export default function EquipmentsView() {
  const { equipments, loading, error, addEquipment } = useEquipments();
  const [isModalOpen, setIsModalOpen] = useState(false);

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
          onClick={() => setIsModalOpen(true)}
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
                <th className="pb-4 font-semibold w-1/4">TIPO / MODELO</th>
                <th className="pb-4 font-semibold w-1/4 text-right pr-4">
                  LOCALIZAÇÃO
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50 text-xs">
              {equipments.length === 0 ? (
                <tr>
                  <td
                    colSpan={4}
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
                    <td className="py-4 text-right pr-4 text-gray-500 font-mono text-[11px]">
                      {eq.location || "Não especificada"}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        )}
      </div>

      {/* Modal de Adição de Equipamento */}
      <NewEquipmentModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={addEquipment}
      />
    </div>
  );
}