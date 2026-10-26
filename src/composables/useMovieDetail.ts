import { tmdb } from "../services/tmdb";

export const useMovieDetail = () => {
  const getMovieDetails = (id: string) => tmdb<any>(`movie/${id}`);

  const getCredits = (id: string) => tmdb<any>(`movie/${id}/credits`);

  const getVideos = async (id: string) => (await tmdb<{ results: any[] }>(`movie/${id}/videos`)).results;

  const getRecommendations = async (id: string) =>
    (await tmdb<{ results: any[] }>(`movie/${id}/recommendations`)).results;

  const getWatchProviders = async (id: string) =>
    (await tmdb<{ results: Record<string, any> }>(`movie/${id}/watch/providers`)).results.BR;

  return {
    getMovieDetails,
    getCredits,
    getVideos,
    getWatchProviders,
    getRecommendations,
  };
};
