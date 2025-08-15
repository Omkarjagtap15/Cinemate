import React from "react";
import { Card } from "../components";
import { useFetch } from "../hooks/useFetch";
import { useSearchParams } from "react-router-dom";

export const Search = ({ apiPath }) => {
  const [searchParams] = useSearchParams();
  const queryTerm = searchParams.get("query");
  const year = searchParams.get("year") || "";
  const rating = searchParams.get("rating") || "";
  const genre = searchParams.get("genre") || "";

  const { data: movies, loading, error } = useFetch(apiPath, queryTerm, 1, {
    year,
    "vote_average.gte": rating,
    with_genres: genre,
  });

  return (
    <main>
      <section className="py-7">
        <p className="text-3xl text-gray-700 dark:text-white">
          {movies.length === 0 && !loading
            ? `No result found for '${queryTerm}'`
            : `Result for '${queryTerm}'`}
        </p>
      </section>
      <section className="max-w-7xl mx-auto py-7">
        <div className="flex justify-start flex-wrap">
          {movies.map((movie) => {
            return <Card key={movie.id} movie={movie} />;
          })}
        </div>
        {loading && <p className="text-center w-full">Loading...</p>}
        {error && (
          <p className="text-red-500 text-center w-full">Failed to load.</p>
        )}
      </section>
    </main>
  );
};
