// Utility per generare URL corretti delle immagini
// Gestisce automaticamente il base path di Vite (es. /justcolors/)
export function getAssetUrl(path: string): string {
  // Rimuove eventuale / iniziale
  const cleanPath = path.startsWith('/') ? path.slice(1) : path;
  const base = import.meta.env.BASE_URL;
  // BASE_URL finisce sempre con /, es. /justcolors/
  return `${base}${cleanPath}`;
}
