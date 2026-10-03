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
  const [currentTab, setCurrentTab] = useState("clientes");
  const { user } = useContext(AuthContext);

  // Define a aba inicial com base nas permissões apenas quando o utilizador entra
  useEffect(() => {
    if (user) {
      if (user.role === "ADMIN" || user.is_superuser) {
        setCurrentTab("admin");
      } else {
        setCurrentTab("clientes");
      }
    }
  }, [user]);

  if (!user) {
    return <Login />;
  }

  return (
    <div className="flex min-h-screen bg-slate-50 font-sans">
      {/* Menu Lateral */}
      <Sidebar currentTab={currentTab} setCurrentTab={setCurrentTab} />

      {/* Conteúdo Principal */}
      <main className="flex-1 p-6 md:p-8 overflow-y-auto">
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