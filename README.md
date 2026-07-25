# Viaura — Signature Perfumes for Men / Women / Kids

Poora stack: **React (Vite)** frontend + **Express** backend + **Supabase (Postgres + Storage)** database, sab **ek hi Vercel project** mein deploy hota hai.

## ✨ Features
- Men / Women / Kids collections, dynamic categories
- Product catalog: sizes/volumes, colors, discount price, stock, images (Supabase Storage)
- Guest checkout — customers login nahi karte, sirf admin ka login hai
- Repeat customer automatically phone number se track hoti hai
- Customer reviews (guest — login zaroori nahi)
- Cash on Delivery (COD), fixed delivery charge Rs. 250
- Order tracking: pending → processing → shipped → delivered → completed, ya returned
- Admin panel + WhatsApp click-to-send notifications
- Customer + admin ko automatic email (order confirm / delivered / completed)
- Har jagah **auto-refresh (polling)** — real-time jaisa hi feel, koi WebSocket/Socket.io nahi (isliye Vercel serverless par bhi bina kisi masle ke chalta hai)

## 🗂️ Project Structure
```
viaura/
  api/index.js       → Vercel serverless function entry (Express app ko wrap karta hai)
  server/             → Express app source (app.js = routes, server.js = local dev runner)
  client/              → React (Vite) frontend
  supabase-schema.sql  → Database schema (Supabase SQL Editor mein run karein)
  vercel.json           → Vercel build/route config
  package.json          → root deps (Vercel /api function ke liye)
```

## 🚀 Setup

### 1. Supabase Project Banayein
1. https://supabase.com par free account banayein, "New Project" banayein
2. Project ready hone ke baad, left sidebar → **SQL Editor** → naya query
3. `supabase-schema.sql` file ka poora content paste karein → **Run**
4. Left sidebar → **Storage** → **New bucket** → naam `uploads` → **Public bucket** ON → Create
5. Left sidebar → **Settings** → **API** → yahan se copy karein:
   - `Project URL` → `SUPABASE_URL`
   - `service_role` key (secret wala, `anon` wala nahi!) → `SUPABASE_SERVICE_ROLE_KEY`

### 2. Backend Setup (Local)
```bash
cd server
npm install
```
`.env.example` ko copy karke `.env` naam se save karein, `SUPABASE_URL` aur `SUPABASE_SERVICE_ROLE_KEY` bharein.

Admin account banane ke liye (sirf ek dafa):
```bash
npm run seed:admin
```

Server chalayein:
```bash
npm run dev
```

### 3. Frontend Setup (Local)
```bash
cd client
npm install
npm run dev
```
Site `http://localhost:5173` par khulegi, admin login: `http://localhost:5173/admin/login`

## 📦 Vercel Par Deploy Karna (Single Project)

1. Project ko GitHub par push karein (poora `viaura` folder)
2. [vercel.com](https://vercel.com) par GitHub se sign up/login karein
3. **Add New** → **Project** → apni repository select karein
4. **Root Directory**: khali chodein (repo ki root — kyunke `vercel.json` root mein hai)
5. **Environment Variables** mein ye add karein:
   - `SUPABASE_URL`
   - `SUPABASE_SERVICE_ROLE_KEY`
   - `JWT_SECRET`
   - `ADMIN_NAME`, `ADMIN_EMAIL`, `ADMIN_PASSWORD`, `ADMIN_PHONE`
   - `DELIVERY_CHARGE` (250)
   - `FREE_DELIVERY_THRESHOLD` (0)
   - `EMAIL_USER`, `EMAIL_PASS` (agar email notifications chahiye)
6. **Deploy** dabayein — 2-3 minute mein poori site (frontend + backend `/api` sab) ek hi URL par live ho jayegi (jese `https://viaura.vercel.app`)
7. Live admin account banane ke liye, apne PC se (locally) ye chalayein — `.env` mein wahi `SUPABASE_URL`/`SUPABASE_SERVICE_ROLE_KEY` daal kar jo Vercel mein daale:
   ```bash
   cd server
   npm run seed:admin
   ```
   (Ye seedha Supabase database mein likhta hai, isliye local se chalana Vercel ke live app ke liye bhi kaam karta hai — koi alag "Vercel shell" ki zaroorat nahi)

**Bas itna hi — koi Render, Back4App, ya alag backend hosting ki zaroorat nahi. Sab Vercel ke ek hi free project mein chal jata hai**, kyunke koi persistent WebSocket connection ki zaroorat nahi (real-time updates polling se hoti hain).

## 📧 Email Notifications (FREE Setup)
1. Apna Gmail account kholein → https://myaccount.google.com/apppasswords
2. Naya App Password generate karein (App name: "Viaura")
3. `EMAIL_USER` = apna Gmail address, `EMAIL_PASS` = 16-char app password
4. Agar khali chodein to emails skip ho jayengi, error nahi aayega

Automatic emails: order place hone par, "Delivered" hone par, "Completed" hone par (customer ko), aur naya order aane par (admin ko).

## 📲 Admin WhatsApp Notifications
Orders tab mein har order ke sath do buttons:
- **Notify Admin (Self)** — apne number pe reminder
- **Message Customer on WhatsApp** — customer ke delivery number par confirmation (click-to-send, free)

## 💵 Delivery Charges
`DELIVERY_CHARGE=250` (Vercel Environment Variables mein). `FREE_DELIVERY_THRESHOLD` set karein to us amount se upar free delivery ho jayegi.

## 🔐 Order Status Flow
`pending → processing → shipped → delivered → completed`, alag se `returned` (stock wapis add ho jata hai) ya `cancelled`
