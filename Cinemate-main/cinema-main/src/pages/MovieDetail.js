import { useState, useEffect, useCallback } from "react";
import { useParams } from "react-router-dom";
import { useTitle } from "../hooks/useTitle";
import { CastCard, RatingRing, TrailerModal, Card } from "../components";
import Backup from "../assets/backup.png";

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || "http://localhost:5000/api";

export const MovieDetail = () => {
  const { id } = useParams();
  const [movie, setMovie] = useState({});
  const [cast, setCast] = useState([]);
  const [trailerKey, setTrailerKey] = useState(null);
  const [recommendations, setRecommendations] = useState([]);
  const [showTrailer, setShowTrailer] = useState(false);
  const [loading, setLoading] = useState(true);

  //eslint-disable-next-line
  const pageTitle = useTitle(movie.title || "Movie Details");

  const fetchAllData = useCallback(async () => {
    setLoading(true);
    try {
      const [movieRes, creditsRes, videosRes, recsRes] = await Promise.all([
        fetch(`${API_BASE_URL}/movies/${id}`),
        fetch(`${API_BASE_URL}/movies/${id}/credits`),
        fetch(`${API_BASE_URL}/movies/${id}/videos`),
        fetch(`${API_BASE_URL}/movies/${id}/recommendations`),
      ]);

      const movieJson = await movieRes.json();
      const creditsJson = await creditsRes.json();
      const videosJson = await videosRes.json();
      const recsJson = await recsRes.json();

      setMovie(movieJson.data || movieJson);
      setCast(creditsJson.cast?.slice(0, 20) || []);

      const trailer = videosJson.results?.find(
        (v) => v.type === "Trailer" && v.site === "YouTube"
      );
      setTrailerKey(trailer?.key || null);

      setRecommendations(recsJson.results?.slice(0, 12) || []);
    } catch (err) {
      console.error("Failed to fetch movie data from backend:", err);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchAllData();
    window.scrollTo(0, 0);
  }, [fetchAllData]);

  const formatCurrency = (amount) => {
    if (!amount) return "N/A";
    if (amount >= 1e9) return `$${(amount / 1e9).toFixed(1)}B`;
    if (amount >= 1e6) return `$${(amount / 1e6).toFixed(0)}M`;
    return `$${amount.toLocaleString()}`;
  };

  const formatRuntime = (mins) => {
    if (!mins) return "N/A";
    const h = Math.floor(mins / 60);
    const m = mins % 60;
    return h > 0 ? `${h}h ${m}m` : `${m}m`;
  };

  const backdrop = movie.backdrop_path
    ? `https://image.tmdb.org/t/p/original${movie.backdrop_path}`
    : null;

  const poster = movie.poster_path
    ? `https://image.tmdb.org/t/p/w500${movie.poster_path}`
    : Backup;

  if (loading) {
    return (
      <main className="pt-20">
        <div className="max-w-7xl mx-auto px-4 py-12">
          <div className="flex flex-col md:flex-row gap-8">
            <div className="skeleton w-72 h-[430px] rounded-xl flex-shrink-0" />
            <div className="flex-1 space-y-4">
              <div className="skeleton h-10 w-3/4" />
              <div className="skeleton h-5 w-1/2" />
              <div className="skeleton h-32 w-full" />
              <div className="flex gap-3">
                <div className="skeleton h-8 w-20" />
                <div className="skeleton h-8 w-20" />
                <div className="skeleton h-8 w-20" />
              </div>
            </div>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main>
      {/* Hero Backdrop */}
      <section className="relative min-h-[85vh] flex items-end">
        {backdrop && (
          <img
            src={backdrop}
            alt=""
            className="absolute inset-0 w-full h-full object-cover"
          />
        )}
        <div className="absolute inset-0 hero-gradient" />
        <div className="absolute inset-0 hero-gradient-side hidden lg:block" />

        <div className="relative z-10 max-w-7xl mx-auto px-4 pb-12 pt-32 w-full">
          <div className="flex flex-col md:flex-row gap-8 items-end md:items-end">
            {/* Poster */}
            <div className="flex-shrink-0 hidden md:block">
              <img
                src={poster}
                alt={movie.title}
                className="w-64 rounded-xl shadow-2xl shadow-black/50 border border-white/10"
              />
            </div>

            {/* Info */}
            <div className="flex-1 animate-slideUp">
              <h1 className="text-4xl md:text-5xl font-bold text-white mb-2 leading-tight">
                {movie.title}
              </h1>

              {movie.tagline && (
                <p className="text-lg text-gray-400 italic mb-4">
                  "{movie.tagline}"
                </p>
              )}

              {/* Meta Row */}
              <div className="flex flex-wrap items-center gap-4 mb-5">
                <RatingRing rating={movie.vote_average} size={52} />
                <div className="text-sm text-gray-400">
                  <span className="text-white font-medium">
                    {movie.vote_count?.toLocaleString()}
                  </span>{" "}
                  reviews
                </div>
                <span className="w-1 h-1 bg-gray-600 rounded-full" />
                <span className="text-sm text-gray-300">
                  {formatRuntime(movie.runtime)}
                </span>
                <span className="w-1 h-1 bg-gray-600 rounded-full" />
                <span className="text-sm text-gray-300">
                  {movie.release_date}
                </span>
              </div>

              {/* Genres */}
              {movie.genres && (
                <div className="flex flex-wrap gap-2 mb-5">
                  {movie.genres.map((genre) => (
                    <span
                      key={genre.id}
                      className="px-3 py-1 text-xs font-medium rounded-full bg-white/10 text-gray-300 border border-white/10"
                    >
                      {genre.name}
                    </span>
                  ))}
                </div>
              )}

              {/* Overview */}
              <p className="text-gray-300 leading-relaxed mb-6 max-w-2xl">
                {movie.overview}
              </p>

              {/* Action Buttons */}
              <div className="flex flex-wrap gap-3">
                {trailerKey && (
                  <button
                    onClick={() => setShowTrailer(true)}
                    className="flex items-center gap-2 px-6 py-3 rounded-lg bg-cinema-600 hover:bg-cinema-500 text-white font-medium transition-all duration-200 play-btn-pulse"
                  >
                    <svg
                      className="w-5 h-5"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z"
                        clipRule="evenodd"
                      />
                    </svg>
                    Watch Trailer
                  </button>
                )}
                {movie.imdb_id && (
                  <a
                    href={`https://www.imdb.com/title/${movie.imdb_id}`}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center gap-2 px-6 py-3 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 text-amber-400 font-medium border border-amber-500/30 transition-all duration-200"
                  >
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M14.31 9.588v.005c-.077-.048-.227-.07-.42-.07v4.815c.27 0 .44-.06.5-.165.062-.104.095-.405.095-.904v-2.19c0-.42-.008-.67-.023-.756-.016-.085-.068-.16-.152-.222v-.513zm-3.71-.04h-.69v4.89h.69c.295 0 .495-.06.6-.18.107-.12.16-.395.16-.825V10.39c0-.42-.053-.695-.16-.825-.105-.13-.305-.195-.6-.195v.188zm9.4-5.548v16h-16v-16h16zm-11.17 3.89H7.21v7.22h1.26v-7.22h1.36V7.89H9.83zm3.29 2.08c0-.645-.075-1.11-.225-1.39-.15-.28-.435-.42-.855-.42-.32 0-.585.09-.795.27v-2.54H9.3v7.22h.945l.105-.42c.21.32.48.48.81.48.35 0 .6-.12.75-.36.15-.24.225-.66.225-1.26v-1.58zm3.475-.18c0-.605-.045-1.025-.135-1.26-.09-.236-.285-.445-.585-.63-.3-.184-.645-.276-1.035-.276H12.78v7.22h1.62c.41 0 .735-.08.975-.24.24-.16.39-.37.45-.63.06-.26.09-.645.09-1.155V9.79zm3.28-.31c0-.52-.09-.886-.27-1.098-.18-.21-.465-.315-.855-.315-.33 0-.615.105-.855.315-.18.212-.27.577-.27 1.097v2.91c0 .505.09.862.27 1.072.24.21.525.315.855.315.39 0 .675-.105.855-.315.18-.21.27-.567.27-1.072V9.48z" />
                    </svg>
                    IMDB
                  </a>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Bar */}
      <section className="border-y border-white/5 bg-surface-light/50">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div>
              <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">
                Budget
              </p>
              <p className="text-xl font-bold text-white">
                {formatCurrency(movie.budget)}
              </p>
            </div>
            <div>
              <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">
                Revenue
              </p>
              <p className="text-xl font-bold text-accent-emerald">
                {formatCurrency(movie.revenue)}
              </p>
            </div>
            <div>
              <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">
                Runtime
              </p>
              <p className="text-xl font-bold text-white">
                {formatRuntime(movie.runtime)}
              </p>
            </div>
            <div>
              <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">
                Status
              </p>
              <p className="text-xl font-bold text-white">
                {movie.status || "N/A"}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Production Companies */}
      {movie.production_companies?.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 py-8">
          <div className="flex flex-wrap items-center gap-6">
            <span className="text-xs text-gray-500 uppercase tracking-wider">
              Production
            </span>
            {movie.production_companies.map((company) => (
              <span
                key={company.id}
                className="text-sm text-gray-400"
              >
                {company.logo_path ? (
                  <img
                    src={`https://image.tmdb.org/t/p/w92${company.logo_path}`}
                    alt={company.name}
                    className="h-6 object-contain brightness-0 invert opacity-50 hover:opacity-100 transition-opacity"
                    title={company.name}
                  />
                ) : (
                  company.name
                )}
              </span>
            ))}
          </div>
        </section>
      )}

      {/* Cast Section */}
      {cast.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 py-8">
          <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
            <svg
              className="w-6 h-6 text-cinema-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
              />
            </svg>
            Top Cast
          </h2>
          <div className="scroll-container flex gap-4 pb-4">
            {cast.map((person) => (
              <CastCard key={person.credit_id} person={person} />
            ))}
          </div>
        </section>
      )}

      {/* Recommendations */}
      {recommendations.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 py-8 pb-16">
          <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
            <svg
              className="w-6 h-6 text-cinema-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M7 4V2m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-2 4h.01M7 16a2 2 0 100 4m0-4a2 2 0 110 4m10-4a2 2 0 100 4m0-4a2 2 0 110 4M5 14h14a2 2 0 012 2v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4a2 2 0 012-2z"
              />
            </svg>
            You May Also Like
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {recommendations.map((movie) => (
              <Card key={movie.id} movie={movie} />
            ))}
          </div>
        </section>
      )}

      {/* Trailer Modal */}
      {showTrailer && trailerKey && (
        <TrailerModal
          videoKey={trailerKey}
          onClose={() => setShowTrailer(false)}
        />
      )}
    </main>
  );
};
