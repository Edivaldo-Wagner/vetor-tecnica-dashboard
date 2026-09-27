import { useState, useEffect } from "react";
import { getPlatformCompanies, createPlatformCompany } from "../services/api";

export function usePlatformCompanies() {
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchCompanies = () => {
    setLoading(true);
    getPlatformCompanies()
      .then((res) => {
        setCompanies(res.data);
        setLoading(false);
      })
      .catch((err) => {
        setError(err);
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchCompanies();
  }, []);

  const addCompany = async (companyData) => {
    const res = await createPlatformCompany(companyData);
    setCompanies((prev) => [res.data, ...prev]);
    return res.data;
  };

  return { companies, loading, error, addCompany, refreshCompanies: fetchCompanies };
}