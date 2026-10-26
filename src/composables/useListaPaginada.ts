import { ref, shallowRef } from "vue";

// Estado de uma grade com scroll infinito. `recarregar` (troca de filtro/busca) descarta respostas antigas ainda em voo.
export function useListaPaginada<T extends { id: number }>(buscar: (pagina: number) => Promise<T[]>) {
  const filmes = shallowRef<T[]>([]);
  const carregando = ref(false);
  const erro = ref(false);
  const fim = ref(false);
  let pagina = 1;
  let geracao = 0;

  const carregarMais = async () => {
    if (carregando.value || fim.value) return;
    const minha = geracao;
    carregando.value = true;
    erro.value = false;
    try {
      const novos = await buscar(pagina);
      if (minha !== geracao) return;
      const vistos = new Set(filmes.value.map((f) => f.id));
      filmes.value = [...filmes.value, ...novos.filter((f) => !vistos.has(f.id))];
      pagina++;
      if (!novos.length) fim.value = true;
    } catch {
      if (minha === geracao) erro.value = true;
    } finally {
      if (minha === geracao) carregando.value = false;
    }
  };

  const recarregar = () => {
    geracao++;
    pagina = 1;
    filmes.value = [];
    fim.value = false;
    erro.value = false;
    carregando.value = false;
    return carregarMais();
  };

  return { filmes, carregando, erro, fim, carregarMais, recarregar };
}
