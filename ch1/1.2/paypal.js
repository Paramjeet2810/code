const EthCrypto = require('eth-crypto');
const Client = require('./client.js');

// Our naive implementation of a centralized payment processor
class Paypal extends Client {
  constructor() {
    super();
    // the state of the network (accounts and balances)
    this.state = {
      [this.wallet.address]: {
        balance: 1000000,
      },
    };
    // the history of transactions
    this.txHistory = [];
  }

  // Checks that the sender of a transaction is the same as the signer
  checkTxSignature(tx) {
    // if the signature is invalid print an error to the console and return false
    // return true if the transaction is valid

    const {
      contents,
      sig,
    } = tx;

    const isValid = this.verify(sig, this.toHash(contents), contents.from);
    if (!isValid) {
      console.log('=========Not valid=========\n');
    }
    return isValid;
  }

  // Checks if the user's address is already in the state, and if not, adds the user's address to the state
  checkUserAddress(tx) {
    // check if the sender is in the state
    // if the sender is not in the state, create an account for them
    // check if the receiver is in the state
    // if the receiver is not in the state, create an account for them
    // once the checks on both accounts pass (they're both in the state), return true
    const { contents } = tx;
    const { from: senderAddress, to: receiverAddress } = contents;
    if (!this.state[senderAddress]) {
      this.state[senderAddress] = { balance: 0 };
    }

    if (!this.state[receiverAddress]) {
      this.state[receiverAddress] = { balance: 0 };
    }

    return true;
  }

  // Checks the transaction type and ensures that the transaction is valid based on that type
  checkTxType(tx) {
    // if the transaction type is 'mint'
    // check that the sender is PayPal
    // if the check fails, print an error to the concole stating why and return false so that the transaction is not processed
    // if the check passes, return true

    // if the transaction type is 'check'
    // print the balance of the sender to the console
    // return false so that the stateTransitionFunction does not process the tx

    // if the transaction type is 'send'
    // check that the transaction amount is positive and the sender has an account balance greater than or equal to the transaction amount
    // if a check fails, print an error to the console stating why and return false
    // if the check passes, return true

    const { contents: { type, from, amount } } = tx;

    switch (type) {
      case 'mint': {
        if (from !== this.wallet.address) {
          console.log('======= Mint attempt by someone other than paypal =======');
          return false;
        }
        return true;
      }

      case 'check': {
        console.log(`The balance of sender is :${this.state[from].balance}`);
        return false;
      }
      case 'send': {
        if (amount >= 0 && amount <= this.state[from].balance) { return true; }
        console.log('======= Insufficient balance =======');

        return false;
      }
      default: {
        return false;
      }
    }
  }

  // Checks if a transaction is valid, adds it to the transaction history, and updates the state of accounts and balances
  checkTx(tx) {
    // check that the transaction signature is valid
    // check that the transaction sender and receiver are in the state
    // check that the transaction type is valid
    // if all checks pass return true
    // if any checks fail return false

    const isValidSig = this.checkTxSignature(tx);
    const isValidState = this.checkUserAddress(tx);
    const isValidType = this.checkTxType(tx);

    return isValidSig && isValidState && isValidType;
  }

  // Updates account balances according to a transaction and adds the transaction to the history
  applyTx(tx) {
    // decrease the balance of the transaction sender/signer
    // increase the balance of the transaction receiver
    // add the transaction to the transaction history
    // return true once the transaction is processed
    const { contents: { from, amount, to } } = tx;
    this.state[from].balance -= amount;
    this.state[to].balance += amount;
    this.txHistory.push(tx);
    return true;
  }

  // Process a transaction
  processTx(tx) {
    // check the transaction is valid
    // apply the transaction to Paypal's state
    const isValidTransaction = this.checkTx(tx);

    if (isValidTransaction) {
      this.applyTx(tx);
    }
  }
}

module.exports = Paypal;
