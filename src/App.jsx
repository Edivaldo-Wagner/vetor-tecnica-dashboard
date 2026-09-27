import React, { useState } from "react";
import Sidebar from "./components/Sidebar";
import Header from "./components/Header";
import MetricsCards from "./components/MetricsCards";
import InspectionChecklist from "./components/InspectionChecklist";
import FieldAppCard from "./components/FieldAppCard";
import ClientsView from "./components/ClientsView";
import ReportsView from "./components/ReportsView";
import TeamView from "./components/TeamView";
import PlatformView from "./components/PlatformView";
import FinancialView from "./components/FinancialView";

export default function App() {
  const [currentTab, setCurrentTab] = useState("financeiro");

  return (
    <div className="flex min-h-screen bg-slate-50 font-sans">
      {/* Menu Lateral */}
      <Sidebar currentTab={currentTab} setCurrentTab={setCurrentTab} />

      {/* Conteúdo Principal */}
      <main className="flex-1 p-6 md:p-8 overflow-y-auto">
        {/* Componentes Reutilizados no Topo */}
        <Header />
        <MetricsCards />

        {/* Alternância de Abas */}
        {currentTab === "clientes" && <ClientsView />}
        {currentTab === "laudos" && <ReportsView />}
        {currentTab === "equipe" && <TeamView />}
        {currentTab === "plataforma" && <PlatformView />}
        {currentTab === "financeiro" && <FinancialView />}
        {currentTab === "os" && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6">
            <div className="lg:col-span-2">
              <InspectionChecklist />
            </div>
            <div>
              <FieldAppCard />
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
