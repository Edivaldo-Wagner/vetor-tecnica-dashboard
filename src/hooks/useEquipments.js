import { useState, useEffect } from "react";
import { getEquipments, createEquipment, updateEquipment, deleteEquipment } from "../services/api";

export function useEquipments() {
  const [equipments, setEquipments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchEquipments = () => {
    setLoading(true);
    getEquipments()
      .then((res) => {
        setEquipments(res.data);
        setLoading(false);
      })
      .catch((err) => {
        setError(err);
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchEquipments();
  }, []);

  const addEquipment = async (equipmentData) => {
    const res = await createEquipment(equipmentData);
    setEquipments((prev) => [res.data, ...prev]);
    return res.data;
  };

  const editEquipment = async (id, equipmentData) => {
    const res = await updateEquipment(id, equipmentData);
    setEquipments((prev) => prev.map((eq) => (eq.id === id ? res.data : eq)));
    return res.data;
  };

  const removeEquipment = async (id) => {
    await deleteEquipment(id);
    setEquipments((prev) => prev.filter((eq) => eq.id !== id));
  };

  return {
    equipments,
    loading,
    error,
    addEquipment,
    editEquipment,
    removeEquipment,
    refreshEquipments: fetchEquipments,
  };
}