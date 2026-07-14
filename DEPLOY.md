# 🚀 Deployment Guide — Fotografi Booking System

Panduan untuk mendeploy aplikasi ke **Railway** dengan **MySQL**.

---

## 📋 Prasyarat

1. **GitHub repository** — push kode ke GitHub dulu
2. **Akun** di [Railway](https://railway.app)
3. **Akun MySQL** — Railway akan otomatis menyediakan MySQL database
4. **Domain** (opsional) — bisa pakai domain bawaan *.railway.app

---

## 🚄 Deploy ke Railway

### Step 1: Push ke GitHub

```bash
# Init git (jika belum)
git init
git add .
git commit -m "Initial commit"

# Buat repo di GitHub dulu, lalu:
git remote add origin https://github.com/username/repo-name.git
git push -u origin main
```

### Step 2: Setup Project di Railway

1. Buka [railway.app](https://railway.app) → **New Project**
2. Pilih **Deploy from GitHub repo**
3. Pilih repository Anda
4. Railway akan auto-detect konfigurasi dari `railway.json`

### Step 3: Tambahkan MySQL Database

1. Di dashboard Railway project Anda, klik **New** → **Database** → **Add MySQL**
   - Jika tidak ada opsi MySQL, gunakan **Add Plugin** → cari "MySQL"
2. Railway akan otomatis membuat service MySQL

### Step 4: Environment Variables

Railway akan meng-inject `DATABASE_URL` secara otomatis dari service MySQL.
Tapi Anda tetap perlu menambahkan variabel lain:

Di dashboard Railway → **Variables**, tambahkan:

| Variable | Value | Keterangan |
|----------|-------|------------|
| `NODE_ENV` | `production` | Mode production |
| `PORT` | `5000` | Port server |
| `JWT_SECRET` | *(random string)* | Generate: `openssl rand -hex 32` |
| `JWT_REFRESH_SECRET` | *(random string)* | Generate: `openssl rand -hex 32` |
| `JWT_EXPIRES_IN` | `15m` | |
| `JWT_REFRESH_EXPIRES_IN` | `7d` | |
| `CORS_ORIGIN` | `https://app-name.railway.app` | Domain Railway Anda |
| `UPLOAD_DIR` | `/data/uploads` | Folder upload (pakai volume) |

> **⚠️ Penting:** `DATABASE_URL` akan otomatis diisi oleh Railway saat Anda menambahkan MySQL plugin. Jangan set manual — Railway akan override.

### Step 5: Setup Persistent Volume untuk Uploads

1. Railway dashboard → **Storage** → **Create Volume**
2. Mount path: `/data`
3. Volume ini akan menyimpan **file uploads** (foto portfolio, bukti pembayaran, dll)

Pastikan `UPLOAD_DIR=/data/uploads` sudah sesuai.

### Step 6: Deploy

Setelah semua konfigurasi, Railway akan otomatis build & deploy.
Cek **Logs** untuk memastikan sukses.

Proses build akan:
1. `npm install` — install dependencies
2. `npm run build` — build server (TypeScript + Prisma generate) dan client (Vite)
3. `node apps/server/dist/index.js` — start server

Server akan otomatis menjalankan `prisma db push` saat pertama kali startup.

### Step 7: Seed Data (Opsional)

Isi data awal (admin, kategori, paket, FAQ, dll) melalui Railway **Shell**:

```bash
cd apps/server && npx prisma db push && npx tsx src/prisma/seed.ts
```

Data yang akan di-seed:
- **Admin:** `admin@fotografi.com` / `admin123`
- **10 kategori** (Wedding, Wisuda, Prewedding, dll)
- **3 paket Wedding** (Basic, Medium, Premium)
- **5 FAQ**
- **70+ pengaturan website**

### Step 8: Akses Aplikasi

- Buka URL Railway: `https://app-name.railway.app`
- Admin panel: `/admin/login`
- Health check: `/api/health`

---

## 🔄 Update Aplikasi

Setelah deploy, setiap push ke GitHub akan **auto-deploy**:

```bash
git add .
git commit -m "Update fitur baru"
git push
```

Railway akan otomatis build & deploy versi terbaru.

---

## 🔧 Troubleshooting

### Database Connection Error
```bash
# Cek apakah MySQL service sudah running di Railway dashboard
# Pastikan DATABASE_URL terisi otomatis (cek di Variables)
# Cek logs: error biasanya muncul di awal startup
# Format DATABASE_URL Railway: mysql://user:password@host:port/database
```

### File Upload Error
```bash
# Pastikan volume sudah ter-mount di /data
# Pastikan UPLOAD_DIR=/data/uploads
# Cek logs: server auto-create folder uploads saat startup
# Cek kapasitas volume di Railway Storage
```

### 404 / Halaman Tidak Muncul
```bash
# Pastikan build berhasil: cek apakah apps/client/dist/ ada
# Pastikan NODE_ENV=production sudah di-set
# Cek logs build — cari error di Vite build
```

### 502 Bad Gateway
```bash
# Restart service di Railway dashboard
# Cek logs untuk error detail
# Pastikan port sudah sesuai (PORT=5000)
# Cek memory usage — kemungkinan perlu upgrade plan
```

---

## Structur Production

```
Railway
├── Web Service (Node.js Express)
│   ├── /api/* — REST API endpoints
│   └── /* — React SPA (served as static files)
├── MySQL Database (Railway Plugin)
└── Persistent Volume (/data)
    └── uploads/
        ├── portfolio/
        ├── package/
        ├── testimonial/
        ├── payment/
        ├── logo/
        └── general/
```

---

## 💰 Estimasi Biaya (Railway)

| Komponen | Harga |
|----------|-------|
| Starter Plan | ~$5/bulan |
| MySQL Database | Termasuk dalam Starter |
| Persistent Volume (1GB) | ~$0.25/bulan |
| **Total** | **~$5-6/bulan** |

> Railway Starter Plan ($5/bulan) sudah cukup untuk production skala kecil.
> Trial: dapat $5 free credits untuk testing.
