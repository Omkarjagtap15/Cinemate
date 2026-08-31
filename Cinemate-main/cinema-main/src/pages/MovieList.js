import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Card, SkeletonCard, RatingRing } from "../components";
import { useFetch } from "../hooks/useFetch";
import { useTitle } from "../hooks/useTitle";

export const MovieList = ({ apiPath, title }) => {
  const [page, setPage] = useState(1);
  const [movies, setMovies] = useState([]);
  const { data, loading, error } = useFetch(apiPath, "", page);

  //eslint-disable-next-line
  const pageTitle = useTitle(title);

  useEffect(() => {
    if (data.length > 0) {
      setMovies((prev) => {
        const ids = new Set(prev.map((m) => m.id));
        const newMovies = data.filter((m) => !ids.has(m.id));
        return [...prev, ...newMovies];
      });
    }
  }, [data]);

  useEffect(() => {
    setMovies([]);
    setPage(1);
  }, [apiPath]);

  // Hero movie = first movie with a backdrop
  const heroMovie = movies.find((m) => m.backdrop_path);

  return (
    <main>
      {/* Hero Banner */}
      {heroMovie && !loading && (
        <section className="relative h-[70vh] flex items-end overflow-hidden">
          <img
            src={`https://image.tmdb.org/t/p/original${heroMovie.backdrop_path}`}
            alt={heroMovie.title}
            className="absolute inset-0 w-full h-full object-cover"
          />
          <div className="absolute inset-0 hero-gradient" />
          <div className="absolute inset-0 hero-gradient-side hidden lg:block" />

          <div className="relative z-10 max-w-7xl mx-auto px-4 pb-16 w-full animate-slideUp">
            <div className="max-w-xl">
              <span className="inline-block px-3 py-1 rounded-full text-xs font-medium bg-cinema-500/20 text-cinema-300 border border-cinema-500/30 mb-4">
                {title || "Now Playing"}
              </span>
              <h1 className="text-4xl md:text-5xl font-bold text-white mb-3 leading-tight">
                {heroMovie.title}
              </h1>
              <div className="flex items-center gap-3 mb-4">
                <RatingRing rating={heroMovie.vote_average} size={44} />
                <span className="text-sm text-gray-400">
                  {heroMovie.release_date}
                </span>
              </div>
              <p className="text-gray-300 leading-relaxed mb-6 line-clamp-3">
                {heroMovie.overview}
              </p>
              <Link
                to={`/movies/${heroMovie.id}`}
                className="inline-flex items-center gap-2 px-6 py-3 rounded-lg bg-cinema-600 hover:bg-cinema-500 text-white font-medium transition-all duration-200 shadow-lg shadow-cinema-600/25"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                View Details
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* Movie Grid */}
      <section className="max-w-7xl mx-auto px-4 py-10">
        {!heroMovie && (
          <h2 className="text-3xl font-bold text-white mb-8 pt-20">
            {title || "Now Playing"}
          </h2>
        )}

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-5">
          {movies
            .filter((m) => !heroMovie || m.id !== heroMovie.id)
            .map((movie, i) => (
              <div
                key={movie.id}
                className="animate-fadeIn"
                style={{ animationDelay: `${Math.min(i * 0.05, 0.5)}s` }}
              >
                <Card movie={movie} />
              </div>
            ))}

          {/* Skeleton loaders */}
          {loading &&
            Array.from({ length: page === 1 ? 10 : 5 }).map((_, i) => (
              <SkeletonCard key={`skeleton-${i}`} />
            ))}
        </div>

        {/* Load More */}
        {!loading && !error && (
          <div className="flex justify-center mt-10">
            <button
              onClick={() => setPage((p) => p + 1)}
              className="group flex items-center gap-2 px-8 py-3 rounded-xl bg-gradient-to-r from-cinema-600 to-purple-600 hover:from-cinema-500 hover:to-purple-500 text-white font-medium transition-all duration-300 shadow-lg shadow-cinema-600/20 hover:shadow-cinema-500/30"
            >
              Load More
              <svg
                className="w-4 h-4 transition-transform duration-200 group-hover:translate-y-0.5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M19 9l-7 7-7-7"
                />
              </svg>
            </button>
          </div>
        )}

        {error && (
          <div className="text-center py-16">
            <p className="text-red-400 text-lg">
              Failed to load movies. Please try again.
            </p>
          </div>
        )}
      </section>
    </main>
  );
};
