// Campos do TMDb que as listas usam (o resto do objeto é ignorado).
export interface Movie {
  id: number;
  title: string;
  poster_path?: string | null;
  backdrop_path?: string | null;
  vote_average?: number | null;
  release_date?: string | null;
  overview?: string;
  genre_ids?: number[];
}
