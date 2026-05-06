export type CardSize = "sm" | "md" | "lg";

const cardGridClass: Record<CardSize, string> = {
  sm: "movie-grid-sm",
  md: "movie-grid-md",
  lg: "movie-grid-lg",
};

export const getMovieGridClass = (size: CardSize) =>
  `movie-grid ${cardGridClass[size]}`;
