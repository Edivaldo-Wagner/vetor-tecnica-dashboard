// FinancialView.jsx
import React from "react";
import { Plus } from "lucide-react";
import { useFinancial } from "../hooks/useFinancial";

export default function FinancialView() {
  const { records, loading, error } = useFinancial();

  return (
    <div className="mt-6">
      {/* Subtítulo e Cabeçalho da Seção */}
      <div className="flex justify-between items-end mb-6">
        <div>
          <p className="text-[10px] font-mono text-gray-400 uppercase tracking-wider mb-1">
            GESTÃO FINANCEIRA
          </p>
          <h2 className="text-3xl font-bold text-slate-800">
            Lançamentos Financeiros
          </h2>
        </div>
        <button className="bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold px-4 py-2.5 rounded-lg flex items-center gap-1.5 transition">
          <Plus size={14} /> + Criar cobrança
        </button>
      </div>

      {/* Tabela de Lançamentos */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden p-6">
        {loading && (
          <p className="text-xs text-gray-500 py-4 font-mono">
            A carregar registos financeiros da base de dados...
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
                <th className="pb-4 font-semibold">CLIENTE</th>
                <th className="pb-4 font-semibold">VALOR</th>
                <th className="pb-4 font-semibold">VENCIMENTO</th>
                <th className="pb-4 font-semibold">STATUS</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50 text-xs">
              {records.length === 0 ? (
                <tr>
                  <td
                    colSpan={4}
                    className="py-6 text-center text-gray-400 font-mono"
                  >
                    Nenhum registo financeiro encontrado no banco de dados.
                  </td>
                </tr>
              ) : (
                records.map((item) => (
                  <tr key={item.id} className="hover:bg-gray-50/50 transition">
                    <td className="py-4 font-bold text-slate-800">
                      {item.client_name}
                    </td>
                    <td className="py-4 font-mono text-slate-700">
                      {Number(item.amount).toLocaleString("pt-BR", {
                        style: "currency",
                        currency: "BRL",
                      })}
                    </td>
                    <td className="py-4 text-gray-500 font-mono text-[11px]">
                      {new Date(item.due_date).toLocaleDateString("pt-PT")}
                    </td>
                    <td className="py-4">
                      <span
                        className={`inline-flex items-center gap-1.5 text-[11px] font-medium px-3 py-1 rounded-full ${
                          item.status === "pago"
                            ? "bg-emerald-50 text-emerald-700"
                            : "bg-amber-50 text-amber-700"
                        }`}
                      >
                        <span
                          className={`w-1.5 h-1.5 rounded-full ${
                            item.status === "pago"
                              ? "bg-emerald-500"
                              : "bg-amber-500"
                          }`}
                        ></span>
                        {item.status}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
