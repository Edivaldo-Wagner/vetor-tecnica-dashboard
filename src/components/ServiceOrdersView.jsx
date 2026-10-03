import React, { useState, useEffect } from "react";
import { Plus, Play, CheckCircle2, Clock, AlertCircle } from "lucide-react";
import { 
  getServiceOrders, 
  getInspectionTemplates, 
  getClients, 
  getEquipments, 
  getUsers,
  getTeamMembers, 
  saveOrderExecution, 
  createServiceOrder 
} from "../services/api";
import ExecuteServiceOrderModal from "./ExecuteServiceOrderModal";
import NewServiceOrderModal from "./NewServiceOrderModal";

export default function ServiceOrdersView() {
  const [orders, setOrders] = useState([]);
  const [templates, setTemplates] = useState([]);
  const [clients, setClients] = useState([]);
  const [equipments, setEquipments] = useState([]);
  const [technicians, setTechnicians] = useState([]);
  
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [isExecuteOpen, setIsExecuteOpen] = useState(false);
  const [isNewOpen, setIsNewOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [resOrders, resTemplates, resClients, resEquipments, resTechs] = await Promise.all([
        getServiceOrders(),
        getInspectionTemplates(),
        getClients(),
        getEquipments(),
        getUsers() // <-- Procura os utilizadores cadastrados
      ]);
      setOrders(resOrders.data);
      setTemplates(resTemplates.data);
      setClients(resClients.data);
      setEquipments(resEquipments.data);
      setTechnicians(resTechs.data);
    } catch (error) {
      console.error("Erro ao carregar dados de Ordens de Serviço:", error);
    }
  };

  const handleCreateOrder = async (orderData) => {
    setIsLoading(true);
    try {
      await createServiceOrder(orderData);
      setIsNewOpen(false);
      loadData();
    } catch (error) {
      console.error("Erro ao criar Ordem de Serviço:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveExecution = async (executionData) => {
    setIsLoading(true);
    try {
      await saveOrderExecution(executionData);
      setIsExecuteOpen(false);
      loadData();
    } catch (error) {
      console.error("Erro ao salvar execução:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header com Ações */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
        <div>
          <h2 className="text-lg font-bold text-slate-800">Ordens de Serviço</h2>
          <p className="text-xs text-slate-500">Gestão de vistorias, checklists e relatórios de campo</p>
        </div>
        <button
          onClick={() => setIsNewOpen(true)}
          className="flex items-center gap-2 px-4 py-2 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold rounded-lg text-xs transition shadow-sm"
        >
          <Plus size={16} /> Nova Ordem de Serviço
        </button>
      </div>

      {/* Lista de Ordens de Serviço */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-600">
            <thead className="bg-slate-50 text-slate-700 font-semibold border-b border-slate-200">
              <tr>
                <th className="p-3">Nº O.S.</th>
                <th className="p-3">Cliente</th>
                <th className="p-3">Início Previsto</th>
                <th className="p-3">Status</th>
                <th className="p-3 text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {orders.length === 0 ? (
                <tr>
                  <td colSpan="5" className="p-6 text-center text-slate-400">
                    Nenhuma Ordem de Serviço cadastrada.
                  </td>
                </tr>
              ) : (
                orders.map((os) => (
                  <tr key={os.id} className="hover:bg-slate-50/80 transition">
                    <td className="p-3 font-bold text-slate-800">#{os.os_number}</td>
                    <td className="p-3">{os.client_name}</td>
                    <td className="p-3">
                      {os.execution_start ? new Date(os.execution_start).toLocaleString("pt-PT") : "—"}
                    </td>
                    <td className="p-3">
                      <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase inline-flex items-center gap-1 ${
                        os.status === "concluida" 
                          ? "bg-green-100 text-green-700" 
                          : os.status === "em_campo" 
                          ? "bg-blue-100 text-blue-700" 
                          : "bg-amber-100 text-amber-700"
                      }`}>
                        {os.status === "concluida" && <CheckCircle2 size={12} />}
                        {os.status === "em_campo" && <Clock size={12} />}
                        {os.status === "aberta" && <AlertCircle size={12} />}
                        {os.status}
                      </span>
                    </td>
                    <td className="p-3 text-right">
                      <button
                        onClick={() => {
                          setSelectedOrder(os);
                          setIsExecuteOpen(true);
                        }}
                        className="px-3 py-1.5 bg-blue-50 text-blue-600 hover:bg-blue-100 font-medium rounded-lg text-xs inline-flex items-center gap-1.5 transition"
                      >
                        <Play size={13} /> Executar / Checklist
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modais */}
      <NewServiceOrderModal
        isOpen={isNewOpen}
        onClose={() => setIsNewOpen(false)}
        onSave={handleCreateOrder}
        isLoading={isLoading}
        clients={clients}
        equipments={equipments}
        templates={templates}
        technicians={technicians}
      />

      <ExecuteServiceOrderModal
        isOpen={isExecuteOpen}
        onClose={() => setIsExecuteOpen(false)}
        onSaveExecution={handleSaveExecution}
        serviceOrder={selectedOrder}
        templates={templates}
        isLoading={isLoading}
      />
    </div>
  );
}