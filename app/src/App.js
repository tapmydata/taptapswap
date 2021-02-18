import React, { Component } from "react";
import './index.css';
import ConnectEthWallet from "./ConnectWallet/EthWallet";
import DropWallet from "./DropWallet/DropWallet";
import SwapTap from "./SwapTap/SwapTap";
import "@ethersproject/shims"
import { ethers } from "ethers";
import TapTapSwapAbi from './contracts/TapTapSwap.json';
import StellarSdk from "stellar-sdk";
import ConfettiGenerator from "confetti-js";
import Web3 from 'web3';

class App extends Component {

  state = {
    boom: false,
    step: 1,
    provider: null,
    account: null,
    claimed: false,
    transaction: null,
    dropWallet: "",
    dropWalletError: false,
    addressGenerating: false,
    incomingTrans: [],
    tapTapSwapContract: false,
    pastClaims: false
  };

  confetti = () => {
    const confettiSettings = { target: 'my-canvas', respawn: false, clock: 50, max: 100, size: 1.2 };
    const confetti = new ConfettiGenerator(confettiSettings);
    confetti.render();
  }

  walletConnected = async (wallet) => {
    this.setState({wallet: wallet});

    const provider = new ethers.providers.Web3Provider(wallet)
    const signer = provider.getSigner();

    let accounts = await provider.listAccounts();
    let account = accounts[0];

    this.setState({boom: true, step: 2, provider: provider, account: account});   

    this.getStellarAddress(account);

    // Subscribe to accounts change
    wallet.on("accountsChanged", (accounts) => {
      window.location.reload(true);
    });

    // Subscribe to chainId change
    wallet.on("chainChanged", (chainId) => {
      console.log("chainChanged", chainId);
    });

    // Subscribe to provider connection
    wallet.on("connect", (info) => {
      console.log("connect", info);
    });

    // Subscribe to provider disconnection
    wallet.on("disconnect", (error) => {
      console.log("disconnect", error);
    });

    let tapTapSwapContract = new ethers.Contract(process.env.REACT_APP_TAP_TAP_SWAP_CONTRACT_ADDRESS, TapTapSwapAbi.abi, provider);
    tapTapSwapContract = await tapTapSwapContract.connect(signer);

    let filterFromMe = tapTapSwapContract.filters.Swapped(account, null, null);
    
    let ethEvent = (function(from, transaction_hash, amount, event) {
      const trans = this.state.incomingTrans;
      const objIndex = trans.findIndex((obj => obj.stellarTransHex === transaction_hash));
      
      if (objIndex >= 0){

        let updateTrans = trans[objIndex];
        updateTrans.mined=true;
        trans[objIndex]=updateTrans;
        this.setState({incomingTrans: trans});

        this.confetti();
      }
    }).bind(this);

    tapTapSwapContract.on(filterFromMe, ethEvent);

    let pastClaims = await tapTapSwapContract.queryFilter(filterFromMe);

    this.setState({pastClaims: pastClaims, tapTapSwapContract: tapTapSwapContract});
  }

  getStellarAddress = async (account) => {

    this.setState({addressGenerating: true, dropWallet: ''});
    let response = await (await fetch(process.env.REACT_APP_GET_DROP_WALLET_ENDPOINT + '?ethaddress='+account)).json();
    let wallet = false;
    if (response.wallet) {
      wallet = response.wallet;
      this.setState({addressGenerating: false, dropWallet: wallet});

      let lastCursor=0;

      let txHandler = async (txResponse) => {
          let ops = await txResponse.operations();
          
          ops.records.forEach(function (item, index) {
              if (item.type === 'payment'
                  && item.asset_type==='credit_alphanum4' 
                  && item.asset_code==='TAP' 
                  && item.asset_issuer===process.env.REACT_APP_TAP_ASSET_ISSUER) {
                  this.addIncomingTransaction(
                          {
                              amount: item.amount,
                              transaction_hash: item.transaction_hash,
                              date: new Date(item.created_at)
                          }
                      );
              }
          }, this);
      };

      const server = new StellarSdk.Server(process.env.REACT_APP_HORIZON_SERVER);
      server.transactions()
          .forAccount(wallet)
          .cursor(lastCursor)
          .stream({
              onmessage: txHandler
          });

    } else {
      this.setState({addressGenerating: false, dropWalletError: true});
    }
  }

