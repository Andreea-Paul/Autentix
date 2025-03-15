// Import Hardhat Ethers plugin for interacting with smart contracts
require('@nomicfoundation/hardhat-ethers');

module.exports = {
  // Specify Solidity compiler version
  solidity: "0.8.0",

  // Define blockchain networks
  networks: {
    ganache: {
      // URL where the Ganache blockchain is running
      url: "http://127.0.0.1:7545",

      // Define accounts using a mnemonic phrase
      accounts: {
        mnemonic: "cricket broccoli home sadness february matter curious innocent gesture ski arm gauge"
      }
    }
  }
};
