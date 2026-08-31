import React from "react";

export const SkeletonCard = () => {
  return (
    <div className="w-full animate-fadeIn">
      <div className="skeleton w-full aspect-[2/3] rounded-xl mb-3" />
      <div className="skeleton h-5 w-3/4 mb-2" />
      <div className="skeleton h-4 w-1/2" />
    </div>
  );
};
