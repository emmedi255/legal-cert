# Security Audit — legal-cert

Data analisi: 2026-05-12

---

## CRITICI

### 1. Nessuna autenticazione server-side sulle API

**File**: tutte le route API  
**Problema**: Nessuna API legge il cookie di sessione per verificare chi sta chiamando. L'`userId` arriva dal client nel body o nei query params e viene usato senza verifica. Un utente non autenticato (o malevolo) può chiamare qualsiasi endpoint direttamente.

Esempi:
- `save-condominio/route.js:23` — `const { userId, form, condominioId } = await req.json()`
- `submit-data/route.js:28` — riceve l'intero oggetto `user` dal client
- `get-condomini/route.js` — accetta `?user_id=` da chiunque
- `fornitori/route.js:13` — `userId = url.searchParams.get("userId")`

**Fix**: Leggere la sessione dal cookie in ogni route:
```js
const cookieStore = await cookies();
const session = cookieStore.get("session_user");
if (!session) return NextResponse.json({ error: "Non autenticato" }, { status: 401 });
const sessionUser = JSON.parse(session.value);
```

---

### 2. Nessun controllo ownership su DELETE condominio

**File**: `app/api/condomini/[id]/route.js:9`  
**Problema**: Elimina un condominio (e i relativi documenti) conoscendo solo l'ID, senza verificare che appartenga all'utente loggato.

**Fix**: Aggiungere `.eq("user_id", sessionUser.id)` alla query di delete, oppure verificare l'ownership prima.

---

### 3. Nessuna autenticazione su `/api/customers`

**File**: `app/api/customers/route.js:10`  
**Problema**: GET restituisce la lista di tutti gli utenti con dati personali (nome, email, telefono, indirizzo) senza nessuna verifica di sessione né di ruolo.

**Fix**: Verificare sessione e che `sessionUser.role === "OWNER"`.

---

### 4. L'intero oggetto `user` viene inviato dal client a `submit-data`

**File**: `app/add-company/page.jsx:506`, `app/api/submit-data/route.js:28`  
**Problema**: Il frontend serializza e invia `{ user, form, condominioId }`. Il server usa `user.id`, `user.role`, `user.condomini_max` direttamente dal body — tutto falsificabile dal client.

**Fix**: Leggere `user` dal cookie di sessione lato server, ignorare quello ricevuto dal client.

---

### 5. Nessun controllo ownership su DELETE fornitore

**File**: `app/api/fornitori/route.js:50`  
**Problema**: DELETE cancella un fornitore per ID senza verificare che appartenga all'utente loggato.

**Fix**: Aggiungere `.eq("user_id", sessionUser.id)` alla query.

---

## ALTI

### 6. Nessuna verifica di ruolo (RBAC) sulle API admin

**File**: `app/api/customers/route.js`, `app/api/customers/[id]/route.js`, `app/api/profile/[id]/route.js`  
**Problema**: Le route riservate agli OWNER non verificano il ruolo dell'utente. Un CLIENTE con sessione valida può chiamarle.

**Fix**: Dopo aver letto la sessione, verificare `sessionUser.role === "OWNER"`.

---

### 7. Profilo utente leggibile senza autenticazione

**File**: `app/api/profile/[id]/route.js:9`  
**Problema**: GET restituisce tutti i dati di un profilo (inclusi email, telefono, indirizzo) conoscendo solo l'UUID. Nessuna autenticazione richiesta.

**Fix**: Verificare sessione e che l'utente sia OWNER oppure che stia leggendo il proprio profilo.

---

### 8. Ownership check su edit mancante in `save-condominio`

**File**: `app/api/save-condominio/route.js:177`  
**Problema**: Il codice recupera il `user_id` originale dal DB e lo preserva (bene), ma non verifica che l'utente loggato sia effettivamente il proprietario o un OWNER. Qualsiasi utente autenticato può sovrascrivere il condominio di chiunque conoscendo l'ID.

**Fix**: Dopo aver recuperato `existing.user_id`, verificare che `existing.user_id === sessionUser.id || sessionUser.role === "OWNER"`.

---

### 9. Nessuna sanitizzazione degli input del form

