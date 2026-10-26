// O destaque só mostra filmes com imagem larga e pôster, senão o hero fica quebrado.
export const filmesDoHero = <T extends { backdrop_path?: string | null; poster_path?: string | null }>(
  filmes: T[],
  max = 5
): T[] => filmes.filter((f) => f.backdrop_path && f.poster_path).slice(0, max);
