import React from "react";

export const RatingRing = ({ rating, size = 56 }) => {
  const normalizedRating = Math.min(Math.max(rating || 0, 0), 10);
  const percentage = normalizedRating * 10;
  const radius = (size - 6) / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  const getColor = (score) => {
    if (score >= 7) return { stroke: "#10b981", bg: "rgba(16, 185, 129, 0.15)" };
    if (score >= 5) return { stroke: "#f59e0b", bg: "rgba(245, 158, 11, 0.15)" };
    return { stroke: "#f43f5e", bg: "rgba(244, 63, 94, 0.15)" };
  };

  const colors = getColor(normalizedRating);

  return (
    <div
      className="relative inline-flex items-center justify-center"
      style={{ width: size, height: size }}
    >
      <svg width={size} height={size} className="-rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill={colors.bg}
          stroke="rgba(255,255,255,0.08)"
          strokeWidth="3"
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={colors.stroke}
          strokeWidth="3"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          style={{ transition: "stroke-dashoffset 1s ease-out" }}
        />
      </svg>
      <span
        className="absolute text-white font-bold"
        style={{ fontSize: size * 0.28 }}
      >
        {normalizedRating.toFixed(1)}
      </span>
    </div>
  );
};
