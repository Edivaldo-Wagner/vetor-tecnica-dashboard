import React from 'react';
import { Plus, Edit3, Download } from 'lucide-react';

export default function Header() {
  return null; // O componente não renderiza nada na tela

  /*
  return (
    <header className="flex flex-col md:flex-row justify-between items-start md:items-center pb-6 border-b border-gray-200 gap-4">
      <div>
        <p className="text-[11px] font-mono text-gray-400 tracking-wider uppercase mb-1">
          ORDENS DE SERVIÇO / OS-2024-0187
        </p>
        <div className="flex items-center gap-3">
          <h1 className="text-2xl font-bold text-slate-800">
            Inspeção de EPI — Turno B
          </h1>
          <span className="text-[10px] bg-gray-100 text-gray-500 px-2 py-0.5 rounded font-mono uppercase">
            ATUALIZADO 09:42
          </span>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <span className="text-xs bg-emerald-100 text-emerald-700 px-2.5 py-1 rounded-full font-medium flex items-center gap-1.5 mr-2">
          <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full"></span>
          concluída
        </span>
        <button className="bg-slate-900 text-white text-xs font-semibold px-3 py-2 rounded-lg flex items-center gap-1.5 hover:bg-slate-800 transition">
          <Plus size={14} /> + Nova O.S.
        </button>
        <button className="bg-slate-900 text-white text-xs font-semibold px-3 py-2 rounded-lg flex items-center gap-1.5 hover:bg-slate-800 transition">
          <Edit3 size={14} /> Editar O.S.
        </button>
        <button className="bg-slate-900 text-white text-xs font-semibold px-3 py-2 rounded-lg flex items-center gap-1.5 hover:bg-slate-800 transition">
          <Download size={14} /> Baixar laudo PDF
        </button>
      </div>
    </header>
  );
  */
}