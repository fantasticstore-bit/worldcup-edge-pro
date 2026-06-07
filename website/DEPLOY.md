# Deploy marcoroberti.it

## Metodo consigliato: Vercel

Questo sito e' un progetto Next.js dentro la cartella `website`.

### 1. Pubblica il codice su GitHub

Carica il repository su GitHub. Vercel leggerà il progetto da lì e aggiornerà il sito a ogni push.

### 2. Crea il progetto su Vercel

1. Vai su Vercel.
2. Seleziona `Add New Project`.
3. Importa il repository.
4. Imposta `Root Directory` su:

```text
website
```

5. Framework: `Next.js`.
6. Build command: lascia il default, oppure usa:

```text
pnpm build
```

7. Output directory: lascia vuoto/default.

### 3. Collega il dominio

Nel progetto Vercel:

1. Vai in `Settings` -> `Domains`.
2. Aggiungi:

```text
marcoroberti.it
www.marcoroberti.it
```

### 4. Configura DNS dal provider del dominio

Nel pannello dove hai comprato il dominio, aggiungi:

```text
Type: A
Name: @
Value: 76.76.21.21
```

```text
Type: CNAME
Name: www
Value: cname.vercel-dns-0.com
```

Vercel potrebbe mostrarti valori DNS leggermente diversi: in quel caso usa sempre quelli indicati da Vercel.

### 5. Attendi la propagazione

Di solito bastano pochi minuti, ma il DNS puo' richiedere fino a 24 ore.

Quando Vercel mostra il dominio come `Valid Configuration`, il sito e' online.
