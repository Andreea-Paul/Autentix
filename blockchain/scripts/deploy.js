async function main() {
  // Get the deployer's signer (the account that will deploy the contract)
  const [deployer] = await ethers.getSigners();
  console.log("Deployer address:", deployer.address);

  // Get the contract factory (a blueprint for creating contract instances)
  const DocumentValidator = await ethers.getContractFactory("DocumentValidator");

  // Deploy the contract to the blockchain
  const contract = await DocumentValidator.deploy();

  // Log the contract's deployed address
  console.log("DocumentValidator contract deployed to:", contract.target);
}

// Execute the main function and handle errors
main()
  .then(() => process.exit(0))
  .catch((error) => {
      console.error(error);
      process.exit(1);
  });
