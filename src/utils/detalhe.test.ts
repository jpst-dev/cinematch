import { describe, it, expect } from "vitest";
import { escolherTrailer, equipeChave, iniciais, fichaTecnica } from "./detalhe";

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

describe("fichaTecnica", () => {
  const limpar = (ficha: { rotulo: string; valor: string }[]) =>
    ficha.map(({ rotulo, valor }) => [rotulo, valor.replace(/\s/g, " ")]);

  it("translates status and language, formats money, lists companies and countries", () => {
    const ficha = fichaTecnica({
      status: "Released",
      original_language: "en",
      budget: 200000000,
      revenue: 1234567890,
      production_companies: [{ name: "Amazon MGM" }, { name: "Sony" }, { name: "Lord Miller" }, { name: "Quarta" }],
      production_countries: [{ iso_3166_1: "US", name: "United States of America" }],
    });
    expect(limpar(ficha)).toEqual([
      ["Situação", "Lançado"],
      ["Idioma original", "Inglês"],
      ["Orçamento", "US$ 200 mi"],
      ["Bilheteria", "US$ 1,2 bi"],
      ["Produção", "Amazon MGM, Sony, Lord Miller"],
      ["País", "Estados Unidos"],
    ]);
  });

  it("skips what TMDb does not know", () => {
    expect(fichaTecnica({ status: "", budget: 0, revenue: 0, production_companies: [], production_countries: [] })).toEqual([]);
  });

  it("keeps unknown statuses as they come", () => {
    expect(fichaTecnica({ status: "Something New" })).toEqual([{ rotulo: "Situação", valor: "Something New" }]);
  });
});
