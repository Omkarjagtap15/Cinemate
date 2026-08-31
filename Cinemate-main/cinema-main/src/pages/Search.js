import React from "react";
import { Card, SkeletonCard } from "../components";
import { useFetch } from "../hooks/useFetch";
import { useSearchParams } from "react-router-dom";
import { useTitle } from "../hooks/useTitle";

export const Search = ({ apiPath }) => {
  const [searchParams] = useSearchParams();
  const queryTerm = searchParams.get("query");
  const year = searchParams.get("year") || "";
  const rating = searchParams.get("rating") || "";
  const genre = searchParams.get("genre") || "";

  //eslint-disable-next-line
  const pageTitle = useTitle(`Search: ${queryTerm}`);

  const {
    data: movies,
    loading,
    error,
  } = useFetch(apiPath, queryTerm, 1, {
    year,
    "vote_average.gte": rating,
    with_genres: genre,
  });

  return (
    <main>
      <section className="max-w-7xl mx-auto px-4 py-10 pt-24">
        <h2 className="text-3xl font-bold text-white mb-2">
          {loading
            ? "Searching..."
            : movies.length === 0
            ? `No results for "${queryTerm}"`
            : `Results for "${queryTerm}"`}
        </h2>
        {!loading && movies.length > 0 && (
          <p className="text-gray-500 mb-8">
            {movies.length} movie{movies.length !== 1 ? "s" : ""} found
          </p>
        )}

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-5 mt-6">
          {loading
            ? Array.from({ length: 10 }).map((_, i) => (
                <SkeletonCard key={`skeleton-${i}`} />
              ))
            : movies.map((movie, i) => (
                <div
                  key={movie.id}
                  className="animate-fadeIn"
                  style={{ animationDelay: `${i * 0.05}s` }}
                >
                  <Card movie={movie} />
                </div>
              ))}
        </div>

        {error && (
          <div className="text-center py-16">
            <p className="text-red-400 text-lg">
              Failed to load results. Please try again.
            </p>
          </div>
        )}

        {!loading && movies.length === 0 && !error && (
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
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
            </div>
            <p className="text-gray-500 max-w-sm">
              Try a different search term or adjust your filters.
            </p>
          </div>
        )}
      </section>
    </main>
  );
};
