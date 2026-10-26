import { describe, it, expect } from "vitest";
import { useListaPaginada } from "./useListaPaginada";

const filme = (id: number) => ({ id, title: `F${id}` });

describe("useListaPaginada", () => {
  it("appends pages in order and skips repeated movies", async () => {
    const paginas: Record<number, ReturnType<typeof filme>[]> = { 1: [filme(1), filme(2)], 2: [filme(2), filme(3)] };
    const lista = useListaPaginada(async (p) => paginas[p] ?? []);
    await lista.carregarMais();
    await lista.carregarMais();
    expect(lista.filmes.value.map((f) => f.id)).toEqual([1, 2, 3]);
  });

  it("stops at the first empty page", async () => {
    let chamadas = 0;
    const lista = useListaPaginada(async (p) => (chamadas++, p === 1 ? [filme(1)] : []));
    await lista.carregarMais();
    await lista.carregarMais();
    await lista.carregarMais();
    expect(lista.fim.value).toBe(true);
    expect(chamadas).toBe(2);
  });

  it("ignores a second call while one is loading", async () => {
    let chamadas = 0;
    const lista = useListaPaginada(async () => (chamadas++, [filme(chamadas)]));
    await Promise.all([lista.carregarMais(), lista.carregarMais()]);
    expect(chamadas).toBe(1);
  });

  it("flags an error, keeps what loaded and retries the same page", async () => {
    let falhar = false;
    const pedidas: number[] = [];
    const lista = useListaPaginada(async (p) => {
      pedidas.push(p);
      if (falhar) throw new Error("rede");
      return [filme(p)];
    });
    await lista.carregarMais();
    falhar = true;
    await lista.carregarMais();
    expect(lista.erro.value).toBe(true);
    expect(lista.carregando.value).toBe(false);
    expect(lista.filmes.value).toHaveLength(1);
    falhar = false;
    await lista.carregarMais();
    expect(lista.erro.value).toBe(false);
    expect(pedidas).toEqual([1, 2, 2]);
  });

  it("drops a late response after recarregar", async () => {
    let soltar!: (v: ReturnType<typeof filme>[]) => void;
    let primeira = true;
    const lista = useListaPaginada<ReturnType<typeof filme>>((p) => {
      if (primeira) {
        primeira = false;
        return new Promise((r) => (soltar = r));
      }
      return Promise.resolve([filme(100 + p)]);
    });
    const antiga = lista.carregarMais();
    await lista.recarregar();
    soltar([filme(1)]);
    await antiga;
    expect(lista.filmes.value.map((f) => f.id)).toEqual([101]);
    expect(lista.carregando.value).toBe(false);
  });
});
