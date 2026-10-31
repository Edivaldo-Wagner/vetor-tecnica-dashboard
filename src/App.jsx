import React, { useState, useEffect, useContext } from "react";
import Sidebar from "./components/Sidebar";
import Header from "./components/Header";
import MetricsCards from "./components/MetricsCards";
import ClientsView from "./components/ClientsView";
import ReportsView from "./components/ReportsView";
import TeamView from "./components/TeamView";
import PlatformView from "./components/PlatformView";
import FinancialView from "./components/FinancialView";
import EquipmentsView from "./components/EquipmentsView";
import ChecklistsView from "./components/ChecklistsView";
import ServiceOrdersView from "./components/ServiceOrdersView";
import AdminDashboard from "./components/AdminDashboard";
import Login from "./components/Login.jsx";
import { AuthContext } from "./authContext/AuthContext.jsx";

export default function App() {
  const { user } = useContext(AuthContext);

  // Inicializa o estado lendo do sessionStorage ou definindo a padrão por permissão
  const [currentTab, setCurrentTab] = useState(() => {
    const savedTab = sessionStorage.getItem("@vetortecnica:currentTab");
    if (savedTab) return savedTab;
    return (user?.role === "ADMIN" || user?.is_superuser) ? "admin" : "clientes";
  });

  // Sempre que a aba mudar, guarda no sessionStorage
  const handleSetTab = (tab) => {
    setCurrentTab(tab);
    sessionStorage.setItem("@vetortecnica:currentTab", tab);
  };

  if (!user) {
    return <Login />;
  }

  return (
    <div className="flex h-screen w-screen bg-slate-50 font-sans overflow-hidden">
      {/* Menu Lateral */}
      <Sidebar currentTab={currentTab} setCurrentTab={handleSetTab} />

      {/* Conteúdo Principal */}
      <main className="flex-1 h-screen p-6 md:p-8 overflow-y-auto">
        {/* Renderiza o Header e Cards APENAS fora da aba de Administração */}
        {currentTab !== "admin" && (
          <>
            <Header />
            <MetricsCards />
          </>
        )}

        {/* Alternância de Abas */}
        {currentTab === "admin" && <AdminDashboard />}
        {currentTab === "clientes" && <ClientsView />}
        {currentTab === "laudos" && <ReportsView />}
        {currentTab === "equipe" && <TeamView />}
        {currentTab === "plataforma" && <PlatformView />}
        {currentTab === "financeiro" && <FinancialView />}
        {currentTab === "equipamentos" && <EquipmentsView />}
        {currentTab === "checklists" && <ChecklistsView />}
        
        {/* Renderização limpa da nova visão de Ordens de Serviço */}
        {currentTab === "os" && <ServiceOrdersView />}
      </main>
    </div>
  );
}