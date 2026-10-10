import React, { useState, useEffect, useRef } from "react";
import { X, CheckCircle2, Loader2, RotateCcw } from "lucide-react";
import SignatureCanvas from "react-signature-canvas";

export default function ExecuteServiceOrderModal({
  isOpen,
  onClose,
  onSaveExecution,
  serviceOrder,
  templates = [],
  isLoading
}) {
  const [complementaryServices, setComplementaryServices] = useState("");
  const [conclusions, setConclusions] = useState("");
  
  // Estados para os nomes das assinaturas
  const [clientName, setClientName] = useState("");
  const [technicianName, setTechnicianName] = useState("");

  // Refs para capturar o desenho dos canvases
  const clientSigRef = useRef(null);
  const techSigRef = useRef(null);

  useEffect(() => {
    if (serviceOrder) {
      setComplementaryServices(serviceOrder.complementary_services || "");
      setConclusions(serviceOrder.conclusions || "");
      setClientName(serviceOrder.client_name || "");
      
      // Se houver técnicos associados, define o primeiro como padrão no nome do técnico
      if (serviceOrder.technicians_details && serviceOrder.technicians_details.length > 0) {
        setTechnicianName(serviceOrder.technicians_details[0].name || "");
      }
    }
  }, [serviceOrder]);

  if (!isOpen || !serviceOrder) return null;

  const handleSubmit = (e) => {
    e.preventDefault();

    // Converte as assinaturas para dados em formato imagem (Base64) se não estiverem vazias
    const clientSignatureData = !clientSigRef.current.isEmpty() 
      ? clientSigRef.current.toDataURL("image/png") 
      : null;

    const techSignatureData = !techSigRef.current.isEmpty() 
      ? techSigRef.current.toDataURL("image/png") 
      : null;

    onSaveExecution({
      serviceOrderId: serviceOrder.id,
      complementary_services: complementaryServices,
      conclusions: conclusions,
      status: "concluida",
      signature: {
        client_name: clientName,
        client_signature: clientSignatureData,
        technician_name: technicianName,
        technician_signature: techSignatureData
      }
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden">
        {/* Cabeçalho */}
        <div className="flex items-center justify-between px-6 py-4 border-b bg-gray-50 shrink-0">
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

        {/* Corpo do Formulário */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-6 flex-1">
          {/* Serviços Complementares e Conclusão */}
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Serviços Complementares Executados
              </label>
              <textarea
                rows={2}
                value={complementaryServices}
                onChange={(e) => setComplementaryServices(e.target.value)}
                placeholder="Ex: Realizada a substituição de componentes..."
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
                placeholder="Ex: Sistema testado e entregue em pleno funcionamento..."
                className="w-full px-3 py-2 border rounded-lg text-sm"
              />
            </div>
          </div>

          {/* Secção de Assinaturas Digitais */}
          <div className="border-t pt-6 space-y-4">
            <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider">
              Assinaturas e Validação de Encerramento
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Assinatura do Cliente */}
              <div className="space-y-2 border p-4 rounded-xl bg-slate-50/50">
                <label className="block text-xs font-bold text-slate-700">
                  ASSINATURA DO RESPONSÁVEL / CLIENTE
                </label>
                <input
                  type="text"
                  value={clientName}
                  onChange={(e) => setClientName(e.target.value)}
                  placeholder="Nome do Representante do Cliente"
                  className="w-full px-3 py-1.5 border rounded-lg text-xs bg-white"
                  required
                />
                <div className="border border-slate-300 rounded-lg bg-white relative">
                  <SignatureCanvas
                    ref={clientSigRef}
                    canvasProps={{
                      className: "w-full h-32 rounded-lg cursor-crosshair"
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => clientSigRef.current.clear()}
                    className="absolute bottom-2 right-2 p-1 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded text-[10px] flex items-center gap-1"
                    title="Limpar assinatura"
                  >
                    <RotateCcw size={12} /> Limpar
                  </button>
                </div>
              </div>

              {/* Assinatura do Técnico */}
              <div className="space-y-2 border p-4 rounded-xl bg-slate-50/50">
                <label className="block text-xs font-bold text-slate-700">
                  ASSINATURA DO TÉCNICO RESPONSÁVEL
                </label>
                <input
                  type="text"
                  value={technicianName}
                  onChange={(e) => setTechnicianName(e.target.value)}
                  placeholder="Nome do Técnico"
                  className="w-full px-3 py-1.5 border rounded-lg text-xs bg-white"
                  required
                />
                <div className="border border-slate-300 rounded-lg bg-white relative">
                  <SignatureCanvas
                    ref={techSigRef}
                    canvasProps={{
                      className: "w-full h-32 rounded-lg cursor-crosshair"
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => techSigRef.current.clear()}
                    className="absolute bottom-2 right-2 p-1 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded text-[10px] flex items-center gap-1"
                    title="Limpar assinatura"
                  >
                    <RotateCcw size={12} /> Limpar
                  </button>
                </div>
              </div>
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