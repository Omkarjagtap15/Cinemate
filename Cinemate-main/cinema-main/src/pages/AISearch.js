import React, { useState } from "react";
import { Card, SkeletonCard } from "../components";
import { useTitle } from "../hooks/useTitle";

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || "/api";

const PRESET_QUERIES = [
  "Mind-bending psychological thrillers with unexpected plot twists",
  "Deep space exploration and emotional human connection",
  "Inspiring true stories of underdog triumphs",
  "Cyberpunk dystopian futures with neon aesthetics",
  "Heartwarming animation for a cozy weekend",
];

export const AISearch = () => {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const [error, setError] = useState(null);

  //eslint-disable-next-line
  const pageTitle = useTitle("Ask Cinemate / AI Search");

  const handleSearch = async (searchTerm) => {
    const term = searchTerm || query;
    if (!term || term.trim() === "") return;

    setLoading(true);
    setSearched(true);
    setError(null);

    try {
      const response = await fetch(
        `${API_BASE_URL}/search/semantic?q=${encodeURIComponent(term)}&limit=15`
      );
      if (!response.ok) {
        throw new Error(`HTTP error ${response.status}`);
      }
      const data = await response.json();
      setResults(data.results || []);
    } catch (err) {
      console.error("Semantic search failed:", err);
      setError("AI search temporarily unavailable. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const onSubmit = (e) => {
    e.preventDefault();
    handleSearch(query);
  };

  return (
    <main>
      <section className="max-w-7xl mx-auto px-4 py-10 pt-24">
        {/* Header Hero */}
        <div className="text-center max-w-3xl mx-auto mb-10">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-cinema-500/20 border border-cinema-500/30 text-cinema-300 text-xs font-semibold mb-4">
            <span>✨ AI Semantic Search</span>
            <span className="w-1.5 h-1.5 rounded-full bg-cinema-400 animate-pulse" />
          </div>
          <h1 className="text-4xl md:text-5xl font-extrabold text-white mb-4 tracking-tight">
            Ask <span className="gradient-text">Cinemate AI</span>
          </h1>
          <p className="text-gray-400 text-base md:text-lg">
            Describe the mood, theme, plot, or atmosphere you're looking for in
            plain English.
          </p>

          {/* Search Input */}
          <form onSubmit={onSubmit} className="mt-8 relative">
            <div className="relative flex items-center">
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="e.g. Dark psychological thriller with a shocking ending..."
                className="w-full pl-6 pr-32 py-4 rounded-2xl bg-surface-card/90 border border-cinema-500/30 text-white placeholder-gray-500 text-base md:text-lg focus:outline-none focus:ring-4 focus:ring-cinema-500/20 focus:border-cinema-500 shadow-2xl backdrop-blur-xl transition-all"
              />
              <button
                type="submit"
                disabled={loading}
                className="absolute right-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-cinema-600 to-purple-600 hover:from-cinema-500 hover:to-purple-500 text-white font-medium text-sm transition-all shadow-lg shadow-cinema-600/30 flex items-center gap-2"
              >
                {loading ? (
                  <>
                    <svg
                      className="animate-spin h-4 w-4 text-white"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      />
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8v8H4z"
                      />
                    </svg>
                    Thinking...
                  </>
                ) : (
                  <>
                    <span>Search</span>
                    <svg
                      className="w-4 h-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M13 5l7 7-7 7M5 5l7 7-7 7"
                      />
                    </svg>
                  </>
                )}
              </button>
            </div>
          </form>

          {/* Quick Preset Ideas */}
          <div className="mt-4 flex flex-wrap justify-center gap-2">
            {PRESET_QUERIES.map((preset, idx) => (
              <button
                key={idx}
                onClick={() => {
                  setQuery(preset);
                  handleSearch(preset);
                }}
                className="px-3 py-1 text-xs rounded-full bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white border border-white/5 transition-colors text-left"
              >
                💡 {preset}
              </button>
            ))}
          </div>
        </div>

        {/* Results Section */}
        {searched && (
          <div className="mt-12">
            <h2 className="text-2xl font-bold text-white mb-6 flex items-center justify-between">
              <span>
                AI Semantic Matches{" "}
                <span className="text-sm font-normal text-gray-500">
                  ({results.length} movies ranked by vector similarity)
                </span>
              </span>
            </h2>

            {loading ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-5">
                {Array.from({ length: 10 }).map((_, i) => (
                  <SkeletonCard key={i} />
                ))}
              </div>
            ) : error ? (
              <div className="text-center py-16">
                <p className="text-red-400">{error}</p>
              </div>
            ) : results.length === 0 ? (
              <div className="text-center py-16 text-gray-500">
                No matching movies found. Try expanding your prompt.
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-5">
                {results.map((movie, i) => (
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
          </div>
        )}
      </section>
    </main>
  );
};
