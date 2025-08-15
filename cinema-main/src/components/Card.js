import React, { useContext } from "react";

import { Link } from "react-router-dom";
import Backup from "../assets/backup.png";
import { FavoritesContext } from "../context/FavoritesContext";

export const Card = ({ movie }) => {
  const { id, title, overview, poster_path } = movie;
  const { favorites, toggleFavorite } = useContext(FavoritesContext);
  const isFav = favorites.some((f) => f.id === id);
  const image = poster_path
    ? `https://image.tmdb.org/t/p/w500/${poster_path}`
    : Backup;
  return (
    <div className="max-w-sm bg-white border border-gray-200 rounded-lg shadow dark:bg-gray-800 dark:border-gray-700 m-3 relative">
      <button
        className="absolute top-2 right-2 text-xl"
        onClick={() => toggleFavorite(movie)}
      >
        {isFav ? "★" : "☆"}
      </button>
      <Link to={`/movies/${id}`}>
        <img className="rounded-t-lg" src={image} alt={title} />
      </Link>
      <div className="p-5">
        <Link to={`/movies/${id}`}>
          <h5 className="mb-2 text-2xl font-bold tracking-tight text-gray-900 dark:text-white">
            {title}
          </h5>
        </Link>
        <p className="mb-3 font-normal text-gray-700 dark:text-gray-400">
          {overview}
        </p>
      </div>
    </div>
  );
};
