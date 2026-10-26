// Regras da página do filme que não dependem de tela.
type Video = { key: string; type: string; site: string; official?: boolean };
type Pessoa = { name: string; job: string };

const ROTEIRO = ["Screenplay", "Writer", "Author", "Novel", "Story"];

// Trailer oficial > qualquer trailer > teaser; só YouTube, que é o player embutido.
export const escolherTrailer = (videos: Video[]): string | null => {
  const yt = videos.filter((v) => v.site === "YouTube" && v.key);
  const achado =
    yt.find((v) => v.type === "Trailer" && v.official) ??
    yt.find((v) => v.type === "Trailer") ??
    yt.find((v) => v.type === "Teaser");
  return achado?.key ?? null;
};

const unicos = (nomes: string[]) => [...new Set(nomes)];

export const equipeChave = (crew: Pessoa[]) => ({
  direcao: unicos(crew.filter((p) => p.job === "Director").map((p) => p.name)),
  roteiro: unicos(crew.filter((p) => ROTEIRO.includes(p.job)).map((p) => p.name)),
});

export const iniciais = (nome: string): string => {
  const partes = nome.trim().split(/\s+/).filter(Boolean);
  if (!partes.length) return "";
  const [primeira, ...resto] = partes;
  return (primeira[0] + (resto.at(-1)?.[0] ?? "")).toUpperCase();
};

const SITUACAO: Record<string, string> = {
  Released: "Lançado",
  "Post Production": "Pós-produção",
  "In Production": "Em produção",
  Planned: "Planejado",
  Rumored: "Rumor",
  Canceled: "Cancelado",
};

const dinheiro = new Intl.NumberFormat("pt-BR", {
  style: "currency",
  currency: "USD",
  notation: "compact",
  maximumFractionDigits: 1,
});
const idiomas = new Intl.DisplayNames(["pt-BR"], { type: "language" });
const paises = new Intl.DisplayNames(["pt-BR"], { type: "region" });
const capitalizar = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

type Filme = {
  status?: string;
  original_language?: string;
  budget?: number;
  revenue?: number;
  production_companies?: { name: string }[];
  production_countries?: { iso_3166_1: string; name: string }[];
};

// Ficha técnica ao lado do trailer; só entra o que o TMDb conhece.
export const fichaTecnica = (f: Filme): { rotulo: string; valor: string }[] => {
  const nomePais = (p: { iso_3166_1: string; name: string }) => {
    try {
      return paises.of(p.iso_3166_1) ?? p.name;
    } catch {
      return p.name;
    }
  };
  const linhas: [string, string | undefined][] = [
    ["Situação", f.status ? (SITUACAO[f.status] ?? f.status) : undefined],
    ["Idioma original", f.original_language ? capitalizar(idiomas.of(f.original_language) ?? f.original_language) : undefined],
    ["Orçamento", f.budget ? dinheiro.format(f.budget) : undefined],
    ["Bilheteria", f.revenue ? dinheiro.format(f.revenue) : undefined],
    ["Produção", f.production_companies?.slice(0, 3).map((c) => c.name).join(", ")],
    ["País", f.production_countries?.map(nomePais).join(", ")],
  ];
  return linhas.filter((l): l is [string, string] => !!l[1]).map(([rotulo, valor]) => ({ rotulo, valor }));
};
