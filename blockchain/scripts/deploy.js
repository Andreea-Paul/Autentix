async function main() {
    const [deployer] = await ethers.getSigners();
    console.log("Deployer address:", deployer.address);
  
    const DocumentValidator = await ethers.getContractFactory("DocumentValidator");
    const contract = await DocumentValidator.deploy();
  
    // În ethers v6, contractul este deja deployat când promise-ul se rezolvă,
    // iar adresa este în proprietatea "target", nu "address"
    console.log("DocumentValidator contract deployed to:", contract.target);
  }
  
  main()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error(error);
      process.exit(1);
    });
  
  
  
  