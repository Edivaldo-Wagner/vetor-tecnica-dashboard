import { useState, useEffect } from "react";
import { getClients, createClient, updateClient, deleteClient } from "../services/api";

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

  const editClient = async (id, clientData) => {
    const res = await updateClient(id, clientData);
    setClients((prev) => prev.map((client) => (client.id === id ? res.data : client)));
    return res.data;
  };

  const removeClient = async (id) => {
    await deleteClient(id);
    setClients((prev) => prev.filter((client) => client.id !== id));
  };

  return { clients, loading, error, addClient, editClient, removeClient, refreshClients: fetchClients };
}