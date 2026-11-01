# GEN LABS — Interactive Science & STEM Platform

## Cara Menjalankan Local Development (Host)

Cukup pilih **salah satu** cara termudah di bawah ini:

### Cara 1: Dobel Klik (Paling Cepat di Windows)
Dobel klik file **`dev.bat`** di folder root `d:\GENLABS`.

### Cara 2: Lewat Terminal / Command Prompt
Buka terminal di root project (`d:\GENLABS`) lalu jalankan:
```bash
npm run dev
```
*(atau `node dev.js` / `.\dev.bat` / `.\dev.ps1`)*

Perintah di atas otomatis menjalankan:
1. **Laravel Backend API:** `http://127.0.0.1:8000` (SQLite terpasang otomatis)
2. **Next.js Frontend Web:** `http://localhost:3000`

---

## URL Akses Cepat

| Halaman | URL Localhost |
|---|---|
| **Beranda & Simulasi** | [http://localhost:3000](http://localhost:3000) |
| **Eksplorasi Kurikulum & Kelas** | [http://localhost:3000/explore](http://localhost:3000/explore) |
| **Portal Admin Modul** | [http://localhost:3000/admin](http://localhost:3000/admin) |
| **Backend API Direct** | [http://127.0.0.1:8000/api](http://127.0.0.1:8000/api) |
| **Cek Opsi Kurikulum Backend** | [http://127.0.0.1:8000/api/curriculum/options](http://127.0.0.1:8000/api/curriculum/options) |

Tekan **Ctrl + C** di terminal untuk menghentikan kedua server secara bersamaan.
