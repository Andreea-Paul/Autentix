require('@nomicfoundation/hardhat-ethers');

module.exports = {
  solidity: "0.8.0",
  networks: {
    ganache: {
      url: "http://127.0.0.1:7545",  // Adresa rețelei Ganache
      accounts: {
        mnemonic: "cricket broccoli home sadness february matter curious innocent gesture ski arm gauge"  
      }
    }
  }
};
