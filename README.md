# Personal Space — M. Rizki Amalludin

Website pribadi bilingual untuk memperkenalkan identitas, minat, pemikiran, puisi, pengalaman, dan aktivitas.

## Teknologi
- HTML, CSS, JavaScript vanilla (tanpa build step agar ringan).
- Vercel untuk hosting.
- Supabase untuk konten publik, puisi, artikel, dan formulir kontak.
- GitHub untuk versi kode.

## Halaman dan bagian
- Beranda, Tentang, Minat, Kompetensi, Pengalaman, Pencapaian.
- Puisi (konten bertipe `poetry` di Supabase).
- Jurnal (konten bertipe `blog`).
- Digital Garden, Playground, Now, Curated Library.
- Open for Discussion (formulir kontak).
- Admin di `/admin.html` untuk mengelola konten dan inbox.

## Mengelola puisi dan artikel
Masuk ke `/admin.html`, pilih jenis konten **Puisi** atau **Blog / Artikel**, simpan sebagai draft, periksa, lalu terbitkan. Konten publik hanya membaca baris berstatus `published`.

## Keamanan
- Browser menggunakan Supabase publishable key saja.
- Tidak ada service-role key di repository.
- Tabel tetap memakai Row Level Security; endpoint publik menangani pengiriman pesan.
- Jangan menaruh password, OTP, token, nomor pribadi, atau rahasia di file publik.

## Catatan
WhatsApp dan Discord belum ditautkan karena URL akun belum dikonfirmasi. Tautan sosial lain menggunakan akun yang sudah diketahui.
