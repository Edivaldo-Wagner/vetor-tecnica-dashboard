import React, { useState, useEffect } from "react";
import { X } from "lucide-react";
import { 
  syncOrderSignature 
} from "../services/api";
import assignMain from "../assets/assign-main.jpg";

export default function ExecuteServiceOrderModal({
  isOpen,
  onClose,
  onSaveExecution,
  serviceOrder,
  templates = [],
  isLoading
}) {
  const [signUrl, setSignUrl] = useState(null);
  const [complementaryServices, setComplementaryServices] = useState("");
  const [conclusions, setConclusions] = useState("");
  
  // Estados para os nomes das assinaturas
  const [clientName, setClientName] = useState("");
  const [technicianName, setTechnicianName] = useState("");

  useEffect(() => {
    if (serviceOrder) {
      setComplementaryServices(serviceOrder.complementary_services || "");
      setConclusions(serviceOrder.conclusions || "");
      setClientName(serviceOrder.client_name || "");
      setTechnicianName("Guilherme C. Junior");
      setSignUrl(serviceOrder.client_sign_url || null);
    }
  }, [serviceOrder]);

  if (!isOpen || !serviceOrder) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();

    const techSignatureData = assignMain;

    try {
      const response = await onSaveExecution({
        serviceOrderId: serviceOrder.id,
        complementary_services: complementaryServices,
        conclusions: conclusions,
        status: "concluida",
        signature: {
          client_name: clientName,
          technician_name: technicianName,
          technician_signature: techSignatureData
        }
      });

      // Se a API retornar o link da ZapSign, guarda-o para exibir o iframe
      if (response && response.data && response.data.client_sign_url) {
        setSignUrl(response.data.client_sign_url);
      } else if (response && response.client_sign_url) {
        setSignUrl(response.client_sign_url);
      } else {
        onClose();
        alert('aqui')
        //window.location.reload();
      }
    } catch (error) {
      console.error("Erro ao finalizar O.S e gerar link ZapSign:", error);
    }
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

        {/* Corpo do Formulário / Validação */}
        <form onSubmit={handleSubmit} className="flex flex-col flex-1 overflow-hidden">
          <div className="p-6 overflow-y-auto space-y-6 flex-1">

            {signUrl ? (
              /* Se o link da ZapSign já foi gerado, exibe o leitor para o cliente assinar */
              <div className="space-y-4 text-center">
                <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-lg text-xs text-emerald-800 font-medium">
                  Documento criado com sucesso na ZapSign! O cliente pode assinar diretamente abaixo ou no telemóvel.
                </div>
                
                <iframe 
                  src={signUrl} 
                  title="Assinatura ZapSign" 
                  className="w-full h-[450px] border rounded-lg bg-white shadow-inner"
                />

                <div className="flex justify-center gap-3 pt-2">
                  <a 
                    href={signUrl} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg text-xs font-bold hover:bg-blue-700 transition"
                  >
                    Abrir Assinatura em Nova Aba
                  </a>
                  <button 
                    type="button" 
                    onClick={async () => { 
                      try {
                        // Tenta puxar a imagem real da assinatura da ZapSign para o media/ do Django
                        await syncOrderSignature(serviceOrder.id);
                      } catch (err) {
                        console.log("Erro ao sincronizar assinatura:", err);
                      }
                      onClose(); 
                      window.location.reload(); 
                    }}
                    className="px-4 py-2 bg-slate-900 text-white rounded-lg text-xs font-bold hover:bg-slate-800 transition"
                  >
                    Concluir e Fechar
                  </button>
                </div>
              </div>
            ) : (
              /* Formulário normal de encerramento */
              <>
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

                {/* Secção de Assinaturas e ZapSign */}
                <div className="border-t pt-6 space-y-4">
                  <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider">
                    Assinatura Digital via ZapSign
                  </h3>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Dados do Cliente para a ZapSign */}
                    <div className="space-y-2 border p-4 rounded-xl bg-slate-50/50">
                      <label className="block text-xs font-bold text-slate-700">
                        NOME DO RESPONSÁVEL / CLIENTE
                      </label>
                      <input
                        type="text"
                        value={clientName}
                        onChange={(e) => setClientName(e.target.value)}
                        placeholder="Nome do Representante do Cliente"
                        className="w-full px-3 py-1.5 border rounded-lg text-xs bg-white"
                        required
                      />
                      <p className="text-[11px] text-slate-500 pt-2 leading-relaxed">
                        Ao clicar em finalizar, o sistema gerará automaticamente o documento de assinatura digital na ZapSign.
                      </p>
                    </div>

                    {/* Assinatura Fixa do Técnico */}
                    <div className="space-y-2 border p-4 rounded-xl bg-slate-50/50">
                      <label className="block text-xs font-bold text-slate-700">
                        ASSINATURA DO TÉCNICO RESPONSÁVEL
                      </label>
                      <input
                        type="text"
                        value="Guilherme C. Junior"
                        disabled
                        className="w-full px-3 py-1.5 border rounded-lg text-xs bg-slate-100 text-slate-600 cursor-not-allowed font-medium"
                      />
                      <div className="border border-slate-300 rounded-lg bg-white relative h-32 flex items-center justify-center p-2 overflow-hidden">
                        <img 
                          src={assignMain} 
                          alt="Assinatura Fixa do Técnico" 
                          className="max-h-full max-w-full object-contain" 
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </>
            )}

          </div>

          {!signUrl && (
            <div className="px-6 py-4 border-t bg-white flex justify-end gap-3 shrink-0 z-10">
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
                className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white font-semibold py-3 rounded-lg text-xs transition disabled:opacity-50"
              >
                {isLoading ? "A gerar documento..." : "Finalizar e Gerar Link ZapSign"}
              </button>
            </div>
          )}
        </form>
      </div>
    </div>
  );
}