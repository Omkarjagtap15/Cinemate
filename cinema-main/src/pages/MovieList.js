import React, { useEffect, useState } from "react";
import { Card } from "../components";
import { useFetch } from "../hooks/useFetch";

export const MovieList = ({ apiPath }) => {
  const [page, setPage] = useState(1);
  const [movies, setMovies] = useState([]);
  const { data, loading, error } = useFetch(apiPath, "", page);

  useEffect(() => {
    setMovies((prev) => [...prev, ...data]);
  }, [data]);

  useEffect(() => {
    setMovies([]);
    setPage(1);
  }, [apiPath]);

  return (
    <main>
      <section className="max-w-7xl mx-auto py-7">
        <div className="flex justify-start flex-wrap">
          {movies.map((movie) => (
            <Card key={movie.id} movie={movie} />
          ))}
        </div>
        {loading && <p className="text-center w-full">Loading...</p>}
        {!loading && !error && (
          <div className="flex justify-center w-full mt-4">
            <button
              onClick={() => setPage((p) => p + 1)}
              className="px-4 py-2 bg-blue-600 text-white rounded"
            >
              Load More
            </button>
          </div>
        )}
        {error && (
          <p className="text-red-500 text-center w-full">Failed to load.</p>
        )}
      </section>
    </main>
  );
};
