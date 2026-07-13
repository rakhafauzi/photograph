# Debug Session: portfolio-upload-500 [OPEN]

## Ringkasan
- Gejala: sebagian upload gambar pada portfolio gagal dengan notifikasi `Internal Server Error`.
- Target: temukan penyebab runtime berbasis evidence, lalu lakukan perbaikan minimal.

## Hipotesis
1. Middleware upload menolak file tertentu karena mime type atau ukuran file.
2. Proses transformasi image di server gagal pada file tertentu saat diproses `sharp`.
3. Path/folder tujuan upload `portfolio` gagal dibuat atau file gagal ditulis.
4. Payload request dari admin tidak selalu mengirim field upload yang sesuai.
5. Format file tertentu seperti `heic/jfif/webp` lolos dari browser tetapi gagal diproses backend.

## Rencana Evidence
- Audit alur upload portfolio di client dan endpoint upload di server.
- Tambahkan instrumentation log pada titik request masuk, validasi file, dan hasil pemrosesan file.
- Reproduksi upload gagal dan baca log runtime.
- Tentukan hipotesis yang terbukti.
- Terapkan fix minimal, lalu verifikasi ulang.

## Status
- Instrumentation runtime aktif pada `upload.ts`, `upload.controller.ts`, dan `errorHandler.ts`.
- Evidence awal terkumpul dari reproduksi `image/heic`.

## Evidence
- Reproduksi ke endpoint `POST /api/upload/single` dengan file bertipe `image/heic` menghasilkan `500 Internal Server Error`.
- Response body menyertakan error asli: `Invalid file type. Only JPEG, PNG, WebP, and GIF are allowed.`
- Debug log membuktikan file gagal di `middlewares/upload.ts:fileFilter:reject`, sebelum masuk ke proses `sharp`.
- Debug log error handler membuktikan error jatuh sebagai `Error` biasa, sehingga di-mapping ke `500` global.

## Kesimpulan Sementara
- Hipotesis 1 terbukti: file tertentu ditolak oleh filter mime.
- Hipotesis 2 dan 3 tidak terbukti untuk kasus ini karena request gagal sebelum metadata `sharp` atau write file.
- Perbaikan minimal: ubah handling error upload agar mengembalikan `400` yang jelas, dan cegah request unsupported file dari client.

## Fix
- Server: `errorHandler` sekarang mengubah error upload unsupported mime menjadi `400 Bad Request` dengan pesan yang jelas.
- Server: `errorHandler` juga mengubah `LIMIT_FILE_SIZE` menjadi pesan `Ukuran file terlalu besar. Maksimal 5MB.`
- Client: `FileUpload` sekarang memvalidasi mime type sebelum request dikirim dan menampilkan pesan ramah pengguna.

## Verifikasi
- Pre-fix: request upload `image/heic` ke `/api/upload/single` menghasilkan `500 Internal Server Error`.
- Post-fix: request yang sama menghasilkan `400 Bad Request` dengan pesan `Format file tidak didukung. Gunakan JPG, PNG, WebP, atau GIF.`
- Debug log tetap menunjukkan titik gagal yang sama di `middlewares/upload.ts:fileFilter:reject`, sehingga penyebab root tetap konsisten, hanya mapping error yang sekarang benar.
- Build frontend berhasil setelah perubahan.

## Lanjutan: Support HEIC
- User meminta dukungan HEIC/HEIF, bukan hanya error handling yang lebih jelas.
- Evidence runtime tambahan menunjukkan `sharp` di environment ini berhasil membaca file HEIC nyata (`format: heif`, metadata terbaca normal), tetapi gagal saat `toFile(...webp)` dengan error decoder plugin HEIF tidak tersedia.
- Root cause final: environment `sharp/libvips` pada mesin ini tidak punya decoder HEIF lengkap untuk beberapa file `HEIC/HEIF`, sehingga pipeline konversi langsung ke `.webp` tidak selalu bisa dipakai.

## Fix Lanjutan
- Server: `upload.controller.ts` sekarang menambahkan fallback khusus `HEIC/HEIF` pada macOS.
- Alur fallback: jika konversi langsung `sharp(...).webp()` gagal untuk file `.heic/.heif`, server akan mengonversi file sumber ke JPEG sementara via `sips`, lalu melanjutkan kompresi ke `.webp` memakai `sharp`.
- Cleanup file sementara fallback dilakukan otomatis setelah proses selesai.
- Jalur yang sama dipakai untuk `uploadSingle` dan `uploadMultipleFiles`, sehingga perilaku upload portfolio tetap konsisten.

## Verifikasi Lanjutan
- Reproduksi ulang pada `POST /api/upload/single` dengan file `heic-small-56813.heic` di server dev `http://127.0.0.1:5002`.
- Hasil post-fix: response `200 OK` dengan payload file hasil `/uploads/portfolio/8aca36c9-c47f-43a4-a260-e951441d55ef.webp`.
- Debug log post-fix menunjukkan urutan `fileFilter:accept` -> `uploadSingle:entry` -> `uploadSingle:metadata` -> `uploadSingle:convert` -> `uploadSingle:success`.
- Debug log tidak lagi berhenti di `middlewares/errorHandler.ts:errorHandler` untuk reproduksi file HEIC kecil yang sama.

## Iterasi JPG
- User melaporkan masih ada file `JPG/JPEG` tertentu yang tetap memunculkan `Internal Server Error`.
- Karena bukti file asli belum tersedia di runtime log, diterapkan fallback defensif tambahan: bila optimasi `sharp` gagal untuk `.jpg/.jpeg/.png/.webp/.jfif`, server akan menyimpan file asli agar upload tidak gagal total.
- Jalur `HEIC/HEIF` tetap memakai fallback `sips -> JPEG -> WebP`; fallback file asli hanya dipakai untuk format yang lazim didukung browser.
- Verifikasi regresi: upload `JPG` sampel ke `POST /api/upload/single` pada server dev `http://127.0.0.1:5002` menghasilkan `200 OK` dan file tetap berhasil tersimpan.
