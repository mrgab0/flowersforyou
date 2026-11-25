/**
 * Genera un SKU formateado a partir del nombre del producto para Flowers For You.
 * Ejemplo: "box roses magenta and white" -> "bx-rs-mgnt-wt"
 */
export function generateSkuFromName(name: string): string {
  if (!name || !name.trim()) return "";

  const dictionary: Record<string, string> = {
    // Presentaciones
    box: "bx",
    caja: "cj",
    cajas: "cj",
    ramo: "rm",
    ramos: "rm",
    bouquet: "bq",
    bouquets: "bq",
    florero: "flr",
    floreros: "flr",
    arreglo: "arr",
    arreglos: "arr",
    canasta: "cnst",
    canastas: "cnst",
    cesta: "cst",
    cestas: "cst",
    sombrerera: "smbr",

    // Flores
    roses: "rs",
    rose: "rs",
    rosas: "rs",
    rosa: "rs",
    girasol: "grs",
    girasoles: "grs",
    tulipanes: "tlp",
    tulipan: "tlp",
    orquidea: "orq",
    orquideas: "orq",
    lirios: "lrs",
    lirio: "lrs",
    claveles: "clv",
    clavel: "clv",
    hortensias: "hrt",
    hortensia: "hrt",
    flores: "flr",
    flower: "flr",
    flowers: "flr",

    // Colores
    magenta: "mgnt",
    purple: "prlp",
    purpura: "prlp",
    morado: "mrd",
    white: "wt",
    blanco: "blc",
    blanca: "blc",
    red: "rd",
    rojo: "rj",
    roja: "rj",
    pink: "pnk",
    rosado: "rsd",
    rosada: "rsd",
    yellow: "yl",
    amarillo: "amr",
    blue: "blu",
    azul: "azl",
    gold: "gld",
    dorado: "drd",
    silver: "slv",
    plateado: "plt",

    // Calidades / Atributos
    imperial: "imp",
    deluxe: "dlx",
    premium: "prm",
    vip: "vip",
    gigante: "ggt",
    mini: "mn",
    grande: "grd",
    pequeno: "pq",
    pequeño: "pq",
    amor: "amr",
    cumpleanos: "cmp",
    cumpleaños: "cmp"
  };

  const stopWords = new Set([
    "and", "y", "de", "del", "con", "el", "la", "los", "las", "un", "una",
    "unos", "unas", "para", "por", "a", "en", "the", "of", "with", "for", "&"
  ]);

  const normalized = name
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "");

  const words = normalized.split(/\s+/).filter(Boolean);
  const skuParts: string[] = [];

  for (const word of words) {
    if (stopWords.has(word)) continue;

    if (dictionary[word]) {
      skuParts.push(dictionary[word]);
    } else {
      let code = "";
      if (/^[aeiou]/.test(word)) {
        code = word[0] + word.slice(1).replace(/[aeiou]/g, "");
      } else {
        code = word.replace(/[aeiou]/g, "");
      }

      if (code.length < 2) {
        code = word.slice(0, 3);
      } else if (code.length > 4) {
        code = code.slice(0, 4);
      }

      skuParts.push(code);
    }
  }

  return skuParts.join("-");
}
