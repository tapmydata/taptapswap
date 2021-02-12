const StellarSdk = require('stellar-sdk');
const aws = require('aws-sdk');

exports.handler = async function(event, context) {
    
    fundWallet = async (pair) => {

        const server = new StellarSdk.Server(process.env.REACT_APP_HORIZON_SERVER);

        const account = await server.loadAccount(process.env.TAP_ASSET_DISTRIBUTOR);
        const fee = await server.fetchBaseFee();
        
        var stellarNetworkPassphrase = process.env.REACT_APP_HORIZON_SERVER === 'https://horizon-testnet.stellar.org' ? 
            StellarSdk.Networks.TESTNET : StellarSdk.Networks.PUBLIC;

        const transaction = new StellarSdk.TransactionBuilder(account, { fee, networkPassphrase: stellarNetworkPassphrase })
            .addOperation(
                // this operation funds the new account with XLM
                StellarSdk.Operation.createAccount({
                    destination: pair.publicKey(),
                    startingBalance: "2"
                }),
            )
            .addOperation(
                StellarSdk.Operation.changeTrust({
                    asset: new StellarSdk.Asset('TAP', process.env.REACT_APP_TAP_ASSET_ISSUER),
                    source: pair.publicKey()
                })
            )
            .setTimeout(30)
            .build();
    
        // sign the transaction by both distributor and new wallet.
        transaction.sign(StellarSdk.Keypair.fromSecret(process.env.TAP_ASSET_DISTRIBUTOR_SECRET));
        transaction.sign(pair)
        try {
            const transactionResult = await server.submitTransaction(transaction);
        } catch (err) {
            console.error(err);
        }

    }

    const ethAddress = event.queryStringParameters.ethaddress;

    const pair = StellarSdk.Keypair.random();

    var s3 = new aws.S3({
        accessKeyId: process.env.TTS_AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.TTS_AWS_SECRET_ACCESS_KEY,
      });

    // See if we have existing for this ETH address
    const existing_stellar_address = await s3.headObject({
        Bucket: process.env.S3_BUCKET,
        Key: ethAddress,
    })
    .promise()
    .then(
        (meta) => meta.Metadata.stellar_address,
        err => {
        if (err.code === 'NotFound') {
            return false;
        }
        throw err;  
        }
    );

    if (existing_stellar_address) {
        return {
            statusCode: 200,
            body: JSON.stringify({ 
                wallet: existing_stellar_address
            })
        };
    }
    
    //Create new record of address and generate stellar wallet
    try {

        var params_new = {
            Bucket: process.env.S3_BUCKET,
            Key: ethAddress,
            Metadata: {
                'stellar_address': pair.publicKey(),
            },
            Body: pair.publicKey() + "\n" + pair.secret()
        };

        var response = await s3.putObject(params_new).promise();
        
        fundWallet(pair);

        return {
            statusCode: 200,
            body: JSON.stringify({ 
                wallet: pair.publicKey()
            })
        };

    } catch(err) {
        return {
            statusCode: 500,
            body: {
                error: "Failed recording wallet."
            }
        };
    }
}