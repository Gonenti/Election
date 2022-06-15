import { ethers } from "hardhat";
import { expect } from "chai";
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { Election } from "../typechain";

describe("Election Tests", async () => {
  let owner:SignerWithAddress;
  let acc2:SignerWithAddress;
  let acc3:SignerWithAddress;
  let acc4:SignerWithAddress;
  let election: Election;
  
  beforeEach(async () => {
    [owner, acc2, acc3, acc4] = await ethers.getSigners();
    const Election = await ethers.getContractFactory("Election", owner);
    election = await Election.deploy();
    await election.deployed();
  });

  it('Other users cannot start voting', async function () {
    await expect(election.connect(acc2).startBallot("Test")).to.be.revertedWith(acc2.address);
  });

  it("Sets owner", async function() {
    const currentOwner = await election.owner();
    expect(currentOwner).to.eq(owner.address);
  });

   
  it("You cannot add one candidate 2 times", async function() {
    await election.startBallot("Test");
    await election.addCandidate("Test", acc3.address);
    await expect(election.addCandidate("Test", acc3.address)).to.be.revertedWith(acc3.address);
  });

  
  it("You can't vote if you haven't contributed enough money", async function() {
    await election.startBallot("Test");
    await election.addCandidate("Test", acc3.address);
    await expect(election.vote("Test", acc3.address, {value: ethers.utils.parseEther("0.0001")}))
    .to.be.revertedWith("100000000000000, 10000000000000000");
  })

  it("You cannot vote more than once", async function() {
    await election.startBallot("Test");
    await election.addCandidate("Test", acc3.address);
    await election.vote("Test", acc3.address, {value: ethers.utils.parseEther("0.1")})
    await expect(election.vote("Test", acc3.address, {value: ethers.utils.parseEther("0.1")}))
    .to.be.revertedWith(owner.address);
  })

  it("You cannot vote for a non-existent candidate", async function() {
    await election.startBallot("Test");
    await expect(election.vote("Test", acc3.address, {value: ethers.utils.parseEther("0.1")}))
    .to.be.revertedWith(acc3.address);
  })

  it("You can't vote if the voting is over", async function() {
    await election.startBallot("Test");
    await ethers.provider.send("evm_increaseTime", [259201]);
    await election.addCandidate("Test", acc3.address);
    await expect(election.vote("Test", acc3.address, {value: ethers.utils.parseEther("0.1")}))
    .to.be.revertedWith("false");
  })

  it("You can't finish voting earlier than 3 days later", async function() {
    await election.startBallot("Test");
    await election.addCandidate("Test", acc3.address);
    await expect(election.finish("Test"))
    .to.be.revertedWith("false");
  })

  it("You cannot complete a vote if it has already been completed", async function() {
    await election.startBallot("Test");
    await election.addCandidate("Test", acc3.address);
    await ethers.provider.send("evm_increaseTime", [259201]);
    await election.finish("Test");
    await expect(election.finish("Test"))
    .to.be.revertedWith("false");
  })

  it("The owner cannot withdraw the commission if the voting is not completed", async function() {
    await election.startBallot("Test");
    await election.addCandidate("Test", acc3.address);
    await ethers.provider.send("evm_increaseTime", [259201]);
    await expect(election.Withdrawal("Test",owner.address))
    .to.be.revertedWith("false");
  })

  it("The winner and the owner receive money", async function() {
    await election.startBallot("Test");
    await election.addCandidate("Test", acc2.address);
    await election.addCandidate("Test", acc3.address);
    await election.addCandidate("Test", acc4.address);

    let ts = await election.vote("Test", acc4.address, {value: ethers.utils.parseEther("1")})
    await ts.wait(); 

    ts = await election.connect(acc2).vote("Test", acc4.address, {value: ethers.utils.parseEther("1")})
    await ts.wait();

    await ethers.provider.send("evm_increaseTime", [259201]);

    let beforeBalance = Number(await acc4.getBalance());
    await election.finish("Test");
    let afterBalance = Number(await acc4.getBalance());

    expect(Math.round((afterBalance - beforeBalance) / 100000000000000000))
    .to.eq(Math.round(1800000000000000000 / 100000000000000000));

    beforeBalance = Number(await owner.getBalance());
    await election.Withdrawal("Test", owner.address);
    afterBalance = Number(await owner.getBalance());

    expect(Math.round((afterBalance - beforeBalance) / 100000000000000000))
    .to.eq(Math.round(200000000000000000 / 100000000000000000));

  })

  it("Other users cannot remove the commission.", async function() {
    await election.startBallot("Test");
    await election.addCandidate("Test", acc4.address);

    let ts = await election.vote("Test", acc4.address, {value: ethers.utils.parseEther("1")})
    await ts.wait(); 

    ts = await election.connect(acc2).vote("Test", acc4.address, {value: ethers.utils.parseEther("1")})
    await ts.wait();

    await ethers.provider.send("evm_increaseTime", [259201]);

    await election.finish("Test");

    await expect(election.connect(acc2).Withdrawal("Test", owner.address))
    .to.be.revertedWith(acc2.address);
  })

  it("The search for the winner is carried out correctly.", async function() {
    await election.startBallot("Test");
    await election.addCandidate("Test", acc3.address);
    await election.addCandidate("Test", acc4.address);

    let ts = await election.vote("Test", acc3.address, {value: ethers.utils.parseEther("1")})
    await ts.wait(); 

    await expect(await election.getWinner("Test"))
    .to.eq(acc3.address);

    ts = await election.connect(acc2).vote("Test", acc4.address, {value: ethers.utils.parseEther("1")})
    await ts.wait();

    ts = await election.connect(acc3).vote("Test", acc4.address, {value: ethers.utils.parseEther("1")})
    await ts.wait();

    await expect(await election.getWinner("Test"))
    .to.eq(acc4.address);
  })

});