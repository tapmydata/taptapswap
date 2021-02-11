import React from "react"

export class ClaimSwap extends React.Component {

    render() {

        const buttonClasses = "inline-flex items-center px-6 py-2 mt-1 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-tap_blue hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500";

        let alertMessage = <span className="text-xs font-semibold inline-block py-1 px-2 uppercase rounded-full text-gray-600 bg-tap_ligh_blue uppercase last:mr-0 mr-1">
            Please connect your ethereum wallet first.
        </span>

        if(this.props.addressGenerating) {
            alertMessage = <span className="animate-bounce text-xs font-semibold inline-block py-1 px-2 uppercase rounded-full text-tap_blue bg-tap_lime_green uppercase last:mr-0 mr-1">
                Your fresh Stellar Drop Wallet is initializing. Please wait.
            </span>
        }

        let trans = <span className="animate-pulse text-xs font-semibold inline-block py-1 px-2 uppercase rounded-full text-tap_blue bg-tap_ligh_blue uppercase last:mr-0 mr-1">
            Awaiting incoming payment of TAP. Please send your TAP to address above.
        </span>

        if (this.props.transactions.length >0) {
            let transRows = this.props.transactions.map((trans) =>
                <tr key={trans.transaction_hash}>
                    <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-left">
                        <div className="flex-shrink-0 h-10 w-10">
                        <img className="h-10 w-10 rounded-full" src="https://tapmydata-tokenassets.s3.eu-west-2.amazonaws.com/taptoken.png" alt="TAP Token" />
                        </div>
                        <div className="ml-4">
                        <div className="text-sm py-2 whitespace-nowrap leading-8">
                            <p><a href={process.env.REACT_APP_STELLAR_TRANS_URL + trans.transaction_hash} targt="_blank">{trans.transaction_hash.substring(0,13)}... <img src="images/open-external.svg" className="inline-block" alt="Open external site" /></a></p>
                        </div>
                        </div>
                    </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex items-left">
                        <div className="text-sm py-2">
                            {parseInt(trans.amount).toFixed(2)}
                        </div>
                    </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      {!trans.ethTrans ? (
                        <button 
                          onClick={() => this.props.claim(trans)} 
                          disabled={false}
                          type="button" 
                          className={buttonClasses}>
                          Swap for ERC20 TAP
                      </button>
                      ) : trans.mined ? (
                        <div>  
                          <a href={process.env.REACT_APP_ETHER_TRANS_URL + trans.ethTrans} targt="_blank">
                          <svg aria-hidden="true" focusable="false" data-prefix="far" data-icon="check-circle" className="inline-block mr-2 h-3.5 svg-inline--fa fa-check-circle fa-w-16" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512"><path fill="#1110A7" d="M256 8C119.033 8 8 119.033 8 256s111.033 248 248 248 248-111.033 248-248S392.967 8 256 8zm0 48c110.532 0 200 89.451 200 200 0 110.532-89.451 200-200 200-110.532 0-200-89.451-200-200 0-110.532 89.451-200 200-200m140.204 130.267l-22.536-22.718c-4.667-4.705-12.265-4.736-16.97-.068L215.346 303.697l-59.792-60.277c-4.667-4.705-12.265-4.736-16.97-.069l-22.719 22.536c-4.705 4.667-4.736 12.265-.068 16.971l90.781 91.516c4.667 4.705 12.265 4.736 16.97.068l172.589-171.204c4.704-4.668 4.734-12.266.067-16.971z"></path></svg>
                          Claied {trans.ethTrans.substring(0,13)}...<img src="images/open-external.svg" className="inline-block ml-2 h-3.5" alt="Open external site" /></a>
                        </div>
                      ) : (
                        <div>  
                          <a className={buttonClasses.replace('bg-tap_blue', 'bg-tap_orange')} href={process.env.REACT_APP_ETHER_TRANS_URL + trans.ethTrans} targt="_blank">
                          <svg className="animate-spin -ml-1 mr-2 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="#ffffff" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>&nbsp;{trans.ethTrans.substring(0,13)}...<img src="images/open-external-white.svg" className="ml-2 h-3.5" alt="Open external site" /></a>
                        </div>
                      )}
                    </td>
                </tr>
            );
            
            trans = <div className="flex flex-col">
            <div className="-my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
              <div className="py-2 align-middle inline-block min-w-full sm:px-6 lg:px-8">
                <div className="shadow overflow-hidden border-b border-gray-200 sm:rounded-lg">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Stellar Incoming Transaction
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Amount
                        </th>
                        <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Action / Outgoing Ethereum Transaction
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {transRows}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div> 
        }
        
        return (
            <div className="content-center text-center">
            {this.props.address ? (
                <>
                    {trans}
                </>
            ) : (alertMessage)}
            </div>
        );
    }
}

export default ClaimSwap;