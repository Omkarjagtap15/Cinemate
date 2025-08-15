import { useState, useEffect } from "react";

export const useFetch = (apiPath, queryTerm = "", page = 1, filters = {}) => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchMovies() {
      setLoading(true);
      const params = new URLSearchParams({
        api_key: process.env.REACT_APP_API_KEY,
        query: queryTerm,
        page,
      });
      for (const key in filters) {
        if (filters[key]) params.append(key, filters[key]);
      }
      const url = `https://api.themoviedb.org/3/${apiPath}?${params.toString()}`;
      try {
        const response = await fetch(url);
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        setData(data.results);
        setError(null);
      } catch (error) {
        console.error("Failed to fetch data:", error);
        setError(error);
      }
      setLoading(false);
    }

    fetchMovies();
  }, [apiPath, queryTerm, page, filters]);

  return { data, loading, error };
};
