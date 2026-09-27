import React from "react";
import { Download } from "lucide-react";

export default function ReportsView() {
  const reportsList = [
    {
      document: "Inspeção de EPI — Turno B",
      order: "OS-2024-0187",
      issuedAt: "12 fev 2024",
      responsible: "Rafael Tavares",
    },
    {
      document: "Casa de bombas — preventiva",
      order: "OS-2024-0186",
      issuedAt: "11 fev 2024",
      responsible: "Camila Rocha",
    },
  ];

  return (
    <div className="mt-6">
      {/* Subtítulo e Cabeçalho da Seção */}
      <div className="flex justify-between items-end mb-6">
        <div>
          <p className="text-[10px] font-mono text-gray-400 uppercase tracking-wider mb-1">
            DOCUMENTAÇÃO TÉCNICA
          </p>
          <h2 className="text-3xl font-bold text-slate-800">Laudos</h2>
        </div>
        <button className="bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold px-4 py-2.5 rounded-lg flex items-center gap-2 transition">
          <Download size={14} /> Exportar relatório
        </button>
      </div>

      {/* Tabela de Laudos */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden p-6">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-gray-100 text-[10px] font-mono text-gray-400 uppercase tracking-wider">
              <th className="pb-4 font-semibold">DOCUMENTO</th>
              <th className="pb-4 font-semibold">ORDEM</th>
              <th className="pb-4 font-semibold">EMISSÃO</th>
              <th className="pb-4 font-semibold">RESPONSÁVEL</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50 text-xs">
            {reportsList.map((item, index) => (
              <tr key={index} className="hover:bg-gray-50/50 transition">
                <td className="py-4 font-bold text-slate-800">
                  {item.document}
                </td>
                <td className="py-4 text-gray-500 font-mono text-[11px]">
                  {item.order}
                </td>
                <td className="py-4 text-gray-500">{item.issuedAt}</td>
                <td className="py-4 text-slate-700 font-medium">
                  {item.responsible}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
