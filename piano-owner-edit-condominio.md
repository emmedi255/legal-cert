# Piano: OWNER può modificare i condomini di altri amministratori

## Problema attuale

La pagina `/condo-managers/[id]` mostra i condomini di un cliente ma è **solo lettura**.
Il flusso di edit esistente (`/condomini/[id]`) ha due limitazioni per l'OWNER:

1. **Dati non disponibili**: carica il condominio da `CondominiContext`, che contiene
   solo i condomini dell'utente loggato — non quelli del cliente.
2. **Ownership sovrascritta**: `DataForm` manda `userId: user.id` (l'OWNER) alla save API,
   che lo scrive come `user_id` nel DB, strappando il condominio al cliente originale.

---

## Approccio: nuova pagina dedicata

Creare `/app/condo-managers/[id]/condomini/[condominioId]/edit/page.jsx`

Vantaggi rispetto a riusare `/condomini/[id]`:
- Non tocca il flusso di edit del cliente normale
- Nessuna logica condizionale spalmata tra context, DataForm e API
- URL distinto → facile capire dove ci si trova

---

## Modifiche necessarie (5 file)

### 1. Nuova pagina edit OWNER
**`app/condo-managers/[id]/condomini/[condominioId]/edit/page.jsx`** *(nuovo file)*

- Legge `id` (userId del cliente) e `condominioId` dai params
- Verifica che l'utente loggato sia OWNER, altrimenti redirect
- Chiama direttamente `GET /api/get-condomini?user_id=[id]` per caricare i dati
  (bypassa CondominiContext, che non ha i condomini del cliente)
- Trova il condominio nell'array restituito e chiama `mapDbToForm()`
- Renderizza `<DataForm initialForm={...} mode="edit" condominioId={condominioId} ownerOverrideUserId={id} />`

Il prop `ownerOverrideUserId` serve per dire a DataForm: "quando salvi, usa questo userId
come proprietario, non il mio".

---

### 2. Bottone "Modifica" nella pagina cliente OWNER
**`app/condo-managers/[id]/page.jsx`**

- Per ogni condominio nella lista, aggiungere un bottone/icona modifica (solo se `user.role === "OWNER"`)
- Naviga verso `/condo-managers/${id}/condomini/${condominio.condominio_id}/edit`

---

### 3. DataForm accetta `ownerOverrideUserId`
**`app/add-company/page.jsx`**

Aggiungere il prop:
```js
export default function DataForm({
  initialForm = null,
  mode = "create",
  condominioId = null,
  ownerOverrideUserId = null,   // ← nuovo
})
```

Ovunque si chiami la save API, usare:
```js
userId: ownerOverrideUserId ?? user.id
```

Questo garantisce che il condominio rimanga associato al cliente originale e non all'OWNER.

---

### 4. Save API: proteggere l'ownership esistente
**`app/api/save-condominio/route.js`**

Aggiungere un controllo sul ramo "edit" (`condominioId` presente):
- Prima dell'upsert, fare una `select("user_id")` sul condominio esistente
- Se il record esiste già, usare il `user_id` trovato nel DB invece di quello
  ricevuto dal client — così anche se qualcosa va storto lato client, il proprietario
  non viene mai riscritto involontariamente

```js
if (condominioId) {
  const { data: existing } = await supabaseAdmin
    .from("condomini")
    .select("user_id")
    .eq("condominio_id", condominioId)
    .single();

  if (existing) {
    condominioRow.user_id = existing.user_id; // preserva il proprietario originale
  }
}
```

---

### 5. Redirect dopo salvataggio
**`app/add-company/page.jsx`** — comportamento del redirect post-save

Attualmente dopo il salvataggio in modalità edit fa `router.push("/dashboard")`.
Con il prop `ownerOverrideUserId` presente, il redirect deve tornare alla pagina
del cliente: `router.push(\`/condo-managers/${ownerOverrideUserId}\`)`.

---

## Flusso completo risultante

```
OWNER va su /condo-managers/[clienteId]
  → vede la lista dei condomini del cliente
  → clicca "Modifica" su un condominio

/condo-managers/[clienteId]/condomini/[condominioId]/edit
  → verifica role === OWNER
  → fetch /api/get-condomini?user_id=[clienteId]
  → trova il condominio, mapDbToForm()
  → renderizza DataForm con ownerOverrideUserId=[clienteId]

OWNER salva
  → POST /api/save-condominio con userId=[clienteId] (ownerOverride)
  → API verifica l'user_id esistente nel DB e lo preserva
  → redirect → /condo-managers/[clienteId]
```

---

## Cosa NON cambia

- Il flusso di edit normale del cliente (`/condomini/[id]`) rimane invariato
- `CondominiContext` rimane invariato
- Nessuna modifica al DB o allo schema
