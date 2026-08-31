import React from "react";
import { Link } from "react-router-dom";

export const Footer = () => {
  return (
    <footer className="w-full bg-[#0a0d18] border-t border-indigo-500/15 text-gray-400 mt-auto transition-colors duration-300">
      {/* Top Gradient Accent Line */}
      <div className="h-[2px] w-full bg-gradient-to-r from-transparent via-cinema-500 to-transparent opacity-75" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          {/* Column 1: Brand & Bio */}
          <div className="md:col-span-2 space-y-3">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-cinema-500 via-indigo-600 to-purple-600 flex items-center justify-center shadow-lg shadow-cinema-500/25">
                <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm3 2h6v4H7V5zm8 8v2H5v-2h10zM5 9h2v2H5V9zm10 0h-2v2h2V9z" />
                </svg>
              </div>
              <Link to="/" className="text-2xl font-extrabold tracking-tight gradient-text">
                Cinemate
              </Link>
            </div>
            <p className="text-sm text-gray-400 max-w-md leading-relaxed">
              Your next-generation, AI-powered movie discovery & recommendation platform. Explore movies with semantic vector search, personalized taste ranking, and sub-millisecond Redis caching.
            </p>
            <div className="flex items-center gap-3 pt-2">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                AI Search Online
              </span>
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-indigo-500/10 text-indigo-300 border border-indigo-500/20">
                ⚡ Redis Cached
              </span>
            </div>
          </div>

          {/* Column 2: Navigation Links */}
          <div className="space-y-3">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-gray-300">
              Discover
            </h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link to="/" className="hover:text-cinema-400 transition-colors">
                  Home
                </Link>
              </li>
              <li>
                <Link to="/movies/trending" className="hover:text-cinema-400 transition-colors">
                  Trending Movies
                </Link>
              </li>
              <li>
                <Link to="/movies/top" className="hover:text-cinema-400 transition-colors">
                  Top Rated
                </Link>
              </li>
              <li>
                <Link to="/recommendations" className="hover:text-cinema-400 transition-colors flex items-center gap-1.5">
                  <span>🎯 For You</span>
                </Link>
              </li>
              <li>
                <Link to="/search/ai" className="hover:text-cinema-400 transition-colors text-cinema-400 flex items-center gap-1">
                  <span>✨ Ask AI Search</span>
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 3: Platform & Observability */}
          <div className="space-y-3">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-gray-300">
              Platform
            </h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link to="/favorites" className="hover:text-cinema-400 transition-colors">
                  My Favorites
                </Link>
              </li>
              <li>
                <Link to="/admin" className="hover:text-cinema-400 transition-colors flex items-center gap-1.5 text-indigo-400">
                  <span>📊 Metrics Dashboard</span>
                </Link>
              </li>
              <li>
                <a
                  href="https://github.com/Omkarjagtap15"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-cinema-400 transition-colors flex items-center gap-1"
                >
                  <span>GitHub Repository</span>
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar: Copyright & Attribution */}
        <div className="pt-6 border-t border-white/5 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-gray-500">
          <p>© {new Date().getFullYear()} Cinemate. All rights reserved.</p>

          <p className="text-center sm:text-right">
            Powered by{" "}
            <a
              href="https://www.themoviedb.org"
              target="_blank"
              rel="noopener noreferrer"
              className="text-gray-400 hover:text-cinema-400 transition-colors font-medium"
            >
              TMDB API
            </a>{" "}
            • Built with React, Node.js & PostgreSQL pgvector.
          </p>
        </div>
      </div>
    </footer>
  );
};
