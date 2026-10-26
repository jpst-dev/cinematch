import { describe, it, expect } from "vitest";
import { escolherTrailer, equipeChave, iniciais } from "./detalhe";

const v = (key: string, type: string, extra: Partial<{ site: string; official: boolean }> = {}) => ({
  key,
  type,
  site: "YouTube",
  official: false,
  ...extra,
});

describe("escolherTrailer", () => {
  it("prefers an official YouTube trailer", () => {
    expect(escolherTrailer([v("a", "Teaser"), v("b", "Trailer"), v("c", "Trailer", { official: true })])).toBe("c");
  });
  it("falls back to any trailer, then a teaser", () => {
    expect(escolherTrailer([v("a", "Featurette"), v("b", "Trailer")])).toBe("b");
    expect(escolherTrailer([v("a", "Featurette"), v("t", "Teaser")])).toBe("t");
  });
  it("ignores non-YouTube videos and returns null when nothing fits", () => {
    expect(escolherTrailer([v("a", "Trailer", { site: "Vimeo" })])).toBeNull();
    expect(escolherTrailer([])).toBeNull();
  });
});

describe("equipeChave", () => {
  it("lists directors and writers without repeats", () => {
    const crew = [
      { name: "Ana", job: "Director" },
      { name: "Bia", job: "Screenplay" },
      { name: "Bia", job: "Writer" },
      { name: "Caio", job: "Producer" },
      { name: "Duda", job: "Novel" },
    ];
    expect(equipeChave(crew)).toEqual({ direcao: ["Ana"], roteiro: ["Bia", "Duda"] });
  });
});

describe("iniciais", () => {
  it("uses first and last name initials", () => {
    expect(iniciais("Jeremy Allen White")).toBe("JW");
    expect(iniciais("Zendaya")).toBe("Z");
    expect(iniciais("  ")).toBe("");
  });
});
