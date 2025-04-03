Overview

AutentiX is an web-based simulation app that allows its users to store and verify documents hashes on a blockchain. By recording cryptographic hashes on a decentralized Ethereum ledger, the system ensures that each entry is permanent and tamper-proof. This mechanism not only deters forgery but also provides a reliable method for verifying document authenticity. 

Features
    Blockchain Storage: Store document hashes securely on a local Ethereum blockchain(which is simulated by Ganache).
    MetaMask Integration: Use MetaMask for authentication and transaction signing.
    Hash Verification: Anyone can verify if a document’s hash is recognized as valid.
    Access Code Upload (Beta): Uploading a hash is supposed to require an access code. This feature is still work in progress, meaning you can use any combination of letters or numbers. 
    User-Friendly Interface: A simple and intuitive UI that makes document verification easy and accesible.

Tech Stack
    Frontend: Vue.js, Ethers.js, Tailwind
    Backend: Flask, SQLite
    Blockchain: Solidity, Ganache, Hardhat
    Authentication: MetaMask    

Installation

  Prerequisites
     Install Ganache and Quickstart Ethereum 
     Install in your browser the MetaMask extension and create a Metamask Account
     Connect MetaMask with the local blockchain created by Ganache
     Import one (or more) of the wallet adresses in your Metamask Account
     Install Python, Node.js, npm

  Setup Instructions
    Clone the repository

    Install Frontend dependencies
       cd frontend
       npm install
    Run the Frontend
       npm run dev

    Install Backend dependencies
       cd backend
       pip install -r requirements.txt
    Run the backend  
       pyton app.py    

    Install Blockchain dependencies
       cd blockain
       npm install

    Deploy the contract
       make sure you have the local blokchain opened in Ganache
       in hardhat.config.js set the mnemonic and the URL with the ones of your own ethereum and save it all
       run npx hardhat run scripts/deploy.js --network ganache
       copy the contract adress from the console to line 90 in Home.vue and line 194 to User.vue in frontend views and save

    Open the localhost in your browser and the app is ready to use   




