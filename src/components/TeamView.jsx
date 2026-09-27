import React, { useState } from "react";
import { UserPlus } from "lucide-react";
import { useTeam } from "../hooks/useTeam";
import InviteUserModal from "./InviteUserModal";

export default function TeamView() {
  const { teamMembers, loading, error, addMember } = useTeam();
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Mapeamento dinâmico de cores com base no cargo
  const getAvatarBg = (role) => {
    switch (role) {
      case "Administrador":
        return "bg-amber-800 text-amber-200";
      case "Supervisor":
        return "bg-purple-900 text-purple-200";
      default:
        return "bg-slate-800 text-slate-200";
    }
  };

  return (
    <div className="mt-6">
      {/* Subtítulo e Cabeçalho */}
      <div className="flex justify-between items-end mb-6">
        <div>
          <p className="text-[10px] font-mono text-gray-400 uppercase tracking-wider mb-1">
            USUÁRIOS E PERMISSÕES
          </p>
          <h2 className="text-3xl font-bold text-slate-800">Equipe</h2>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold px-4 py-2.5 rounded-lg flex items-center gap-1.5 transition"
        >
          <UserPlus size={14} /> + Convidar usuário
        </button>
      </div>

      {/* Estados de Carregamento e Erro */}
      {loading && (
        <p className="text-xs font-mono text-gray-500 py-4">A carregar membros da equipa...</p>
      )}

      {error && (
        <p className="text-xs font-mono text-red-500 py-4">Erro ao carregar equipa.</p>
      )}

      {/* Cartões dos Membros */}
      {!loading && !error && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {teamMembers.map((member) => (
            <div
              key={member.id}
              className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm flex items-start gap-4 hover:border-gray-200 transition"
            >
              <div
                className={`w-10 h-10 rounded-lg font-bold text-xs flex items-center justify-center shrink-0 ${getAvatarBg(
                  member.role
                )}`}
              >
                {member.initials}
              </div>
              <div>
                <h3 className="font-bold text-slate-800 text-sm">
                  {member.name}
                </h3>
                <p className="text-xs text-gray-400 mt-0.5">
                  {member.role} · {member.status || "online"}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal de Convidar Usuário */}
      <InviteUserModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={addMember}
      />
    </div>
  );
}