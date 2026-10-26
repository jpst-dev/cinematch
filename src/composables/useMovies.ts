import { tmdb } from "../services/tmdb";

type Lista = { results: any[] };
const lista = async (caminho: string, params: Record<string, string | number | undefined>) =>
  (await tmdb<Lista>(caminho, params)).results;

let generosCache: Promise<Record<number, string>> | null = null;

export function useMovies() {
  const getPopularMovies = (page = 1) => lista("movie/popular", { page });

  const getTopRatedMovies = (page = 1) => lista("movie/top_rated", { page });

  const getNowPlayingMovies = (page = 1) => lista("movie/now_playing", { page });

  const searchMovies = (query: string, page = 1) => lista("search/movie", { query, page });

  const getMovieDetails = (id: string) => tmdb<any>(`movie/${id}`);

  const getMoviesWithFilters = ({
    genreId = "",
    sortBy = "vote_average.desc",
    page = 1,
  }: {
    genreId?: string;
    sortBy?: string;
    page?: number;
  }) =>
    lista("discover/movie", {
      sort_by: sortBy,
      with_genres: genreId || undefined,
      "vote_count.gte": 100, // evita notas infladas com poucos votos
      page,
    });

  // Lista de gêneros muda raramente: busca uma vez por sessão.
  const getGenres = () =>
    (generosCache ??= tmdb<{ genres: { id: number; name: string }[] }>("genre/movie/list").then((r) =>
      Object.fromEntries(r.genres.map((g) => [g.id, g.name]))
    ));

  return {
    getPopularMovies,
    getTopRatedMovies,
    getNowPlayingMovies,
    searchMovies,
    getMovieDetails,
    getMoviesWithFilters,
    getGenres,
  };
}
