# 📸 Photography Booking System

Sistem booking fotografi modern yang memungkinkan klien untuk memesan layanan fotografi dan fotografer untuk mengelola booking mereka.

## 📋 Daftar Isi

- [Fitur](#fitur)
- [Tech Stack](#tech-stack)
- [Prerequisites](#prerequisites)
- [Instalasi](#instalasi)
- [Setup Database](#setup-database)
- [Menjalankan Aplikasi](#menjalankan-aplikasi)
- [Struktur Proyek](#struktur-proyek)
- [API Documentation](#api-documentation)
- [Contributing](#contributing)
- [License](#license)

## ✨ Fitur

### 👥 Client (Frontend)
- 🎨 Interface modern dengan Tailwind CSS
- 📱 Responsive design untuk semua perangkat
- 🔐 Autentikasi dan autorisasi user
- 📅 Booking management yang mudah digunakan
- 💳 Integrasi payment gateway (ready)
- 🔔 Real-time notifications
- 📊 Dashboard user dengan statistik booking
- 🖼️ Portfolio photographer showcase

### 🖥️ Server (Backend)
- 🛡️ Security best practices (Helmet, CORS, Rate Limiting)
- 🔑 JWT authentication dengan token refresh
- 🗄️ PostgreSQL dengan Prisma ORM
- 📤 Image upload & processing dengan Sharp
- 🔒 Password encryption dengan bcryptjs
- ✅ Input validation dengan Zod
- 📧 Email notification system ready
- 🔍 Advanced search & filtering

## 🛠️ Tech Stack

### Frontend
- **Framework**: React 19
- **Build Tool**: Vite
- **Styling**: Tailwind CSS
- **UI Components**: Radix UI
- **State Management**: TanStack Query (React Query)
- **HTTP Client**: Axios
- **Forms**: React Hook Form
- **Routing**: React Router v7
- **Validation**: Zod
- **Animation**: Framer Motion
- **Icons**: Lucide React
- **Notifications**: Sonner

### Backend
- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: PostgreSQL
- **ORM**: Prisma
- **Authentication**: JWT (jsonwebtoken)
- **Password Hashing**: bcryptjs
- **File Upload**: Multer
- **Image Processing**: Sharp
- **Validation**: Zod
- **Security**: Helmet, CORS, Express Rate Limit
- **Development**: tsx (TypeScript execution)
- **Language**: TypeScript (98.8% of codebase)

## 📋 Prerequisites

- Node.js (v18 atau lebih tinggi)
- npm atau yarn
- PostgreSQL database (v12+)
- Git

## 🚀 Instalasi

### 1. Clone Repository
```bash
git clone https://github.com/rakhafauzi/photograph.git
cd photograph
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Setup Environment Variables

Buat file `.env` di `apps/server`:
```env
# Database
DATABASE_URL="postgresql://user:password@localhost:5432/fotografi"

# JWT
JWT_SECRET="your-secret-key-here"
JWT_REFRESH_SECRET="your-refresh-secret-key"

# Server
PORT=3000
NODE_ENV="development"

# Multer (Upload)
UPLOAD_DIR="uploads"
MAX_FILE_SIZE=5242880  # 5MB in bytes

# CORS
CORS_ORIGIN="http://localhost:5173"
```

Buat file `.env` di `apps/client`:
```env
VITE_API_URL="http://localhost:3000"
```

## 🗄️ Setup Database

### 1. Push Schema ke Database
```bash
npm run db:push
```

### 2. Generate Prisma Client
```bash
npm run db:generate
```

### 3. (Opsional) Seed Database
```bash
npm run db:seed
```

### 4. (Opsional) Buka Prisma Studio untuk Visualisasi
```bash
npm run db:studio
```

## ⚙️ Menjalankan Aplikasi

### Development Mode
Menjalankan server dan client secara bersamaan:
```bash
npm run dev
```

Atau jalankan secara terpisah:
```bash
npm run dev:server  # Terminal 1 - Server akan berjalan di http://localhost:3000
npm run dev:client  # Terminal 2 - Client akan berjalan di http://localhost:5173
```

### Production Build
```bash
npm run build
```

### Production Run
```bash
npm run start
```

## 📁 Struktur Proyek

```
photograph/
├── apps/
│   ├── server/              # Backend Express.js
│   │   ├── src/
│   │   │   ├── index.ts
│   │   │   ├── routes/
│   │   │   ├── controllers/
│   │   │   ├── middleware/
│   │   │   ├── utils/
│   │   │   ├── types/
│   │   │   └── prisma/
│   │   │       └── schema.prisma
│   │   ├── package.json
│   │   └── tsconfig.json
│   └── client/              # Frontend React
│       ├── src/
│       │   ├── components/
│       │   ├── pages/
│       │   ├── hooks/
│       │   ├── services/
│       │   ├── types/
│       │   ├── styles/
│       │   └── App.tsx
│       ├── package.json
│       ├── tsconfig.json
│       └── vite.config.ts
├── package.json             # Root workspace
└── README.md
```

## 📚 API Documentation

### Authentication Endpoints
- `POST /api/auth/register` - Daftar user baru
- `POST /api/auth/login` - Login user
- `POST /api/auth/refresh` - Refresh JWT token
- `POST /api/auth/logout` - Logout user
- `GET /api/auth/profile` - Dapatkan profil user (Auth required)

### Photographers Endpoints
- `GET /api/photographers` - Daftar semua fotografer
- `GET /api/photographers/:id` - Detail fotografer
- `POST /api/photographers` - Buat profil fotografer (Auth required)
- `PUT /api/photographers/:id` - Update profil fotografer (Auth required)
- `GET /api/photographers/:id/portfolio` - Portfolio fotografer

### Bookings Endpoints
- `GET /api/bookings` - Daftar booking user (Auth required)
- `POST /api/bookings` - Buat booking baru (Auth required)
- `GET /api/bookings/:id` - Detail booking (Auth required)
- `PUT /api/bookings/:id` - Update booking (Auth required)
- `DELETE /api/bookings/:id` - Cancel booking (Auth required)
- `PUT /api/bookings/:id/status` - Update booking status (Auth required)

### Reviews Endpoints
- `GET /api/reviews` - Daftar review
- `POST /api/bookings/:id/reviews` - Buat review untuk booking (Auth required)

## 🤝 Contributing

Kami menerima kontribusi! Berikut cara berkontribusi:

1. Fork repository ini
2. Buat branch fitur (`git checkout -b feature/AmazingFeature`)
3. Commit perubahan (`git commit -m 'Add some AmazingFeature'`)
4. Push ke branch (`git push origin feature/AmazingFeature`)
5. Buat Pull Request

### Coding Standards
- Gunakan TypeScript untuk type safety
- Ikuti naming conventions yang konsisten
- Tambahkan tests untuk fitur baru
- Update documentation sesuai perubahan

## 📝 License

Proyek ini belum memiliki lisensi. Hubungi owner untuk informasi lebih lanjut.

## 📧 Contact & Support

- **GitHub**: [@rakhafauzi](https://github.com/rakhafauzi)
- **Repository**: [rakhafauzi/photograph](https://github.com/rakhafauzi/photograph)
- **Issues**: [GitHub Issues](https://github.com/rakhafauzi/photograph/issues)

---

**Dibuat dengan ❤️ oleh Rakha Fauzi**

*Last Updated: 2026-07-14*
