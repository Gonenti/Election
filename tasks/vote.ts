import { task } from 'hardhat/config';
import { ContractTransaction } from "ethers";

const wait = (tx: ContractTransaction) => tx.wait();

task("vote", "Vote for a candidate")
.addParam("contract", "contract address.")
.addParam("topic", "The ballot contract topic.")
.addParam("candidate", "the candidate you want to vote for.")
.setAction(async (taskArgs, hre) => {
  const { contract, topic, candidate } = taskArgs;

  const election = await hre.ethers.getContractAt( "Election", contract);
  await election.vote(topic, candidate, {value: hre.ethers.utils.parseEther("0.01")})
  .then(wait)
  .catch(console.error);
})