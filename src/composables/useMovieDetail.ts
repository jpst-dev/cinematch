import axios from "axios";

const API_KEY = import.meta.env.VITE_TMDB_API_KEY;
const BASE_URL = "https://api.themoviedb.org/3";

export const useMovieDetail = () => {
  const getMovieDetails = async (id: string) => {
    const { data } = await axios.get(`${BASE_URL}/movie/${id}`, {
      params: { api_key: API_KEY, language: "pt-BR" },
    });
    return data;
  };

  const getCredits = async (id: string) => {
    const { data } = await axios.get(`${BASE_URL}/movie/${id}/credits`, {
      params: { api_key: API_KEY, language: "pt-BR" },
    });
    return data;
  };

  const getVideos = async (id: string) => {
    const { data } = await axios.get(`${BASE_URL}/movie/${id}/videos`, {
      params: { api_key: API_KEY, language: "pt-BR" },
    });
    return data.results;
  };

  const getRecommendations = async (id: string) => {
    const { data } = await axios.get(
      `${BASE_URL}/movie/${id}/recommendations`,
      {
        params: { api_key: API_KEY, language: "pt-BR" },
      }
    );
    return data.results;
  };

  const getWatchProviders = async (id: string) => {
    const { data } = await axios.get(
      `https://api.themoviedb.org/3/movie/${id}/watch/providers`,
      {
        params: {
          api_key: import.meta.env.VITE_TMDB_API_KEY,
        },
      }
    );
    return data.results.BR; // ou "US", dependendo do país
  };

  return {
    getMovieDetails,
    getCredits,
    getVideos,
    getWatchProviders,
    getRecommendations,
  };
};
