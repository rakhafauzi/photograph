# 🚀 Deployment Guide — Fotografi Booking System

Panduan untuk mendeploy aplikasi ke **Railway** atau **Render**.

---

## 📋 Prasyarat

1. **GitHub repository** — push kode ke GitHub dulu
2. **Akun** di [Railway](https://railway.app) atau [Render](https://render.com)
3. **Domain** (opsional) — bisa pakai domain bawaan *.railway.app / *.onrender.com

---

## 🚄 Opsi A: Deploy ke Railway (Rekomendasi)

### Step 1: Push ke GitHub
```bash
git init
git add .
git commit -m "Initial commit"
git remote add origin https://github.com/username/repo-name.git
git push -u origin main
```

### Step 2: Deploy di Railway

1. Buka [railway.app](https://railway.app) → **New Project**
2. Pilih **Deploy from GitHub repo**
3. Pilih repository Anda
4. Railway auto-detect konfigurasi dari `railway.json`

### Step 3: Setting Environment Variables

Di dashboard Railway, buka project → **Variables**, tambahkan:

| Variable | Value | Keterangan |
|----------|-------|------------|
| `NODE_ENV` | `production` | Mode production |
| `PORT` | `5000` | Port server |
| `DATABASE_URL` | `file:/data/production.db` | SQLite di persistent volume |
| `JWT_SECRET` | *(random string)* | Generate dengan `openssl rand -hex 32` |
| `JWT_REFRESH_SECRET` | *(random string)* | Generate dengan `openssl rand -hex 32` |
| `JWT_EXPIRES_IN` | `15m` | |
| `JWT_REFRESH_EXPIRES_IN` | `7d` | |
| `CORS_ORIGIN` | `https://your-app.railway.app` | Domain Railway Anda |
| `UPLOAD_DIR` | `/data/uploads` | Upload folder di persistent volume |

### Step 4: Setup Persistent Volume

1. Di Railway dashboard → **Storage** → **Create Volume**
2. Mount path: `/data`
3. Volume ini akan menyimpan **SQLite database** dan **file uploads**

### Step 5: Deploy

Railway akan otomatis membuild dan mendeploy. Lihat logs untuk memastikan sukses.

> **Catatan:** Database akan otomatis dibuat dan schema di-push saat server pertama kali jalan. Tidak perlu langkah manual tambahan.

### Step 6: Seed Data (Opsional)

Jika ingin mengisi data awal (admin user, kategori, dll), jalankan di Railway dashboard → **Shell**:
```bash
cd apps/server && npx tsx src/prisma/seed.ts
```

### Step 7: Akses Aplikasi

- Buka URL yang diberikan Railway (biasanya `https://<app-name>.railway.app`)
- Akses `/admin/login` untuk ke admin panel
- Cek health check di `/api/health`

---

## 🖥️ Opsi B: Deploy ke Render

### Step 1: Push ke GitHub (sama seperti di atas)

### Step 2: Buat Web Service di Render

1. Buka [render.com](https://render.com) → **New Web Service**
2. Hubungkan GitHub repository
3. Konfigurasi:
   - **Name**: `fotografi-booking`
   - **Root Directory**: *biarkan kosong*
   - **Runtime**: `Node`
   - **Build Command**: `npm install && npm run build`
   - **Start Command**: `node apps/server/dist/index.js`

### Step 3: Environment Variables

Di Render dashboard → **Environment**, tambahkan variabel yang sama seperti di tabel di atas.

### Step 4: Setup Disk

1. Render dashboard → **Disks** → **Add Disk**
2. Mount path: `/data`
3. Size: 1 GB (cukup untuk database + foto)

Update `DATABASE_URL` menjadi `file:/data/production.db`
Update `UPLOAD_DIR` menjadi `/data/uploads`

### Step 5: Deploy

Klik **Create Web Service** atau **Manual Deploy** → **Deploy latest commit**.

> **Catatan:** Database akan otomatis dibuat dan schema di-push saat server pertama kali jalan.

---

## 🔄 Update Aplikasi

Setelah deploy, setiap push ke GitHub:
- **Railway**: auto-deploy otomatis
- **Render**: auto-deploy (aktifkan di Settings → Auto-Deploy)

### Update Manual
```bash
git add .
git commit -m "Update fitur"
git push
```

---

## 🔧 Troubleshooting

### Database Error
```bash
# Cek logs di Railway/Render dashboard
# Pastikan persistent volume sudah ter-mount dengan benar
# DATABASE_URL harus mengarah ke path volume (/data/production.db)
```

### File Upload Error
```bash
# Pastikan UPLOAD_DIR mengarah ke path volume (/data/uploads)
# Pastikan volume punya cukup space
# Cek logs: server akan auto-buat folder uploads saat startup
```

### 404 After Deploy
```bash
# Pastikan client sudah dibuild (npm run build) — Railway/Render auto-build
# Cek apakah client/dist/ folder ada di logs build
# Pastikan NODE_ENV=production sudah di-set di environment variables
```

### 502 Bad Gateway
```bash
# Restart service di Railway/Render dashboard
# Cek logs untuk error detail
# Pastikan port sudah sesuai (PORT=5000)
```

---

## 📦 Struktur Production

```
Server (Railway/Render)
├── Node.js Express API (:5000)
│   ├── /api/* — REST API endpoints
│   └── /* — React SPA (static files)
├── SQLite Database (/data/production.db)
└── Uploads (/data/uploads/)
    ├── portfolio/
    ├── package/
    ├── testimonial/
    ├── payment/
    ├── logo/
    └── general/
```

---

## 💰 Estimasi Biaya

| Platform | Biaya | Free Tier |
|----------|-------|-----------|
| **Railway** | ~$5-7/bln | Starter plan $5/bln |
| **Render** | ~$7/bln | Individual plan $7/bln |

Keduanya punya free credits untuk trial.
