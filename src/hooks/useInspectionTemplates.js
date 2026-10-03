import { useState, useEffect, useCallback } from "react";
import { 
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
  const addTemplate = async (templateData) => {
    const res = await createInspectionTemplate(templateData);
    await fetchTemplates(); // Atualiza a lista completa com os novos relacionamentos
    return res.data;
  };

  // Adicionar Pergunta / Item com criação dinâmica de Categoria se necessário
  const addItemToTemplate = async ({ templateId, categoryId, newCategoryTitle, label, responseType }) => {
    let finalCategoryId = categoryId;

    // Se não selecionou uma categoria existente, cria uma nova
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
        response_type: responseType,
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