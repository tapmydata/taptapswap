## TAP TAP Swap

This project provides an interface to swap from ![Stellar TAP](https://stellar.expert/explorer/public/asset/TAP-GBLDM2NKZ4Z4H67RZ3UQ2A5RNLFLLQNXGWRFHKGOL3QUALWYFWI4FIL4-1) to ![ERC20 TAP](https://etherscan.io/token/0x7f1f2d3dfa99678675ece1c243d3f7bc3746db5d) 

Can be seen on https://swap.tapmydata.com

### About

Connect your Ethereum wallet. A Stellar drop wallet will be generated. Open up the Tapmydata app and transfer your TAP in app to the drop wallet. You will then see the transaction appear where you can swap to ERC20 TAP.

### Main Components

Originally the project was setup with https://www.trufflesuite.com/drizzle. Ths was a good starting point for structure but we didn't actually use the Drizzle coponents in the end.

Stack:
- [Truffle](https://www.trufflesuite.com/)
- [React](https://reactjs.org/)
- [Web3Modal](https://github.com/Web3Modal/web3modal)
- [Ethers.js](https://docs.ethers.io/v5/)
- [Tailwind](https://tailwindcss.com/)
- [Netlify Lambda Functions](https://github.com/netlify/netlify-lambda)

### Folder Structure

`app/` - This is the React front-end.
`contracts/` - These are the solidity contracts. 
`migrations/` - This is where you will find the deployment script. 

### How to run

Run `npm install` in both root folder and `app/` folder.

You will need a .env in the root of the project for the Ethereum contract deployment that looks like:

```
MNEMONIC=<YOUR SECRET KEY MNEMONIC>
INFURA_RINKEBY=<INFURA URL IF DEPLOYING TO RINKEBY>
INFURA_KOVAN=<INFURA URL IF DEPLOYING TO KOVAN>
INFURA_MAINNET=<INFURA URL IF DEPLOYING TO MAINNET>
ETHERSCAN=<AN ETHERESCAN API KEY - ONLY NEEDED IF YOU WANT TO VERIFY YOUR CONTRACT>
FROM=<ETH ADDRESS YOU ARE DEPLOYING FROM>
```

You can compile contracts and test with Truffle:

```
npx truffle develop
truffle migrate
tuffle compile
truffle test
```

To deploy contracts use the following:

```
npx truffle migrate --reset --network kovan
```

To verify the contract on ehterscan you can run:

```
npx truffle run verify TapTapSwap --network kovan
```

You will need a .env in the app/ folder to run the front-end that looks like:

```
WALLET_MNEMONIC=<YOUR SECRET KEY MNEMONIC>
INFURA_URL=<INFURA URL>
S3_BUCKET=<S3 BUCKET NAME FOR RECORDING WALLETS>
AWS_ACCESS_KEY_ID=<AWS ACCESS KEY FOR A BUCKET>
AWS_SECRET_ACCESS_KEY=<AWS SECRET KEY FOR THE BUCKET>
REACT_APP_TAP_ASSET_ISSUER=<STELLAR ASSET ISSUER>
TAP_ASSET_DISTRIBUTOR=<STELLAR ASSET DISTRIBUTOR>
TAP_ASSET_DISTRIBUTOR_SECRET=<STELLAR ASSET DISTRIBUTOR SECRET>
REACT_APP_HORIZON_SERVER=<STELLAR HORIZON SERVER>
REACT_APP_TAP_TAP_SWAP_CONTRACT_ADDRESS=<THE SWAP CONTRACT ADDRESS>
REACT_APP_STELLAR_TRANS_URL=http://stellarchain.io/tx/
REACT_APP_ETHER_TRANS_URL=https://etherscan.io/tx/
```


Change in to `app/` and run:

```
npm run start
```

You should then have the app on `http://127.0.0.1:3000`. 