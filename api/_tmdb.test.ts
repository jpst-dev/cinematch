import { describe, it, expect } from "vitest";
import { resolverAlvo } from "./_tmdb";

const alvo = (caminho: string, query = "") => resolverAlvo(caminho, new URLSearchParams(query), "KEY");

describe("resolverAlvo", () => {
  it.each([
    "movie/popular",
    "movie/top_rated",
    "movie/now_playing",
    "movie/123",
    "movie/123/credits",
    "movie/123/videos",
    "movie/123/recommendations",
    "movie/123/watch/providers",
    "search/movie",
    "discover/movie",
    "genre/movie/list",
  ])("allows %s and injects the key", (caminho) => {
    const url = alvo(caminho, "page=2");
    expect(url?.origin + url!.pathname).toBe(`https://api.themoviedb.org/3/${caminho}`);
    expect(url?.searchParams.get("api_key")).toBe("KEY");
    expect(url?.searchParams.get("page")).toBe("2");
  });

  it.each([
    "person/1",
    "search/person",
    "search/multi",
    "movie/../account",
    "movie/%2e%2e/account",
    "movie/1/account_states",
    "/movie/popular",
    "movie//popular",
    "movie/popular/",
    "",
  ])("blocks %s", (caminho) => {
    expect(alvo(caminho)).toBeNull();
  });

  it("drops api_key and path sent by the client", () => {
    const url = alvo("movie/popular", "api_key=HACK&path=x&page=1");
    expect(url?.searchParams.getAll("api_key")).toEqual(["KEY"]);
    expect(url?.searchParams.has("path")).toBe(false);
  });

  it("defaults language to pt-BR but keeps an explicit one", () => {
    expect(alvo("movie/popular")?.searchParams.get("language")).toBe("pt-BR");
    expect(alvo("movie/popular", "language=en-US")?.searchParams.get("language")).toBe("en-US");
  });

  it("does not add language to watch providers", () => {
    expect(alvo("movie/1/watch/providers")?.searchParams.has("language")).toBe(false);
  });
});
