import React from "react";
import Backup from "../assets/backup.png";

export const CastCard = ({ person }) => {
  const image = person.profile_path
    ? `https://image.tmdb.org/t/p/w185${person.profile_path}`
    : Backup;

  return (
    <div className="flex-shrink-0 w-32 group cursor-pointer">
      <div className="relative overflow-hidden rounded-xl mb-2">
        <img
          src={image}
          alt={person.name}
          className="w-32 h-44 object-cover transition-transform duration-300 group-hover:scale-110"
          loading="lazy"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      </div>
      <p className="text-sm font-semibold text-white truncate" title={person.name}>
        {person.name}
      </p>
      <p className="text-xs text-gray-400 truncate" title={person.character}>
        {person.character}
      </p>
    </div>
  );
};
