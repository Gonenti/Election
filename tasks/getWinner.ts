import { task } from 'hardhat/config';

task("getWinner", "prints the current voting winner")
.addParam("contract", "The Ballot contract address.")
.addParam("topic", "The ballot contract topic.")
.setAction(async (taskArgs, hre) => {
  const { contract, topic} = taskArgs;

  const election = await hre.ethers.getContractAt( "Election", contract);
  let winner = await election.getWinner(topic);
  console.log(`Current winner: ${winner}`);
})