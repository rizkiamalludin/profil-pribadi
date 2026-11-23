# Website Profil — M. Rizki Amalludin

Website portfolio statis yang di-deploy melalui Vercel dan menggunakan Supabase untuk konten publik serta pesan.

## Struktur
- \`index.html\` — halaman profil dan ringkasan proyek.
- \`project.html\` — detail proyek berdasarkan slug Supabase.
- \`journal.html\` dan \`article.html\` — daftar dan detail artikel yang berstatus published.
- \`admin.html\` — dashboard pemilik untuk mengelola konten, inbox, moderasi, dan sinkronisasi GitHub.
- \`backend.js\` — klien browser dengan publishable key Supabase.
- \`site.js\` — rendering data, bahasa, tema, formulir, dan aktivitas GitHub.
- \`style.css\` — desain responsif.

## Backend
Proyek Supabase: \`qkexfgadhtnkgzdfbcnf\`.

Website hanya menggunakan Supabase publishable key di browser. Jangan pernah memasukkan service-role key atau secret key ke file publik. Tabel database menggunakan Row Level Security; pengiriman kontak, guestbook, dan komentar dilakukan melalui Edge Function \`profile-public-api\` yang memiliki validasi, honeypot, batas ukuran, CORS, dan rate limiting.

Pesan kontak masuk ke tabel privat \`contact_messages\` dan dapat dibaca dari dashboard pemilik. Notifikasi email otomatis belum dikonfigurasi.

## Menulis artikel
Masuk ke \`/admin.html\`, buat konten bertipe \`blog\`, isi judul dan isi versi Indonesia/Inggris, lalu simpan sebagai draft. Terbitkan setelah isi diperiksa. Artikel yang dipublikasikan akan tampil di \`journal.html\`.

## Autentikasi admin
Akses dashboard dibatasi ke email pemilik di kode admin dan kebijakan database. Email OTP harus dikonfigurasi di Supabase Auth. Google OAuth memerlukan Client ID/Secret yang dikonfigurasi langsung di dashboard Supabase, bukan di repository.

## Keamanan dan privasi
- Jangan publikasikan password, OTP, access token, API secret, alamat rumah, atau nomor pribadi.
- Hindari mengirim data sensitif melalui guestbook atau kolom komentar.
- Jangan mempromosikan branch ini ke produksi sebelum preview diuji dan pemilik menyetujui rilis.
