# Crowdfunding dApp on the Stellar Network

This is a decentralized application (dApp) for crowdfunding built on the Stellar network, utilizing a smart contract written in Rust with Soroban. The front-end application is built with React, Vite, and TypeScript.

## Key Features

- **Crowdfunding Campaign**: Users can view the status of a campaign, including donation progress, the target goal, and the deadline.
- **Donations**: Users can donate to the campaign using XLM tokens through a compatible Stellar wallet.
- **Automatic Refunds**: If the donation target is not met by the deadline, donors can withdraw their funds.
- **Tamagochi Gamification**: To motivate donations, each donor has a "Tamagochi" that evolves based on their contribution percentage towards the campaign's total goal.
- **Leaderboard & Streaks**: Features a real-time leaderboard for top donors and a streak system to reward consistent daily donations.
- **Real-time Notifications**: Users receive pop-up notifications (using SweetAlert2) for successful or failed actions, such as donations and refunds.

## Technology Stack

- **Front-End**: React, Vite, TypeScript, React Router, Tailwind CSS
- **Blockchain Interaction**: Stellar SDK, @creit.tech/stellar-wallets-kit
- **Smart Contract**: Rust, Soroban

## Prerequisites

Before you begin, ensure you have the following software installed:

- [Node.js](https://nodejs.org/) (v18 or later)
- [npm](https://www.npmjs.com/) or [yarn](https://yarnpkg.com/)
- [Rust](https://www.rust-lang.org/tools/install)
- [Soroban CLI](https://soroban.stellar.org/docs/getting-started/setup#install-the-soroban-cli)

## Installation & Usage

The project consists of two main parts: the Smart Contract (backend) and the React Application (front-end).

### 1. Smart Contract (Rust & Soroban)

The smart contract is located within the `packages/` directory (the directory name corresponds to the generated contract ID).

1.  **Build the Contract**:
    Open a terminal in the project's root directory and run the Soroban build command.
    ```sh
    soroban contract build
    ```

2.  **Deploy the Contract**:
    Deploy your contract to the Stellar network (e.g., testnet).
    ```sh
    soroban contract deploy --wasm target/wasm32-unknown-unknown/release/crowdfunding_contract.wasm --source <YOUR_ACCOUNT> --network testnet
    ```
    Take note of the `contractId` generated after the deployment process.

3.  **Generate TypeScript Client**:
    Create a TypeScript client library for the front-end to interact with the contract.
    ```sh
    soroban contract bindings typescript --contract-id <YOUR_NEW_CONTRACT_ID> --output-dir packages/<YOUR_NEW_CONTRACT_ID>/src --network testnet
    ```

### 2. Front-End (React)

1.  **Update Contract ID**:
    After deploying a new contract, you need to update the contract ID in the front-end code:
    - In `app/routes/home.tsx` and `app/routes/tamagochi.tsx`, update the import path to point to your new contract directory.

2.  **Install Dependencies**:
    From the project's root directory, run the following command to install all the necessary front-end dependencies.
    ```sh
    npm install
    ```

3.  **Run the Application**:
    Once the installation is complete, run the local development server.
    ```sh
    npm run dev
    ```
    The application will be available at `http://localhost:5173` (or another available port).

## How to Use the Application

1.  **Connect Wallet**: Open the application in your browser and connect a Stellar wallet that supports the Testnet (e.g., Freighter).
2.  **Make a Donation**: Enter the amount of XLM you wish to donate and click the "Submit Donation" button. You will be prompted to approve the transaction via your wallet.
3.  **View Status**: The progress bar and total donations will update automatically.
4.  **Check Your Tamagochi**: Click the "View My Tamagochi" button to see your Tamagochi's evolution based on your contribution.
5.  **Claim a Refund**: If the campaign has ended and the goal was not met, a "Refund" button will appear, allowing you to reclaim your donation.
