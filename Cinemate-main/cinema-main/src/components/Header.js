import React from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";

export const Header = () => {
  const [hidden, setHidden] = useState(true);
  const navigate = useNavigate();
  const [darkMode, setDarkMode] = useState(
    JSON.parse(localStorage.getItem("darkMode")) ?? true
  );
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleSubmit = (event) => {
    event.preventDefault();
    const queryTerm = event.target.search.value;
    const year = event.target.year?.value || "";
    const rating = event.target.rating?.value || "";
    const genre = event.target.genre?.value || "";
    event.target.reset();
    const params = new URLSearchParams({ query: queryTerm });
    if (year) params.append("year", year);
    if (rating) params.append("rating", rating);
    if (genre) params.append("genre", genre);
    return navigate(`/search?${params.toString()}`);
  };

  useEffect(() => {
    localStorage.setItem("darkMode", JSON.stringify(darkMode));
    if (darkMode) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [darkMode]);

  const navLinks = [
    { to: "/", label: "Home", end: true },
    { to: "/movies/popular", label: "Popular" },
    { to: "/movies/top", label: "Top Rated" },
    { to: "/movies/trending", label: "Trending" },
    { to: "/movies/upcoming", label: "Upcoming" },
    { to: "/recommendations", label: "🎯 For You" },
    { to: "/favorites", label: "Favorites" },
    { to: "/admin", label: "📊 Metrics" },
  ];

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? "glass shadow-lg shadow-black/20"
          : "bg-transparent"
      }`}
    >
      <nav className="max-w-7xl mx-auto px-4 py-3">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 group">
            <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-cinema-500 to-purple-500 flex items-center justify-center shadow-lg shadow-cinema-500/25">
              <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                <path d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm3 2h6v4H7V5zm8 8v2H5v-2h10zM5 9h2v2H5V9zm10 0h-2v2h2V9z" />
              </svg>
            </div>
            <span className="text-xl font-extrabold tracking-tight gradient-text hidden sm:block">
              Cinemate
            </span>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden lg:flex items-center gap-1">
            {navLinks.map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                end={link.end}
                className={({ isActive }) =>
                  `px-3 py-1.5 rounded-full text-sm font-medium transition-all duration-200 ${
                    isActive
                      ? "bg-cinema-500/20 text-cinema-300 shadow-inner"
                      : "text-gray-400 hover:text-white hover:bg-white/5"
                  }`
                }
              >
                {link.label}
              </NavLink>
            ))}

            {/* AI Search Nav Button */}
            <NavLink
              to="/search/ai"
              className={({ isActive }) =>
                `ml-1 px-3.5 py-1.5 rounded-full text-xs font-semibold flex items-center gap-1.5 transition-all duration-200 border ${
                  isActive
                    ? "bg-gradient-to-r from-cinema-600 to-purple-600 text-white border-cinema-400/50 shadow-lg shadow-cinema-500/20"
                    : "bg-cinema-500/10 text-cinema-300 border-cinema-500/30 hover:bg-cinema-500/20 hover:text-white"
                }`
              }
            >
              <span>✨ Ask AI</span>
            </NavLink>
          </div>

          {/* Search + Actions */}
          <div className="flex items-center gap-2">
            {/* Search Form */}
            <form onSubmit={handleSubmit} className="hidden md:flex items-center gap-2">
              <div className="relative">
                <svg
                  className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                  />
                </svg>
                <input
                  type="text"
                  name="search"
                  placeholder="Search movies..."
                  autoComplete="off"
                  className="w-40 pl-9 pr-3 py-2 text-sm rounded-lg bg-white/5 border border-white/10 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-cinema-500/50 focus:border-cinema-500/50 transition-all duration-200 focus:w-52"
                />
              </div>
            </form>

            {/* AI Search Icon Button for Compact Screens */}
            <Link
              to="/search/ai"
              className="lg:hidden p-2 rounded-lg bg-cinema-500/20 text-cinema-300 hover:text-white border border-cinema-500/30"
              title="Ask Cinemate AI"
            >
              ✨
            </Link>

            {/* Dark Mode Toggle */}
            <button
              onClick={() => setDarkMode(!darkMode)}
              className="p-2 rounded-lg text-gray-400 hover:text-white hover:bg-white/5 transition-all duration-200"
              title="Toggle theme"
            >
              {darkMode ? (
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path
                    d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z"
                    fillRule="evenodd"
                    clipRule="evenodd"
                  />
                </svg>
              ) : (
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z" />
                </svg>
              )}
            </button>

            {/* Mobile Menu Toggle */}
            <button
              onClick={() => setHidden(!hidden)}
              className="lg:hidden p-2 rounded-lg text-gray-400 hover:text-white hover:bg-white/5 transition-all duration-200"
            >
              {hidden ? (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              ) : (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              )}
            </button>
          </div>
        </div>

        {/* Mobile Nav Drawer */}
        {!hidden && (
          <div className="lg:hidden mt-4 pt-4 border-t border-white/10 animate-fadeIn">
            <div className="flex flex-col gap-1 mb-4">
              {navLinks.map((link) => (
                <NavLink
                  key={link.to}
                  to={link.to}
                  end={link.end}
                  onClick={() => setHidden(true)}
                  className={({ isActive }) =>
                    `px-4 py-2.5 rounded-lg text-sm font-medium transition-all ${
                      isActive
                        ? "bg-cinema-500/20 text-cinema-300"
                        : "text-gray-400 hover:text-white hover:bg-white/5"
                    }`
                  }
                >
                  {link.label}
                </NavLink>
              ))}
              <NavLink
                to="/search/ai"
                onClick={() => setHidden(true)}
                className="px-4 py-2.5 rounded-lg text-sm font-semibold bg-cinema-500/20 text-cinema-300 flex items-center gap-2"
              >
                <span>✨ Ask Cinemate (AI Search)</span>
              </NavLink>
            </div>
          </div>
        )}
      </nav>
    </header>
  );
};
