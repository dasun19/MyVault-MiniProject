# MyVault-MiniProject  
Blockchain-Based Digital Identity & Document Verification System  

## Table of Contents  
- [Project Overview](#project-overview)  
- [Features](#features)  
- [Architecture & Tech Stack](#architecture--tech-stack)  
- [Folder Structure](#folder-structure)  
- [Getting Started](#getting-started)  
  - [Prerequisites](#prerequisites)  
  - [Installation](#installation)  
  - [Running the Applications](#running-the-applications)  
- [Usage](#usage)  
- [Contributing](#contributing)  
- [License](#license)  
- [Contact](#contact)  

---

## Project Overview  
**MyVault** is a privacy-first digital identity platform that leverages blockchain to enable secure and verifiable document authentication without central data storage.  

Citizens store verifiable credentials (like digital driver’s licences or exam result sheets) locally on their devices, while only a cryptographic hash of the credential is stored on the blockchain by the authority.  
Verification happens by recomputing the hash and matching it with the stored on-chain value — ensuring privacy, security, and authenticity.  

### 🎯 Objectives  
- Protect citizen data with decentralized verification  
- Eliminate paper-based verification  
- Enable verifiers to confirm authenticity without accessing personal data  

---

## Features  
- 🔐 **Decentralized Credential Verification** — hashes stored on blockchain  
- 📱 **Mobile App** — React Native app for storing & showing credentials  
- 🌐 **Web Verification Portal** — simple verifier interface  
- ⚙️ **Blockchain Smart Contract** — stores and verifies document hashes  
- 🧾 **Node.js Backend** — handles credential issuance and verification logic  
- 🧱 **Local Development Blockchain** (Hardhat)  
- 🪶 Lightweight, privacy-first design  

---

## Architecture & Tech Stack  
**Frontend (Verifier UI):** React + Vite + TailwindCSS  
**Mobile App (Holder):** React Native CLI (no Expo)  
**Backend API:** Node.js + Express  
**Blockchain:** Solidity + Hardhat (local Ethereum test node)  

---

## Folder Structure  
```
MyVault-MiniProject/
│
├── myvault-backend/                  # Backend service (API + Blockchain interaction)
│   ├── contracts/                    # Solidity smart contracts
│   │   └── MyVault.sol               # Main smart contract
│   ├── scripts/                      # Hardhat deployment & interaction scripts
│   │   └── deploy.js                 # Deploy contract to local blockchain
│   ├── artifacts/                    # Auto-generated contract artifacts (after compile)
│   ├── cache/                        # Hardhat cache
│   ├── server.js                     # Express server entry point
│   ├── package.json
│   └── hardhat.config.cjs            # Hardhat config file
│
├── verification-webapp/              # Web app for verifying documents
│   ├── src/
│   │   ├── pages/
│   │   │   └── Verify.jsx            # Verification page logic
│   │   ├── components/
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── public/
│   ├── vite.config.js
│   └── package.json
│
├── myvault-mobile-app/               # React Native mobile application
│   ├── android/                      # Android project files
│   ├── ios/                          # iOS project files
│   ├── src/
│   │   ├── screens/
│   │   ├── components/
│   │   ├── utils/
│   │   └── App.js
│   ├── package.json
│   └── metro.config.js
│
└── README.md                         # Project documentation
```

---

## Getting Started  

### Prerequisites  
Ensure you have the following installed:  
- [Node.js](https://nodejs.org/) (v16 or higher)  
- [npm](https://www.npmjs.com/) or [yarn](https://yarnpkg.com/)  
- [Hardhat](https://hardhat.org/)  
- [React Native CLI](https://reactnative.dev/docs/environment-setup)  
- [Android Studio](https://developer.android.com/studio) or Xcode (for iOS)  

---

## Installation  

Clone the repository:  
```bash
git clone https://github.com/dasun19/MyVault-MiniProject.git
cd MyVault-MiniProject
```

Install dependencies in each subproject:  
```bash
# Backend
cd myvault-backend
npm install

# Web Verification App
cd ../verification-webapp
npm install

# Mobile App
cd ../myvault-mobile-app
npm install
```

---

## Running the Applications  

### 🧱 Step 1 — Run Local Blockchain  
Open **Terminal 1**:  
```bash
cd myvault-backend
npx hardhat node
```

This starts a local Ethereum blockchain on `http://127.0.0.1:8545`.

---

### ⚙️ Step 2 — Compile Smart Contracts  
Open **Terminal 2** (still in `myvault-backend`):  
```bash
npm run compile
```

This compiles the Solidity contracts and generates the artifacts.

---

### 🚀 Step 3 — Deploy Smart Contract  
In the same **Terminal 2**, deploy the contract to the local network:  
```bash
npx hardhat run scripts/deploy.js --network localhost
```

This will output a deployed contract address.  
Make sure your backend uses this address when verifying documents.

---

### 🖥️ Step 4 — Run Backend Server  
In **Terminal 2** (same directory):  
```bash
node server.js
```

This starts the backend API, which connects to the blockchain and exposes verification endpoints.

---

### 🌐 Step 5 — Run Web Verification App  
Open **Terminal 3**:  
```bash
cd verification-webapp
npm run dev
```

The verifier web app should now be available (usually at `http://localhost:5173`).

---

### 📱 Step 6 — Run Mobile App  

#### For Android  
Open **Terminal 4**:  
```bash
cd myvault-mobile-app
npx react-native run-android
```

Then start the Metro bundler:  
```bash
npx react-native start
```

#### For iOS (on macOS)  
```bash
cd myvault-mobile-app
npx pod-install ios
npx react-native run-ios
```

---

## Usage  

1. **Issuer:** Use backend API to issue new credentials (hash stored on blockchain).  
2. **Citizen:** Mobile app stores credential locally, shows QR for verification.  
3. **Verifier:** Web app scans QR or accepts credential ID → verifies by recomputing hash and checking blockchain.  

---

## Contributing  
Contributions are welcome!  
1. Fork the repository  
2. Create a feature branch:  
   ```bash
   git checkout -b feature/your-feature
   ```  
3. Commit your changes and push  
4. Open a Pull Request  

---

## License  
This project is licensed under the **MIT License** – see the [LICENSE](LICENSE) file for details.

---

## Contact  
👤 **Developer:** Dasun  
📍 Kalutara, Sri Lanka  
🔗 [GitHub](https://github.com/dasun19)  
 