**File**: `app/api/save-condominio/route.js:60+`, `app/api/submit-data/route.js:47+`  
**Problema**: I campi testuali del form vengono salvati direttamente nel DB senza validazione di lunghezza o contenuto. Campi come note, indirizzi e nomi accettano qualsiasi stringa arbitrariamente lunga.

**Fix**: Limitare la lunghezza dei campi (`str.slice(0, N)`) e applicare sanitizzazione prima del salvataggio.

---

### 10. Query `fornitoriIds` costruita con string interpolation

**File**: `app/api/save-condominio/route.js:211`  
**Problema**:
```js
.not("fornitore_id", "in", `(${fornitoriIds.join(",")})`)
```
Se `fornitoriIds` contiene valori non numerici/non UUID, la stringa iniettata nella query non viene validata.

**Fix**: Validare che ogni elemento di `fornitoriIds` sia un UUID prima di usarli, oppure usare un approccio alternativo con `.delete()` + `.in()`.

---

## MEDI

### 11. Logica duplicata tra `save-condominio` e `submit-data`

**File**: `app/api/save-condominio/route.js`, `app/api/submit-data/route.js`  
**Problema**: La costruzione di `condominioRow` (~120 righe) è identica in entrambe le route. Qualsiasi modifica allo schema va fatta due volte, con rischio di disallineamento.

**Fix**: Estrarre in `lib/mapFormToCondominio.js` e importarla in entrambe le route.

---

### 12. Nessun rate limiting

**File**: `app/api/login/route.js`, tutte le API  
**Problema**: Nessun limite sul numero di richieste. L'endpoint di login è vulnerabile a brute force sulle credenziali.

**Fix**: Implementare rate limiting almeno sul login (es. max 5 tentativi/minuto per IP).

---

### 13. Nessuna protezione CSRF

**File**: tutte le route POST/DELETE  
**Problema**: Le richieste mutanti non verificano l'origine. Cookie `httpOnly` mitiga gli attacchi XSS, ma non CSRF cross-site.

**Fix**: Aggiungere verifica dell'header `Origin` o un token CSRF sulle operazioni mutanti.

---

### 14. `documents/route.js` non filtra per utente loggato

**File**: `app/api/documents/route.js`  
**Problema**: Filtra per `user_id` ricevuto dal client senza verificare che corrisponda alla sessione.

**Fix**: Usare `sessionUser.id` dalla sessione invece del parametro client.

---

### 15. Logout non invalida la sessione Supabase Auth

**File**: `app/api/logout/route.js`  
**Problema**: Il logout cancella solo il cookie locale ma non chiama `supabase.auth.signOut()`. La sessione Supabase rimane attiva.

**Fix**: Aggiungere chiamata a `supabase.auth.signOut()` prima di cancellare il cookie.

---

## BASSI / QUALITÀ

### 16. Struttura delle risposte API inconsistente

**File**: varie API  
**Problema**: Alcune route restituiscono `{ data }`, altre `{ user }`, altre `{ success, data }`. Rende difficile gestire gli errori in modo uniforme nel frontend.

**Fix**: Standardizzare su `{ success: boolean, data?: any, error?: string }`.

---

### 17. `condomini_max` letto dal body in `submit-data`

**File**: `app/api/submit-data/route.js:37`  
**Problema**: `user.condomini_max` arriva dal client. Un utente può gonfiare il valore per aggirare il limite di condomini.

**Fix**: Leggere `condomini_max` dal DB (`profiles`) usando l'ID dalla sessione, non dal body.

---

### 18. Struttura risposta `get-condomini` espone colonne interne

**File**: `app/api/get-condomini/route.js`  
**Problema**: La `select("*")` sulla tabella `condomini` restituisce tutte le colonne al client, incluse colonne che potrebbero non servire al frontend.

**Fix**: Selezionare esplicitamente solo le colonne necessarie.

---

## Riepilogo per priorità

| Priorità | N° problemi | Tempo stimato |
|---|---|---|
| Critici | 5 | ~6 ore |
| Alti | 5 | ~5 ore |
| Medi | 4 | ~4 ore |
| Bassi/Qualità | 3 | ~2 ore |
| **Totale** | **17** | **~17 ore** |

**Azione più impattante**: aggiungere la lettura del cookie di sessione in ogni route API risolve i problemi 1, 3, 4, 5, 6, 7, 8, 14 in un colpo solo.
