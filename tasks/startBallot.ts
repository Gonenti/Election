import { task } from 'hardhat/config';
import { ContractTransaction } from "ethers";

const wait = (tx: ContractTransaction) => tx.wait();

task("startBallot", "Create a vote")
.addParam("contract", "The Ballot contract address.")
.addParam("topic", "The ballot contract topic.")
.setAction(async (taskArgs, hre) => {
  const { contract, topic } = taskArgs;
  const election = await hre.ethers.getContractAt( "Election", contract);
  await election.startBallot(topic)
  .then(wait)
  .catch(console.error);
})