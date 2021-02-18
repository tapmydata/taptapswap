const StellarSdk = require('stellar-sdk');

exports.handler = async function(event, context) {

    const pair = StellarSdk.Keypair.random();

    return {
        statusCode: 200,
        body: JSON.stringify({ 
            error: "Failed to generate wallet",
            //wallet: pair.publicKey()
        })
    };
}