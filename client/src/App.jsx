import Wallet from "./Wallet";
import "./App.scss";
import { useState } from "react";

function App() {
  const [balance, setBalance] = useState(0);
  const [address, setAddress] = useState("");
  const [privateKey, setPrivateKey] = useState("");
  const [sendAmount, setSendAmount] = useState("");
  const [recipient, setRecipient] = useState("");
  //const [signature, setSignature] = useState("");

  return (
    <div className="app">
      <Wallet
        balance={balance}
        setBalance={setBalance}
        privateKey={privateKey}
        setPrivateKey={setPrivateKey}
        address={address}
        setAddress={setAddress}
        sendAmount={sendAmount}
        setSendAmount={setSendAmount}
        recipient={recipient}
        setRecipient={setRecipient}
      />
    </div>
  );
}

export default App;
