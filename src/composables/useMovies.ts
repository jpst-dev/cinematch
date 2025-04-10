import axios from "axios";

const API_KEY = import.meta.env.VITE_TMDB_API_KEY;
const BASE_URL = "https://api.themoviedb.org/3";

export function useMovies() {
  const getPopularMovies = async (page: number = 1) => {
    const res = await axios.get(`${BASE_URL}/movie/popular`, {
      params: { api_key: API_KEY, language: "pt-BR", page },
    });
    return res.data.results;
  };

  const getTopRatedMovies = async (page: number = 1) => {
    const res = await axios.get(`${BASE_URL}/movie/top_rated`, {
      params: { api_key: API_KEY, language: "pt-BR", page },
    });
    return res.data.results;
  };

  const searchMovies = async (query: string, page: number = 1) => {
    const res = await axios.get(`${BASE_URL}/search/movie`, {
      params: { api_key: API_KEY, query, language: "pt-BR", page },
    });
    return res.data.results;
  };

  const getMovieDetails = async (id: string) => {
    const res = await axios.get(`${BASE_URL}/movie/${id}`, {
      params: { api_key: API_KEY, language: "pt-BR" },
    });
    return res.data;
  };

  const getMoviesByVoteAverage = async (
    minRating: number,
    page: number = 1
  ) => {
    const res = await axios.get(`${BASE_URL}/discover/movie`, {
      params: {
        api_key: API_KEY,
        language: "pt-BR",
        sort_by: "vote_average.desc",
        "vote_count.gte": 100, // evita notas infladas com poucos votos
        "vote_average.gte": minRating,
        page,
      },
    });
    return res.data.results;
  };

  const getMoviesByGenre = async (genreId: number, page: number = 1) => {
    const res = await axios.get(`${BASE_URL}/discover/movie`, {
      params: {
        api_key: API_KEY,
        language: "pt-BR",
        with_genres: genreId,
        sort_by: "popularity.desc",
        page,
      },
    });
    return res.data.results;
  };

  const getMoviesByYear = async (year: number, page: number = 1) => {
    const res = await axios.get(`${BASE_URL}/discover/movie`, {
      params: {
        api_key: API_KEY,
        language: "pt-BR",
        primary_release_year: year,
        sort_by: "popularity.desc",
        page,
      },
    });
    return res.data.results;
  };

  const getTopRatedByGenre = async (genreId: number, page: number = 1) => {
    const res = await axios.get(`${BASE_URL}/discover/movie`, {
      params: {
        api_key: API_KEY,
        language: "pt-BR",
        with_genres: genreId,
        sort_by: "vote_average.desc",
        "vote_count.gte": 100,
        page,
      },
    });
    return res.data.results;
  };

  const getMoviesWithFilters = async ({
    genreId = "",
    sortBy = "vote_average.desc",
    page = 1,
  }: {
    genreId?: string;
    sortBy?: string;
    page?: number;
  }) => {
    const res = await axios.get(`${BASE_URL}/discover/movie`, {
      params: {
        api_key: API_KEY,
        language: "pt-BR",
        sort_by: sortBy,
        with_genres: genreId || undefined,
        "vote_count.gte": 100,
        page,
      },
    });
    return res.data.results;
  };

  return {
    getPopularMovies,
    getTopRatedMovies,
    searchMovies,
    getMovieDetails,
    getMoviesByVoteAverage,
    getMoviesByGenre,
    getTopRatedByGenre,
    getMoviesWithFilters,
    getMoviesByYear,
  };
}
