// ClientsView.jsx
import React, { useState } from "react";
import { Plus } from "lucide-react";
import { useClients } from "../hooks/useClients";
import NewClientModal from "../components/NewClientModal";

export default function ClientesView() {
  const { clients, loading, error, addClient } = useClients();
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <div className="mt-6">
      {/* Subtítulo e Cabeçalho da Seção */}
      <div className="flex justify-between items-end mb-6">
        <div>
          <p className="text-[10px] font-mono text-gray-400 uppercase tracking-wider mb-1">
            GESTÃO DE CONTAS
          </p>
          <h2 className="text-3xl font-bold text-slate-800">Clientes</h2>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold px-4 py-2.5 rounded-lg flex items-center gap-1.5 transition"
        >
          <Plus size={14} /> + Novo cliente
        </button>
      </div>

      {/* Tabela de Clientes */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden p-6">
        {loading && (
          <p className="text-xs text-gray-500 py-4 font-mono">
            A carregar clientes da base de dados...
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
                <th className="pb-4 font-semibold w-1/3">CLIENTE</th>
                <th className="pb-4 font-semibold w-1/3">CONTRATO</th>
                <th className="pb-4 font-semibold w-1/6">ORDENS ATIVAS</th>
                <th className="pb-4 font-semibold w-1/6 text-right pr-4">
                  STATUS
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50 text-xs">
              {clients.length === 0 ? (
                <tr>
                  <td
                    colSpan={4}
                    className="py-6 text-center text-gray-400 font-mono"
                  >
                    Nenhum cliente cadastrado na base de dados.
                  </td>
                </tr>
              ) : (
                clients.map((client) => {
                  const isAtivo = (client.status || "ativo") === "ativo";

                  return (
                    <tr
                      key={client.id}
                      className="hover:bg-gray-50/50 transition"
                    >
                      {/* Nome do Cliente */}
                      <td className="py-4 font-bold text-slate-800">
                        {client.name}
                      </td>

                      {/* Código do Contrato / Data */}
                      <td className="py-4 text-gray-400 font-mono text-[11px]">
                        {client.contract_code}
                      </td>

                      {/* Ordens Ativas */}
                      <td className="py-4 text-gray-500 font-mono text-[11px] pl-4">
                        {client.active_orders_count}
                      </td>

                      {/* Status */}
                      <td className="py-4 text-right">
                        <span
                          className={`inline-flex items-center gap-1.5 text-[11px] font-medium px-4 py-1.5 rounded-full w-28 justify-center ${
                            isAtivo
                              ? "bg-emerald-50 text-emerald-700"
                              : "bg-amber-100/70 text-amber-800"
                          }`}
                        >
                          <span
                            className={`w-1.5 h-1.5 rounded-full ${
                              isAtivo ? "bg-emerald-500" : "bg-amber-500"
                            }`}
                          ></span>
                          {client.status}
                        </span>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        )}
      </div>

      {/* Modal de Adição de Cliente */}
      <NewClientModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={addClient}
      />
    </div>
  );
}
