/** Normaliza cor hex para #RRGGBB. Retorna null se inválida. */
export function normalizeHexColor(input: string): string | null {
  const raw = input.trim();
  if (!raw) return null;

  const withHash = raw.startsWith("#") ? raw : `#${raw}`;
  const hex = withHash.toUpperCase();

  if (/^#[0-9A-F]{6}$/.test(hex)) return hex;
  const m3 = /^#([0-9A-F]{3})$/.exec(hex);
  if (m3) {
    const [r, g, b] = m3[1].split("");
    return `#${r}${r}${g}${g}${b}${b}`;
  }
  return null;
}

/** Cor hex estável a partir de uma string (ex.: id do ativo). */
export function defaultAssetColor(seed: string): string {
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    hash = seed.charCodeAt(i) + ((hash << 5) - hash);
  }

  const h = Math.abs(hash % 360); // 0..359
  const s = 65 + (Math.abs(hash >> 8) % 25); // 65..89
  const l = 45 + (Math.abs(hash >> 16) % 25); // 45..69

  return hslToHex(h / 360, s / 100, l / 100);
}

function hslToHex(h: number, s: number, l: number): string {
  let r: number, g: number, b: number;
  if (s === 0) {
    r = g = b = l;
  } else {
    const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
    const p = 2 * l - q;
    r = hueToRgb(p, q, h + 1 / 3);
    g = hueToRgb(p, q, h);
    b = hueToRgb(p, q, h - 1 / 3);
  }

  return (
    "#" +
    [r, g, b]
      .map((x) => {
        const hx = Math.round(x * 255).toString(16);
        return hx.length === 1 ? `0${hx}` : hx;
      })
      .join("")
      .toUpperCase()
  );
}

function hueToRgb(p: number, q: number, t: number): number {
  if (t < 0) t += 1;
  if (t > 1) t -= 1;
  if (t < 1 / 6) return p + (q - p) * 6 * t;
  if (t < 1 / 2) return q;
  if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
  return p;
}

