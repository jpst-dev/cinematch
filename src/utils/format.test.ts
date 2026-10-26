import { describe, it, expect } from "vitest";
import { formatNota, formatData, formatDuracao, ano } from "./format";

describe("formatNota", () => {
  it("uses one decimal with a comma", () => {
    expect(formatNota(7.493)).toBe("7,5");
    expect(formatNota(10)).toBe("10,0");
  });
  it("hides missing or zero ratings", () => {
    expect(formatNota(0)).toBe("");
    expect(formatNota(null)).toBe("");
    expect(formatNota(undefined)).toBe("");
  });
});

describe("formatData", () => {
  it("formats as day, short month and year in pt-BR", () => {
    expect(formatData("2026-10-19")).toBe("19 out. 2026");
    expect(formatData("2026-05-01")).toBe("1 mai. 2026");
  });
  it("returns empty for missing or invalid dates", () => {
    expect(formatData("")).toBe("");
    expect(formatData(null)).toBe("");
    expect(formatData("2026-13-01")).toBe("");
    expect(formatData("abc")).toBe("");
  });
});

describe("formatDuracao", () => {
  it("formats hours and minutes", () => {
    expect(formatDuracao(112)).toBe("1h 52min");
    expect(formatDuracao(60)).toBe("1h");
    expect(formatDuracao(45)).toBe("45min");
  });
  it("hides missing runtime", () => {
    expect(formatDuracao(0)).toBe("");
    expect(formatDuracao(null)).toBe("");
  });
});

describe("ano", () => {
  it("extracts the year", () => {
    expect(ano("2026-10-19")).toBe("2026");
    expect(ano("")).toBe("");
    expect(ano(undefined)).toBe("");
  });
});
