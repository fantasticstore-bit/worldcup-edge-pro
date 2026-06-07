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
Value: 216.198.79.1
```

```text
Type: CNAME
Name: www
Value: 7aadc9b2df466643.vercel-dns-017.com
```

Vercel puo' mostrare valori DNS leggermente diversi per ogni progetto: usa sempre quelli indicati nella schermata `Domains` di Vercel.

### 5. Attendi la propagazione

Di solito bastano pochi minuti, ma il DNS puo' richiedere fino a 24 ore.

Quando Vercel mostra il dominio come `Valid Configuration`, il sito e' online.
