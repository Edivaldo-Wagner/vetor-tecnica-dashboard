import React, { useState } from "react";
import { Plus } from "lucide-react";
import { usePlatformCompanies } from "../hooks/usePlatformCompanies";
import NewPlatformCompanyModal from "../components/NewPlatformCompanyModal";

export default function PlatformView() {
  const { companies, loading, error, addCompany } = usePlatformCompanies();
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Cálculos rápidos para os cards
  const totalActive = companies.filter((c) => (c.status || "ativa") === "ativa").length;
  const totalTrial = companies.filter((c) => c.status === "trial").length;
  const totalUsers = companies.reduce((acc, c) => acc + Number(c.users_count || 0), 0);
  const totalMRR = companies
    .filter((c) => (c.status || "ativa") === "ativa")
    .reduce((acc, c) => acc + Number(c.monthly_fee || 0), 0);

  return (
    <div className="mt-6">
      {/* Subtítulo e Cabeçalho da Seção */}
      <div className="flex justify-between items-end mb-6">
        <div>
          <p className="text-[10px] font-mono text-gray-400 uppercase tracking-wider mb-1">
            ADMINISTRAÇÃO DO PRODUTO
          </p>
          <h2 className="text-3xl font-bold text-slate-800">Minha plataforma</h2>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold px-4 py-2.5 rounded-lg flex items-center gap-1.5 transition"
        >
          <Plus size={14} /> + Nova empresa
        </button>
      </div>

      {/* Cards de Métricas */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6 mb-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 divide-y sm:divide-y-0 sm:divide-x divide-gray-100">
        <div>
          <p className="text-[10px] font-mono text-gray-400 uppercase tracking-wider mb-2">
            EMPRESAS ATIVAS
          </p>
          <p className="text-2xl font-bold text-amber-700">{totalActive}</p>
          <p className="text-xs text-gray-400 mt-1">clientes pagantes</p>
        </div>
        <div className="sm:pl-6 pt-4 sm:pt-0">
          <p className="text-[10px] font-mono text-gray-400 uppercase tracking-wider mb-2">
            USUÁRIOS
          </p>
          <p className="text-2xl font-bold text-amber-700">{totalUsers}</p>
          <p className="text-xs text-gray-400 mt-1">em todas as contas</p>
        </div>
        <div className="sm:pl-6 pt-4 sm:pt-0">
          <p className="text-[10px] font-mono text-gray-400 uppercase tracking-wider mb-2">
            RECEITA MENSAL
          </p>
          <p className="text-2xl font-bold text-emerald-600">
            R$ {totalMRR.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
          </p>
          <p className="text-xs text-gray-400 mt-1">MRR estimado</p>
        </div>
        <div className="sm:pl-6 pt-4 sm:pt-0">
          <p className="text-[10px] font-mono text-gray-400 uppercase tracking-wider mb-2">
            EM TESTE
          </p>
          <p className="text-2xl font-bold text-amber-700">{totalTrial}</p>
          <p className="text-xs text-gray-400 mt-1">empresas em trial</p>
        </div>
      </div>

      {/* Tabela de Empresas */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden p-6">
        {loading && (
          <p className="text-xs text-gray-500 py-4 font-mono">
            A carregar empresas da base de dados...
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
                <th className="pb-4 font-semibold w-1/3">EMPRESA</th>
                <th className="pb-4 font-semibold w-1/3">PLANO</th>
                <th className="pb-4 font-semibold w-1/6">USUÁRIOS</th>
                <th className="pb-4 font-semibold w-1/6 text-right pr-4">STATUS</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50 text-xs">
              {companies.length === 0 ? (
                <tr>
                  <td
                    colSpan={4}
                    className="py-6 text-center text-gray-400 font-mono"
                  >
                    Nenhuma empresa cadastrada na base de dados.
                  </td>
                </tr>
              ) : (
                companies.map((company) => {
                  const isAtiva = (company.status || "ativa") === "ativa";

                  return (
                    <tr
                      key={company.id}
                      className="hover:bg-gray-50/50 transition"
                    >
                      {/* Nome da Empresa */}
                      <td className="py-4 font-bold text-slate-800">
                        {company.name}
                      </td>

                      {/* Plano e Mensalidade */}
                      <td className="py-4 text-gray-400 font-mono text-[11px]">
                        {company.plan || "Profissional"} · R${" "}
                        {Number(company.monthly_fee || 0).toLocaleString("pt-BR")}/mês
                      </td>

                      {/* Qtd de Usuários */}
                      <td className="py-4 text-gray-500 font-mono text-[11px] pl-4">
                        {company.users_count || 0}
                      </td>

                      {/* Status */}
                      <td className="py-4 text-right">
                        <span
                          className={`inline-flex items-center gap-1.5 text-[11px] font-medium px-4 py-1.5 rounded-full w-28 justify-center ${
                            isAtiva
                              ? "bg-emerald-50 text-emerald-700"
                              : "bg-amber-100/70 text-amber-800"
                          }`}
                        >
                          <span
                            className={`w-1.5 h-1.5 rounded-full ${
                              isAtiva ? "bg-emerald-500" : "bg-amber-500"
                            }`}
                          ></span>
                          {company.status || "ativa"}
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

      {/* Modal de Adição de Empresa */}
      <NewPlatformCompanyModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={addCompany}
      />
    </div>
  );
}