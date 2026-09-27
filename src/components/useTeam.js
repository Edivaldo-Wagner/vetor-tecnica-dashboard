import { useState, useEffect, useCallback } from "react";

const API_URL = "http://localhost:8000/api/team-members/";

export function useTeam() {
  const [teamMembers, setTeamMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchTeam = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch(API_URL);
      if (!res.ok) throw new Error("Erro ao procurar membros da equipa");
      const data = await res.json();
      setTeamMembers(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTeam();
  }, [fetchTeam]);

  const addMember = async (memberData) => {
    try {
      // Caso não passe nome no formulário, define um valor inicial com base no email
      const payload = {
        ...memberData,
        name: memberData.name || memberData.email.split("@")[0],
      };

      const res = await fetch(API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) throw new Error("Erro ao guardar cadastro");
      const newMember = await res.json();
      setTeamMembers((prev) => [newMember, ...prev]);
      return { success: true };
    } catch (err) {
      return { success: false, error: err.message };
    }
  };

  return { teamMembers, loading, error, addMember, refreshTeam: fetchTeam };
}