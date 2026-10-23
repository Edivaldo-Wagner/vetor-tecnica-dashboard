import { useState, useEffect, useCallback } from "react";
import api, {  
  getInspectionTemplates, 
  createInspectionTemplate, 
  createInspectionCategory, 
  createInspectionItem 
} from "../services/api";

export function useInspectionTemplates() {
  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchTemplates = useCallback(async () => {
    setLoading(true);
    try {
      const res = await getInspectionTemplates();
      setTemplates(res.data);
      setError(null);
    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTemplates();
  }, [fetchTemplates]);

  // Adicionar Novo Modelo Geral (Template)
  const addTemplate = async (templateData, photosList = []) => {
    // 1. Cria o modelo de checklist principal (sem as fotos no payload inicial)
    const payload = {
      name: templateData.name,
      equipment_type: templateData.equipment_type,
      equipment: templateData.equipment || null,
      categories: templateData.categories || []
    };

    const res = await createInspectionTemplate(payload);
    const newTemplateId = res.data.id;

    // 2. Se existirem fotografias anexadas, faz o upload de cada uma vinculada ao novo template
    if (photosList && photosList.length > 0) {
      for (const photo of photosList) {
        const formData = new FormData();
        formData.append("template", newTemplateId); // Vincula ao template_id criado
        formData.append("label", photo.caption || "Foto do Modelo"); // Envia a legenda digitada como 'label'
        
        if (photo.file) {
          formData.append("image", photo.file); // O ficheiro físico real
        }

        await api.post("inspection-photos/", formData, {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        });
      }
    }

    await fetchTemplates(); // Atualiza a lista completa
    return res.data;
  };

  // Adicionar Pergunta / Item com criação dinâmica de Categoria se necessário
  const addItemToTemplate = async ({ templateId, categoryId, newCategoryTitle, label, status = "SIM", observation = "" }) => {
    let finalCategoryId = categoryId;

    if (!finalCategoryId && newCategoryTitle) {
      const catRes = await createInspectionCategory({
        template: templateId,
        title: newCategoryTitle.toUpperCase(),
      });
      finalCategoryId = catRes.data.id;
    }

    if (finalCategoryId) {
      await createInspectionItem({
        category: finalCategoryId,
        label,
        status,
        observation,
      });
    }

    await fetchTemplates();
  };

  return {
    templates,
    loading,
    error,
    addTemplate,
    addItemToTemplate,
    refreshTemplates: fetchTemplates,
  };
}