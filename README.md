# MyVault – Digital Identity & Document Verification

MyVault is a **privacy-first digital identity and document verification system** built using **blockchain technology**.  
It allows citizens to store digital credentials on their mobile devices while enabling verifiers to confirm authenticity **without accessing personal data**.

---

## ✨ Key Idea (Simple)
- Citizen keeps documents on their own device  
- Government/authority stores **only a hash** on blockchain  
- Verifier checks authenticity by matching hashes  
- No central storage, no data leaks

---

## 🚀 Features
- Blockchain-based tamper-proof verification  
- React Native mobile app for citizens  
- Web verification app for authorities/verifiers  
- Node.js backend with smart contract interaction  
- Local Ethereum blockchain using Hardhat  
- CI/CD deployment for verification web app (Vercel)

**Live Verification App:** https://myvault-verify.vercel.app/

---

## 🧠 Tech Stack
- **Mobile App:** React Native CLI  
- **Web App:** React + Vite + Tailwind CSS  
- **Backend:** Node.js + Express  
- **Blockchain:** Solidity + Hardhat  
- **Deployment:** Vercel  
- **CI/CD:** GitHub Actions  

---

## 📁 Folder Structure
```
MyVault-MiniProject/
│
├── myvault-backend/          # Backend + Blockchain
│   ├── contracts/           # Solidity smart contracts
│   ├── scripts/             # Hardhat deploy scripts
│   ├── server.js            # Backend entry point
│   └── hardhat.config.cjs
│
├── verification-webapp/     # Web app for verification
│   ├── src/
│   └── package.json
│
├── myvault-mobile-app/      # React Native mobile app
│   ├── android/
│   ├── ios/
│   └── src/
│
├── .github/workflows/       # CI/CD pipeline
└── README.md
```

---

## 🛠️ Setup & Run (Quick)

### 1️⃣ Clone Project
```bash
git clone https://github.com/dasun19/MyVault-MiniProject.git
cd MyVault-MiniProject
```

### 2️⃣ Install Dependencies
```bash
cd myvault-backend && npm install
cd ../verification-webapp && npm install
cd ../myvault-mobile-app && npm install
```

### 3️⃣ Start Blockchain
```bash
cd myvault-backend
npx hardhat node
```

### 4️⃣ Deploy Smart Contract
```bash
npx hardhat run scripts/deploy.js --network localhost
```

### 5️⃣ Start Backend
```bash
node server.js
```

### 6️⃣ Start Web App
```bash
cd verification-webapp
npm run dev
```

### 7️⃣ Run Mobile App (Android)
```bash
cd myvault-mobile-app
npx react-native run-android
```

---

## 👤 How It Works
1. **Issuer** issues a credential → hash stored on blockchain  
2. **Citizen** stores credential in mobile app  
3. **Verifier** uses web app → verifies via blockchain hash  

---

## 📜 License
MIT License

---

## 👨‍💻 Author
**Dasun**  
Kalutara, Sri Lanka  
GitHub: https://github.com/dasun19
