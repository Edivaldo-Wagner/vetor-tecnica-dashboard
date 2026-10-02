import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../authContext/AuthContext';
import { 
  Shield, 
  Users, 
  UserCheck, 
  UserX, 
  Search, 
  Filter 
} from 'lucide-react';

export default function AdminDashboard() {
  const { tokens } = useContext(AuthContext);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('ALL');

  // Carregar utilizadores do backend
  const fetchUsers = async () => {
    try {
      const response = await fetch('http://127.0.0.1:8000/api/users/', {
        headers: {
          'Authorization': `Bearer ${tokens?.access}`,
        },
      });
      if (response.ok) {
        const data = await response.json();
        setUsers(data);
      }
    } catch (err) {
      console.error('Erro ao carregar utilizadores:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  // Alternar Status do Utilizador (Ativar/Desativar)
  const toggleUserActive = async (id, currentStatus) => {
    try {
      const response = await fetch(`http://127.0.0.1:8000/api/users/${id}/`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${tokens?.access}`,
        },
        body: JSON.stringify({ is_active: !currentStatus }),
      });
      if (response.ok) fetchUsers();
    } catch (err) {
      console.error(err);
    }
  };

  // Alterar o Papel (Role) do Utilizador
  const handleRoleChange = async (id, newRole) => {
    try {
      const response = await fetch(`http://127.0.0.1:8000/api/users/${id}/`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${tokens?.access}`,
        },
        body: JSON.stringify({ role: newRole }),
      });
      if (response.ok) fetchUsers();
    } catch (err) {
      console.error(err);
    }
  };

  // Cálculos para as métricas dos Cards
  const totalUsers = users.length;
  const activeUsers = users.filter((u) => u.is_active).length;
  const inactiveUsers = users.filter((u) => !u.is_active).length;

  // Lógica de Pesquisa e Filtros
  const filteredUsers = users.filter((u) => {
    const matchesSearch = 
      u.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (u.email && u.email.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesRole = roleFilter === 'ALL' || u.role === roleFilter;

    return matchesSearch && matchesRole;
  });

  return (
    <div className="p-6 space-y-6 bg-[#0b0e14] min-h-screen text-slate-200">
      {/* Cabeçalho */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-white flex items-center gap-2">
            <Shield className="text-amber-500" size={24} />
            Gestão de Utilizadores & Permissões
          </h1>
          <p className="text-xs text-slate-400">
            Painel administrativo de controlo de acessos e monitorização
          </p>
        </div>
      </div>

      {/* Cards de Métricas */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Total de Utilizadores */}
        <div className="bg-[#151c24] border border-slate-800 rounded-xl p-4 flex items-center justify-between">
          <div>
            <p className="text-xs text-slate-400">Total Registados</p>
            <h3 className="text-2xl font-bold text-white mt-1">{totalUsers}</h3>
          </div>
          <div className="p-3 bg-amber-500/10 text-amber-500 rounded-lg">
            <Users size={22} />
          </div>
        </div>

        {/* Utilizadores Ativos */}
        <div className="bg-[#151c24] border border-slate-800 rounded-xl p-4 flex items-center justify-between">
          <div>
            <p className="text-xs text-slate-400">Ativos no Sistema</p>
            <h3 className="text-2xl font-bold text-emerald-400 mt-1">{activeUsers}</h3>
          </div>
          <div className="p-3 bg-emerald-500/10 text-emerald-400 rounded-lg">
            <UserCheck size={22} />
          </div>
        </div>

        {/* Utilizadores Inativos */}
        <div className="bg-[#151c24] border border-slate-800 rounded-xl p-4 flex items-center justify-between">
          <div>
            <p className="text-xs text-slate-400">Inativos / Bloqueados</p>
            <h3 className="text-2xl font-bold text-red-400 mt-1">{inactiveUsers}</h3>
          </div>
          <div className="p-3 bg-red-500/10 text-red-400 rounded-lg">
            <UserX size={22} />
          </div>
        </div>
      </div>

      {/* Tabela de Utilizadores com Barra de Pesquisa */}
      <div className="bg-[#151c24] border border-slate-800 rounded-xl overflow-hidden shadow-xl">
        {/* Topo da Tabela: Pesquisa e Filtros */}
        <div className="p-4 border-b border-slate-800 flex flex-col md:flex-row gap-3 justify-between items-center">
          <h2 className="text-sm font-semibold text-white">
            Lista de Utilizadores ({filteredUsers.length})
          </h2>

          <div className="flex items-center gap-2 w-full md:w-auto">
            {/* Lupa / Campo de Pesquisa */}
            <div className="relative flex-1 md:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={14} />
              <input
                type="text"
                placeholder="Pesquisar por nome ou e-mail..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-[#1e2732] border border-slate-700 text-xs text-slate-200 rounded-lg pl-8 pr-3 py-1.5 focus:outline-none focus:border-amber-500"
              />
            </div>

            {/* Filtro por Papel */}
            <div className="flex items-center gap-1 bg-[#1e2732] border border-slate-700 rounded-lg px-2 py-1">
              <Filter size={14} className="text-slate-400" />
              <select
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value)}
                className="bg-transparent text-xs text-slate-200 focus:outline-none cursor-pointer"
              >
                <option value="ALL" className="bg-[#1e2732]">Todos os Papéis</option>
                <option value="ADMIN" className="bg-[#1e2732]">Administrador</option>
                <option value="TECNICO" className="bg-[#1e2732]">Técnico</option>
                <option value="CLIENTE" className="bg-[#1e2732]">Cliente</option>
              </select>
            </div>
          </div>
        </div>

        {loading ? (
          <p className="p-4 text-xs text-slate-400">A carregar utilizadores...</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#1e2732] text-slate-400 uppercase text-[10px]">
                <tr>
                  <th className="p-3">Utilizador</th>
                  <th className="p-3">E-mail</th>
                  <th className="p-3">Papel / Função</th>
                  <th className="p-3">Estado</th>
                  <th className="p-3 text-right">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {filteredUsers.length > 0 ? (
                  filteredUsers.map((u) => (
                    <tr key={u.id} className="hover:bg-[#1e2732]/50 transition">
                      <td className="p-3 font-semibold text-white">
                        {u.username}
                        {u.is_superuser && (
                          <span className="ml-2 text-[10px] bg-amber-500/20 text-amber-400 px-1.5 py-0.5 rounded">
                            Superuser
                          </span>
                        )}
                      </td>
                      <td className="p-3 text-slate-400">{u.email || '—'}</td>
                      <td className="p-3">
                        <select
                          value={u.role}
                          onChange={(e) => handleRoleChange(u.id, e.target.value)}
                          className="bg-[#1e2732] border border-slate-700 text-slate-200 rounded px-2 py-1 focus:outline-none focus:border-amber-500 cursor-pointer"
                        >
                          <option value="ADMIN">Administrador</option>
                          <option value="TECNICO">Técnico</option>
                          <option value="CLIENTE">Cliente</option>
                        </select>
                      </td>
                      <td className="p-3">
                        <span
                          className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                            u.is_active
                              ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                              : 'bg-red-500/10 text-red-400 border border-red-500/20'
                          }`}
                        >
                          {u.is_active ? 'Ativo' : 'Inativo'}
                        </span>
                      </td>
                      <td className="p-3 text-right space-x-2">
                        <button
                          onClick={() => toggleUserActive(u.id, u.is_active)}
                          className={`px-2.5 py-1 rounded text-[10px] font-medium transition ${
                            u.is_active
                              ? 'bg-red-500/10 text-red-400 hover:bg-red-500/20'
                              : 'bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20'
                          }`}
                        >
                          {u.is_active ? 'Desativar' : 'Ativar'}
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="5" className="p-4 text-center text-slate-500">
                      Nenhum utilizador encontrado para a pesquisa executada.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}