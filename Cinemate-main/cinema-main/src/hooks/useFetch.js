import { useState, useEffect } from "react";

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || "/api";

export const useFetch = (apiPath, queryTerm = "", page = 1, filters = {}) => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchMovies() {
      setLoading(true);
      const params = new URLSearchParams();
      if (queryTerm) params.append("query", queryTerm);
      if (page) params.append("page", page);
      
      for (const key in filters) {
        if (filters[key]) params.append(key, filters[key]);
      }

      // Normalize path to backend routes
      let endpoint = apiPath;
      if (endpoint.startsWith("/")) endpoint = endpoint.slice(1);
      
      const queryString = params.toString();
      const url = `${API_BASE_URL}/${endpoint}${queryString ? `?${queryString}` : ""}`;

      try {
        const response = await fetch(url);
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const json = await response.json();
        setData(json.results || (json.data ? [json.data] : []));
        setError(null);
      } catch (err) {
        console.error("Failed to fetch data from backend:", err);
        setError(err);
      } finally {
        setLoading(false);
      }
    }

    fetchMovies();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [apiPath, queryTerm, page, JSON.stringify(filters)]);

  return { data, loading, error };
};
