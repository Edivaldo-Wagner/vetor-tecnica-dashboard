import { useState, useEffect } from "react";
import { getEquipments, createEquipment } from "../services/api";

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

  return {
    equipments,
    loading,
    error,
    addEquipment,
    refreshEquipments: fetchEquipments,
  };
}