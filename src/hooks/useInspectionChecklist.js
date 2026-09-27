import { useState, useEffect } from "react";
import api from "../services/api";

export function useInspectionChecklist() {
  const [categories, setCategories] = useState([]);
  const [photos, setPhotos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchCategories = async () => {
    try {
      const res = await api.get("inspection-categories/");
      setCategories(res.data);
    } catch (err) {
      setError(err);
    }
  };

  const fetchPhotos = async () => {
    try {
      const res = await api.get("inspection-photos/");
      setPhotos(res.data);
    } catch (err) {
      console.error("Erro ao carregar fotos:", err);
    }
  };

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      await Promise.all([fetchCategories(), fetchPhotos()]);
      setLoading(false);
    };
    loadData();
  }, []);

  const addCategory = async (name, itemsText) => {
    await api.post("inspection-categories/", { name, items_text: itemsText });
    fetchCategories();
  };

  const toggleItem = async (itemId, currentStatus) => {
    const nextStatus = !currentStatus;

    setCategories((prevCategories) =>
      prevCategories.map((cat) => ({
        ...cat,
        items: (cat.items || []).map((item) =>
          item.id === itemId ? { ...item, is_completed: nextStatus } : item
        ),
      }))
    );

    try {
      await api.patch(`inspection-items/${itemId}/`, { is_completed: nextStatus });
    } catch (err) {
      fetchCategories();
    }
  };

  const uploadPhoto = async (serviceOrderId, label, imageFile) => {
    const formData = new FormData();
    if (serviceOrderId) {
      formData.append("service_order", serviceOrderId);
    }
    formData.append("label", label);
    formData.append("image", imageFile);

    try {
      const response = await api.post("inspection-photos/", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setPhotos((prev) => [...prev, response.data]);
    } catch (err) {
      console.error("Erro ao carregar imagem:", err);
    }
  };

  return {
    categories,
    photos,
    loading,
    error,
    addCategory,
    toggleItem,
    uploadPhoto,
    fetchCategories,
  };
}