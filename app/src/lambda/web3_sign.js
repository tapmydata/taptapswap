// https://ethereum.stackexchange.com/questions/41283/why-does-web3-eth-getaccounts-return-only-1-account/41285
// https://forum.openzeppelin.com/t/sign-it-like-you-mean-it-creating-and-verifying-ethereum-signatures/697
// https://docs.openzeppelin.com/contracts/2.x/utilities#cryptography
// https://ethereum.stackexchange.com/questions/76810/sign-message-with-web3-and-verify-with-openzeppelin-solidity-ecdsa-sol

const HDWalletProvider = require('truffle-hdwallet-provider');
const Web3 = require('web3');
const ethereumjs = require('ethereumjs-abi');

exports.handler = async function(event, context) {

    const ethAddress = event.queryStringParameters.ethaddress;
    const transaction = event.queryStringParameters.transaction;
    const amount = Web3.utils.toWei(event.queryStringParameters.amount, 'ether');

    const walletMnemonic = process.env.WALLET_MNEMONIC;
    const walletAPIUrl = process.env.INFURA_URL; // Your Infura URL

    const provider = new HDWalletProvider(
        walletMnemonic,
        walletAPIUrl,
        0,
        5
    );

    const web3 = new Web3(provider);

    const accounts = await web3.eth.getAccounts();

    var transBuffer = Buffer.from(transaction);
    transBuffer = web3.utils.bytesToHex(transBuffer.slice(0,8));
    
    var hash = "0x" + ethereumjs.soliditySHA3(
        ["address", "uint256", "bytes8", "address"],
        [ethAddress, amount, transBuffer, process.env.REACT_APP_TAP_TAP_SWAP_CONTRACT_ADDRESS]
      ).toString("hex");
    
    var signature = await web3.eth.personal.sign(hash, accounts[0]);
    
    signature = signature.split('x')[1];

    var r = signature.substring(0, 64);
    var s = signature.substring(64, 128);
    var v = parseInt(signature.substring(128, 130)) + 27;

    return {
      statusCode: 200,
      body: JSON.stringify({
          kkack: web3.utils.keccak256('SIGNER_ROLE'),
          r: r,
          s: s,
          v: v,
          amount: amount,
          transaction: transBuffer
        }),
    };

};