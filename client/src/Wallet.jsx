import server from "./server";
import * as secp from "ethereum-cryptography/secp256k1";
import { toHex, utf8ToBytes } from "ethereum-cryptography/utils";
import { keccak256 } from "ethereum-cryptography/keccak";
import { useState } from "react";

function getAddress(publicKey) {
  return toHex(keccak256(publicKey.slice(1)).slice(-20));
}

async function signTx(prvKey, recipient, sendAmount) {
  console.log("privateKey:", prvKey);
  console.log("recipient:", recipient);
  console.log("sendAmount:", sendAmount);
  const tx = {
    to: recipient,
    value: sendAmount,
  };
  const hash = keccak256(utf8ToBytes(JSON.stringify(tx)));
  return secp.sign(hash, prvKey, { recovered: true });
}

function Wallet({
  address,
  setAddress,
  balance,
  setBalance,
  privateKey,
  setPrivateKey,
  sendAmount,
  setSendAmount,
  recipient,
  setRecipient,
}) {
  const [signature, setSignature] = useState("");

  const setValue = (setter) => (evt) => setter(evt.target.value);

  async function onChange(evt) {
    const privateKey = evt.target.value;
    setPrivateKey(privateKey);
    const publicKey = secp.getPublicKey(privateKey);
    const address = getAddress(publicKey);
    setAddress(address);
    if (address) {
      const {
        data: { balance },
      } = await server.get(`balance/${address}`);
      setBalance(balance);
    } else {
      setBalance(0);
    }
  }

  async function onSubmit(prvKey, recipient, sendAmount) {
    const signedTx = await signTx(prvKey, recipient, sendAmount);
    setSignature(signedTx);
    try {
      const {
        data: { balance },
      } = await server.post(`send`, {
        sender: address,
        senderPublicKey: secp.getPublicKey(prvKey),
        amount: sendAmount,
        recipient,
        signature: signedTx,
      });
      setBalance(balance);
    } catch (ex) {
      alert(ex.response.data.message);
    }
  }

  return (
    <div className="container wallet">
      <h1>Your Wallet</h1>
      <label>
        Private Key
        <input
          placeholder="a8e03abab6a70e9a1386241d3be15815983d9f7e71beef720f2894d5d1e11c88"
          value={privateKey}
          onChange={onChange}
        ></input>
      </label>
      <div>Address: {address}</div>
      <div className="balance">Balance: {balance}</div>
      <h1>Sign Transaction</h1>
      <label>
        Send Amount
        <input
          placeholder="20"
          value={sendAmount}
          onChange={setValue(setSendAmount)}
        ></input>
      </label>
      <label>
        Recipient
        <input
          placeholder="c6fea94dde2f19fe93c8db24d48c7d1da3d26f72"
          value={recipient}
          onChange={setValue(setRecipient)}
        ></input>
      </label>
      <input
        type="submit"
        className="button"
        value="Sign & Transfer"
        onClick={() => onSubmit(privateKey, recipient, sendAmount)}
      />
    </div>
  );
}

export default Wallet;
