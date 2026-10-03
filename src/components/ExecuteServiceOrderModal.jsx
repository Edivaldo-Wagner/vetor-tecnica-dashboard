import React, { useState, useEffect } from "react";
import { X, CheckCircle2, Loader2 } from "lucide-react";

export default function ExecuteServiceOrderModal({
  isOpen,
  onClose,
  onSaveExecution,
  serviceOrder,
  templates = [],
  isLoading
}) {
  const [responses, setResponses] = useState({});
  const [complementaryServices, setComplementaryServices] = useState("");
  const [conclusions, setConclusions] = useState("");

  useEffect(() => {
    if (serviceOrder) {
      setComplementaryServices(serviceOrder.complementary_services || "");
      setConclusions(serviceOrder.conclusions || "");

      // Mapeia respostas existentes caso seja uma reedição
      const initialResponses = {};
      serviceOrder.order_equipments?.forEach((orderEq) => {
        orderEq.responses?.forEach((resp) => {
          initialResponses[resp.item] = {
            item: resp.item,
            status: resp.status,
            value: resp.value || ""
          };
        });
      });
      setResponses(initialResponses);
    }
  }, [serviceOrder]);

  if (!isOpen || !serviceOrder) return null;

  const handleResponseChange = (itemId, field, value) => {
    setResponses((prev) => ({
      ...prev,
      [itemId]: {
        ...prev[itemId],
        item: itemId,
        [field]: value
      }
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSaveExecution({
      serviceOrderId: serviceOrder.id,
      responses: Object.values(responses),
      complementary_services: complementaryServices,
      conclusions: conclusions,
      status: "concluida"
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden">
        {/* Cabeçalho */}
        <div className="flex items-center justify-between px-6 py-4 border-b bg-gray-50">
          <div>
            <h2 className="text-lg font-bold text-gray-800">
              Execução O.S. #{serviceOrder.os_number} - {serviceOrder.client_name}
            </h2>
            <p className="text-xs text-gray-500">{serviceOrder.scope}</p>
          </div>
          <button onClick={onClose} className="p-1 hover:bg-gray-200 rounded-lg">
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Form / Checklist Body */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-6 flex-1">
          {serviceOrder.order_equipments?.map((orderEq) => {
            const template = templates.find((t) => t.id === orderEq.template);
            return (
              <div key={orderEq.id} className="border rounded-xl p-4 bg-gray-50/50 space-y-4">
                <div className="border-b pb-2">
                  <h3 className="font-semibold text-blue-900">{orderEq.equipment_name}</h3>
                  <p className="text-xs text-gray-500">Local: {orderEq.equipment_location}</p>
                </div>

                {template?.categories?.map((cat) => (
                  <div key={cat.id} className="bg-white p-4 rounded-lg border shadow-sm space-y-3">
                    <h4 className="text-sm font-bold text-gray-700 uppercase border-b pb-1">
                      {cat.title}
                    </h4>

                    {cat.items?.map((item) => (
                      <div key={item.id} className="flex flex-col md:flex-row md:items-center justify-between gap-2 py-2 border-b last:border-b-0">
                        <span className="text-sm text-gray-800 font-medium">{item.label}</span>

                        <div className="flex items-center gap-3">
                          {/* Botões de Resposta Sim/Não/NA */}
                          <div className="flex bg-gray-100 p-1 rounded-lg">
                            {["SIM", "NAO", "NA"].map((st) => (
                              <button
                                type="button"
                                key={st}
                                onClick={() => handleResponseChange(item.id, "status", st)}
                                className={`px-3 py-1 text-xs font-semibold rounded-md transition-colors ${
                                  responses[item.id]?.status === st
                                    ? st === "SIM"
                                      ? "bg-green-600 text-white"
                                      : st === "NAO"
                                      ? "bg-red-600 text-white"
                                      : "bg-gray-600 text-white"
                                    : "text-gray-600 hover:bg-gray-200"
                                }`}
                              >
                                {st}
                              </button>
                            ))}
                          </div>

                          {/* Campo complementar se for número ou texto */}
                          {item.response_type !== "BOOLEAN" && (
                            <input
                              type="text"
                              placeholder={item.response_type === "NUMBER" ? "Ex: 227 V" : "Observação"}
                              value={responses[item.id]?.value || ""}
                              onChange={(e) => handleResponseChange(item.id, "value", e.target.value)}
                              className="px-2 py-1 text-xs border rounded-md w-28 focus:ring-1 focus:ring-blue-500"
                            />
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                ))}
              </div>
            );
          })}

          {/* Serviços Complementares e Conclusão */}
          <div className="space-y-4 pt-2">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Serviços Complementares Executados
              </label>
              <textarea
                rows={2}
                value={complementaryServices}
                onChange={(e) => setComplementaryServices(e.target.value)}
                placeholder="Ex: Realizada a substituição de 12 baterias de 12V 7Ah..."
                className="w-full px-3 py-2 border rounded-lg text-sm"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Conclusões Técnicas / Parecer Final
              </label>
              <textarea
                rows={3}
                value={conclusions}
                onChange={(e) => setConclusions(e.target.value)}
                placeholder="Ex: Realizada inspeção e testes operacionais. Painel apresentando 56 falhas..."
                className="w-full px-3 py-2 border rounded-lg text-sm"
              />
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t">
            <button
              type="button"
              onClick={onClose}
              disabled={isLoading}
              className="px-4 py-2 border rounded-lg text-sm text-gray-700 hover:bg-gray-50"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="px-4 py-2 bg-green-600 text-white rounded-lg text-sm font-medium hover:bg-green-700 flex items-center gap-2"
            >
              {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
              Finalizar Ordem de Serviço
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}