import { useState, useEffect } from "react";
import { getFinancialRecords } from "../services/api";

export function useFinancial() {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    getFinancialRecords()
      .then((res) => {
        setRecords(res.data);
        setLoading(false);
      })
      .catch((err) => {
        setError(err);
        setLoading(false);
      });
  }, []);

  return { records, loading, error };
}
