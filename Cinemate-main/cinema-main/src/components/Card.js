import React, { useContext, useState } from "react";
import { Link } from "react-router-dom";
import Backup from "../assets/backup.png";
import { FavoritesContext } from "../context/FavoritesContext";
import { RatingRing } from "./RatingRing";

export const Card = ({ movie }) => {
  const {
    id,
    title,
    poster_path,
    vote_average,
    release_date,
    recommendationReason,
    matchPercentage,
    similarityScore,
  } = movie;
  const { favorites, toggleFavorite } = useContext(FavoritesContext);
  const isFav = favorites.some((f) => f.id === id);
  const [justToggled, setJustToggled] = useState(false);

  const image = poster_path
    ? `https://image.tmdb.org/t/p/w500/${poster_path}`
    : Backup;

  const year = release_date ? new Date(release_date).getFullYear() : "";

  const handleFav = (e) => {
    e.preventDefault();
    e.stopPropagation();
    toggleFavorite(movie);
    setJustToggled(true);
    setTimeout(() => setJustToggled(false), 300);
  };

  return (
    <Link to={`/movies/${id}`} className="block group">
      <div className="relative rounded-xl overflow-hidden bg-surface-card card-hover flex flex-col h-full">
        {/* Poster */}
        <div className="relative aspect-[2/3] overflow-hidden">
          <img
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
            src={image}
            alt={title}
            loading="lazy"
          />

          {/* Gradient Overlay on hover */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

          {/* Match Score Badge (AI / Recs) */}
          {(matchPercentage || similarityScore) && (
            <div className="absolute top-3 left-3 px-2 py-1 rounded-md bg-cinema-600/90 backdrop-blur-md text-[11px] font-bold text-white shadow-lg flex items-center gap-1">
              <svg className="w-3 h-3 text-accent-amber" fill="currentColor" viewBox="0 0 20 20">
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
              {matchPercentage ? `${matchPercentage}% Match` : `${Math.round(similarityScore * 100)}% Sim`}
            </div>
          )}

          {/* Rating Badge (on hover if no match badge) */}
          {!matchPercentage && !similarityScore && (
            <div className="absolute top-3 left-3 opacity-0 group-hover:opacity-100 transition-all duration-300 transform -translate-y-2 group-hover:translate-y-0">
              <RatingRing rating={vote_average} size={42} />
            </div>
          )}

          {/* Favorite Button */}
          <button
            onClick={handleFav}
            className={`absolute top-3 right-3 w-9 h-9 rounded-full flex items-center justify-center transition-all duration-200 ${
              isFav
                ? "bg-rose-500/90 text-white shadow-lg shadow-rose-500/30"
                : "bg-black/40 text-white/70 hover:bg-black/60 hover:text-white backdrop-blur-sm"
            } ${justToggled ? "animate-pulseHeart" : ""}`}
            title={isFav ? "Remove from favorites" : "Add to favorites"}
          >
            {isFav ? (
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z"
                  clipRule="evenodd"
                />
              </svg>
            ) : (
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                />
              </svg>
            )}
          </button>

          {/* Year Badge */}
          {year && (
            <div className="absolute bottom-3 right-3 px-2 py-1 rounded-md bg-black/50 backdrop-blur-sm text-xs font-medium text-white/80 opacity-0 group-hover:opacity-100 transition-all duration-300">
              {year}
            </div>
          )}
        </div>

        {/* Info & Reason */}
        <div className="p-3 flex-1 flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-semibold text-white truncate group-hover:text-cinema-300 transition-colors duration-200">
              {title}
            </h3>
            {year && <p className="text-xs text-gray-500 mt-0.5">{year}</p>}
          </div>

          {/* Explainable Recommendation Reason (Phase 10) */}
          {recommendationReason && (
            <div className="mt-2 pt-2 border-t border-white/5 flex items-center gap-1.5">
              <span className="text-xs text-cinema-400">✨</span>
              <p className="text-[11px] text-gray-400 truncate italic">
                {recommendationReason}
              </p>
            </div>
          )}
        </div>
      </div>
    </Link>
  );
};
