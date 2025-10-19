# Stellar Crowdfunding dApp dengan Gamifikasi Tamagochi

Ini adalah aplikasi terdesentralisasi (dApp) untuk crowdfunding yang dibangun di atas jaringan Stellar. Proyek ini menggunakan smart contract yang ditulis dengan Rust & Soroban dan antarmuka (front-end) yang dibangun dengan React, Vite, dan TypeScript.

Aplikasi ini tidak hanya berfungsi sebagai platform donasi, tetapi juga mengintegrasikan elemen gamifikasi untuk meningkatkan keterlibatan pengguna. Setiap donatur memiliki "Tamagochi" pribadi yang berevolusi berdasarkan kontribusi mereka, serta fitur-fitur menarik lainnya seperti papan peringkat dan "donation streak".

## ✨ Fitur Utama

- **Kampanye Crowdfunding Dinamis**: Pengguna dapat melihat status kampanye secara real-time, termasuk progres donasi, target (goal), dan hitung mundur menuju batas waktu (deadline).
- **Donasi Terdesentralisasi**: Pengguna dapat berdonasi ke kampanye menggunakan token XLM melalui dompet Stellar yang kompatibel (misalnya, Freighter).
- **Refund Otomatis & Aman**: Jika target donasi tidak tercapai hingga batas waktu berakhir, para donatur dapat menarik kembali dana mereka dengan aman melalui fungsi `refund`.
- **Gamifikasi Tamagochi**: Untuk memotivasi donasi, setiap donatur memiliki "Tamagochi" yang akan berevolusi melalui beberapa tahap (dari telur hingga phoenix) berdasarkan persentase kontribusi mereka terhadap total goal kampanye.
- **Papan Peringkat (Leaderboard)**: Menampilkan 3 donatur teratas untuk mendorong kompetisi sehat.
- **Umpan Donasi Langsung**: Menampilkan riwayat donasi terbaru yang masuk ke dalam kampanye.
- **Sistem "Donation Streak"**: Memberikan hadiah visual (aura api pada Tamagochi) kepada pengguna yang berdonasi beberapa hari berturut-turut.
- **Mahkota untuk Sang Juara**: Donatur peringkat pertama akan mendapatkan mahkota spesial untuk Tamagochi mereka.
- **Fitur "All In"**: Memudahkan pengguna untuk berdonasi dengan jumlah yang tepat untuk mencapai 100% goal atau sesuai dengan sisa saldo mereka.
- **Notifikasi Interaktif**: Pengguna mendapatkan notifikasi pop-up (menggunakan SweetAlert2) untuk setiap aksi yang berhasil atau gagal.

## 🛠️ Teknologi yang Digunakan

- **Front-End**: React, Vite, TypeScript, React Router, Tailwind CSS
- **Interaksi Blockchain**: Stellar SDK, `@creit.tech/stellar-wallets-kit`
- **Smart Contract**: Rust, Soroban
- **UI/UX**: `lucide-react` untuk ikon, `sweetalert2` untuk notifikasi.

## 🚀 Instalasi & Penggunaan

Proyek ini terdiri dari dua bagian utama: **Smart Contract** (backend) dan **Aplikasi React** (front-end).

### Bagian 1: Smart Contract (Rust & Soroban)

Pastikan Anda telah menginstal [Rust](https://www.rust-lang.org/tools/install) dan [Soroban CLI](https://soroban.stellar.org/docs/getting-started/setup#install-the-soroban-cli).

1.  **Build Smart Contract**
    Buka terminal di direktori root proyek dan jalankan perintah build Soroban untuk mengkompilasi kode Rust menjadi file `.wasm`.
    ```sh
    soroban contract build
    ```

2.  **Deploy Smart Contract**
    Deploy contract Anda ke jaringan Stellar (misalnya, `testnet`). Perintah ini akan memberikan Anda **Contract ID yang baru**.
    ```sh
    # Ganti <YOUR_ACCOUNT> dengan nama akun atau public key Anda
    soroban contract deploy --wasm target/wasm32-unknown-unknown/release/crowdfunding_contract.wasm --source <YOUR_ACCOUNT> --network testnet
    ```
    **PENTING**: Salin dan simpan `Contract ID` yang baru saja Anda dapatkan. Contoh: `CAMOXPDNU7D6ZGI7HQXNBFL4RQ7H2NBXAB3UBWKX5VPTHEERGGDWJ3TO`.

3.  **Generate TypeScript Client**
    Buat *client library* TypeScript agar front-end dapat berinteraksi dengan contract Anda. Gunakan `Contract ID` yang baru.
    ```sh
    # Ganti <YOUR_NEW_CONTRACT_ID> dengan ID yang Anda dapatkan di langkah sebelumnya
    soroban contract bindings typescript --contract-id <YOUR_NEW_CONTRACT_ID> --output-dir packages/<YOUR_NEW_CONTRACT_ID>/src --network testnet
    ```
    Langkah ini akan membuat direktori baru di dalam folder `packages/` yang berisi file `index.ts`.

### Bagian 2: Front-End (React)

1.  **Perbarui Path Impor Contract**
    Ini adalah langkah yang sangat penting. Buka file-file berikut dan perbarui path impor untuk menunjuk ke direktori contract Anda yang baru:
    - `app/routes/home.tsx`
    - `app/routes/tamagochi.tsx`

    Ubah baris impor di bagian atas file:
    ```typescript
    // Ganti <YOUR_NEW_CONTRACT_ID> dengan ID contract Anda yang baru
    import * as Crowdfund from "../../packages/<YOUR_NEW_CONTRACT_ID>/src/index";
    import type { TopDonor, DonationRecord } from "../../packages/<YOUR_NEW_CONTRACT_ID>/src/index";
    ```

2.  **Install Dependencies**
    Dari direktori root proyek, jalankan perintah berikut untuk menginstal semua dependensi yang dibutuhkan oleh front-end.
    ```sh
    npm install
    ```

3.  **Jalankan Aplikasi**
    Setelah instalasi selesai, jalankan server pengembangan lokal.
    ```sh
    npm run dev
    ```
    Aplikasi akan tersedia di `http://localhost:5173` (atau port lain yang tersedia).

## 🎮 Cara Menggunakan Aplikasi

1.  **Hubungkan Dompet**: Buka aplikasi di browser Anda dan hubungkan dompet Stellar yang mendukung Testnet (misalnya, Freighter).
2.  **Lakukan Donasi**: Masukkan jumlah XLM yang ingin Anda donasikan. Anda juga bisa mencentang kotak "All In" untuk donasi cerdas.
3.  **Lihat Status**: Perhatikan progres bar, hitung mundur, papan peringkat, dan umpan donasi yang semuanya diperbarui secara real-time.
4.  **Cek Tamagochi**: Klik tombol "View My Tamagochi" untuk melihat evolusi, mahkota, atau aura api pada Tamagochi Anda.
5.  **Lakukan Refund**: Jika kampanye telah berakhir dan target tidak tercapai, tombol "Refund" akan muncul, memungkinkan Anda untuk menarik kembali donasi Anda.
