import React from "react";

export default function AppCampoCard() {
  const clients = [
    {
      name: "Paraná Refinaria",
      contract: "Contrato válido até 03/2026",
      count: "12",
      tag: "PR",
    },
    {
      name: "Santa Cruz Siderúrgica",
      contract: "Contrato válido até 11/2025",
      count: "8",
      tag: "SC",
    },
    {
      name: "Mata Energia",
      contract: "Contrato válido até 08/2026",
      count: "5",
      tag: "MA",
    },
  ];

  return (
    <div className="space-y-6">
      {/* Visualização de Simulação Mobile */}
      <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm">
        <div className="flex justify-between items-center mb-4">
          <p className="text-[10px] font-mono text-gray-400 uppercase tracking-wider">
            APP DE CAMPO · VISÍVEL AO TÉCNICO
          </p>
          <span className="text-[10px] bg-amber-700 text-white px-2 py-0.5 rounded font-bold uppercase">
            LIVE
          </span>
        </div>

        <div className="border border-gray-200 rounded-lg p-4 bg-gray-50/30">
          <p className="text-[10px] font-mono text-gray-400">OS-2024-0186</p>
          <h3 className="text-sm font-bold text-slate-800 mb-1">
            Casa de bombas
          </h3>
          <p className="text-[11px] text-gray-500 mb-3">
            2 de 3 itens verificados
          </p>

          <div className="space-y-2 mb-4">
            <div className="bg-white p-2.5 rounded border border-gray-200 text-xs text-gray-700 flex items-center gap-2">
              <input
                type="checkbox"
                checked
                readOnly
                className="accent-amber-600"
              />{" "}
              Nível de óleo
            </div>
            <div className="bg-white p-2.5 rounded border border-gray-200 text-xs text-gray-700 flex items-center gap-2">
              <input
                type="checkbox"
                checked
                readOnly
                className="accent-amber-600"
              />{" "}
              Vibração de rolamento
            </div>
            <div className="bg-white p-2.5 rounded border border-amber-500 text-xs text-gray-700 flex items-center gap-2">
              <input type="checkbox" readOnly /> Fotos do acoplamento
            </div>
          </div>

          <button className="w-full bg-amber-600 hover:bg-amber-700 text-white font-semibold py-2 rounded-lg text-xs transition">
            Registrar item
          </button>
        </div>
      </div>

      {/* Lista de Clientes */}
      <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-sm font-bold text-slate-800">Clientes</h3>
          <a
            href="#"
            className="text-xs font-semibold text-amber-600 hover:underline"
          >
            ver todos
          </a>
        </div>

        <div className="space-y-3">
          {clients.map((cli, idx) => (
            <div
              key={idx}
              className="flex items-center justify-between pb-3 border-b border-gray-100 last:border-0 last:pb-0"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-slate-700 rounded text-xs flex items-center justify-center font-bold text-white">
                  {cli.tag}
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-800">{cli.name}</p>
                  <p className="text-[10px] text-gray-400">{cli.contract}</p>
                </div>
              </div>
              <div className="text-right">
                <span className="text-xs font-bold text-slate-800">
                  {cli.count}
                </span>
                <p className="text-[9px] text-gray-400">o.s.</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
