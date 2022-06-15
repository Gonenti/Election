import { task } from 'hardhat/config';
import { ContractTransaction } from "ethers";

const wait = (tx: ContractTransaction) => tx.wait();

task("withdrawal", "remove the commission")
.addParam("contract", "The Ballot contract address.")
.addParam("topic", "The ballot contract topic.")
.addParam("address", "the address to which you want to transfer money")
.setAction(async (taskArgs, hre) => {
  const { contract, topic, address } = taskArgs;

  const election = await hre.ethers.getContractAt( "Election", contract);
  await election.Withdrawal(topic, address)
  .then(wait)
  .catch(console.error);
})