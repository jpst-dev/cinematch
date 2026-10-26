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
