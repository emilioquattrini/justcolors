# Justcolors Portfolio

Personal portfolio website for Chiara, graphic designer and visual artist based in Venice, Italy.

**Live site:** [https://justcolors.net](https://justcolors.net)

---

## Landing page VagueVase

La landing page dedicata a VagueVase è disponibile alla route:

```text
/#/vaguevase
```

Tutti i contenuti modificabili si trovano in un unico file:

```text
src/data/vague-vase.json
```

Da questo file si possono cambiare senza intervenire sul componente React:

- testi, titoli, didascalie e CTA;
- logo testuale oppure percorso di un logo immagine;
- immagini delle singole sezioni;
- voci di navigazione;
- link social;
- testi e campi della finestra di pre-ordine;
- dominio Shopify e ID delle varianti usate per le prenotazioni.

Le immagini della landing sono ospitate nella libreria file Shopify e richiamate tramite URL CDN permanenti. Il pre-ordine utilizza un prodotto Shopify `UNLISTED` a prezzo zero: il visitatore completa un checkout di prenotazione senza pagamento e i dati scelti vengono registrati nell'ordine Shopify.

File principali:

```text
src/pages/VagueVasePage.tsx
src/pages/VagueVasePage.css
src/data/vague-vase.json
```

---

## Come aggiungere un nuovo progetto

### 1. Aggiungi l'immagine

Carica il file immagine nella cartella corretta:

| Sezione | Cartella |
|---------|----------|
| Visual Arts | `public/assets/visual-arts/` |
| Branding | `public/assets/branding/` |
| Photo-Graphic | `public/assets/photo-graphic/` |

### 2. Aggiungi il progetto nel file JSON

Modifica il file JSON corrispondente nella cartella `src/data/`.

**Per Visual Arts** → modifica `src/data/visual-arts.json`:

```json
{
  "projects": [
    {
      "image": "/assets/visual-arts/nome-file.jpg",
      "title": "Titolo del progetto",
      "category": "Categoria"
    }
  ]
}
```

**Per Branding** → modifica `src/data/branding.json` (stessa struttura)

**Per Photo-Graphic** → modifica `src/data/photo-graphic.json` (stessa struttura)

> I progetti nuovi vanno **in cima alla lista** (prima dell'oggetto `projects`) per apparire in prima posizione.

### 3. Commit e push

```bash
git add .
git commit -m "Aggiunto progetto XYZ"
git push
```

Il sito si aggiorna automaticamente!

---

## Struttura dei file di configurazione

### `src/data/homepage.json`
- Titolo, tagline, email, Instagram
- Voci di navigazione
- Immagini di sfondo della homepage (8 immagini che ruotano)

### `src/data/about.json`
- Biografia, foto profilo, didascalia
- Lista mostre e premi
- Link cliccabili nella bio (Metadesign, Snøhetta, AIAP...)
- Immagine di sfondo

### `src/data/visual-arts.json`
- Titolo pagina, sottotitolo, descrizione
- Progetti in galleria (immagine, titolo, categoria)

### `src/data/branding.json`
- Stessa struttura di visual-arts.json

### `src/data/photo-graphic.json`
- Stessa struttura + statistiche animate

---

## Come modificare il testo

Tutti i contenuti testuali sono nei file JSON in `src/data/`. Non serve toccare il codice React.

Per modificare la bio: apri `src/data/about.json` e cambia il testo nell'array `bio`.
Per aggiungere un premio: aggiungi un oggetto nell'array `awards`.
Per cambiare l'email: modifica il campo `email` in `homepage.json`.

---

## Deploy su GitHub Pages

1. Crea un repository su GitHub
2. Pusha questo codice
3. Vai su **Settings > Pages**
4. Scegli **GitHub Actions** come source
5. Il workflow `.github/workflows/deploy.yml` si occupa del deploy automatico

Ogni volta che fai push sul branch `main`, il sito si aggiorna automaticamente.

---

## Sviluppo locale

```bash
npm install
npm run dev
```

Build per produzione:
```bash
npm run build
```

---

## Tecnologie

- React 19 + TypeScript + Vite
- Tailwind CSS
- GSAP (animazioni)
- React Router
