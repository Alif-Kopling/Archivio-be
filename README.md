# 🗄️ Archivio — Backend (Project 2: E-Arsip Dokumen Kantor)

> RESTful API untuk sistem manajemen dokumen digital **E-Arsip** dengan autentikasi JWT dan kontrol akses berbasis peran. Backend ini menangani penyimpanan file fisik, manajemen database, dan integrasi pengiriman email.

---

## 🧩 Tech Stack

| Teknologi | Versi | Keterangan |
|---|---|---|
| [Node.js](https://nodejs.org/) | >= 18 | Runtime JavaScript utama |
| [Express.js](https://expressjs.com/) | 5.2.1 | Web framework untuk routing & middleware |
| [Prisma ORM](https://www.prisma.io/) | 5.22.0 | Database ORM untuk MySQL |
| [MySQL](https://www.mysql.com/) | - | Database relasional utama |
| [JWT](https://jwt.io/) | 9.0.3 | Autentikasi berbasis token (Stateless) |
| [Bcrypt](https://github.com/kelektiv/node.bcrypt.js) | 6.0.0 | Enkripsi password pengguna |
| [Multer](https://github.com/expressjs/multer) | 2.1.1 | Middleware untuk upload file digital |
| [Nodemailer](https://nodemailer.com/) | 8.0.6 | Layanan pengiriman email SMTP |

---

## 🗃️ Database Schema (Prisma Models)

- **User**: Menyimpan data pengguna, password (hash), dan role (`ADMIN`/`STAFF`).
- **Document**: Inti dari sistem arsip. Menyimpan metadata dokumen, path file, tipe (`masuk`/`keluar`/`sertifikat`), dan status (`draft`/`final`/`rejected`).
- **Setting**: Penyimpanan konfigurasi sistem (key-value pair).

---

## 📂 Struktur Direktori

```
Backend/
├── prisma/
│   ├── schema.prisma        # Definisi model database & koneksi
│   └── migrations/          # Riwayat migrasi database MySQL
├── src/
│   ├── app.js               # Konfigurasi Express & Middleware Global
│   ├── config/              # Konfigurasi Database (Prisma Client)
│   ├── controllers/         # Logika Bisnis per Modul
│   │   ├── auth.controller.js          # Registrasi & Login
│   │   ├── user.controller.js          # Manajemen akun pengguna
│   │   ├── suratMasuk.controller.js    # Manajemen Arsip Surat Masuk
│   │   ├── suratKeluar.controller.js   # Manajemen Arsip Surat Keluar
│   │   ├── sertifikat.controller.js    # Manajemen Arsip Sertifikat
│   │   └── setting.controller.js       # Manajemen Pengaturan Sistem
│   ├── middlewares/         # Proteksi Route
│   │   ├── auth.middleware.js          # Verifikasi Token JWT
│   │   ├── role.middleware.js          # Validasi Hak Akses Role
│   │   └── upload.middleware.js        # Konfigurasi Multer (Storage & Filter)
│   ├── routes/              # Definisi Endpoint API
│   ├── services/            # Abstraksi Database (Prisma Services)
│   └── utils/               # Helper (Status document, Penamaan file)
├── uploads/                 # Folder penyimpanan file fisik (PDF/Docs)
└── package.json
```

---

## 🚀 Cara Menjalankan

### 1. Konfigurasi Environment (`.env`)

Buat file `.env` di folder root Backend:

```env
DATABASE_URL="mysql://USER:PASSWORD@localhost:3306/archivio_db"
JWT_SECRET="masukkan_secret_yang_kuat"
PORT=3000

# Konfigurasi SMTP (Contoh Gmail)
SMTP_HOST="smtp.gmail.com"
SMTP_PORT=587
SMTP_USER="youremail@gmail.com"
SMTP_PASS="app_password_gmail"
```

### 2. Setup Database & Jalankan Server

```bash
# Install dependencies
npm install

# Generate Prisma Client & Jalankan Migrasi
npx prisma generate
npx prisma migrate dev --name init

# Jalankan server dalam mode development
npm run dev
```

---

## 🔒 Fitur Keamanan

- **Role-Based Access Control (RBAC)**: Menjamin Admin memiliki akses penuh sementara Staff memiliki akses terbatas.
- **Atomic File Deletion**: Saat data arsip dihapus dari database, file fisik di folder `uploads` juga akan dihapus secara otomatis.
- **Input Sanitization**: Validasi input metadata sebelum disimpan ke database.
- **Secure Download**: File didownload dengan nama asli yang tersimpan di metadata, bukan nama random dari storage.

---

## 📄 Lisensi
Proyek ini didistribusikan di bawah lisensi **ISC**.
