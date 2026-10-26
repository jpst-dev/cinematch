// Formatos pt-BR exibidos nos cards e no detalhe. Valor ausente vira "" para a UI simplesmente esconder.
const MESES = ["jan.", "fev.", "mar.", "abr.", "mai.", "jun.", "jul.", "ago.", "set.", "out.", "nov.", "dez."];

export const formatNota = (v?: number | null): string => (v ? v.toFixed(1).replace(".", ",") : "");

export const formatData = (iso?: string | null): string => {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(iso ?? "");
  if (!m) return "";
  const mes = MESES[Number(m[2]) - 1];
  return mes ? `${Number(m[3])} ${mes} ${m[1]}` : "";
};

export const formatDuracao = (min?: number | null): string => {
  if (!min) return "";
  const h = Math.floor(min / 60);
  const r = min % 60;
  return [h && `${h}h`, r && `${r}min`].filter(Boolean).join(" ");
};

export const ano = (iso?: string | null): string => /^\d{4}/.exec(iso ?? "")?.[0] ?? "";
