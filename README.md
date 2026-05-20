# KLOK Webapp — Vercel Deploy Gids

Werkgevers-dashboard voor KLOK Works. Next.js 15 + Supabase + Tailwind.

**Live URL doel:** `app.klok.works`

---

## ⚠️ Belangrijke realiteit-check eerst

Dit is een **starter project** — login + signup + dashboard skelet werken, maar shift/vacature features zijn placeholders die je nog moet uitbouwen met Cursor (zie `CURSOR-PROMPTS.md`).

**Wat werkt direct na deploy:**
- ✅ Homepage met landing
- ✅ Werkgever signup (maakt account in Supabase)
- ✅ Login
- ✅ Dashboard layout met sidebar
- ✅ Logout
- ✅ Auth-bescherming (redirect naar /login bij beschermde routes)

**Wat nog placeholders zijn:**
- 🚧 Shifts plaatsen (formulier met basis velden)
- 🚧 Shifts lijst (toont data uit Supabase)
- 🚧 Vacatures (basis weergave)
- 🚧 Pool en instellingen (basis weergave)

Maar het is **deploybaar als-is** en je kan vanaf daar uitbreiden in Cursor.

---

## 🚀 Deploy in 5 stappen (~20 min)

### Stap 1: Supabase database opzetten (5 min)

⚠️ **ZONDER DIT WERKT NIETS** — auth + database zijn essentieel.

1. Ga naar [supabase.com](https://supabase.com) → "Start your project"
2. Sign up met GitHub
3. **New project**:
   - Name: `klok-works`
   - Database password: kies een sterke (bewaar in 1Password!)
   - Region: **West EU (Frankfurt)** ← BELANGRIJK voor GDPR
   - Plan: Free
4. Wacht 2 min totdat klaar is
5. **SQL Editor** (links in sidebar) → **New query**
6. Open `sql/supabase-schema.sql` uit deze pack → kopieer ALLES → plak in Supabase → **Run**
7. Je ziet "Success" → database is klaar
8. Ga naar **Settings** (icoon links onder) → **API** → kopieer:
   - **Project URL** (begint met `https://xxxxxx.supabase.co`)
   - **anon public key** (lange `eyJ...` string)

### Stap 2: Code naar GitHub pushen (5 min)

1. Open **GitHub Desktop** op je PC
2. Pak de webapp folder uit deze ZIP
3. In GitHub Desktop: **File → Add Local Repository** → wijs naar de `webapp` folder
4. Klik **Publish repository**
   - Naam: `klok-webapp`
   - Beschrijving: "KLOK Works werkgevers-dashboard"
   - **Vink "Keep this code private" AAN**
5. Klik **Publish repository**

### Stap 3: Vercel deployen (5 min)

1. Ga naar [vercel.com](https://vercel.com) → log in (zelfde GitHub account)
2. **Add New** → **Project**
3. Import je `klok-webapp` repository
4. Framework Preset: **Next.js** (auto-detected)
5. **Environment Variables** sectie — voeg deze 2 toe:
   - Naam: `NEXT_PUBLIC_SUPABASE_URL` · Value: jouw Project URL uit stap 1.8
   - Naam: `NEXT_PUBLIC_SUPABASE_ANON_KEY` · Value: jouw anon key uit stap 1.8
6. Klik **Deploy**
7. Wacht 90 seconden — je krijgt een live URL: `klok-webapp-xxx.vercel.app`

**🎉 Webapp is nu live op een Vercel URL!**

### Stap 4: Subdomein `app.klok.works` koppelen (5 min)

1. In Vercel project: **Settings → Domains**
2. Type in: `app.klok.works` → **Add**
3. Vercel toont een DNS record (CNAME naar `cname.vercel-dns.com`)
4. Ga naar je domein-provider (waar je klok.works hebt gekocht)
5. In het DNS-paneel:
   - Type: **CNAME**
   - Name/Host: `app`
   - Value: `cname.vercel-dns.com`
   - TTL: `Auto` of `3600`
6. Sla op
7. Wacht 5-60 min — `app.klok.works` is live!

### Stap 5: Supabase configureren voor productie URL (2 min)

1. Terug naar Supabase → **Authentication → URL Configuration**
2. **Site URL**: `https://app.klok.works`
3. **Redirect URLs**: voeg toe:
   - `https://app.klok.works/**`
   - `http://localhost:3000/**` (voor lokaal ontwikkelen)
4. Klik **Save**

**KLAAR! 🎉**

---

## ✅ Test het

1. Ga naar `https://app.klok.works`
2. Klik **Account aanmaken**
3. Vul werkgevers-data in (gebruik echte email!)
4. Submit → je krijgt een verificatie-email van Supabase
5. Klik op de link in de email
6. Je belandt in `/dashboard`
7. Je ziet de werkgevers-dashboard layout

**Als dit werkt: alles staat correct.**

---

## 🐛 Veelvoorkomende problemen

### "Application error" na deploy
→ Environment variables ontbreken in Vercel.
→ Ga naar Vercel → Settings → Environment Variables → check beide keys.
→ Re-deploy via **Deployments → ... → Redeploy**

### "Invalid login credentials"
→ Email niet geverifieerd. Check je inbox + spam folder.
→ Of: Supabase Auth heeft "Confirm email" aan staan. Check **Authentication → Settings**.

### "Failed to fetch" of CORS error
→ Site URL in Supabase staat verkeerd.
→ Stap 5 nogmaals doen.

### Signup werkt maar geen redirect
→ Database trigger niet geladen.
→ Re-run de SQL schema in Supabase (vooral het `handle_new_user()` deel onderaan).

### "Module not found" bij Vercel build
→ Lokaal eerst testen: `npm install && npm run build`

---

## 🔄 Updates pushen

Elke wijziging in je code:
1. Edit bestanden lokaal in **Cursor**
2. **GitHub Desktop** → commit + push
3. Vercel deployt automatisch binnen 30 sec

---

## 🎨 KLOK styling gebruiken

In components, gebruik deze Tailwind classes:

```jsx
// Lime button
<button className="bg-lime text-ink px-4 py-2 rounded-md font-semibold hover:bg-lime-dark">
  Plaats shift
</button>

// KLOK logo
<div className="font-serif font-semibold text-2xl inline-flex items-baseline">
  KLOK<span className="inline-block w-2 h-2 bg-lime ml-1 -translate-y-px"></span>
</div>

// Heading
<h1 className="font-serif text-4xl font-medium tracking-tight">
  Welkom <em className="italic text-lime">terug.</em>
</h1>
```

---

## 🚀 Volgende stappen

Open `../docs/CURSOR-PROMPTS.md` voor 30+ kant-en-klare prompts om features toe te voegen.

---

🚀 KLOK Works · Het werk regelt zichzelf
