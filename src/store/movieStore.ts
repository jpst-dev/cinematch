import { defineStore } from "pinia";

export const useMovieStore = defineStore("movie", {
  state: () => ({
    movies: [] as any[],
    selectedMovie: null as any,
    currentPage: 1,
    isLoading: false,
    isSearchMode: false,
    query: "",
    cardSize: "lg" as "sm" | "md" | "lg",
  }),
  actions: {
    setMovies(payload: any[]) {
      this.movies = payload;
    },
    appendMovies(payload: any[]) {
      const existingIds = new Set(this.movies.map((m) => m.id));
      const newMovies = payload.filter((m) => !existingIds.has(m.id));
      this.movies.push(...newMovies);
    },
    setSelectedMovie(payload: any) {
      this.selectedMovie = payload;
    },
    setPage(page: number) {
      this.currentPage = page;
    },
    setLoading(loading: boolean) {
      this.isLoading = loading;
    },
    setSearchMode(isSearch: boolean, query = "") {
      this.isSearchMode = isSearch;
      this.query = query;
    },
    setCardSize(size: "sm" | "md" | "lg") {
      this.cardSize = size;
    },
  },
});
