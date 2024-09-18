# NFT Gated Merkle Airdrop

## Overview

This project provides a Solidity smart contract `NFTGatedMerkleAirdrop` and a JavaScript script `merkle.ts` for managing token airdrops using Merkle trees. This README includes instructions for setting up and running the `merkle.t# Sample Aidrop Distribution

## Setup and Running `merkle.ts`

1. **Clone the Repository**

   ```bash
   git clone https://github.com/youngancient/Nft-gated-merkle-airdrop.git

   cd Nft-gated-merkle-airdrop
   ```

2. **Install Dependencies**

   ```bash
   npm install
   ```

3. **Update CSV file and Configure the Script**
   - Update CSV: The CSV looks like this
      ```bash
         address,amount
         0x99cb7f24da7f4bf494bb9740a3ff46d07bee1525,50
         0x9a3a60f5aee7aef1fb0d4da8534452a2e2a89d46,100
       ```
     - change the whole addresses and amounts as you desire.
   - Configure Script: The scripts/merkle.ts generates the root hash from the CSV, the merkleProof of a target leaf and verifies it.
      ```bash
         const targetData = {
             address: "0xa6B1feB40D1c8eeAD5AFD6f7372E02B637F142FA",
             amount: "1800",
         }
       ```
4. **Run the Script**

   ```bash
       npx hardhat run scripts/merkle.ts
   ```

   Running this script, you will get both the merkle root and the merkle proof. You need to copy both of them.

5. **Deploying the MerkleAirdrop Contract**
   Go to ignition/modules/MerkleAirdrop, to deploy this contract, we need to pass in the nftAddress, tokenAddress and merkle root as arguments in the constructor.

```bash
const tokenAddress = "0x669eEe68Ef39E12D1b38d1f274BFc9aC46D771CB";
const merkleRoot = "0xc2635d49a927cf06ff1e8646a3c4d2d6808947f771c7faebe4b63b09df24b449";
```

replace the tokenAddress with the address of the token you want to airdrop, and addd the address of the NFT the airdrop claimers must have. Then change the merkleRoot to the one you got from running the script.
After this, run the command to deploy on lisk sepolia test network.

```bash
npx hardhat ignition deploy ignition/modules/MerkleAirdrop.ts --network lisk-sepolia --deployment-id Airdrop-deployment
```

The command above deploys the contrat with the id : Airdrop-deployment. We can easily verify the contract by running

```bash
 npx hardhat ignition verify Airdrop-deployment
```

6. **Generating merkle Proof**
   Step 4 explains how to generate merkle proof, but the idea is to go to the scripts/merkle.ts and change the content of targetData. Also ensure that your data is part of the data in the csv else you will get invalid proof error.

7. **Assumptions and Limitations**
   - **Assumptions**
     - The MerkleAirdrop contract and ERC20 token contract are deployed on the same network.
     - The Merkle tree has been properly constructed and the Merkle root is valid.
     - The user interacting with the contract has sufficient funds for transaction fees
     - The owner of the contract is fair enough to allow atleast 51% of airdrops to be claimed before withdrawing all the tokens from the contract.
   - **Limitations**
     - This contract can only be used by one airdrop claiming project at a particular time, i.e only one token can be sent and aidropped.
     - This contract is only deployed on one network hence only tokens in that particular network can be airdropped.
