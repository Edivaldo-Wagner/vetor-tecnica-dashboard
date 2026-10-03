import React, { useState, useContext } from "react";
import {
  Users,
  FileText,
  ClipboardCheck,
  UserCheck,
  Layers,
  DollarSign,
  ChevronDown,
  Menu,
  X,
  LogOut,
  Shield,
  User as UserIcon,
  HardDrive,
  ListChecks,
} from "lucide-react";
import { AuthContext } from "../authContext/AuthContext";

export default function Sidebar({ currentTab, setCurrentTab }) {
  const [isOpen, setIsOpen] = useState(false);
  const { logoutUser, user } = useContext(AuthContext);

  const isAdmin = user?.role === 'ADMIN' || user?.is_superuser;

  const baseMenuItems = [
    { id: "clientes", label: "Clientes", icon: Users, badge: "0" },
    { id: "equipamentos", label: "Equipamentos / Sistemas", icon: HardDrive },
    { id: "checklists", label: "Modelos de Checklist", icon: ListChecks },
    { id: "os", label: "Ordens de Serviço", icon: FileText, badge: "0" },
  ];

  const handleTabClick = (id) => {
    setCurrentTab(id);
    setIsOpen(false);
  };

  const userInitial = user?.username ? user.username.charAt(0).toUpperCase() : "U";

  return (
    <>
      {/* Botão Hambúrguer para Mobile */}
      <div className="md:hidden fixed top-4 left-4 z-50">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="p-2.5 bg-[#151c24] text-white rounded-lg border border-slate-800 shadow-lg focus:outline-none"
          aria-label="Abrir menu"
        >
          {isOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>

      {/* Overlay mobile */}
      {isOpen && (
        <div
          onClick={() => setIsOpen(false)}
          className="md:hidden fixed inset-0 bg-black/60 backdrop-blur-sm z-40 transition-opacity"
        />
      )}

      {/* Sidebar Principal */}
      <aside
        className={`fixed md:static top-0 left-0 z-40 h-screen w-64 bg-[#151c24] text-slate-300 flex flex-col justify-between p-4 border-r border-slate-800 shrink-0 transition-transform duration-300 ease-in-out ${
          isOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
        }`}
      >
        {/* CONTAINER COM SCROLL AUTOMÁTICO PARA O CONTEÚDO PRINCIPAL */}
        <div className="flex-1 overflow-y-auto min-h-0 pr-1 custom-scrollbar space-y-5">
          {/* Header com Logo */}
          <div className="flex items-center justify-between px-2 pt-2 md:pt-0">
            <div className="flex items-center gap-3">
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

            <button
              onClick={() => setIsOpen(false)}
              className="md:hidden text-slate-400 hover:text-white"
            >
              <X size={20} />
            </button>
          </div>

          {/* ÁREA ADMINISTRATIVA */}
          {isAdmin && (
            <div>
              <p className="text-[10px] uppercase tracking-wider font-semibold text-amber-500/80 mb-2 px-1">
                Acesso Gerencial
              </p>
              <button
                onClick={() => handleTabClick("admin")}
                className={`w-full flex items-center justify-between p-3 rounded-xl border transition-all duration-200 ${
                  currentTab === "admin"
                    ? "bg-amber-500/15 border-amber-500/60 text-amber-400 shadow-lg shadow-amber-500/5"
                    : "bg-[#1e2732]/80 border-slate-700/60 text-slate-300 hover:bg-[#1e2732] hover:border-amber-500/40 hover:text-white"
                }`}
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`p-2 rounded-lg ${
                      currentTab === "admin"
                        ? "bg-amber-500/20 text-amber-400"
                        : "bg-slate-800 text-amber-500"
                    }`}
                  >
                    <Shield size={18} />
                  </div>
                  <div className="text-left">
                    <p className="text-xs font-bold leading-tight">Administração</p>
                    <p className="text-[10px] text-slate-400">Painel de Controlo</p>
                  </div>
                </div>
                <span className="text-[9px] font-bold uppercase tracking-wider bg-amber-500/20 text-amber-400 border border-amber-500/30 px-1.5 py-0.5 rounded">
                  Admin
                </span>
              </button>
            </div>
          )}

          {/* Menu Principal Operacional */}
          <div>
            {isAdmin && (
              <p className="text-[10px] uppercase tracking-wider font-semibold text-slate-500 mb-2 px-1">
                Módulos
              </p>
            )}
            <nav className="space-y-1">
              {baseMenuItems.map((item) => {
                const Icon = item.icon;
                const isActive = currentTab === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => handleTabClick(item.id)}
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
                        className={`text-[10px] px-1.5 py-0.5 rounded ${
                          isActive
                            ? "bg-amber-500/20 text-amber-400"
                            : "text-slate-500"
                        }`}
                      >
                        {item.badge}
                      </span>
                    )}
                  </button>
                );
              })}
            </nav>
          </div>
        </div>

        {/* RODAPÉ DA SIDEBAR - PERMANECE FIXO NO FUNDO */}
        <div className="pt-4 border-t border-slate-800 space-y-3 shrink-0">
          {/* Card com os dados do Utilizador */}
          <div className="flex items-center gap-3 px-3 py-2 bg-[#1e2732]/50 rounded-lg">
            <div className="w-10 h-10 bg-amber-500/20 border border-amber-500/40 rounded-full flex items-center justify-center font-bold text-amber-400 text-base shrink-0">
              {userInitial}
            </div>
            <div className="overflow-hidden">
              <p className="text-sm font-bold text-white truncate">
                {user?.username || ""}
              </p>
              <p className="text-xs text-slate-400 truncate">
                {user?.email || `user_id: ${user?.user_id || "---"}`}
              </p>
            </div>
          </div>

          {/* Botão de Sair */}
          <button
            onClick={logoutUser}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-red-400 hover:bg-red-500/10 transition"
          >
            <LogOut size={18} />
            <span>Sair da conta</span>
          </button>
        </div>
      </aside>
    </>
  );
}