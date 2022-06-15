import { task } from 'hardhat/config';
import { ContractTransaction } from "ethers";

const wait = (tx: ContractTransaction) => tx.wait();

task("addCandidate", "Add a candidate")
.addParam("contract", "The Ballot contract address.")
.addParam("topic", "The ballot contract topic.")
.addParam("candidate", "the address of the candidate you want to add.")
.setAction(async (taskArgs, hre) => {
  const { contract, topic, candidate } = taskArgs;

  const election = await hre.ethers.getContractAt( "Election", contract);
  await election.addCandidate(topic, candidate)
  .then(wait)
  .catch(console.error);
})