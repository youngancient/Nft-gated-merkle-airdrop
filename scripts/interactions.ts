import { ethers } from "hardhat";
import * as dotenv from "dotenv";
dotenv.config();

async function main() {
  const cwtTokenAddress = "0x669eEe68Ef39E12D1b38d1f274BFc9aC46D771CB";
  const cwt = await ethers.getContractAt("IERC20", cwtTokenAddress);

  const merkleAirdropContractAddress =
    "0x55bBddDd171e681D528cc6d813DFceA63113646d";
  const merkleAirdrop = await ethers.getContractAt(
    "MerkleAirdrop",
    merkleAirdropContractAddress
  );


  // returns the balance of CWT tokens in the contract that will be airdropped
  const contractBalance = await merkleAirdrop.getContractBalance();
  console.log(contractBalance);

  // test user
  const userPrivateKey = `${process.env.TEST_PRIVATE_KEY}`; // Replace with your private key
  const userWallet = new ethers.Wallet(userPrivateKey, ethers.provider);

  const USER = {
    address: "0xa6B1feB40D1c8eeAD5AFD6f7372E02B637F142FA",
    amount: "1800000000000000000000",
  };

  // checks user token balance
  const userTokenBalance = await cwt.balanceOf(USER.address);
  console.log("User CWT balance before: " + userTokenBalance);

  // checks contract token balance
  const contractTokenBalance = await merkleAirdrop.getContractBalance();
  console.log("contract balance : " + contractTokenBalance);

  // merkle root
  const merkleRoot =
    "0x29c08bc8bf7d3a0ed4b1dd16063389608cf9dec220f1584e32d317c2041e1fa4";

  const contractMerkleRoot = await merkleAirdrop.getMerkleProof();
  console.log(
    "Contract merkle proof is valid: ",
    contractMerkleRoot == merkleRoot
  );
  // merkle proof gotten from merkle.ts
  const merkleProof = [
    "0x5a14ec3b90c5dab0d3640d893dcb87ff30bae272bbf7eb37b520d7a86d098bf4",
    "0x545c8e6423cb085b9eff4f30100298a878feb885da485b6b697ba2cb64746591",
    "0x7801757d15a5d624d2209895c2374ed61f75b5f3d4fd417d83f2c8394621e7c9",
    "0xa43d49610f2a78963667a3013d940a782da13a33f6ba32311818cf72781378be",
  ];

  try {
    // const claimTx = await merkleAirdrop.claimAirdrop(USER.amount, merkleProof);
    const claimTx = await merkleAirdrop.connect(userWallet).claimAirdrop(USER.amount, merkleProof);

    console.log(`Transaction sent` + claimTx);
    // // Wait for the transaction to be mined
    claimTx.wait();

    console.log("Airdrop claimed successfully");

    // Check contract balance after claiming
    const contractBalanceAfter = await merkleAirdrop.getContractBalance();
    console.log("contract balance after: " + contractBalanceAfter);

    //   user balance after
    const userTokenBalanceAfter = await cwt.balanceOf(USER.address);
    console.log("User CWT balance after: " + userTokenBalanceAfter);
  } catch (error) {
    console.error("Error claiming airdrop:", error);
  }
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
