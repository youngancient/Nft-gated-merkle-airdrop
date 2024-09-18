import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";

const nftAddress = "0xBC4CA0EdA7647A8aB7C2061c2E118A18a936f13D";
const tokenAddress = "0x669eEe68Ef39E12D1b38d1f274BFc9aC46D771CB";
const merkleRoot =
  "0x29c08bc8bf7d3a0ed4b1dd16063389608cf9dec220f1584e32d317c2041e1fa4";
//redeploy

const MerkleAirdropModule = buildModule("MerkleAirdropModule", (m) => {
  const airdrop = m.contract("NFTGatedMerkleAirdrop", [
    nftAddress,
    tokenAddress,
    merkleRoot,
  ]);

  return { airdrop };
});

export default MerkleAirdropModule;
