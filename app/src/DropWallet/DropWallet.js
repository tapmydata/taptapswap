import React from "react"
import QRCode from "qrcode"
import copy from 'copy-to-clipboard';

export class DropWallet extends React.Component {

    state = {
        copyButtonColor: '#000'
    }

    componentDidUpdate() {
        if(this.props.address) {
            QRCode.toCanvas(this.qrCanvas, this.props.address, function (error) {
                if (error) console.error(error)
            });
        }
    }

    copyAddress(address) {
        copy(address, {
            debug: true,
            message: 'Press #{key} to copy',
        });

        this.setState({copyButtonColor: '#4BB543'});
        setTimeout(() => {
            this.setState({copyButtonColor: '#000'});
        }, 400);
    }

    render() {

        const canvasStyle = {
            display: "inline"
        }

        var alertMessage = <span className="text-xs font-semibold inline-block py-1 px-2 uppercase rounded-full text-gray-600 bg-tap_ligh_blue uppercase last:mr-0 mr-1">
            Please connect your ethereum wallet first.
        </span>

        if(this.props.addressGenerating) {
            alertMessage = <span className="animate-bounce text-xs font-semibold inline-block py-1 px-2 uppercase rounded-full text-tap_blue bg-tap_lime_green uppercase last:mr-0 mr-1">
                Your fresh Stellar Drop Wallet is initializing. Please wait.
            </span>
        }

        if(this.props.dropWalletError) {
            alertMessage = <span className="text-xs font-semibold inline-block py-2 px-3 uppercase rounded-full text-white bg-red-600 uppercase last:mr-0 mr-1">
                There was an error generating your drop wallet.<br/>Our tech team have been informed.
            </span>
        }

        return (
            <div className="content-center text-center">
            {this.props.address ? (
                <>
                    <p className="font-mono leading-4">{this.props.address}
                        <svg onClick={() => this.copyAddress(this.props.address)} aria-hidden="true" focusable="false" className="cursor-pointer ml-1 h-3.5 inline-block svg-inline--fa fa-copy fa-w-14" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512">
                            <path fill={this.state.copyButtonColor} d="M433.941 65.941l-51.882-51.882A48 48 0 0 0 348.118 0H176c-26.51 0-48 21.49-48 48v48H48c-26.51 0-48 21.49-48 48v320c0 26.51 21.49 48 48 48h224c26.51 0 48-21.49 48-48v-48h80c26.51 0 48-21.49 48-48V99.882a48 48 0 0 0-14.059-33.941zM352 32.491a15.88 15.88 0 0 1 7.431 4.195l51.882 51.883A15.885 15.885 0 0 1 415.508 96H352V32.491zM288 464c0 8.822-7.178 16-16 16H48c-8.822 0-16-7.178-16-16V144c0-8.822 7.178-16 16-16h80v240c0 26.51 21.49 48 48 48h112v48zm128-96c0 8.822-7.178 16-16 16H176c-8.822 0-16-7.178-16-16V48c0-8.822 7.178-16 16-16h144v72c0 13.2 10.8 24 24 24h72v240z"></path>
                        </svg>
                    </p>
                    <canvas ref={(canvas) => {this.qrCanvas = canvas}} style={canvasStyle}></canvas>
                </>
            ) : (alertMessage)}
            </div>
        );
    }
}

export default DropWallet;