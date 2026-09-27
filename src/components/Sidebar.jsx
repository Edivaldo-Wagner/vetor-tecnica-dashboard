import React from "react";
import {
  Users,
  FileText,
  ClipboardCheck,
  UserCheck,
  Layers,
  DollarSign,
  ChevronDown,
} from "lucide-react";

export default function Sidebar({ currentTab, setCurrentTab }) {
  const menuItems = [
    { id: "clientes", label: "Clientes", icon: Users, badge: "3" },
    { id: "os", label: "Ordens de Serviço", icon: FileText, badge: "5" },
    { id: "laudos", label: "Laudos", icon: ClipboardCheck, badge: "5" },
    { id: "equipe", label: "Equipe", icon: UserCheck, badge: "5" },
    { id: "plataforma", label: "Minha plataforma", icon: Layers },
    { id: "financeiro", label: "Financeiro", icon: DollarSign },
  ];

  return (
    <aside className="w-64 bg-[#151c24] text-slate-300 flex flex-col justify-between p-4 min-h-screen border-r border-slate-800 shrink-0">
      <div>
        {/* Logo */}
        <div className="flex items-center gap-3 mb-6 px-2">
          <div className="w-10 h-10 bg-amber-500 rounded-lg flex items-center justify-center font-bold text-slate-950 text-lg">
            VT
          </div>
          <div>
            <h1 className="font-bold text-white text-base leading-tight">
              VetorTécnica
            </h1>
            <p className="text-[10px] uppercase tracking-wider text-slate-400">
              Painel de Controle
            </p>
          </div>
        </div>

        {/* Seletor de Unidade / Empresa */}
        <div className="bg-[#1e2732] p-3 rounded-lg mb-6 flex items-center justify-between cursor-pointer hover:bg-slate-800 transition">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-slate-700 rounded text-xs flex items-center justify-center font-semibold text-white">
              PR
            </div>
            <div>
              <p className="text-xs font-bold text-white">Paraná Refinaria</p>
              <p className="text-[10px] text-slate-400">12 O.S. ativas</p>
            </div>
          </div>
          <ChevronDown size={14} className="text-slate-400" />
        </div>

        {/* Menu Principal */}
        <nav className="space-y-1">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setCurrentTab(item.id)}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-xs font-medium transition ${
                  isActive
                    ? "bg-amber-500/10 text-amber-500 border-l-2 border-amber-500"
                    : "text-slate-400 hover:bg-[#1e2732] hover:text-slate-200"
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon size={16} />
                  <span>{item.label}</span>
                </div>
                {item.badge && (
                  <span
                    className={`text-[10px] px-1.5 py-0.5 rounded ${isActive ? "bg-amber-500/20 text-amber-400" : "text-slate-500"}`}
                  >
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>
    </aside>
  );
}
