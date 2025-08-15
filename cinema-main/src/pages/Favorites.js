import React, { useContext } from "react";
import { FavoritesContext } from "../context/FavoritesContext";
import { Card } from "../components";

export const Favorites = () => {
  const { favorites } = useContext(FavoritesContext);

  return (
    <main>
      <section className="max-w-7xl mx-auto py-7">
        <h2 className="text-3xl mb-4 text-gray-700 dark:text-white">My Favorites</h2>
        {favorites.length === 0 ? (
          <p className="text-gray-600 dark:text-gray-400">No favorites added.</p>
        ) : (
          <div className="flex justify-start flex-wrap">
            {favorites.map((movie) => (
              <Card key={movie.id} movie={movie} />
            ))}
          </div>
        )}
      </section>
    </main>
  );
};
