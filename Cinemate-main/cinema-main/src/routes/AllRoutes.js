import { Routes, Route } from "react-router-dom";
import {
  MovieDetail,
  MovieList,
  PageNotFound,
  Search,
  Favorites,
  AISearch,
  Recommendations,
  AdminDashboard,
} from "../pages";

export const AllRoutes = () => {
  return (
    <div className="bg-surface dark:bg-surface min-h-screen">
      <Routes>
        <Route
          path="/"
          element={<MovieList apiPath="movies/now-playing" title="Now Playing" />}
        />
        <Route path="movies/:id" element={<MovieDetail />} />
        <Route
          path="movies/popular"
          element={<MovieList apiPath="movies/popular" title="Popular" />}
        />
        <Route
          path="movies/top"
          element={<MovieList apiPath="movies/top-rated" title="Top Rated" />}
        />
        <Route
          path="movies/trending"
          element={<MovieList apiPath="movies/trending" title="Trending" />}
        />
        <Route
          path="movies/upcoming"
          element={<MovieList apiPath="movies/upcoming" title="Upcoming" />}
        />
        <Route path="recommendations" element={<Recommendations />} />
        <Route path="favorites" element={<Favorites />} />
        <Route path="search" element={<Search apiPath="movies/search" />} />
        <Route path="search/ai" element={<AISearch />} />
        <Route path="admin" element={<AdminDashboard />} />
        <Route path="*" element={<PageNotFound />} />
      </Routes>
    </div>
  );
};
