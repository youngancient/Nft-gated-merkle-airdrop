import {
  time,
  loadFixture,
} from "@nomicfoundation/hardhat-toolbox/network-helpers";
import { anyValue } from "@nomicfoundation/hardhat-chai-matchers/withArgs";
import { expect } from "chai";
import hre, { ethers } from "hardhat";
const helpers = require("@nomicfoundation/hardhat-network-helpers");

describe("NFTGated MerkleAirdrop", function () {
  // We define a fixture to reuse the same setup in every test.
  // We use loadFixture to run this setup once, snapshot that state,
  // and reset Hardhat Network to that snapshot in every test.
  async function deployToken() {
    // Contracts are deployed using the first signer/account by default
    const [owner, otherAccount] = await hre.ethers.getSigners();
    // token we are using to test
    const ERC20Contract = await hre.ethers.getContractFactory("WinToken");
    const airdropToken = await ERC20Contract.deploy();

    return { airdropToken };
  }

  async function deployMerkleAirdrop() {
    // Contracts are deployed using the first signer/account by default
    const [owner, account1, account2] = await hre.ethers.getSigners();

    const nftAddress = "0xBC4CA0EdA7647A8aB7C2061c2E118A18a936f13D";

    const merkleRoot =
      "0x67ed207195389edeb66a27fe868f6707ee23b6622ef478edf1c7d07552c9e2e7";

    // using locally deployed
    const { airdropToken } = await loadFixture(deployToken);

    const NFTGatedMerkleAirdrop = await hre.ethers.getContractFactory(
      "NFTGatedMerkleAirdrop"
    );
    const nftGatedMerkleAirdrop = await NFTGatedMerkleAirdrop.deploy(
      airdropToken,
      nftAddress,
      merkleRoot
    );

    // send tokens to the contract
    const amount = ethers.parseUnits("100000", 18);
    airdropToken.transfer(nftGatedMerkleAirdrop, amount);

    const nftHolder1 = "0x720A4FaB08CB746fC90E88d1924a98104C0822Cf";
    await helpers.impersonateAccount(nftHolder1);
    const impersonatedNftHolder1 = await ethers.getSigner(nftHolder1);

    const nftHolder2 = "0xbB05F71952B30786d0aC7c7A8fA045724B8d2D69";
    await helpers.impersonateAccount(nftHolder2);
    const impersonatedNftHolder2 = await ethers.getSigner(nftHolder2);

    return {
      impersonatedNftHolder1,
      impersonatedNftHolder2,
      nftAddress,
      nftGatedMerkleAirdrop,
      airdropToken,
      owner,
      merkleRoot,
      amount,
      account1,
      account2,
    };
  }
  // with nft but not eligible: 0x4AF79fFCaBb09083aF6CcC3b2C20Fe989519f6d7

  describe("Deployment", function () {
    it("Should set the owner correctly", async function () {
      const { nftGatedMerkleAirdrop, owner } = await loadFixture(
        deployMerkleAirdrop
      );

      expect(await nftGatedMerkleAirdrop.owner()).to.equal(owner);
    });

    it("Should check if tokenAddress is correctly set", async function () {
      const { nftGatedMerkleAirdrop, airdropToken } = await loadFixture(
        deployMerkleAirdrop
      );

      expect(await nftGatedMerkleAirdrop.tokenAddress()).to.equal(airdropToken);
    });

    it("Should check if NFTAddress is correctly set", async function () {
      const { nftGatedMerkleAirdrop, nftAddress } = await loadFixture(
        deployMerkleAirdrop
      );

      expect(await nftGatedMerkleAirdrop.nftAddress()).to.equal(nftAddress);
    });
    it("Should check if MerkleRoot is correctly set", async function () {
      const { nftGatedMerkleAirdrop, nftAddress, merkleRoot } =
        await loadFixture(deployMerkleAirdrop);

      expect(await nftGatedMerkleAirdrop.getMerkleRoot()).to.equal(merkleRoot);
    });
    it("Should send test tokens to the contract", async function () {
      const { nftGatedMerkleAirdrop, nftAddress, amount } = await loadFixture(
        deployMerkleAirdrop
      );
      expect(await nftGatedMerkleAirdrop.getContractBalance()).to.equal(amount);
    });
  });

  describe("Claim Airdrop", function () {
    it("Should revert if called by zero address", async function () {
      const { nftGatedMerkleAirdrop, owner } = await loadFixture(
        deployMerkleAirdrop
      );
      await helpers.impersonateAccount(ethers.ZeroAddress);
      const zeroSigner = await ethers.getSigner(ethers.ZeroAddress);

      const amount = ethers.parseUnits("50", 18);
      const merkleProof = [
        "0x31843176e3301e2dc71ed3f4946247899f496fc34c2b1468e63cb56f5a1ac967",
        "0x83625161d1c1341e60abbc9d5be9ea5eb4f70c023e8c86c7253054c8ea0cc989",
        "0x7f862e74df5ef9f009d8da2be82faf731b3624a0ae8c8e0253249c2089e0e028",
        "0x59031210883d6c444ee66b516e8ba380e63adadfe67c71dc894e9e088aabb25a",
      ];

      await expect(
        nftGatedMerkleAirdrop
          .connect(zeroSigner)
          .claimAirdrop(amount, merkleProof)
      ).to.be.revertedWithCustomError(
        nftGatedMerkleAirdrop,
        "ZeroAddressDetected"
      );
    });

    it("Should revert if user does not have BoredApes NFT", async function () {
      const { nftGatedMerkleAirdrop, airdropToken, account1 } =
        await loadFixture(deployMerkleAirdrop);
      const amount = ethers.parseUnits("50", 18);
      const merkleProof = [
        "0x31843176e3301e2dc71ed3f4946247899f496fc34c2b1468e63cb56f5a1ac967",
        "0x83625161d1c1341e60abbc9d5be9ea5eb4f70c023e8c86c7253054c8ea0cc989",
        "0x7f862e74df5ef9f009d8da2be82faf731b3624a0ae8c8e0253249c2089e0e028",
        "0x59031210883d6c444ee66b516e8ba380e63adadfe67c71dc894e9e088aabb25a",
      ];

      await expect(
        nftGatedMerkleAirdrop
          .connect(account1)
          .claimAirdrop(amount, merkleProof)
      ).to.be.revertedWithCustomError(nftGatedMerkleAirdrop, "NftNotFound");
    });
    it("Should revert if user has NFT but merkle proof is invalid", async function () {
      const { nftGatedMerkleAirdrop, airdropToken, impersonatedNftHolder2 } =
        await loadFixture(deployMerkleAirdrop);
      const amount = ethers.parseUnits("50", 18);
      const invalidMerkleProof = [
        "0x31843176e3301e2dc71ed3f4946247899f496fc34c2b1468e63cb56f5a1ac967",
        "0x83625161d1c1341e60abbc9d5be9ea5eb4f70c023e8c86c7253054c8ea0cc989",
        "0x7f862e74df5ef9f009d8da2be82faf731b3624a0ae8c8e0253249c2089e0e028",
        "0x59031210883d6c444ee66b516e8ba380e63adadfe67c71dc894e9e088aabb25a",
      ];
      await expect(
        nftGatedMerkleAirdrop
          .connect(impersonatedNftHolder2)
          .claimAirdrop(amount, invalidMerkleProof)
      ).to.be.revertedWithCustomError(nftGatedMerkleAirdrop, "InvalidClaim");
    });
    it("Should revert if user has NFT and correct merkle proof, but invalid amount", async function () {
      const { nftGatedMerkleAirdrop, airdropToken, impersonatedNftHolder2 } =
        await loadFixture(deployMerkleAirdrop);
      const invalidAmount = ethers.parseUnits("3200", 18);
      const MerkleProof = [
        "0x260ed15c9d2c2903514fc2a5d1213dbf80230d8a50d8ea5c599bd4832dd16637",
        "0x99c7f81c5ca76e03183cc146a5defdbf4a50b056766db98e8b7db26cda29859c",
      ];
      await expect(
        nftGatedMerkleAirdrop
          .connect(impersonatedNftHolder2)
          .claimAirdrop(invalidAmount, MerkleProof)
      ).to.be.revertedWithCustomError(nftGatedMerkleAirdrop, "InvalidClaim");
    });
    it("Should claim airdrop successfully", async function () {
      const { nftGatedMerkleAirdrop, nftAddress, impersonatedNftHolder2 } =
        await loadFixture(deployMerkleAirdrop);
      const amount = ethers.parseUnits("320", 18);
      const MerkleProof = [
        "0x260ed15c9d2c2903514fc2a5d1213dbf80230d8a50d8ea5c599bd4832dd16637",
        "0x99c7f81c5ca76e03183cc146a5defdbf4a50b056766db98e8b7db26cda29859c",
      ];
      const contractBalanceBeforeClaim =
        await nftGatedMerkleAirdrop.getContractBalance();

      await expect(
        nftGatedMerkleAirdrop
          .connect(impersonatedNftHolder2)
          .claimAirdrop(amount, MerkleProof)
      )
        .to.emit(nftGatedMerkleAirdrop, "AirdropClaimed")
        .withArgs(impersonatedNftHolder2, amount);

      const totalAirdropClaimed =
        await nftGatedMerkleAirdrop.getTotalAirdropClaimed();

      expect(totalAirdropClaimed).to.equal(amount);
      expect(await nftGatedMerkleAirdrop.getContractBalance()).to.equal(
        contractBalanceBeforeClaim - totalAirdropClaimed
      );
    });

    it("Should not allow a user claim airdrop twice", async function () {
      const { nftGatedMerkleAirdrop, nftAddress, impersonatedNftHolder2 } =
        await loadFixture(deployMerkleAirdrop);

      const amount = ethers.parseUnits("320", 18);
      const MerkleProof = [
        "0x260ed15c9d2c2903514fc2a5d1213dbf80230d8a50d8ea5c599bd4832dd16637",
        "0x99c7f81c5ca76e03183cc146a5defdbf4a50b056766db98e8b7db26cda29859c",
      ];

      //   we claim here
      await nftGatedMerkleAirdrop
        .connect(impersonatedNftHolder2)
        .claimAirdrop(amount, MerkleProof);

      await expect(
        nftGatedMerkleAirdrop
          .connect(impersonatedNftHolder2)
          .claimAirdrop(amount, MerkleProof)
      ).to.be.revertedWithCustomError(
        nftGatedMerkleAirdrop,
        "HasClaimedRewardsAlready"
      );
    });
  });
  describe("Only Owner Functions", function () {
    it("Should revert if called by non-owner", async function () {
      const { nftGatedMerkleAirdrop, owner, impersonatedNftHolder2 } =
        await loadFixture(deployMerkleAirdrop);

      const newMerkleRoot =
        "0x67ed207195389edeb66a27fe868f6707ee23b6622ef478edf1c7d07552c9e2d8";

      //  all functions here are OnlyOwner functions

      await expect(
        nftGatedMerkleAirdrop.connect(impersonatedNftHolder2).getMerkleRoot()
      ).to.be.revertedWithCustomError(
        nftGatedMerkleAirdrop,
        "UnAuthorizedFunctionCall"
      );

      await expect(
        nftGatedMerkleAirdrop
          .connect(impersonatedNftHolder2)
          .withdrawLeftOverToken()
      ).to.be.revertedWithCustomError(
        nftGatedMerkleAirdrop,
        "UnAuthorizedFunctionCall"
      );

      await expect(
        nftGatedMerkleAirdrop
          .connect(impersonatedNftHolder2)
          .getContractBalance()
      ).to.be.revertedWithCustomError(
        nftGatedMerkleAirdrop,
        "UnAuthorizedFunctionCall"
      );

      await expect(
        nftGatedMerkleAirdrop
          .connect(impersonatedNftHolder2)
          .getTotalAirdropClaimed()
      ).to.be.revertedWithCustomError(
        nftGatedMerkleAirdrop,
        "UnAuthorizedFunctionCall"
      );

      await expect(
        nftGatedMerkleAirdrop
          .connect(impersonatedNftHolder2)
          .updateMerkleRoot(newMerkleRoot)
      ).to.be.revertedWithCustomError(
        nftGatedMerkleAirdrop,
        "UnAuthorizedFunctionCall"
      );
    });
  });
  describe("Update Merkle Root", function () {
    it("Should claim airdrop successfully", async function () {
      const { nftGatedMerkleAirdrop, nftAddress, impersonatedNftHolder2 } =
        await loadFixture(deployMerkleAirdrop);
      const newMerkleRoot =
        "0x67ed207195389edeb66a27fe868f6707ee23b6622ef478edf1c7d07552c9e2d8";
      await nftGatedMerkleAirdrop.updateMerkleRoot(newMerkleRoot);

      expect(await nftGatedMerkleAirdrop.getMerkleRoot()).to.equal(
        newMerkleRoot
      );
    });
  });
});
