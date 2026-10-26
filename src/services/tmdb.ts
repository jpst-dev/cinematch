// Única porta de saída para o TMDb: o navegador só conversa com /api/tmdb, a chave fica no servidor.
type Params = Record<string, string | number | undefined>;

export async function tmdb<T>(caminho: string, params: Params = {}): Promise<T> {
  const query = new URLSearchParams();
  for (const [k, v] of Object.entries(params)) if (v !== undefined && v !== "") query.set(k, String(v));
  const res = await fetch(`/api/tmdb/${caminho}${query.size ? `?${query}` : ""}`);
  if (!res.ok) throw new Error(`TMDb ${res.status} em ${caminho}`);
  return res.json() as Promise<T>;
}

export type TamanhoImg = "w45" | "w185" | "w342" | "w500" | "w1280";

export const IMG = (tamanho: TamanhoImg, path?: string | null): string | null =>
  path ? `https://image.tmdb.org/t/p/${tamanho}${path}` : null;

// Imagem de fundo em tela cheia: o navegador escolhe pelo tamanho da tela (4K recebe a original).
export const fundo = (path: string) => ({
  src: `https://image.tmdb.org/t/p/w1280${path}`,
  srcset: ["w780 780w", "w1280 1280w", "original 3840w"]
    .map((t) => `https://image.tmdb.org/t/p/${t.split(" ")[0]}${path} ${t.split(" ")[1]}`)
    .join(", "),
  sizes: "100vw",
});
