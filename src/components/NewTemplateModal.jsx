import React, { useState } from "react";
import { X, Plus, Trash2, Loader2, Sparkles, Camera, Image, Upload } from "lucide-react";

// Dicionário de Categorias e Itens Padrão
const PREDEFINED_CATALOG = {
  SDAI: {
    categories: [
      "01 - DETECTORES",
      "02 - ACIONADORES MANUAIS",
      "03 - AVISADORES SONOROS/VISUAIS",
      "05 - CENTRAL DE ALARME",
      "06 - REDE DE ELETRODUTOS",
      "07 - MÓDULOS / SAÍDAS AUXILIARES"
    ],
    items: {
      "01 - DETECTORES": [
        { label: "É POSSÍVEL REALIZAR INSPEÇÃO?", status: "SIM", observation: "" },
        { label: "A) BOM ASPECTO EXTERNO?", status: "SIM", observation: "" },
        { label: "B) LED DE SUPERVISÃO ESTÁ PISCANDO?", status: "SIM", observation: "" },
        { label: "C) ESTÁ BEM FIXADO NA BASE E NA POSIÇÃO CORRETA DE OPERAÇÃO?", status: "SIM", observation: "" },
        { label: "D) SUA CÂMARA DE DETECÇÃO ESTÁ TOTALMENTE DESOBSTRUÍDA?", status: "SIM", observation: "" },
        { label: "E) FOI OBTIDO RESPOSTA DE ACIONAMENTO?", status: "SIM", observation: "" }
      ],
      "02 - ACIONADORES MANUAIS": [
        { label: "É POSSÍVEL REALIZAR INSPEÇÃO?", status: "SIM", observation: "" },
        { label: "A) ACIONAMENTO INTACTO E SEM NENHUM DANO?", status: "SIM", observation: "" },
        { label: "B) ACESSO DESIMPEDIDO?", status: "SIM", observation: "" },
        { label: "C) BOM ASPECTO EXTERNO?", status: "SIM", observation: "" },
        { label: "D) VISTORIADOS TODOS OS ACIONADORES?", status: "SIM", observation: "" }
      ],
      "03 - AVISADORES SONOROS/VISUAIS": [
        { label: "É POSSÍVEL REALIZAR INSPEÇÃO?", status: "SIM", observation: "" },
        { label: "A) ESTÃO BEM FIXADOS E COM AS LENTES LIMPAS?", status: "SIM", observation: "" },
        { label: "B) ACESSO DESIMPEDIDO?", status: "SIM", observation: "" },
        { label: "C) BOM ASPECTO EXTERNO DA LENTE?", status: "SIM", observation: "" },
        { label: "D) VISTORIADOS TODOS OS AVISADORES?", status: "SIM", observation: "" }
      ],
      "05 - CENTRAL DE ALARME": [
        { label: "É POSSÍVEL REALIZAR INSPEÇÃO?", status: "SIM", observation: "" },
        { label: "A) FOI MEDIDA A TENSÃO VCA DE ENTRADA?", status: "SIM", observation: "227 Vca" },
        { label: "B) FOI MEDIDA A TENSÃO VDC DA FONTE DE ALIMENTAÇÃO?", status: "SIM", observation: "26.9 VCC" },
        { label: "C) FOI MEDIDA A TENSÃO DAS BATERIAS DA CENTRAL?", status: "SIM", observation: "27.1 vcc" },
        { label: "D) AS BATERIAS ESTÃO COM BOM ASPECTO? QUAL A DATA DE FABRICAÇÃO DAS BATERIAS?", status: "SIM", observation: "Trocadas 11/03/2025" },
        { label: "E) FOI MEDIDA A TENSÃO DOS LAÇOS DE DETECÇÃO?", status: "SIM", observation: "15 a 18 vcc" },
        { label: "F) O CABO DE ATERRAMENTO ESTÁ BEM FIXADO AO PAINEL?", status: "SIM", observation: "" },
        { label: "G) LÂMPADA PILOTO ACESA?", status: "SIM", observation: "" },
        { label: "H) LÂMPADAS DE INCÊNDIO APAGADAS?", status: "SIM", observation: "" },
        { label: "I) LÂMPADAS DE DEFEITO APAGADAS?", status: "SIM", observation: "" }
      ],
      "06 - REDE DE ELETRODUTOS": [
        { label: "É POSSÍVEL REALIZAR INSPEÇÃO?", status: "SIM", observation: "" },
        { label: "A) BOM ASPECTO EXTERNO?", status: "SIM", observation: "" },
        { label: "B) BEM FIXADOS?", status: "SIM", observation: "" },
        { label: "C) FIAÇÃO ESTÁ APARENTE EM ALGUM TRECHO DA REDE?", status: "SIM", observation: "" }
      ],
      "07 - MÓDULOS / SAÍDAS AUXILIARES": [
        { label: "É POSSÍVEL REALIZAR INSPEÇÃO?", status: "SIM", observation: "" },
        { label: "A) MÓDULOS DE COMANDO E MONITORAMENTO OPERACIONAIS?", status: "SIM", observation: "" },
        { label: "B) SAÍDAS AUXILIARES TESTADAS E RESPONDENDO?", status: "SIM", observation: "" },
        { label: "C) BOM ASPECTO EXTERNO E FIXAÇÃO ADEQUADA?", status: "SIM", observation: "" }
      ]
    }
  },
  BOMBAS: {
    categories: [
      "INSPEÇÃO MENSAL DA CASA DE BOMBAS"
    ],
    items: {
      "INSPEÇÃO MENSAL DA CASA DE BOMBAS": [
        { label: "VERIFICAR SE HÁ ALARMES NO PAINEL ELÉTRICO", status: "SIM", observation: "" },
        { label: "VERIFICAR E ANOTAR PRESSÃO DE TRABALHO | PAINEL ELÉTRICO", status: "SIM", observation: "N/A Não foi possível os testes operacionais" },
        { label: "VERIFICAR E ANOTAR PRESSÃO DE ENTRADA | MANÔMETRO", status: "SIM", observation: "" },
        { label: "VERIFICAR E ANOTAR PRESSÃO DE SAÍDA | MANÔMETRO", status: "SIM", observation: "" },
        { label: "VERIFICAR POSIÇÃO COMANDO | BOMBA JOCKEY", status: "SIM", observation: "" },
        { label: "VERIFICAR POSIÇÃO COMANDO | BOMBA ELÉTRICA", status: "SIM", observation: "" },
        { label: "VERIFICAR POSIÇÃO COMANDO | BOMBA DIESEL", status: "SIM", observation: "" },
        { label: "LER E ANOTAR HORÍMETRO | MOTOR", status: "SIM", observation: "171,3 H" },
        { label: "VERIFICAR E ANOTAR RPM | PAINEL ELÉTRICO", status: "SIM", observation: "" },
        { label: "VERIFICAR E ANOTAR PRESSÃO DO ÓLEO (NÃO DEVE CAIR A PRESSÃO COM O TEMPO) | MOTOBOMBA", status: "SIM", observation: "" },
        { label: "VERIFICAR PRESSÃO DA ÁGUA DE ARREFECIMENTO MOTOR | MANÔMETRO", status: "SIM", observation: "" },
        { label: "VERIFICAR NÍVEL DE ÁGUA | RESERVATÓRIO", status: "SIM", observation: "" },
        { label: "VERIFICAR NÍVEL DE ÁGUA | BATERIAS", status: "SIM", observation: "" },
        { label: "VERIFICAR NÍVEL DE ÁGUA | MOTOR", status: "SIM", observation: "" },
        { label: "VERIFICAR NÍVEL DE DIESEL | RESERVATÓRIO", status: "SIM", observation: "" },
        { label: "VERIFICAR NÍVEL DE LUBRIFICANTE (REABASTECER SE NECESSÁRIO) | MOTOR", status: "SIM", observation: "" },
        { label: "VERIFICAR E ANOTAR TENSÃO | BATERIAS", status: "SIM", observation: "" },
        { label: "VERIFICAR E ANOTAR TEMPERATURA DA ÁGUA | PAINEL ELÉTRICO", status: "SIM", observation: "" },
        { label: "VERIFICAR E ANOTAR TEMPERATURA DA CARCAÇA | MOTOR (TEMP. MAX)", status: "SIM", observation: "" },
        { label: "VERIFICAR E ANOTAR TEMPERATURA | ÁGUA DE ARREFECIMENTO", status: "SIM", observation: "" },
        { label: "VERIFICAR POSIÇÃO DAS VÁLVULAS DO SISTEMA | SISTEMA", status: "SIM", observation: "" },
        { label: "VERIFICAR PRESENÇA DE VAZAMENTO (PEQUENO VAZAMENTO É TOLERÁVEL) | GAXETA", status: "SIM", observation: "" },
        { label: "TESTAR MOTOBOMBA EM AUTOMÁTICO | MOTOR", status: "SIM", observation: "" },
        { label: "TESTAR MOTOBOMBA MANUAL 01 | PAINEL ELÉTRICO", status: "SIM", observation: "" },
        { label: "TESTAR MOTOBOMBA MANUAL 02 | PAINEL ELÉTRICO", status: "SIM", observation: "" },
        { label: "VERIFICAR COMANDO DAS CHAVES MANUAIS CRANCK 01, 02, OVERSPEED E CHAVE MANUAL | PAINEL ELÉTRICO", status: "SIM", observation: "" },
        { label: "VERIFICAR CONDIÇÕES FÍSICAS DA CASA DE BOMBAS | EDIFICAÇÃO", status: "SIM", observation: "" },
        { label: "VERIFICAR E ANOTAR AS CONDIÇÕES FÍSICAS DA TUBULAÇÃO | TUBULAÇÃO", status: "SIM", observation: "" },
        { label: "VERIFICAR CONDIÇÕES FÍSICAS DAS VÁLVULAS E CONEXÕES | VÁLVULAS E CONEXÕES", status: "SIM", observation: "" }
      ]
    }
  }
};

