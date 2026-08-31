import React, { useState, useEffect } from "react";
import { Card, SkeletonCard } from "../components";
import { useTitle } from "../hooks/useTitle";

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || "http://localhost:5000/api";

export const Recommendations = () => {
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  //eslint-disable-next-line
  const pageTitle = useTitle("Recommended For You / Cinemate");

  useEffect(() => {
    async function fetchRecs() {
      setLoading(true);
      const userId = localStorage.getItem("cinemate_user_id") || "guest_user";

      try {
        const response = await fetch(`${API_BASE_URL}/recommendations?limit=18`, {
          headers: {
            "x-user-id": userId,
          },
        });
        if (!response.ok) throw new Error(`HTTP error ${response.status}`);
        const json = await response.json();
        setRecommendations(json.data || []);
      } catch (err) {
        console.error("Failed to load recommendations:", err);
        setError("Recommendations are temporarily unavailable.");
      } finally {
        setLoading(false);
      }
    }

    fetchRecs();
  }, []);

  return (
    <main>
      <section className="max-w-7xl mx-auto px-4 py-10 pt-24">
        <div className="mb-8">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-accent-violet/20 border border-accent-violet/30 text-purple-300 text-xs font-semibold mb-3">
            <span>⚡ Hybrid Recommendation Engine</span>
          </div>
          <h1 className="text-3xl md:text-4xl font-extrabold text-white mb-2">
            Recommended <span className="gradient-text">For You</span>
          </h1>
          <p className="text-gray-400 max-w-2xl">
            Tailored suggestions driven by your favorited titles, genre affinity,
            vector semantic matching, and community quality ratings.
          </p>
        </div>

        {loading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-5">
            {Array.from({ length: 12 }).map((_, i) => (
              <SkeletonCard key={i} />
            ))}
          </div>
        ) : error ? (
          <div className="text-center py-16">
            <p className="text-red-400">{error}</p>
          </div>
        ) : recommendations.length === 0 ? (
          <div className="text-center py-20 text-gray-500">
            No recommendations generated yet. Favorite some movies to personalize
            your feed!
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-5">
            {recommendations.map((movie, i) => (
              <div
                key={movie.id}
                className="animate-fadeIn"
                style={{ animationDelay: `${i * 0.04}s` }}
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
