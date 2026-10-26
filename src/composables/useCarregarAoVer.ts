import { watch, type Ref } from "vue";

// Pede mais itens quando a sentinela está visível e a lista está pronta. Reavalia também quando o carregamento
// termina: em telas grandes a sentinela continua visível depois da 1ª página e o observer não dispara de novo.
export function useCarregarAoVer(
  visivel: Ref<boolean>,
  lista: { carregando: Ref<boolean>; fim: Ref<boolean | undefined>; total: Ref<number> },
  pedirMais: () => void
) {
  watch(
    [visivel, lista.carregando, lista.fim, lista.total],
    () => {
      if (visivel.value && !lista.carregando.value && !lista.fim.value && lista.total.value) pedirMais();
    },
    { flush: "post" }
  );
}
