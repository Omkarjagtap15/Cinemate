import { createContext, useEffect, useState, useCallback } from "react";

export const FavoritesContext = createContext();

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || "http://localhost:5000/api";

const getUserId = () => {
  let userId = localStorage.getItem("cinemate_user_id");
  if (!userId) {
    userId = `user_${Math.random().toString(36).substring(2, 11)}_${Date.now()}`;
    localStorage.setItem("cinemate_user_id", userId);
  }
  return userId;
};

export const FavoritesProvider = ({ children }) => {
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(true);
  const userId = getUserId();

  const fetchFavorites = useCallback(async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/favorites`, {
        headers: {
          "x-user-id": userId,
        },
      });
      if (response.ok) {
        const json = await response.json();
        setFavorites(json.data || []);
      }
    } catch (err) {
      console.error("Failed to load favorites from backend:", err);
      // Local fallback
      const localStored = localStorage.getItem("favorites");
      if (localStored) setFavorites(JSON.parse(localStored));
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    fetchFavorites();
  }, [fetchFavorites]);

  const toggleFavorite = async (movie) => {
    const isFav = favorites.some((f) => f.id === movie.id);

    // Optimistic UI update
    if (isFav) {
      setFavorites((prev) => prev.filter((f) => f.id !== movie.id));
      try {
        await fetch(`${API_BASE_URL}/favorites/${movie.id}`, {
          method: "DELETE",
          headers: {
            "x-user-id": userId,
          },
        });
      } catch (err) {
        console.error("Failed to delete favorite on server:", err);
      }
    } else {
      setFavorites((prev) => [movie, ...prev]);
      try {
        await fetch(`${API_BASE_URL}/favorites`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "x-user-id": userId,
          },
          body: JSON.stringify(movie),
        });
      } catch (err) {
        console.error("Failed to add favorite on server:", err);
      }
    }
  };

  return (
    <FavoritesContext.Provider value={{ favorites, toggleFavorite, loading }}>
      {children}
    </FavoritesContext.Provider>
  );
};
