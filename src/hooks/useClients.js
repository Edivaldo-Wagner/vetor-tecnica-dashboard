import { useState, useEffect } from "react";
import { getClients, createClient } from "../services/api";

export function useClients() {
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchClients = () => {
    setLoading(true);
    getClients()
      .then((res) => {
        setClients(res.data);
        setLoading(false);
      })
      .catch((err) => {
        setError(err);
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchClients();
  }, []);

  const addClient = async (clientData) => {
    const res = await createClient(clientData);
    setClients((prev) => [res.data, ...prev]);
    return res.data;
  };

  return { clients, loading, error, addClient, refreshClients: fetchClients };
}