export default function NewTemplateModal({
  isOpen,
  onClose,
  onSave = () => {},
  isLoading
}) {
  const [templateName, setTemplateName] = useState("");
  const [equipmentType, setEquipmentType] = useState("SDAI");
  const [categories, setCategories] = useState([]);

  // Estado para controlar as fotografias do relatório
  const [photos, setPhotos] = useState([]);
  const [isPhotoModalOpen, setIsPhotoModalOpen] = useState(false);

  if (!isOpen) return null;

  // Carregar Estrutura Completa de Exemplo (Auto-Preenchimento)
  const handleLoadDefaultTemplate = () => {
    if (PREDEFINED_CATALOG[equipmentType]) {
      const defaultData = PREDEFINED_CATALOG[equipmentType];
      const newCategories = defaultData.categories.map((catTitle) => ({
        title: catTitle,
        items: (defaultData.items[catTitle] || []).map((item) => ({ ...item }))
      }));

      setCategories(newCategories);
      if (!templateName) {
        if (equipmentType === "SDAI") {
          setTemplateName("Checklist SDAI - Sistema de Detecção e Alarme");
        } else if (equipmentType === "BOMBAS") {
          setTemplateName("Inspeção Mensal - Casa de Bombas");
        }
      }
    }
  };

  // Funções de Gestão do Checklist
  const handleAddCategory = () => {
    setCategories([
      ...categories,
      { title: "", items: [{ label: "", status: "SIM", observation: "" }] }
    ]);
  };

  const handleRemoveCategory = (catIndex) => {
    setCategories(categories.filter((_, idx) => idx !== catIndex));
  };

  const handleCategoryTitleChange = (catIndex, value) => {
    const updated = [...categories];
    updated[catIndex].title = value;

    const predefItems = PREDEFINED_CATALOG[equipmentType]?.items[value];
    if (predefItems && updated[catIndex].items.length === 1 && updated[catIndex].items[0].label === "") {
      updated[catIndex].items = predefItems.map(item => ({ ...item }));
    }

    setCategories(updated);
  };

  const handleAddItem = (catIndex) => {
    const updated = [...categories];
    updated[catIndex].items.push({ label: "", status: "SIM", observation: "" });
    setCategories(updated);
  };

  const handleRemoveItem = (catIndex, itemIndex) => {
    const updated = [...categories];
    updated[catIndex].items = updated[catIndex].items.filter((_, idx) => idx !== itemIndex);
    setCategories(updated);
  };

  const handleItemChange = (catIndex, itemIndex, field, value) => {
    const updated = [...categories];
    updated[catIndex].items[itemIndex][field] = value;
    setCategories(updated);
  };

  // --- FUNÇÕES DE GESTÃO DAS FOTOGRAFIAS ---
  const handlePhotoUpload = (e) => {
    const files = Array.from(e.target.files);
    if (!files.length) return;

    const newPhotoEntries = files.map((file) => ({
      id: Date.now() + Math.random(),
      url: URL.createObjectURL(file),
      caption: "",
      fileName: file.name
    }));

    setPhotos((prev) => [...prev, ...newPhotoEntries]);
  };

  const handleCaptionChange = (id, newCaption) => {
    setPhotos((prev) =>
      prev.map((photo) => (photo.id === id ? { ...photo, caption: newCaption } : photo))
    );
  };

  const handleRemovePhoto = (id) => {
    setPhotos((prev) => prev.filter((photo) => photo.id !== id));
  };

  // Submeter Formulário Completo
  const handleSubmit = (e) => {
    e.preventDefault();

    const payload = {
      name: templateName,
      equipment_type: equipmentType,
      categories: categories
        .filter((cat) => cat.title.trim() !== "")
        .map((cat, catIdx) => ({
          title: cat.title,
          order: catIdx + 1,
          items: cat.items
            .filter((item) => item.label.trim() !== "")
            .map((item, itemIdx) => ({
              label: item.label,
              status: item.status || "SIM",
              observation: item.observation || "",
              order: itemIdx + 1,
            })),
        })),
      photos: photos.map((p, idx) => ({
        order: idx + 1,
        url: p.url,
        caption: p.caption
      }))
    };

    onSave(payload);
  };

  const getSuggestedItems = (catTitle) => {
    return PREDEFINED_CATALOG[equipmentType]?.items[catTitle] || [];
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-4xl overflow-hidden my-8 relative">
        {/* Cabeçalho */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <div>
            <h2 className="text-lg font-semibold text-gray-800">Criar Novo Modelo de Checklist</h2>
            <p className="text-xs text-gray-500">Defina o formulário com opções, medições e relatório fotográfico</p>
          </div>
          <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded-lg transition-colors">
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6 max-h-[75vh] overflow-y-auto">
          {/* Informações Básicas */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Nome do Modelo *
              </label>
              <input
                type="text"
                placeholder="Ex: Checklist SDAI - Central GST"
                value={templateName}
                onChange={(e) => setTemplateName(e.target.value)}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Tipo de Sistema / Equipamento
              </label>
              <select
                value={equipmentType}
                onChange={(e) => {
                  setEquipmentType(e.target.value);
                  setCategories([]);
                }}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
              >
                <option value="SDAI">Sistema de Detecção e Alarme de Incêndio</option>
                <option value="BOMBAS">Casa de Bombas / Motobombas</option>
                <option value="SPRINKLERS">Rede de Chuveiros (Sprinklers)</option>
                <option value="ILUMINACAO">Iluminação de Emergência</option>
                <option value="EXTINTORES">Extintores de Incêndio</option>
                <option value="OUTRO">Outro Sistema</option>
              </select>
            </div>
          </div>

          {/* BARRA DE AÇÕES: Botão de Fotos Destacado + Botão de Checklist Padrão */}
          <div className="flex flex-wrap items-center justify-end gap-3 pt-2">
            {/* BOTÃO EM DESTAQUE VERMELHO PARA FOTOGRAFIAS */}
            <button
              type="button"
              onClick={() => setIsPhotoModalOpen(true)}
              className="flex items-center gap-2 px-4 py-2 bg-rose-600 text-white hover:bg-rose-700 rounded-lg text-xs font-bold shadow-md hover:shadow-lg transition-all border border-rose-500 active:scale-95"
            >
              <Camera className="w-4 h-4 text-white" />
              <span>Anexar / Gerir Fotos</span>
              <span className="bg-white text-rose-700 rounded-full px-2 py-0.5 text-[10px] font-extrabold ml-1">
                {photos.length}
              </span>
            </button>

            {/* BOTÃO CARREGAR CHECKLIST PADRÃO */}
            {PREDEFINED_CATALOG[equipmentType] && (
              <button
                type="button"
                onClick={handleLoadDefaultTemplate}
                className="flex items-center gap-1.5 px-3 py-2 bg-blue-50 text-blue-700 hover:bg-blue-100 rounded-lg text-xs font-semibold transition-colors border border-blue-200"
              >
                <Sparkles className="w-3.5 h-3.5 text-blue-600" />
                Carregar Checklist Padrão ({equipmentType})
              </button>
            )}
          </div>

          <hr className="border-gray-100" />

          {/* Categorias e Perguntas */}
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="text-md font-semibold text-gray-700">Categorias & Verificações</h3>
              <button
                type="button"
                onClick={handleAddCategory}
                className="flex items-center gap-1 text-sm text-blue-600 hover:text-blue-700 font-medium"
              >
                <Plus className="w-4 h-4" /> Adicionar Categoria
              </button>
            </div>

            {categories.length === 0 ? (
              <p className="text-sm text-gray-500 italic text-center py-6 bg-gray-50 rounded-lg border border-dashed border-gray-200">
                Nenhuma categoria adicionada. Clique em "Adicionar Categoria" para criar manualmente ou "Carregar Checklist Padrão" acima.
              </p>
            ) : (
              categories.map((category, catIndex) => (
                <div key={catIndex} className="p-4 bg-gray-50 rounded-lg border border-gray-200 space-y-4">
                  {/* Título da Categoria */}
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      list={`category-options-${catIndex}`}
                      placeholder="Selecione ou digite o Título da Categoria (Ex: 01 - DETECTORES)"
                      value={category.title}
                      onChange={(e) => handleCategoryTitleChange(catIndex, e.target.value)}
                      className="flex-1 px-3 py-1.5 bg-white border border-gray-300 rounded-lg text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <datalist id={`category-options-${catIndex}`}>
                      {(PREDEFINED_CATALOG[equipmentType]?.categories || []).map((catTitle, idx) => (
                        <option key={idx} value={catTitle} />
                      ))}
                    </datalist>

                    <button
                      type="button"
                      onClick={() => handleRemoveCategory(catIndex)}
                      className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                      title="Remover Categoria"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Itens da Categoria */}
                  <div className="pl-2 sm:pl-4 space-y-2 border-l-2 border-gray-200">
                    <div className="flex items-center gap-2 text-[11px] font-semibold text-gray-500 uppercase tracking-wider px-1">
                      <span className="flex-1">Descrição / Item de Inspeção</span>
                      <span className="w-24 text-center">Status</span>
                      <span className="w-48 text-left">Medição / Obs.</span>
                      <span className="w-6"></span>
                    </div>

                    {category.items.map((item, itemIndex) => (
                      <div key={itemIndex} className="flex items-center gap-2">
                        <input
                          type="text"
                          list={`item-options-${catIndex}-${itemIndex}`}
                          placeholder="Item a inspecionar..."
                          value={item.label}
                          onChange={(e) =>
                            handleItemChange(catIndex, itemIndex, "label", e.target.value)
                          }
                          className="flex-1 px-3 py-1.5 bg-white border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                        <datalist id={`item-options-${catIndex}-${itemIndex}`}>
                          {getSuggestedItems(category.title).map((suggested, idx) => (
                            <option key={idx} value={suggested.label} />
                          ))}
                        </datalist>

                        <select
                          value={item.status || "SIM"}
                          onChange={(e) =>
                            handleItemChange(catIndex, itemIndex, "status", e.target.value)
                          }
                          className="w-24 px-2 py-1.5 bg-white border border-gray-300 rounded-lg text-xs font-semibold text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 text-center"
                        >
                          <option value="SIM">SIM</option>
                          <option value="NÃO">NÃO</option>
                          <option value="N/A">N/A</option>
                        </select>

                        <input
                          type="text"
                          placeholder="Ex: 227 Vca, 26.9 VCC..."
                          value={item.observation || ""}
                          onChange={(e) =>
                            handleItemChange(catIndex, itemIndex, "observation", e.target.value)
                          }
                          className="w-48 px-2.5 py-1.5 bg-white border border-gray-300 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />

                        {category.items.length > 1 && (
                          <button
                            type="button"
                            onClick={() => handleRemoveItem(catIndex, itemIndex)}
                            className="p-1 text-gray-400 hover:text-red-500 rounded transition-colors"
                            title="Remover Item"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    ))}

                    <button
                      type="button"
                      onClick={() => handleAddItem(catIndex)}
                      className="text-xs text-blue-600 hover:underline pt-1 inline-block font-medium"
                    >
                      + Adicionar item a esta categoria
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Botões de Ação */}
          <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
            <button
              type="button"
              onClick={onClose}
              disabled={isLoading}
              className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 flex items-center gap-2 transition-colors"
            >
              {isLoading && <Loader2 className="w-4 h-4 animate-spin" />}
              Guardar Modelo
            </button>
          </div>
        </form>

        {/* --------------------------------------------------------------------- */}
        {/* SUB-MODAL DEDICADO: REGISTO / RELATÓRIO FOTOGRÁFICO                   */}
        {/* --------------------------------------------------------------------- */}
        {isPhotoModalOpen && (
          <div className="fixed inset-0 z-60 flex items-center justify-center bg-black/60 backdrop-blur-md p-4">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-3xl overflow-hidden flex flex-col max-h-[90vh]">
              {/* Header do Sub-Modal */}
              <div className="flex items-center justify-between px-6 py-4 bg-gray-900 text-white">
                <div className="flex items-center gap-2">
                  <Camera className="w-5 h-5 text-rose-400" />
                  <div>
                    <h3 className="font-semibold text-base">Relatório Fotográfico de Campo</h3>
                    <p className="text-xs text-gray-400">
                      Adicione fotos e respetivas descrições/legendas (Uploads Ilimitados)
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setIsPhotoModalOpen(false)}
                  className="p-1 hover:bg-gray-800 rounded-lg transition-colors text-gray-400 hover:text-white"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Corpo do Sub-Modal */}
              <div className="p-6 overflow-y-auto space-y-6 flex-1 bg-gray-50">
                {/* Zona de Drop / Upload */}
                <div className="border-2 border-dashed border-gray-300 rounded-xl p-6 text-center hover:border-rose-500 bg-white transition-colors cursor-pointer group">
                  <label htmlFor="photo-upload-input" className="cursor-pointer block space-y-2">
                    <div className="w-12 h-12 bg-rose-50 rounded-full flex items-center justify-center mx-auto text-rose-600 group-hover:scale-110 transition-transform">
                      <Upload className="w-6 h-6" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-gray-700">
                        Clique aqui para carregar fotografias
                      </p>
                      <p className="text-xs text-gray-500">
                        Pode selecionar múltiplas fotos de uma vez (PNG, JPG, JPEG)
                      </p>
                    </div>
                  </label>
                  <input
                    id="photo-upload-input"
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handlePhotoUpload}
                    className="hidden"
                  />
                </div>

                {/* Lista de Fotos (Grid 2 Colunas) */}
                {photos.length === 0 ? (
                  <div className="text-center py-8 text-gray-400 space-y-2">
                    <Image className="w-10 h-10 mx-auto opacity-40" />
                    <p className="text-sm">Nenhuma fotografia adicionada ao relatório ainda.</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {photos.map((photo, index) => (
                      <div
                        key={photo.id}
                        className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden flex flex-col"
                      >
                        {/* Imagem Preview */}
                        <div className="relative h-44 bg-gray-100 flex items-center justify-center overflow-hidden group">
                          <img
                            src={photo.url}
                            alt={`Foto ${index + 1}`}
                            className="w-full h-full object-cover"
                          />
                          <span className="absolute top-2 left-2 bg-black/60 text-white text-[10px] px-2 py-0.5 rounded font-mono">
                            #{index + 1}
                          </span>
                          <button
                            type="button"
                            onClick={() => handleRemovePhoto(photo.id)}
                            className="absolute top-2 right-2 p-1.5 bg-red-600 text-white rounded-lg opacity-90 hover:opacity-100 hover:bg-red-700 transition-all shadow-md"
                            title="Eliminar Foto"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>

                        {/* Campo de Legenda / Descrição por baixo */}
                        <div className="p-3 bg-white border-t border-gray-100 space-y-1">
                          <label className="block text-[11px] font-semibold text-gray-600 uppercase tracking-wider">
                            Descrição / Legenda da Foto
                          </label>
                          <input
                            type="text"
                            placeholder="Ex: Painel da Sala de Bombeiros, Substituição da bateria..."
                            value={photo.caption}
                            onChange={(e) => handleCaptionChange(photo.id, e.target.value)}
                            className="w-full px-2.5 py-1.5 bg-gray-50 border border-gray-300 rounded-md text-xs focus:outline-none focus:ring-2 focus:ring-rose-500 focus:bg-white"
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Rodapé do Sub-Modal */}
              <div className="flex items-center justify-between px-6 py-4 bg-white border-t border-gray-200">
                <span className="text-xs font-semibold text-gray-600">
                  Total de Fotos: <strong className="text-gray-900">{photos.length}</strong>
                </span>

                <div className="flex items-center gap-2">
                  {photos.length > 0 && (
                    <button
                      type="button"
                      onClick={() => setPhotos([])}
                      className="px-3 py-1.5 text-xs text-red-600 hover:bg-red-50 rounded-lg transition-colors font-medium"
                    >
                      Remover Todas
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => setIsPhotoModalOpen(false)}
                    className="px-4 py-2 bg-gray-900 hover:bg-black text-white text-xs font-semibold rounded-lg transition-colors"
                  >
                    Concluir & Voltar
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}