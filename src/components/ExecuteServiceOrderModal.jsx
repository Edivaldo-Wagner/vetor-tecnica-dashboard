import React, { useState, useEffect, useRef } from "react";
import { X, RotateCcw, Upload } from "lucide-react";
//import { syncOrderSignature } from "../services/api";
import SignatureCanvas from "react-signature-canvas";
import assignMain from "../assets/assign-main.png";

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

  const clientSigRef = useRef(null);

  useEffect(() => {
    if (serviceOrder) {
      setComplementaryServices(serviceOrder.complementary_services || "");
      setConclusions(serviceOrder.conclusions || "");
      setClientName(serviceOrder.signature_details?.client_name || serviceOrder.client_name || "");
      setTechnicianName("Guilherme C. Junior");
      setSignUrl(serviceOrder.signature_details?.client_signature || null);

      if (serviceOrder.signature_details?.client_signature && clientSigRef.current) {
        setTimeout(() => {
          const canvas = clientSigRef.current.getCanvas();
          const ctx = canvas.getContext("2d");
          const img = new Image();
          img.crossOrigin = "anonymous";
          img.onload = () => {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
          };
          img.src = serviceOrder.signature_details.client_signature;
        }, 100);
      } else if (clientSigRef.current) {
        clientSigRef.current.clear();
      }
    }
  }, [serviceOrder]);

  if (!isOpen || !serviceOrder) return null;

  // Função para tratar o upload da imagem da assinatura
  // Função para tratar o upload da imagem da assinatura de forma limpa
  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (file && clientSigRef.current) {
      const reader = new FileReader();
      reader.onload = (uploadEvent) => {
        const base64Image = uploadEvent.target.result;
        
        // Guarda a imagem carregada diretamente no estado de URL/Base64 da assinatura
        setSignUrl(base64Image);

        // Desenha também no canvas visualmente para o utilizador ver
        const canvas = clientSigRef.current.getCanvas();
        const ctx = canvas.getContext("2d");
        const img = new Image();
        img.crossOrigin = "anonymous";
        img.onload = () => {
          ctx.clearRect(0, 0, canvas.width, canvas.height);
          
          if (file.type === "image/jpeg" || file.type === "image/jpg") {
            ctx.fillStyle = "#FFFFFF";
            ctx.fillRect(0, 0, canvas.width, canvas.height);
          }
          
          ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        };
        img.src = base64Image;
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const signaturePad = clientSigRef.current;
    const isCanvasEmpty = signaturePad ? signaturePad.isEmpty() : true;
    
    // Se o canvas foi desenhado, usa o canvas. Se foi feito upload, usa o signUrl guardado!
    let clientSignatureData = null;
    if (!isCanvasEmpty && signaturePad) {
      clientSignatureData = signaturePad.toDataURL("image/png");
    } else if (signUrl) {
      clientSignatureData = signUrl;
    }

    const techSignatureData = assignMain;

    try {
      await onSaveExecution({
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
      onClose();
    } catch (error) {
      console.error("Erro ao salvar execução e assinaturas:", error);
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

        {/* Corpo do Formulário */}
        <form onSubmit={handleSubmit} className="flex flex-col flex-1 overflow-hidden">
          <div className="p-6 overflow-y-auto space-y-6 flex-1">
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

            {/* Secção de Assinaturas Digitais Manual */}
            <div className="border-t pt-6 space-y-4">
              <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider">
                Assinaturas e Validação de Encerramento
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Assinatura do Cliente */}
                <div className="space-y-2 border p-4 rounded-xl bg-slate-50/50">
                  <div className="flex items-center justify-between">
                    <label className="block text-xs font-bold text-slate-700">
                      ASSINATURA DO RESPONSÁVEL / CLIENTE
                    </label>
                    <label className="cursor-pointer text-[11px] text-blue-600 hover:text-blue-700 font-semibold flex items-center gap-1 bg-blue-50 px-2 py-1 rounded border border-blue-200 transition">
                      <Upload size={12} /> Carregar Imagem
                      <input 
                        type="file" 
                        accept="image/*" 
                        className="hidden" 
                        onChange={handleFileUpload} 
                      />
                    </label>
                  </div>
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
          </div>

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
              className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-lg text-xs transition disabled:opacity-50 flex items-center gap-2"
            >
              {isLoading ? "A guardar..." : "Finalizar Ordem de Serviço"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}