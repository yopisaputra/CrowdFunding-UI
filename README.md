# Proyek Crowdfunding dApp di Jaringan Stellar

Ini adalah aplikasi terdesentralisasi (dApp) untuk crowdfunding yang dibangun di atas jaringan Stellar, menggunakan smart contract yang ditulis dengan Rust dan Soroban. Aplikasi front-end dibuat dengan React, Vite, dan TypeScript.

## Fitur Utama

- **Kampanye Crowdfunding**: Pengguna dapat melihat status kampanye, termasuk progres donasi, target (goal), dan batas waktu (deadline).
- **Donasi**: Pengguna dapat berdonasi ke kampanye menggunakan token XLM melalui dompet Stellar yang kompatibel.
- **Refund Otomatis**: Jika target donasi tidak tercapai hingga batas waktu berakhir, para donatur dapat menarik kembali dana mereka.
- **Gamifikasi Tamagochi**: Untuk memotivasi donasi, setiap donatur memiliki "Tamagochi" yang akan berevolusi berdasarkan persentase kontribusi mereka terhadap total goal kampanye.
- **Notifikasi Real-time**: Pengguna mendapatkan notifikasi pop-up (menggunakan SweetAlert2) untuk setiap aksi yang berhasil atau gagal, seperti donasi dan refund.

## Teknologi yang Digunakan

- **Front-End**: React, Vite, TypeScript, React Router, Tailwind CSS
- **Interaksi Blockchain**: Stellar SDK, @creit.tech/stellar-wallets-kit
- **Smart Contract**: Rust, Soroban

## Prasyarat

Sebelum memulai, pastikan Anda telah menginstal perangkat lunak berikut:

- [Node.js](https://nodejs.org/) (v18 atau lebih baru)
- [npm](https://www.npmjs.com/) atau [yarn](https://yarnpkg.com/)
- [Rust](https://www.rust-lang.org/tools/install)
- [Soroban CLI](https://soroban.stellar.org/docs/getting-started/setup#install-the-soroban-cli)

## Instalasi & Penggunaan

Proyek ini terdiri dari dua bagian utama: Smart Contract (backend) dan Aplikasi React (front-end).

### 1. Smart Contract (Rust & Soroban)

Smart contract berada di dalam direktori `packages/` (nama direktori sesuai dengan ID contract yang digenerate).

1.  **Build Contract**:
    Buka terminal di direktori root proyek dan jalankan perintah build Soroban.
    ```sh
    soroban contract build
    ```

2.  **Deploy Contract**:
    Deploy contract Anda ke jaringan Stellar (misalnya, testnet).
    ```sh
    soroban contract deploy --wasm target/wasm32-unknown-unknown/release/crowdfunding_contract.wasm --source <YOUR_ACCOUNT> --network testnet
    ```
    Catat `contractId` yang dihasilkan setelah proses deploy.

3.  **Generate TypeScript Client**:
    Buat client library TypeScript agar front-end dapat berinteraksi dengan contract.
    ```sh
    soroban contract bindings typescript --contract-id <YOUR_NEW_CONTRACT_ID> --output-dir packages/<YOUR_NEW_CONTRACT_ID>/src --network testnet
    ```

### 2. Front-End (React)

1.  **Update Contract ID**:
    Setelah men-deploy contract baru, Anda perlu memperbarui ID contract di beberapa tempat di kode front-end:
    - `packages/<YOUR_NEW_CONTRACT_ID>/src/index.ts`: Pastikan `contractId` sudah sesuai.
    - `app/routes/home.tsx`: Perbarui path impor untuk menunjuk ke direktori contract Anda yang baru.
    - `app/routes/tamagochi.tsx`: Perbarui juga path impor di sini.

2.  **Install Dependencies**:
    Dari direktori root proyek, jalankan perintah berikut untuk menginstal semua dependensi yang dibutuhkan oleh front-end.
    ```sh
    npm install
    ```

3.  **Jalankan Aplikasi**:
    Setelah instalasi selesai, jalankan server pengembangan lokal.
    ```sh
    npm run dev
    ```
    Aplikasi akan tersedia di `http://localhost:5173` (atau port lain yang tersedia).

## Cara Menggunakan Aplikasi

1.  **Hubungkan Dompet**: Buka aplikasi di browser Anda dan hubungkan dompet Stellar yang mendukung Testnet (misalnya, Freighter).
2.  **Lakukan Donasi**: Masukkan jumlah XLM yang ingin Anda donasikan dan klik tombol "Submit Donation". Anda akan diminta untuk menyetujui transaksi melalui dompet Anda.
3.  **Lihat Status**: Progres bar dan total donasi akan diperbarui secara otomatis.
4.  **Cek Tamagochi**: Klik tombol "View My Tamagochi" untuk melihat evolusi Tamagochi Anda berdasarkan kontribusi Anda.
5.  **Lakukan Refund**: Jika kampanye telah berakhir dan target tidak tercapai, tombol "Refund" akan muncul, memungkinkan Anda untuk menarik kembali donasi Anda.
