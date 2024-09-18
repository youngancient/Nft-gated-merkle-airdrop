import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";

const nftAddress = "0xBC4CA0EdA7647A8aB7C2061c2E118A18a936f13D";
const tokenAddress = "0x669eEe68Ef39E12D1b38d1f274BFc9aC46D771CB";
const merkleRoot =
  "0x67ed207195389edeb66a27fe868f6707ee23b6622ef478edf1c7d07552c9e2e7";
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