  addIncomingTransaction = async (trans) => {
    let transBuffer = Buffer.from(trans.transaction_hash);
    transBuffer = Web3.utils.bytesToHex(transBuffer.slice(0,8));

    if (this.state.pastClaims) {
      let previousTrans = this.state.pastClaims.filter(obj => {
        return obj.args[1] === transBuffer
      });
      if (previousTrans && previousTrans[0]) {
        trans.mined = true;
        trans.ethTrans=previousTrans[0].transactionHash;
      }
    }

    let incomingTrans = [...this.state.incomingTrans, trans].sort(function(a, b) {
        return b.date - a.date;
    });

    this.setState({ step: 3, incomingTrans: incomingTrans});
  }

  claim = async (trans) => {

    let amount = trans.amount;
    let transaction_hash = trans.transaction_hash;
    const response = await (await fetch(
      '/.netlify/functions/web3_sign?ethaddress='+this.state.account+'&transaction='+transaction_hash+'&amount='+amount
      )).json();

    const wei_amount = response.amount;
    const v = response.v;
    const r = Buffer.from(response.r,'hex');
    const s = Buffer.from(response.s,'hex');
    const transaction_hash_hex = response.transaction;

    let contract = this.state.tapTapSwapContract;
    let transactionResponse = await contract.claim(wei_amount, transaction_hash_hex, v, r, s);
    
    trans.ethTrans = transactionResponse.hash;
    trans.stellarTransHex = transaction_hash_hex;

    let incomingTrans = this.state.incomingTrans;

    const index = incomingTrans.findIndex((obj => obj.transaction_hash === trans.transaction_hash));
    incomingTrans[index] = trans;
    this.setState({incomingTrans: incomingTrans});
  }

  header = (
    <div className="bg-tap_blue pb-32">
      <header className="py-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 content-center">
        <a className="mx-auto" href="https://tapmydata.com" target="_blank" rel="noreferrer"><img className="h-10 mx-auto" src="https://tapmydata.com/wp-content/uploads/2020/10/Tapmydata-Logo-White-2019b@3x-2.png" alt={'"' + process.env.REACT_APP_BASE_TOKEN_NAME + ' Logo"'} /></a>
        </div>
      </header>
    </div>
  )

  render() {

    let canvas = {
      position: 'absolute',
      pointerEvents: 'none',
      width: 'auto',
      height: 'auto',
      zIndex: '9999',
      top: 0,
      left: 0
    }

    return (
      
      <div className="relative bg-tap_blue content-center min-h-screen bg-gray-100">
        <canvas id="my-canvas" style={canvas}></canvas>
        {this.header}
        <main className="-mt-32">
          <div className="max-w-7xl mx-auto pb-12 px-4 sm:px-6 lg:px-8">
            
          
              <div className="bg-white rounded-lg shadow px-5 py-12 sm:px-6">

                <h1 className="text-center text-xl font-semibold uppercase text-tap_blue tracking-wider">
                  Swap your Stellar TAP asset in to ERC20 TAP
                </h1>

                <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:py-16 lg:px-3">
                  
                  <p className="text-center text-base font-semibold uppercase text-gray-600 tracking-wider">
                    {this.state.step===1 ? (<>👉</>) : (null)} Step 1. Connect your wallet
                  </p>
                  <div className="mx-auto p-8 content-center text-center">
                    <ConnectEthWallet account={this.state.account} connected={(wallet) => this.walletConnected(wallet)} web3provider={this.state.provider} />
                  </div>

                  <p className="text-center text-base font-semibold uppercase text-gray-600 tracking-wider">
                    {this.state.step===2 ? (<>👉</>) : (null)} Step 2. Send your Tapmydata Stellar TAP
                  </p>
                  <div className="mx-auto p-8 content-center text-center">
                    <DropWallet addressGenerating={this.state.addressGenerating} address={this.state.dropWallet} dropWalletError={this.state.dropWalletError}></DropWallet>
                  </div>

                  <p className="text-center text-base font-semibold uppercase text-gray-600 tracking-wider">
                    {this.state.step===3 ? (<>👉</>) : (null)} Step 3. Swap your Stellar TAP for ERC20 TAP
                  </p>
                  <div className="mx-auto p-8 content-center text-center">
                    <SwapTap 
                      addressGenerating={this.state.addressGenerating} 
                      address={this.state.dropWallet} 
                      claim={this.claim}
                      transactions={this.state.incomingTrans}
                      web3provider={this.state.provider} />
                  </div>
                </div>
              </div>
            
          </div>
        </main>
      </div>
    );
  }
}

export default App;
