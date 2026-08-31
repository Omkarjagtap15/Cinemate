import React, { useContext } from "react";
import { FavoritesContext } from "../context/FavoritesContext";
import { Card } from "../components";
import { useTitle } from "../hooks/useTitle";

export const Favorites = () => {
  const { favorites } = useContext(FavoritesContext);

  //eslint-disable-next-line
  const pageTitle = useTitle("Favorites");

  return (
    <main>
      <section className="max-w-7xl mx-auto px-4 py-10 pt-24">
        <h2 className="text-3xl font-bold text-white mb-2">My Favorites</h2>
        <p className="text-gray-500 mb-8">
          {favorites.length} movie{favorites.length !== 1 ? "s" : ""} saved
        </p>

        {favorites.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="w-20 h-20 rounded-full bg-white/5 flex items-center justify-center mb-6">
              <svg
                className="w-10 h-10 text-gray-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="1.5"
                  d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-gray-300 mb-2">
              No favorites yet
            </h3>
            <p className="text-gray-500 max-w-sm">
              Start exploring movies and tap the heart icon to save your
              favorites here.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-5">
            {favorites.map((movie, i) => (
              <div
                key={movie.id}
                className="animate-fadeIn"
                style={{ animationDelay: `${i * 0.05}s` }}
              >
                <Card movie={movie} />
              </div>
            ))}
          </div>
        )}
      </section>
    </main>
  );
};
