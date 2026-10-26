import { describe, it, expect } from "vitest";
import { filmesDoHero } from "./hero";

const f = (id: number, backdrop_path: string | null, poster_path: string | null = "/p.jpg") => ({ id, backdrop_path, poster_path });

describe("filmesDoHero", () => {
  it("keeps only movies with backdrop and poster, in order", () => {
    const filmes = [f(1, "/a.jpg"), f(2, null), f(3, "/c.jpg", null), f(4, "/d.jpg")];
    expect(filmesDoHero(filmes).map((m) => m.id)).toEqual([1, 4]);
  });
  it("limits to five by default", () => {
    const filmes = Array.from({ length: 8 }, (_, i) => f(i, "/b.jpg"));
    expect(filmesDoHero(filmes)).toHaveLength(5);
    expect(filmesDoHero(filmes, 2)).toHaveLength(2);
  });
});
