// Load dependencies
const { expect } = require('chai');

// Import utilities from Test Helpers
const { expectRevert, expectEvent } = require('@openzeppelin/test-helpers');

// Load compiled artifacts
const ERC20Token = artifacts.require("ERC20Token");
const TapTapSwap = artifacts.require("TapTapSwap");

const Web3 = require('web3');
const ethereumjs = require('ethereumjs-abi');

contract("TapTapSwap", function ([ owner, other, other2, other3 ]) {

    const ONE_HUNDRED_MILLION = 100000000;
    const ONE_MILLION = 1000000;
    const MINT_AMOUNT = Web3.utils.toWei(ONE_HUNDRED_MILLION.toString(), 'ether');
    const TOKEN_FLOAT = Web3.utils.toWei(ONE_MILLION.toString(), 'ether');
    const STELLAR_TRANS = 'GAI3GJ2Q3B35AOZJ36C4ANE3HSS4NK7WI6DNO4ZSHRAX6NG7BMX6VJER'; //arbitary stellar trans address
    const CLAIM_AMOUNT = Web3.utils.toWei('10', 'ether');

    beforeEach(async function () {
        this.tapInstance = await ERC20Token.new('TapToken', 'TAP', MINT_AMOUNT);
        await this.tapInstance.mint(owner, MINT_AMOUNT);

        this.tapTapSwap = await TapTapSwap.new(this.tapInstance.address);

        await this.tapInstance.transfer(this.tapTapSwap.address, TOKEN_FLOAT);
    });
  
    it('TapTap Swap contract has a Tap balance', async function () {
        expect((await this.tapInstance.balanceOf(this.tapTapSwap.address)).toString()).to.equal(TOKEN_FLOAT.toString());
    });

    it('Can drain contract if admin', async function () {
        expect((await this.tapInstance.balanceOf(owner)).toString()).to.equal(Web3.utils.toWei((ONE_HUNDRED_MILLION - ONE_MILLION).toString(), 'ether').toString());
        await this.tapTapSwap.drain();
        expect((await this.tapInstance.balanceOf(owner)).toString()).to.equal(MINT_AMOUNT.toString());
        expect((await this.tapInstance.balanceOf(this.tapTapSwap.address)).toString()).to.equal('0');
    });

    it('Can NOT drain contract if not admin', async function () {
        await expectRevert(
            this.tapTapSwap.drain({from: other}),
            "Caller is not an admin"
        );
    });

    it('Can claim tokens', async function () {
        expect((await this.tapInstance.balanceOf(other)).toString()).to.equal('0');
        var vrs = await sign(web3, owner, other, CLAIM_AMOUNT, STELLAR_TRANS, this.tapTapSwap.address);
        await this.tapTapSwap.claim(vrs.amount, vrs.trans, vrs.v, vrs.r, vrs.s, {from: other});
        expect((await this.tapInstance.balanceOf(other)).toString()).to.equal(CLAIM_AMOUNT.toString());
    });

    it('Can NOT claim tokens if already claimed', async function () {
        expect((await this.tapInstance.balanceOf(other)).toString()).to.equal('0');
        var vrs = await sign(web3, owner, other, CLAIM_AMOUNT, STELLAR_TRANS, this.tapTapSwap.address);
        await this.tapTapSwap.claim(vrs.amount, vrs.trans, vrs.v, vrs.r, vrs.s, {from: other});
        await expectRevert(
            this.tapTapSwap.claim(vrs.amount, vrs.trans, vrs.v, vrs.r, vrs.s, {from: other}),
            "Transaction already claimed"
        );
    });

    it('Can NOT claim tokens if not signed by SIGNER ROLE', async function () {
        expect((await this.tapInstance.balanceOf(other)).toString()).to.equal('0');
        var vrs = await sign(web3, other2, other, CLAIM_AMOUNT, STELLAR_TRANS, this.tapTapSwap.address);
        await expectRevert(
            this.tapTapSwap.claim(vrs.amount, vrs.trans, vrs.v, vrs.r, vrs.s, {from: other}),
            "Invalid signer"
        );
    });

    it('Claim emits Swapped event', async function () {
        expect((await this.tapInstance.balanceOf(other)).toString()).to.equal('0');
        var vrs = await sign(web3, owner, other, CLAIM_AMOUNT, STELLAR_TRANS, this.tapTapSwap.address);
        const web3Receipt = await this.tapTapSwap.claim(vrs.amount, vrs.trans, vrs.v, vrs.r, vrs.s, {from: other});
        await expectEvent(
            web3Receipt,
            "Swapped",
            [ other, vrs.trans, CLAIM_AMOUNT ]
          );

    });

    it('hasClaimed returns true if trans is claimed', async function () {
        var vrs = await sign(web3, owner, other, CLAIM_AMOUNT, STELLAR_TRANS, this.tapTapSwap.address);
        await this.tapTapSwap.claim(vrs.amount, vrs.trans, vrs.v, vrs.r, vrs.s, {from: other});
        expect((await this.tapTapSwap.hasClaimed(vrs.trans))).to.equal(true);
    });
    
    it('hasClaimed returns false if trans is not claimed', async function () {
        var vrs = await sign(web3, owner, other, CLAIM_AMOUNT, STELLAR_TRANS, this.tapTapSwap.address);
        expect((await this.tapTapSwap.hasClaimed(vrs.trans))).to.equal(false);
    });

    sign = async (web3, signer, ethAddress, amount, transaction, contract_address) => {

        var transBuffer = Buffer.from(transaction);
        transBuffer = web3.utils.bytesToHex(transBuffer.slice(0,8));
        
        var hash = "0x" + ethereumjs.soliditySHA3(
            ["address", "uint256", "bytes8", "address"],
            [ethAddress, amount, transBuffer, contract_address]
        ).toString("hex");
        
        var signature = await web3.eth.sign(hash, signer);
        
        signature = signature.split('x')[1];
        
        var r = signature.substring(0, 64);
        var s = signature.substring(64, 128);

        return {
            r: Buffer.from(r,'hex'),
            s: Buffer.from(s,'hex'),
            v: parseInt(signature.substring(128, 130)) + 27,
            amount: amount,
            trans: transBuffer
        }
    }

});
