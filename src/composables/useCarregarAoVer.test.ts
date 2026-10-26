import { describe, it, expect } from "vitest";
import { nextTick, ref } from "vue";
import { useCarregarAoVer } from "./useCarregarAoVer";

describe("useCarregarAoVer", () => {
  it("asks for more when loading finishes while the sentinel is still visible", async () => {
    const visivel = ref(true);
    const carregando = ref(true);
    const fim = ref(false);
    const total = ref(0);
    let pedidos = 0;
    useCarregarAoVer(visivel, { carregando, fim, total }, () => pedidos++);
    await nextTick();
    expect(pedidos).toBe(0);

    total.value = 20;
    carregando.value = false;
    await nextTick();
    expect(pedidos).toBe(1);
  });

  it("does not ask when hidden, finished or empty", async () => {
    const visivel = ref(false);
    const carregando = ref(false);
    const fim = ref(false);
    const total = ref(20);
    let pedidos = 0;
    useCarregarAoVer(visivel, { carregando, fim, total }, () => pedidos++);
    await nextTick();
    fim.value = true;
    visivel.value = true;
    await nextTick();
    expect(pedidos).toBe(0);
  });
});
