import React from "react";
import { Link } from "react-router-dom";
import { useTitle } from "../hooks/useTitle";

export const PageNotFound = () => {
  //eslint-disable-next-line
  const pageTitle = useTitle("404 - Page Not Found");

  return (
    <main>
      <section className="min-h-screen flex flex-col items-center justify-center px-4 text-center">
        <div className="mb-8">
          <span className="text-8xl md:text-9xl font-black gradient-text">
            404
          </span>
        </div>
        <h1 className="text-3xl md:text-4xl font-bold text-white mb-4">
          Page Not Found
        </h1>
        <p className="text-gray-400 max-w-md mb-8">
          The page you're looking for doesn't exist or has been moved. Let's get
          you back to browsing movies.
        </p>
        <Link
          to="/"
          className="inline-flex items-center gap-2 px-6 py-3 rounded-lg bg-cinema-600 hover:bg-cinema-500 text-white font-medium transition-all duration-200 shadow-lg shadow-cinema-600/25"
        >
          <svg
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
            />
          </svg>
          Back to Home
        </Link>
      </section>
    </main>
  );
};
