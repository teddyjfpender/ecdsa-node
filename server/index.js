const express = require("express");
const app = express();
const cors = require("cors");
const port = 3042;
const secp = require("ethereum-cryptography/secp256k1");
const { keccak256 } = require("ethereum-cryptography/keccak");
const { utf8ToBytes, toHex } = require("ethereum-cryptography/utils");

app.use(cors());
app.use(express.json());

const balances = {
  "0aad30cb8d866074a93482e646035bf38b634070": 50,
  c6fea94dde2f19fe93c8db24d48c7d1da3d26f72: 75,
  fd76729ff80b75ba366b9f82486e5d8602b318b9: 100,
};

function hashMessage(message) {
  // turn the message an array of bytes, this is
  // the expected format for the hash algorithm
  const bytes = utf8ToBytes(message);
  // hash the message using keccak256
  const hash = keccak256(bytes);

  return hash;
}

async function recoverKey(message, signature, recoveryBit) {
  return secp.recoverPublicKey(message, signature, recoveryBit);
}

app.get("/balance/:address", (req, res) => {
  const { address } = req.params;
  const balance = balances[address] || 0;
  res.send({ balance });
});

app.post("/send", async (req, res) => {
  // TODO: get a signature from the client-side application
  // recover the public address from the signature
  const { sender, senderPublicKey, recipient, amount, signature } = req.body;
  //console.log("request body", sender, senderPublicKey, recipient, amount);
  const [sig, recoveryBit] = signature;
  // convert sig to Uint8Array
  const signatureBytes = Object.values(sig);
  const signatureUint8Array = new Uint8Array(signatureBytes);
  // convert senderPublicKey to Uint8Array
  const publicKeyBytes = Object.values(senderPublicKey);
  const publicKeyUint8Array = new Uint8Array(publicKeyBytes);
  // create transaction body
  const tx = {
    to: recipient,
    value: amount,
  };
  const hashTx = keccak256(utf8ToBytes(JSON.stringify(tx)));
  const recoveredPublicKey = await recoverKey(
    hashTx,
    signatureUint8Array,
    recoveryBit
  );
  console.log("recovered key", recoveredPublicKey);
  console.log("sender public key", publicKeyUint8Array);

  setInitialBalance(sender);
  setInitialBalance(recipient);

  if (toHex(publicKeyUint8Array) !== toHex(recoveredPublicKey)) {
    res.status(400).send({ message: "Wrong key!" });
  } else if (balances[sender] < amount) {
    res.status(400).send({ message: "Not enough funds!" });
  } else {
    balances[sender] -= amount;
    balances[recipient] += amount;
    res.send({ balance: balances[sender] });
  }
});

app.listen(port, () => {
  console.log(`Listening on port ${port}!`);
});

function setInitialBalance(address) {
  if (!balances[address]) {
    balances[address] = 0;
  }
}
