const TapTapSwap = artifacts.require("TapTapSwap");
const ERC20Token = artifacts.require("ERC20Token");

var Web3 = require('web3');

module.exports = async function(deployer, network, accounts) {
  
  const one_hundred_million = Web3.utils.toWei('100000000', 'ether');

  await deployer.deploy(ERC20Token, 'TapToken', 'TAP', one_hundred_million);
  tapInstance = await ERC20Token.deployed();
  await tapInstance.mint(accounts[0], one_hundred_million);

  await deployer.deploy(TapTapSwap, tapInstance.address);
  tapTapSwapInstance = await TapTapSwap.deployed();

  await tapInstance.transfer(tapTapSwapInstance.address, one_hundred_million);
};
